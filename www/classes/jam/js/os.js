/* global io, Slides */
let sel = null // selected window
// let admin = false
const users = {}
const socket = io()
const slides = new Slides({
  parent: document.querySelector('#slides'),
  socket: socket
})
slides.setup(0)

const menuItems = ['notes', 'syllabus', 'slides', 'warez', 'homework']
const itemSizes = {
  notes: { width: 542, height: 400 },
  homework: { width: 590 },
  slides: { width: 600 },
  warez: { width: 392 }
}
const itemInPos = {
  notes: { left: random(20, 60), bottom: random(20, 60) },
  syllabus: { left: random(20, 60), top: random(20, 60) },
  slides: { right: random(20, 60), top: random(20, 60) },
  homework: { right: random(20, 60), bottom: random(20, 60) },
  warez: { left: random(20, 60), top: random(20, 60) },
  chat: { right: random(20, 60), bottom: random(20, 60) }
}

function random (min, max) {
  return min + Math.random() * (max - min)
}

function bubbleUpiFrameEvents (ifr) {
  // see: https://stackoverflow.com/a/38442439/1104148
  const callback = (event, type) => {
    const boundingClientRect = ifr.getBoundingClientRect()
    const o = { bubbles: true, cancelable: false }
    const e = new window.CustomEvent(type, o)
    e.clientX = event.clientX + boundingClientRect.left
    e.clientY = event.clientY + boundingClientRect.top
    e.keyCode = event.keyCode
    e.ctrlKey = event.ctrlKey
    e.metaKey = event.metaKey
    ifr.dispatchEvent(e)
  }
  ifr.contentWindow
    .addEventListener('mousemove', (e) => callback(e, 'mousemove'))
  ifr.contentWindow
    .addEventListener('mouseup', (e) => callback(e, 'mouseup'))
}

menuItems.forEach(item => {
  document.querySelector(`.menu > div[name="${item}"]`)
    .addEventListener('click', (e) => {
      const ele = document.querySelector(`#${item}`)
      if (ele.style.display === 'none') ele.style.display = 'block'
      else ele.style.display = 'none'
      const sz = itemSizes[item]
      if (sz) {
        if (sz.width && ele.width < sz.width) ele.width = sz.width
        if (sz.height && ele.height < sz.height) ele.height = sz.height
      }
      if (item === 'notes') document.querySelector('textarea').focus()
      ele.bring2front()
      ele.recenter()
      ele.update(itemInPos[item], 500)
      setTimeout(() => ele.keepInFrame(), 600)
    })
})

document.querySelector('.menu > div[name="chat"]')
  .addEventListener('click', (e) => {
    const url = 'https://chill.netizen.org/jam'
    const ele = document.querySelector('#chat')
    const ifr = document.querySelector('#chat > iframe')
    if (ele.style.display === 'none') {
      setTimeout(() => {
        ele.width = 720; ele.height = 480
        ele.bring2front()
        ele.recenter()
        ele.update(itemInPos.chat, 500)
      }, 200)
      ele.style.display = 'block'
      ifr.src = url
      bubbleUpiFrameEvents(ifr)
    } else {
      ele.style.display = 'none'
      ifr.src = null
    }
  })

window.addEventListener('load', (event) => {
  document.querySelector('.loading').style.display = 'none'
  setTimeout(() => {
    document.querySelector('#syllabus').width = 720
  }, 100)
})

// ------------------------------------------------------ NOTEPAD --------------
// -----------------------------------------------------------------------------

socket.on('init-note-pad', (data) => {
  document.querySelector('textarea').value = data.text
})

socket.on('note-pad-update', (txt) => {
  document.querySelector('textarea').value = txt
})

document.querySelector('textarea').addEventListener('input', (e) => {
  socket.emit('note-pad-input', e.target.value)
})

// ------------------------------------------------------ MOVING WINDOWS -------
// -----------------------------------------------------------------------------

function newUser (id) {
  users[id] = document.createElement('img')
  users[id].id = 'cursor-' + id
  users[id].src = 'images/cursor.png'
  users[id].style.position = 'absolute'
  users[id].style.zIndex = 500
  users[id].style.top = '0px'
  users[id].style.left = '0px'
  document.body.appendChild(users[id])
}

function rmvUser (id) {
  if (users[id]) {
    users[id].remove()
    delete users[id]
  }
}

function movUser (m) {
  if (!users[m.id]) newUser(m.id)
  users[m.id].style.left = m.x + 'px'
  users[m.id].style.top = m.y + 'px'
}

socket.on('user-left', (id) => rmvUser(id))
socket.on('user-moved', (id) => movUser(id))
socket.on('win-moved', (w) => {
  console.log(w);
})

window.addEventListener('mousemove', (e) => {
  socket.emit('moved', { id: socket.id, x: e.clientX, y: e.clientY })
}, false)

// ------------------------------------------------------ MOVING WINDOWS -------
// -----------------------------------------------------------------------------

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
  if (sel) {
    sel.mouseMove(e)
    // if (admin) {
    //   socket.emit('moved-win', {
    //     id: sel.id,
    //     x: sel.left,
    //     y: sel.top,
    //     z: sel.zIndex,
    //     w: sel.width,
    //     h: sel.height
    //   })
    // }
  }
}

window.addEventListener('mousedown', (e) => mouseDown(e), false)
window.addEventListener('mouseup', (e) => mouseUp(e), false)
window.addEventListener('mousemove', (e) => mouseMove(e), false)
