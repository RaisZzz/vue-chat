const ApiError = require('../error/ApiError')
const {User, Chat, Msg, UserChat} = require('../models/models')
const express = require("express")
const Sequelize = require('sequelize')
const Op = Sequelize.Op

class userController {
    async start(req, res) {
        try {
            let resChat = null

            // Проверка, нет ли такого чата
            const user = await User.findOne({
                where: {id: req.user.id},
                include: [
                    {
                        model: Chat,
                        as: "chats",
                        include: [
                            {
                                model: User,
                                attributes: ['username', 'email', 'id'],
                                as: "users"
                            }
                        ]
                    }
                ]
            })
            user.chats.forEach(chat => {
                const usersIn = []
                chat.users.forEach(user => {
                    usersIn.push(user.id)
                })
                if (JSON.stringify(usersIn.sort()) === JSON.stringify(req.body.users.sort())) {
                    resChat = chat
                }
            })

            // Создание нового чата
            if (!resChat) {
                let newChat = null
                if (req.body.users.length === 1) {
                    newChat = await Chat.create({personal: true})
                } else {
                    newChat = await Chat.create()
                }
                for (const userId of req.body.users) {
                    await newChat.addUser(userId)
                }
                resChat = await Chat.findOne({
                    where: {
                        id: newChat.id
                    },
                    include: [
                        {
                            model: User,
                            attributes: ['username', 'email', 'id'],
                            as: "users"
                        }
                    ]
                })
            }
            if (resChat.users.length === 2) {
                resChat.users.forEach(user => {
                    console.log(user.username)
                    if (user.id !== req.user.id) {
                        resChat.title = user.username
                    }
                })
            }

            return res.json({chat: resChat})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Create chat error'})
        }
    }

    async all(req, res) {
        try {
            const user = await User.findOne({
                where: {id: req.user.id},
                include: [
                    {
                        model: Chat,
                        as: "chats",
                        include: [
                            {
                                model: User,
                                attributes: ['username', 'email', 'id'],
                                as: "users"
                            }
                        ]
                    }
                ]
            })
            user.chats.forEach(chat => {
                if (chat.users.length === 2) {
                    chat.users.forEach(user => {
                        if (user.id !== req.user.id) {
                            chat.title = user.username
                        }
                    })
                }
            })
            return res.json({chats: user.chats})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Get chats error'})
        }
    }

    async sendMessage(req, res, next) {
        try {
            let access = false
            const chat = await Chat.findOne({
                where: {id: req.body.chatId},
                include: [
                    {
                        model: User,
                        as: "users",
                        attributes: ['id']
                    }
                ]
            })
            chat.users.forEach(user => {
                if (user.id === req.user.id) {
                    access = true
                }
            })
            if (!access) {
                return next(ApiError.badRequest('Нет доступа!'))
            }
            const msg = await Msg.create({text: req.body.message, userId: req.user.id, chatId: req.body.chatId})
            chat.users.forEach(user => {
                if (global.users[user.id]) {
                    global.users[user.id].emit('message', [{chatId: req.body.chatId, userId: req.user.id, message: msg}])
                }
            })
            return res.json({msg})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Send message error'})
        }
    }

    async deleteMessages(req, res, next) {
        try {
            let access = false
            const chat = await Chat.findOne({
                where: {id: req.body.chatId},
                include: [
                    {
                        model: User,
                        as: "users",
                        attributes: ['id']
                    }
                ]
            })
            chat.users.forEach(user => {
                if (user.id === req.user.id) {
                    access = true
                }
            })
            if (!access) {
                return next(ApiError.badRequest('Нет доступа!'))
            }
            if (!req.body.messages || !req.body.chatId) {
                return next(ApiError.badRequest('chatId and messages required'))
            }
            await Msg.destroy({where: {
                id: req.body.messages
            }})
            chat.users.forEach(user => {
                if (global.users[user.id]) {
                    global.users[user.id].emit('messagesDeleted', req.body.messages)
                }
            })
            return res.json({status: 200})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Delete messages error'})
        }
    }

    async getMessages(req, res, next) {
        try {
            let access = false
            const chat = await Chat.findOne({
                where: {id: req.query.chatId},
                include: [
                    {
                        model: User,
                        as: "users",
                        attributes: ['id']
                    }
                ]
            })
            chat.users.forEach(user => {
                if (user.id === req.user.id) {
                    access = true
                }
            })
            if (!access) {
                return next(ApiError.badRequest('Нет доступа!'))
            }
            const limit = 30
            const offset = parseInt(req.query.offset) || 0
            const length = await Msg.count({where: {chatId: req.query.chatId}})
            if (length <= limit && offset === 0) {
                const messages = await Msg.findAll({
                    where: {
                        chatId: req.query.chatId
                    }
                })
                return res.json({messages})
            }
            if (offset >= length) {
                return res.json({messages: []})
            }
            if (length - offset - limit < 0) {
                const messages = await Msg.findAll({
                    where: {
                        chatId: req.query.chatId
                    },
                    limit: length - offset
                })
                return res.json({messages})
            }
            const messages = await Msg.findAll({
                where: {
                    chatId: req.query.chatId
                },
                offset: length - offset - limit,
                limit: limit
            })
            return res.json({messages})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Send message error'})
        }
    }
}

module.exports = new userController()
