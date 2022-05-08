const express = require('express')
const sequelize = require('./db')
const cors = require('cors')
const router = require('./routers/index')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    allowEIO3: true,
    cors: {
        origin: '*',
    }
})
io.on('connection', socket => {
    global.socket = socket
})
global.io = io
global.users = {}

const PORT = 5000

app.use(cors())
app.use(express.json())
app.use('/api', router)

// Обработка ошибок
app.use(errorHandler)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        server.listen(3000, () => {})
        app.listen(PORT, () => console.log('SERVER STARTED ON PORT ' + PORT))
    } catch (e) {
        console.log(e)
    }
}

start()
