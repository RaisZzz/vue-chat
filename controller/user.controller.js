const Sequelize = require('sequelize')
const Op = Sequelize.Op
const ApiError = require('../error/ApiError')
const {User} = require('../models/models')

class userController {
    async getData(req, res) {
        try {
            return res.json({user: req.user})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Get users error'})
        }
    }

    async getAll(req, res) {
        try {
            const search = req.query.search || ''
            const offset = parseInt(req.query.offset) || 0
            const limit = 20
            const users = await User.findAll({
                offset: offset,
                limit: limit,
                attributes: ['username', 'email', 'id'],
                where: {
                    [Op.or]: {
                        username: {
                            [Op.iLike]: `%${search}%`
                        },
                        email: {
                            [Op.iLike]: `%${search}%`
                        }
                    }
                }
            })
            return res.json({users})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Get users error'})
        }
    }

    async getOne(req, res) {
        try {
            const user = await User.findAll({
                attributes: ['username', 'email', 'id'],
                where: {
                    id: req.query.userId
                }
            })
            return res.json({user})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Get users error'})
        }
    }
}

module.exports = new userController()
