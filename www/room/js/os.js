/* global io, DrawCursor */
let sel = null // selected window
let myId = null
const others = {}
const socket = io()

const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.style.position = 'absolute'
canvas.style.left = 0
canvas.style.top = 0
// canvas.style.zIndex = -100
// const ctx = canvas.getContext('2d')

const myCursor = new DrawCursor(canvas)
myCursor.onDraw = (data) => socket.emit('drawing', { id: myId, ...data })

// Window Move/Resize Functions
// ......................................

function allowSelection (bool) {
  if (bool) {
    document.body.style.userSelect = 'auto'
    document.body.style.webkitUserSelect = 'auto'
  } else {
    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'
  }
}

function mouseDown (e) {
  if (e.target.localName === 'browser-window') {
    sel = e.target
    if (sel.shouldMove(e) || sel.shouldResize(e)) allowSelection(false)
    else allowSelection(true)
    sel.mouseDown(e)
  } else sel = null
}

function mouseUp (e) {
  if (sel) sel.mouseUp(e)
  allowSelection(true)
  document.body.style.cursor = 'auto'
  sel = null
}

function mouseMove (e) {
  if (sel) sel.mouseMove(e)
  socket.emit('moving', { id: myId, x: e.clientX, y: e.clientY })
}

function openVideo () {
  const video = document.querySelector('browser-window')
  video.style.display = 'block'
  const jitsi = document.querySelector('#jitsi')
  jitsi.src = 'https://chill.netizen.org/test'
}

// Other Functions
// ......................................

function clearCanvas () {
  const canvas = document.querySelector('canvas')
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  socket.emit('clearing', { id: myId })
}

function otherUpdate (id, type, data) {
  if (!id) return
  if (!others[id]) {
    others[id] = {}
    others[id].img = document.createElement('img')
    others[id].img.src = 'images/marker.png'
    others[id].img.style.position = 'absolute'
    others[id].img.style.zIndex = 9000
    document.body.appendChild(others[id].img)
    others[id].cursor = new DrawCursor(canvas)
  } else {
    if (type === 'new-draw') others[id].cursor.draw(data)
    else if (type === 'new-move') {
      others[id].img.style.left = `${data.x}px`
      others[id].img.style.top = `${data.y}px`
    } else if (type === 'new-clear') clearCanvas()
  }
}

function removeOther (id) {
  if (others[id]) {
    others[id].img.remove()
    delete others[id]
  }
}

// ............................................. EVENT LISTENERS

socket.on('new-id', (id) => {
  myId = id
})

socket.on('new-draw', (data) => {
  otherUpdate(data.id, 'new-draw', data)
})

socket.on('new-move', (data) => {
  otherUpdate(data.id, 'new-move', data)
})

socket.on('new-clear', (data) => {
  otherUpdate(data.id, 'new-clear', data)
})

socket.on('bye', (id) => {
  removeOther(id)
})

canvas.addEventListener('mousedown', (e) => myCursor.mouseDown(e), false)
canvas.addEventListener('mouseup', (e) => myCursor.mouseUp(e), false)
canvas.addEventListener('mousemove', (e) => myCursor.mouseMove(e), false)

window.addEventListener('mousedown', (e) => mouseDown(e), false)
window.addEventListener('mouseup', (e) => mouseUp(e), false)
window.addEventListener('mousemove', (e) => mouseMove(e), false)
document.addEventListener('keydown', (e) => {
  // console.log(e);
  if (e.ctrlKey && e.keyCode === 67) clearCanvas()
  if (e.keyCode === 86) openVideo()
})
