function someoneLoggedOff (socket, io) {
  console.log(`${socket.id} is gone!`)
}

function clientSentMessage (socket, io, msg) {
  console.log(`${socket.id} said: ${msg}`)
}

module.exports = (socket, io) => {
  // console.log('a user connected')
  // connected = io.sockets.clients().connected
  console.log(`${socket.id} connected!`)
  socket.on('disconnect', () => { someoneLoggedOff(socket, io) })
  socket.on('new-message', (m) => { clientSentMessage(socket, io, m) })

  // for slides page
  socket.on('play', () => io.emit('play-video'))
  socket.on('pause', () => io.emit('pause-video'))
  socket.on('load', (v) => io.emit('load-video', v))
  socket.on('time', (t) => io.emit('change-time', t))
}
