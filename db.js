const Sequelize = require('sequelize')

module.exports = new Sequelize(
    "vue_chat",
    "postgres",
    "admin",
    {
        dialect: 'postgres',
        host: "localhost",
        port: "5433"
    }
)
