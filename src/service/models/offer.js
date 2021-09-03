"use strict";

const {DataTypes, Model} = require(`sequelize`);

const define = (sequelize) => {
  class Offer extends Model {}

  Offer.init({
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    picture: DataTypes.STRING,
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sum: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: `Offer`,
    tableName: `offers`
  });
  return Offer;
};

module.exports = define;
