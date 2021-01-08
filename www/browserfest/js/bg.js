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
  ctx.fillStyle = '#060d1d'
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
  ctx.fillStyle = '#060d1d11'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  pxl.forEach(p => p.update())
}

window.addEventListener('resize', setup)
window.addEventListener('load', () => {
  setup()
  draw()
})

bfest.addEventListener('click', () => {
  window.open('https://netizenorg.github.io/netitor/#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', '_blank')
})
