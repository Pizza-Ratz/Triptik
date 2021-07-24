const router = require("express").Router();
const sequelize = require("../db");
const debug = require("debug")("app:routes:healthz");

router.get("/healthz", async (req, res) => {
  try {
    await sequelize.authenticate();
  } catch (err) {
    console.error(err.message);
    debug("healthcheck failed on db: ", err);
    return res.status(417).send("database");
  }
  debug("healthcheck ok");
  return res.status(200).send("OK");
});

// this is for GCP's L7 load balancer health check
router.get("/", (_, res) => res.send("triptik"));

module.exports = router;
