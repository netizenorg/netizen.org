let sel = null // selected window

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
    console.log(sel, e.clientX, e.clientY);
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
window.addEventListener('load', (e) => {

  setTimeout(() => {
    console.clear()
    const jitsi = document.querySelector('#jitsi')
    console.log('JITSI', jitsi);
    bubbleUpiFrameEvents(jitsi)
  }, 5000)

})
