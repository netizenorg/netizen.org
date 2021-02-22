/*
  █▄▄ █▀█ █▀█ █░█░█ █▀ █▀▀ █▀█   █▀▀ █▀▀ █▀ ▀█▀   ▀█ █▀█ ▀█ █▀█ ▄█
  █▄█ █▀▄ █▄█ ▀▄▀▄▀ ▄█ ██▄ █▀▄   █▀░ ██▄ ▄█ ░█░   █▄ █▄█ █▄ █▄█ ░█
*/


class GradientBG {
  constructor () {
    this.grad1 = '#1c1c3600' // dark
    this.grad0 = '#6e6ed450' // light
    this.size = 0.35 // ie. half of screen
    this._createCanvas()
    window.addEventListener('mousemove', (e) => this._canvasMouseMove(e))
    window.addEventListener('resize', (e) => this._canvasResize(e))
  }

  _createCanvas () {
    this.canv = document.createElement('canvas')
    this.canv.style.position = 'fixed'
    this.canv.style.top = '0px'
    this.canv.style.left = '0px'
    this.canv.style.width = '100vw'
    this.canv.style.height = '100vh'
    this.canv.style.zIndex = '-9999998'
    document.body.appendChild(this.canv)
    this._canvasResize()
    this._canvasUpdate(0, 0)
    this._canvasMouseMove({ clientX: 0, clientY: 0 })
    return this.canv
  }

  _canvasUpdate (x, y) {
    const ctx = this.canv.getContext('2d')
    const rad = (this.canv.width > this.canv.height)
      ? this.canv.width * this.size : this.canv.height * this.size
    const g = ctx.createRadialGradient(x, y, 1, x, y, rad)
    ctx.clearRect(0, 0, this.canv.width, this.canv.height)
    g.addColorStop(0, this.grad0)
    g.addColorStop(1, this.grad1)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, this.canv.width, this.canv.height)
  }

  _canvasResize (e) {
    e = e || {}
    const x = (e.clientX || 0)
    const y = (e.clientY || 0)
    this.canv.width = window.innerWidth
    this.canv.height = window.innerHeight
    this._canvasUpdate(x, y)
  }

  _canvasMouseMove (e) {
    const x = e.clientX
    const y = e.clientY
    this._canvasUpdate(x, y)
  }
}

window.gradientbg = new GradientBG()
