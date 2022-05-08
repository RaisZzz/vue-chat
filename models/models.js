const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    username: {type: DataTypes.STRING},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING}
})

const Chat = sequelize.define('chat', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    usersIn: {type: DataTypes.ARRAY(DataTypes.INTEGER)},
    messages: {type: DataTypes.ARRAY(DataTypes.JSON)},
    title: {type: DataTypes.STRING}
})

const UserChat = sequelize.define('user_chat', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

const Msg = sequelize.define('msg', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    text: {type: DataTypes.STRING},
    userId: {type: DataTypes.INTEGER}
})

User.belongsToMany(Chat, {through: UserChat})
Chat.belongsToMany(User, {through: UserChat})

Chat.hasMany(Msg)

module.exports = {
    User,
    Chat,
    UserChat,
    Msg
}
