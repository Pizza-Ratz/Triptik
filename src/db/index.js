const { Sequelize } = require("sequelize");

const {
  DB_USER = "postgres",
  DB_PASS = "",
  DB_HOST = "db",
  DB_PORT = "5432",
  DB_NAME = "triptik",
} = process.env;

const sequelize = new Sequelize({
  dialect: "postgres",
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  logging: false,
});

sequelize.ready = false;

let models;

// validates db connection and returns the sequelize object
// throws an error if the connection isn't good
async function verify() {
  await sequelize.authenticate();
  console.info("db connected");
  return sequelize;
}

// imports the models (or returns the models if already imported)
function create() {
  if (models) return models;

  const modelMods = [require("./cache.model")];
  models = modelMods.map((m) => m.create(sequelize));
  return models;
}

async function relate() {
  models.forEach((model) =>
    !!model.relate && typeof model.relate === "function"
      ? model.relate(sequelize)
      : null
  );

  return sequelize;
}

// on import, validate the connection, build the models, build relations betweeen
// them, and sync all to the DB,
verify()
  .then(create)
  .then(relate)
  .then(() => sequelize.sync())
  .then(() => (sequelize.ready = true));

module.exports = sequelize;
