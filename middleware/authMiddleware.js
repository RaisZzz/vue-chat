const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        const token = req.query.token || req.body.token
        if (!token) {
            return res.status(401).json({message: 'Не авторизован'})
        }
        const decoded = jwt.verify(token, 'random_secret_key_123')
        req.user = decoded
        next()
    } catch (e) {
        res.status(401).json({message: 'Не авторизован'})
    }
}
