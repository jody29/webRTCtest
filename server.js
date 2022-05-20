const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, {
    cors: {
        origin: '*'
    }
})
const { v4: uuidV4 } = require('uuid')
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
    debug: true
})

app.use('/peerjs', peerServer)
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', {
        roomId: req.params.room
    })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId, userName) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)
        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message, userName)
        })
    })
})

server.listen(3030, () => {
    console.log('http://localhost:3030')
})