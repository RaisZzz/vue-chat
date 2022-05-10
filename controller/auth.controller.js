const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User, Chat} = require('../models/models')

const generateJWT = (id, email, username) => {
    return jwt.sign(
        {id, email, username},
        'random_secret_key_123',
        {expiresIn: '24h'}
    )
}

class authController {
    async registration(req, res, next) {
        try {
            const {username, email, password} = req.body
            if (!username || !password || !email) {
                return next(ApiError.badRequest('Некорректный логин, почта или пароль'))
            }
            const candidate = await User.findOne({where: {email}})
            if (candidate) {
                return next(ApiError.badRequest('Пользователь с такой почтой уже существует'))
            }
            const hashPassword = await bcrypt.hash(password, 5)
            const user = await User.create({username, email, password: hashPassword, chatsId: []})
            const token = generateJWT(user.id, email, username)
            return res.json({token})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Registration error'})
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body
            const user = await User.findOne({where: {email}})
            if (!user) {
                return next(ApiError.internal('Пользователь не найден'))
            }
            let comparePassword = bcrypt.compareSync(password, user.password)
            if (!comparePassword) {
                return next(ApiError.internal('Неверный пароль'))
            }
            const token = generateJWT(user.id, email, user.username)
            res.json({token})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Login error'})
        }
    }

    async auth(req, res) {
        try {
            const token = generateJWT(req.user.id, req.user.email, req.user.username)

            const date = new Date()
            const dateToday = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`
            console.log('\x1b[47m\x1b[30m', 'USER WITH ID ' + req.user.id + ' AUTH AS: ' + req.user.username + ' AT ' + dateToday, '\x1b[0m')

            return res.json({token, user: req.user})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Auth error'})
        }
    }
}

module.exports = new authController()
