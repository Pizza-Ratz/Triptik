const express = require("express");
const cors = require("cors");
const sequelize = require("./db");
const debug = require("debug")("app");

const app = express();

const PORT = process.env.PORT || 0;
// list of places from which requests can originate
const allowedOrigins = ["localhost", /mta-music.nyc$/];

// configuration of CORS middleware
const corsOptions = {
  origin: allowedOrigins,
};

app.use(cors(corsOptions));
app.use("/", require("./routes/healthz"));
app.use("/api/v1", require("./routes/directions"));

function pollSequelizeReady() {
  let spinTimer = 0;

  function pSRIntl(resolve, reject) {
    // if (spinTimer > 2000) {
    //   console.error("DB not ready after 2 seconds -- bailing");
    //   reject();
    // }
    if (!sequelize.ready) {
      spinTimer += 100;
      setTimeout(() => pSRIntl(resolve, reject), 100);
    }
    resolve();
  }
  return new Promise(pSRIntl);
}

pollSequelizeReady().then(() => {
  const server = app.listen(PORT);
  server.on("listening", () =>
    console.info("listening on port " + server.address().port)
  );
  server.on("close", () => {
    console.info("closing connections");
    sequelize.close();
  });

  process.on("SIGTERM", () => {
    console.info("SIGTERM signal received");
    server.close(() => {
      debug("HTTP server closed");
    });
  });
});

module.exports = app;
