/*
  █▄▄ █▀█ █▀█ █░█░█ █▀ █▀▀ █▀█   █▀▀ █▀▀ █▀ ▀█▀   ▀█ █▀█ ▀█ █▀█ ▄█
  █▄█ █▀▄ █▄█ ▀▄▀▄▀ ▄█ ██▄ █▀▄   █▀░ ██▄ ▄█ ░█░   █▄ █▄█ █▄ █▄█ ░█
*/
class Pixel {
  constructor () {
    this.w = 10
    this.h = 15
    this.x = 0
    this.y = 0
    this.i = 0
    this.hue = 0
    this.d = {
      i: Math.random() * 0.03 + 0.01,
      h: Math.random() * 0.1,
      r: Math.random() * 2 + 0.5,
      l: Math.random()
    }
    if (Math.random() > 0.5) this.d.i = -this.d.i
    // if (Math.random() > 0.5) this.d.l = -this.d.l
  }

  draw () {
    ctx.fillStyle = `hsl(${this.hue}, 100%, 79%)`
    ctx.fillRect(this.x, this.y, this.w, this.h)
  }

  update () {
    this.i += this.d.i
    const ox = canvas.width / 2
    const oy = canvas.height / 2
    const rad = 100 * this.d.r
    this.x = Math.sin(this.i) * rad + ox
    this.y = Math.cos(this.i + this.d.l) * rad + oy
    this.x = Math.round(this.x / this.w) * this.w
    this.y = Math.round(this.y / this.h) * this.h
    this.hue = Date.now() * this.d.h % 360
    this.draw()
  }
}

const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
canvas.style.position = 'fixed'
canvas.style.top = '0'
canvas.style.left = '0'
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const ctx = canvas.getContext('2d')
ctx.fillStyle = '#060d1d'
ctx.fillRect(0, 0, canvas.width, canvas.height)

const num = 50
let pxl = []

function createPixels () {
  pxl = []
  for (let i = 0; i < num; i++) pxl.push(new Pixel())
}

function centerASCII () {
  const bfest = document.querySelector('pre')
  const test = document.createElement('span')
  test.innerText = '█'
  bfest.appendChild(test)
  const charWidth = test.offsetWidth * 77
  const charHeight = test.offsetHeight * 46
  test.remove()
  bfest.style.left = window.innerWidth / 2 - charWidth / 2 + 'px'
  bfest.style.top = window.innerHeight / 2 - charHeight / 2 + 'px'
}

function draw () {
  window.requestAnimationFrame(draw)
  ctx.fillStyle = '#060d1d11'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  pxl.forEach(p => p.update())
}

function resize () {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  ctx.fillStyle = '#060d1d'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  createPixels()
  centerASCII()
}

window.addEventListener('resize', resize)
window.addEventListener('load', () => {
  draw()
  createPixels()
  centerASCII()
})
