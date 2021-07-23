const router = require("express").Router();
const sequelize = require("../db");
const fetch = require("node-fetch");

const GDIR_API_TOKEN = process.env.API_KEY;
const GDIR_API_URL = `https://maps.googleapis.com/maps/api/directions/json?key=${GDIR_API_TOKEN}`;

// expects a string with the same start & end parameters google's api would expect
// (https://developers.google.com/maps/documentation/directions/overview)
// implements caching using a deadline approach: entries older than 5 minutes
// are replaced
router.get("/", async (req, res) => {
  if (!(req.query.start && req.query.end))
    return res.status(422).send("badly formatted request body");
  const { start, end } = req.query;

  // see if we've got this start & end in the DB already
  const existing = await sequelize.models.Cache.findOne({
    where: {
      start,
      end,
    },
  });
  // if we found them, maybe return them
  if (existing) {
    const { updatedAt } = existing;
    const updatedDate = new Date(updatedAt);
    // if entry is older than 30 minutes, let it be replaced
    if (Date.now() - updatedDate.getTime() <= 1800000)
      return res.status(200).send(existing.directions);
  }
  // if we didn't find them, fetch them
  try {
    const resp = await fetch(
      GDIR_API_URL +
        `&origin=${start}` +
        `&destination=${end}` +
        `&mode=transit&transit_mode=subway`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // fetch only throws errors on lower-layer protocol errors, so we must
    // check the 'ok' flag to see if there were HTTP errors
    if (!resp.ok)
      return res
        .status(resp.status)
        .send("unable to complete provider request");
    const directions = await (await resp).json();
    // if gDirections sent us something other than okay, reflect that in our HTTP response
    if (directions.status !== "OK") {
      console.warn(directions);
      return res.status(400).send(directions.error_message);
    }
    // otherwise, we've got some directions
    sequelize.models.Cache.upsert({
      start,
      end,
      directions,
    });
    // console.log(directions);
    return res.json(directions);
  } catch (err) {
    console.error(err);
    return res.status(400).send(err.message);
  }
});

router.get("/healthcheck", async (req, res) => {
  try {
    await sequelize.authenticate();
    console.debug("healthcheck ok");
  } catch (err) {
    console.error(err);
    return res.status(417).send("cache");
  }
  return res.status(200).send();
});

module.exports = router;
