const Router = require('express')
const router = new Router()
const controller = require('../controller/chat.controller')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/all', authMiddleware, controller.all)
router.post('/start', authMiddleware, controller.start)
router.post('/sendMessage', authMiddleware, controller.sendMessage)
router.post('/deleteMessages', authMiddleware, controller.deleteMessages)
router.get('/getMessages', authMiddleware, controller.getMessages)

module.exports = router
