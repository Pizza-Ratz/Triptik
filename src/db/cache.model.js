const { Sequelize, DataTypes } = require("sequelize");

const create = (sequelize) => {
  return sequelize.define("Cache", {
    start: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    end: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    directions: DataTypes.JSONB,
  });
};

const relate = (sequelize) => {};

module.exports = {
  create,
  relate,
};
