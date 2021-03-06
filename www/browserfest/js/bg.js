/*
  █▄▄ █▀█ █▀█ █░█░█ █▀ █▀▀ █▀█   █▀▀ █▀▀ █▀ ▀█▀   ▀█ █▀█ ▀█ █▀█ ▄█
  █▄█ █▀▄ █▄█ ▀▄▀▄▀ ▄█ ██▄ █▀▄   █▀░ ██▄ ▄█ ░█░   █▄ █▄█ █▄ █▄█ ░█
*/

const bfest = document.querySelector('pre')
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const rows = 31
const columns = 76
const num = 75 // number of pixels
let pxl = [] // collect pixels
let xradius = 0
let yradius = 0

// Pixel class which creates the colorful pixel objects
class Pixel {
  constructor (width, height) {
    this.w = width
    this.h = height
    this.xr = xradius
    this.yr = yradius
    this.x = 0
    this.y = 0
    this.i = 0
    this.hue = 0
    this.d = {
      i: Math.random() * 0.03 + 0.01,
      h: Math.random() * 0.1,
      r: Math.random(),
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
    const oy = this.yr
    const xr = this.xr * this.d.r
    const yr = this.yr * this.d.r
    this.x = Math.sin(this.i) * xr + ox
    this.y = Math.cos(this.i + this.d.l) * yr + oy
    this.x = Math.round(this.x / this.w) * this.w
    this.y = Math.round(this.y / this.h) * this.h
    this.hue = Date.now() * this.d.h % 360
    this.draw()
  }
}

// main setup function
function setup () {
  // ensure that the <canvas> element matches the
  // full width/height of the page
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  ctx.fillStyle = '#1c1c36'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // calculate optimal font-size
  const scale = window.innerWidth < 800 ? 1 : 0.6
  const fontSize = Math.floor(window.innerWidth * scale / columns * 1.5)
  bfest.style.fontSize = fontSize + 'px'
  // calculate ANSII character text dimensions
  const c = document.createElement('canvas')
  const x = c.getContext('2d')
  x.font = `${fontSize}px 'fira-mono-regular'`
  const width = x.measureText('█').width
  const height = bfest.offsetHeight / rows
  // center the <pre> element
  xradius = (width * columns) / 2
  yradius = (height * rows) / 2
  bfest.style.width = width * columns + 'px'

  // create && store some number of pixel objects
  pxl = []
  for (let i = 0; i < num; i++) pxl.push(new Pixel(width, height))
}

// 1.2

// main animation loop
function draw () {
  window.requestAnimationFrame(draw)
  // setTimeout(() => draw(), 1000)
  ctx.fillStyle = '#1c1c3611'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  pxl.forEach(p => p.update())
}

window.addEventListener('resize', setup)
window.addEventListener('load', () => {
  setup()
  draw()
})

bfest.addEventListener('click', () => {
  window.open('https://netnet.studio/?layout=dock-left#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', '_blank')
})
