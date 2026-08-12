class NetizenBentText {
  constructor (config) {
    const {
      parent,
      text,
      color,
      padding = 10,
      xOverlap = 10,
      yOverlap = 10,
      fontFamily = 'Fira Mono',
      lineWidth = 2
    } = config

    this.container = typeof parent === 'string'
      ? document.querySelector(parent)
      : parent
    if (!this.container) {
      throw new Error('Invalid parent element')
    }

    this.lines = Array.isArray(text) ? text : [text]
    this.strokeColor = color
    this.opts = { padding, xOverlap, yOverlap, fontFamily, lineWidth }

    this.canvas = document.createElement('canvas')
    this.container.appendChild(this.canvas)
    this.update()

    window.addEventListener('resize', () => this.update())

    // redraw whenever the parent element itself resizes
    this._ro = new window.ResizeObserver(() => this.update())
    this._ro.observe(this.container)
  }

  update (config = {}) {
    const { text, color, padding, xOverlap, yOverlap } = config
    if (text) this.lines = Array.isArray(text) ? text : [text]
    if (color) this.strokeColor = color
    if (padding != null) this.opts.padding = padding
    if (xOverlap != null) this.opts.xOverlap = xOverlap
    if (yOverlap != null) this.opts.yOverlap = yOverlap
    this._draw()
  }

  destroy () {
    // later, if you ever want to clean up:
    window.removeEventListener('resize', this.update)
    this._ro.disconnect()
  }

  _draw () {
    const { padding, xOverlap, yOverlap, fontFamily, lineWidth } = this.opts
    const lines = this.lines
    const { width: w, height: h } = this.container.getBoundingClientRect()

    // 1) Measure each character at a big base size to get relative widths
    const baseSize = 200
    const measurer = document.createElement('canvas').getContext('2d')
    measurer.font = `${baseSize}px ${fontFamily}`
    const baseWidths = lines.map(line =>
      line.split('').map(ch => measurer.measureText(ch).width)
    )
    const baseSums = baseWidths.map(ws =>
      ws.reduce((a, b) => a + b, 0)
    )

    // 2) Choose fontSize so the widest line (with xOverlap) fits available width
    const availW = w - padding * 2
    const candidateSizes = baseSums.map((sum, i) => {
      const chars = baseWidths[i].length
      return baseSize * (availW + xOverlap * (chars - 1)) / sum
    })
    const fontSize = Math.floor(Math.min(...candidateSizes))

    // 3) Re-measure widths & actual line height at that fontSize
    const m2 = document.createElement('canvas').getContext('2d')
    m2.font = `${fontSize}px ${fontFamily}`
    const letterWidths = lines.map(line =>
      line.split('').map(ch => m2.measureText(ch).width)
    )
    const sample = m2.measureText('Mg')
    const lineH = sample.actualBoundingBoxAscent + sample.actualBoundingBoxDescent

    // 4) Solve for vertical scale so that
    //    (n*lineH − (n−1)*yOverlap)*vScale = h − 2*padding
    const n = lines.length
    const vScale = (h - 2 * padding + (n - 1) * yOverlap) / (n * lineH)

    // 5) Pre-stretch spacing so that after scaling you get exactly yOverlap px
    //    (lineH*vScale) − (ySpace*vScale) = yOverlap  ⇒  ySpace = lineH − yOverlap/vScale
    const ySpace = lineH - yOverlap / vScale

    // 6) Compute raw canvas width
    const maxLineW = letterWidths.reduce((mx, arr) => {
      const sum = arr.reduce((a, b) => a + b, 0)
      return Math.max(mx, sum - xOverlap * (arr.length - 1))
    }, 0)
    const rawW = maxLineW + padding * 2

    // 7) Resize & clear
    const canvas = this.canvas
    canvas.width = Math.ceil(rawW)
    canvas.height = Math.ceil(h)
    const ctx = canvas.getContext('2d')
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 8) Apply vertical stretch + constant padding
    ctx.setTransform(1, 0, 0, vScale, padding, padding)
    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = this.strokeColor
    ctx.textBaseline = 'top'

    // 9) Draw each line with xOverlap & ySpace
    lines.forEach((line, row) => {
      let x = 0
      const y = ySpace * row
      line.split('').forEach((ch, i) => {
        ctx.strokeText(ch, x, y)
        x += letterWidths[row][i] - xOverlap
      })
    })
  }
}

window.NetizenBentText = NetizenBentText
