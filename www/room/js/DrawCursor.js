/* global Maths */
class DrawCursor {
  constructor (canvas) {
    this.down = false
    this.x = 0
    this.y = 0
    this.px = null
    this.py = null
    this.ctx = canvas.getContext('2d')
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    this.ctx.strokeStyle = '#27455d'
  }

  mouseDown (e) { this.down = true }

  mouseUp (e) {
    this.down = false
    this.px = null
    this.py = null
  }

  mouseMove (e) {
    if (!this.down) return
    this.x = e.clientX
    this.y = e.clientY
    this.draw()
    this.px = this.x
    this.py = this.y
  }

  draw (data) {
    if (data) {
      this.x = data.x
      this.y = data.y
      this.px = data.px
      this.py = data.py
    }
    if (this.px !== null) {
      const d = Maths.dist(this.x, this.y, this.px, this.py)
      const w = data
        ? data.width : Maths.map(d, 0, window.innerWidth, 5, 100)
      this.ctx.lineWidth = w
      this.ctx.beginPath()
      this.ctx.moveTo(this.px, this.py)
      this.ctx.lineTo(this.x, this.y)
      this.ctx.stroke()
      this.ctx.closePath()
      if (!data && this.onDraw) {
        this.onDraw({
          x: this.x, y: this.y, px: this.px, py: this.py, width: w
        })
      }
    }
  }
}

window.DrawCursor = DrawCursor
