const Sequelize = require('sequelize');
const config = require('../../config/config.js');

const sequelize = new Sequelize(config);

// import every model and setup database

const db = {
  message: sequelize.import('./message'),
  Sequelize,
};

// associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

module.exports = { db };