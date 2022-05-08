const Router = require('express')
const router = new Router()
const controller = require('../controller/user.controller')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/data', authMiddleware, controller.getData)
router.get('/all', authMiddleware, controller.getAll)
router.get('/', authMiddleware, controller.getOne)

module.exports = router
