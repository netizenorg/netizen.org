const fs = require('fs')
const path = require('path')

function someoneLoggedOff (socket, io) {
  console.log(`${socket.id} is gone!`)
}

function clientSentMessage (socket, io, msg) {
  console.log(`${socket.id} said: ${msg}`)
}

function updateNotePad (socket, t) {
  socket.broadcast.emit('note-pad-update', t)
  const data = require('../data/notepad.json')
  const filepath = path.join(__dirname, '../data/notepad.json')
  data.text = t
  data.updated = Date.now()
  fs.writeFile(filepath, JSON.stringify(data), (err) => {
    if (err) console.log(err)
  })
}

function getNotePad (socket) {
  const data = require('../data/notepad.json')
  socket.emit('init-note-pad', data)
}

module.exports = (socket, io) => {
  // console.log('a user connected')
  // connected = io.sockets.clients().connected
  console.log(`${socket.id} connected!`)
  socket.on('disconnect', () => { someoneLoggedOff(socket, io) })
  socket.on('new-message', (m) => { clientSentMessage(socket, io, m) })

  // for class page
  // TODO: add logic for diff "room"
  io.emit('user-entered', socket.id)
  socket.on('disconnect', () => io.emit('user-left', socket.id))
  socket.on('moved', (m) => socket.broadcast.emit('user-moved', m))
  socket.on('moved-win', (m) => socket.broadcast.emit('win-moved', m))

  socket.on('play', () => io.emit('play-video'))
  socket.on('pause', () => io.emit('pause-video'))
  socket.on('load', (v) => io.emit('load-slide', v))
  socket.on('time', (t) => io.emit('change-time', t))

  getNotePad(socket)
  socket.on('note-pad-input', (t) => updateNotePad(socket, t))
}
