const ApiError = require('../error/ApiError')
const {User, Chat, Msg} = require('../models/models')
const express = require("express");

class userController {
    async start(req, res) {
        try {
            let resChat = null
            const chats = await Chat.findAll({})
            // Проверка, нет ли такого чата
            chats.forEach(chat => {
                if (JSON.stringify(chat.usersIn.sort()) == JSON.stringify(req.body.users.sort())) resChat = chat
            })
            // Создание нового чата
            if (!resChat) {
                resChat = await Chat.create({usersIn: req.body.users, messages: []})
            }
            return res.json({[resChat.id]: resChat})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Create chat error'})
        }
    }

    async all(req, res) {
        try {
            const chats = await Chat.findAll()

            const response = {}
            const userId = req.user.id
            await chats.forEach(chat => {
                chat.usersIn.forEach(user => {
                    if (user == userId) {
                        response[chat.id] = chat
                    }
                })
            })
            return res.json({chats: response})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Get chats error'})
        }
    }

    async sendMessage(req, res, next) {
        try {
            let access = false
            const chat = await Chat.findAll({where: {id: req.body.chatId}})
            chat[0].usersIn.forEach(user => {
                if (user === req.user.id) {
                    access = true
                }
            })
            if (!access) {
                return next(ApiError.badRequest('Нет доступа!'))
            }
            const msg = await Msg.create({text: req.body.message, userId: req.user.id, chatId: req.body.chatId})
            chat[0].usersIn.forEach(user => {
                if (global.users[user]) {
                    global.users[user].emit('message', [{chatId: req.body.chatId, userId: req.user.id, message: msg}])
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
            const chat = await Chat.findAll({where: {
                id: req.body.chatId
            }})
            let access = false
            chat[0].usersIn.forEach(user => {
                if (user === req.user.id) {
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
            chat[0].usersIn.forEach(user => {
                if (global.users[user]) {
                    global.users[user].emit('messagesDeleted', req.body.messages)
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
            const chat = await Chat.findAll({where: {id: req.query.chatId}})
            chat[0].usersIn.forEach(user => {
                if (user === req.user.id) {
                    access = true
                }
            })
            if (!access) {
                return next(ApiError.badRequest('Нет доступа!'))
            }
            const limit = 30
            const offset = req.query.offset || 0
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
