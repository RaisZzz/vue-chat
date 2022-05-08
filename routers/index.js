const Router = require('express')
const router = new Router()
const authRouter = require('./auth.routes')
const userRouter = require('./user.routes')
const chatRouter = require('./chat.routes')

router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/chat', chatRouter)

module.exports = router
