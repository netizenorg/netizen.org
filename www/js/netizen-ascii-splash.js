/* global nn */
class NetizenASCIISplash {
  constructor (opts = {}) {
    this.container = opts.ele || document.body
    if (Array.isArray(opts.images)) {
      this.imageList = opts.images
      this.currentIndex = 0
      this.imagePath = this.imageList[0]
    } else {
      this.imageList = null
      this.imagePath = opts.images
    }

    this.charSet = opts.chars || 'OO*. '
    this.fontSize = opts.fontSize || 8
    this.radius = opts.radius || 100 // size of the Ascii Circle
    this.duration = opts.duration || 2000 // how long before we remove an Ascii Circle
    this.removeRate = opts.removeRate || 10 // how many chars to remove from Ascii Circle
    this.transitionWait = opts.transitionWait || 2000 // how long to wait before next Ascii image fades into clean version

    // this.fgColor = 'white'
    // this.bgColor = 'black'
    // this.bgColorB = 'rgba(0, 0, 0, 0.8)'

    this.fgColor = 'black'
    this.bgColor = 'white'
    this.bgColorB = 'rgba(255, 255, 255, 0.8)'

    this.drawnCells = {} // { "col-row": count }
    this.overlays = [] // [{ canvas, cells:[ "col-row", ... ] }]
    this.locked = false
    this.click = 0

    this.init()
  }

  async init () {
    this.canvas = document.createElement('canvas')
    Object.assign(this.canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      display: 'block'
    })
    this.container.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')

    try {
      this.img = await this.loadImage(this.imagePath)
      this.resizeCanvas()
      this.drawImageCover()
    } catch (err) { console.error('Failed to load image:', err) }

    window.addEventListener('resize', () => {
      this.resizeCanvas()
      this.drawImageCover()
    })

    this.canvas.addEventListener('mousemove', this.onHover.bind(this))
    this.canvas.addEventListener('click', this.onClick.bind(this))
  }

  resizeCanvas () {
    const w = window.innerWidth
    const h = w * 9 / 16
    this.canvas.width = w
    this.canvas.height = h
    this.container.style.height = `${h}px`
  }

  stop () { this.locked = true }

  start () { this.locked = false }

  // *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O

  onHover (e) {
    if (this.locked) return
    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    this.drawAsciiCircle(x, y)
  }

  async onClick (e) {
    if (this.locked) return

    this.click++

    this.clearStack()

    // if we've got an image list && we've clicked twice (not just once)
    if (this.imageList && this.click % 2 === 0) { // then move onto next image
      this.currentIndex = (this.currentIndex + 1) % this.imageList.length
      this.imagePath = this.imageList[this.currentIndex]
      this.img = await this.loadImage(this.imagePath)
      this.drawImageCover(true)
      this.locked = true
    }

    this.drawAsciiCover()
  }

  // *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O

  loadImage (path) {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => resolve(img)
      img.onerror = err => reject(err)
      img.src = path
    })
  }

  clearStack () {
    this.overlays.forEach(o => {
      if (o.canvas.parentNode === this.container) {
        this.container.removeChild(o.canvas)
      }
      o.cells.forEach(id => delete this.drawnCells[id])
    })
    this.overlays = []
  }

  drawImageCover (overlay) {
    const cw = this.canvas.width
    const ch = this.canvas.height
    const iw = this.img.naturalWidth
    const ih = this.img.naturalHeight
    const canvasRatio = cw / ch
    const imageRatio = iw / ih
    let sx, sy, sw, sh

    if (imageRatio > canvasRatio) {
      sw = ih * canvasRatio; sh = ih
      sx = (iw - sw) / 2; sy = 0
    } else {
      sw = iw; sh = iw / canvasRatio
      sx = 0; sy = (ih - sh) / 2
    }

    this.ctx.clearRect(0, 0, cw, ch)
    this.ctx.drawImage(this.img, sx, sy, sw, sh, 0, 0, cw, ch)

    if (overlay) { // if we're transitioning to a new image
      // draw clean overlay of new image (assuming the main canvas is ascii-fied)
      const overlay = nn.create('canvas')
        .set({ width: cw, height: ch })
        .css({
          position: 'absolute',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity var(--tt) var(--out-cubic)'
        })
        .addTo(this.container)
      const octx = overlay.getContext('2d')
      octx.drawImage(this.img, sx, sy, sw, sh, 0, 0, cw, ch)
      // wait for a while, then fade in the clean canvas
      setTimeout(() => {
        overlay.style.opacity = 1
        setTimeout(() => { // when fade is complete
          // replace (assumed) ascii-fied canvas with clean image
          this.ctx.clearRect(0, 0, cw, ch)
          this.ctx.drawImage(this.img, sx, sy, sw, sh, 0, 0, cw, ch)
          overlay.remove() // ...then remove clean overlay
          this.locked = false
        }, 800)
      }, this.transitionWait)
    }
  }

  drawAsciiCover () {
    const fs = this.fontSize
    const cw = this.canvas.width
    const ch = this.canvas.height
    const chars = this.charSet
    const cols = Math.floor(cw / fs)
    const rows = Math.floor(ch / fs)
    // grab current image pixels
    const data = this.ctx.getImageData(0, 0, cw, ch).data
    // clear to black background
    this.ctx.fillStyle = this.bgColor
    this.ctx.fillRect(0, 0, cw, ch)
    this.ctx.font = `${fs}px monospace`
    this.ctx.fillStyle = this.fgColor
    this.ctx.textBaseline = 'top'
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const px = Math.floor(col * fs + fs / 2)
        const py = Math.floor(row * fs + fs / 2)
        const idx = (py * cw + px) * 4
        let avg = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
        if (this.bgColor === 'white') avg = 255 - avg
        const ci = Math.floor((avg / 255) * (chars.length - 1))
        const glyph = chars.charAt(chars.length - 1 - ci)
        this.ctx.fillText(glyph, col * fs, row * fs)
      }
    }
  }

  drawAsciiCircle (x, y) {
    const r = this.radius
    const fs = this.fontSize
    const cw = this.canvas.width
    const ch = this.canvas.height

    // compute grid cell bounds whose centers might lie in circle
    const colMin = Math.max(0, Math.ceil((x - r - fs / 2) / fs))
    const rowMin = Math.max(0, Math.ceil((y - r - fs / 2) / fs))
    const colMax = Math.min(Math.floor((x + r - fs / 2) / fs), Math.floor((cw - fs / 2) / fs))
    const rowMax = Math.min(Math.floor((y + r - fs / 2) / fs), Math.floor((ch - fs / 2) / fs))
    if (colMax < colMin || rowMax < rowMin) return

    const cols = colMax - colMin + 1
    const rows = rowMax - rowMin + 1
    const left = colMin * fs
    const top = rowMin * fs
    const w = cols * fs
    const h = rows * fs

    // block = original image data
    const block = this.ctx.getImageData(left, top, w, h).data
    const overlay = nn.create('canvas')
      .set({ width: w, height: h })
      .css({
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        pointerEvents: 'none'
      })
    const octx = overlay.getContext('2d')
    const chars = this.charSet

    // collect cells this overlay draws on
    const myCells = []

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cx = left + col * fs + fs / 2
        const cy = top + row * fs + fs / 2
        const dx = cx - x
        const dy = cy - y
        if (dx * dx + dy * dy > r * r) continue

        const cellId = `${colMin + col}-${rowMin + row}`
        if (this.drawnCells[cellId]) continue

        // sample brightness in this fs×fs cell
        let sum = 0
        let cnt = 0
        for (let py = 0; py < fs; py++) {
          for (let px = 0; px < fs; px++) {
            const idx = ((row * fs + py) * w + (col * fs + px)) * 4
            sum += (block[idx] + block[idx + 1] + block[idx + 2]) / 3
            cnt++
          }
        }
        let avg = sum / cnt
        if (this.bgColor === 'white') avg = 255 - avg
        const ci = Math.floor((avg / 255) * (chars.length - 1))
        const ch = chars.charAt(chars.length - 1 - ci)

        // draw transparent bg + char
        octx.fillStyle = this.bgColorB
        octx.fillRect(col * fs, row * fs, fs, fs)
        octx.font = `${fs}px monospace`
        octx.fillStyle = this.fgColor
        octx.fillText(ch, col * fs, (row + 1) * fs)

        // mark as drawn
        this.drawnCells[cellId] = 1
        myCells.push(cellId)
      }
    }

    if (myCells.length === 0) return
    this.container.appendChild(overlay)
    this.overlays.push({ canvas: overlay, cells: myCells })

    // schedule removal & free those cells
    setTimeout(() => this.removeAsciiCircle(overlay, myCells), this.duration)
  }

  removeAsciiCircle (canvas, cells) {
    const fs = this.fontSize
    const interval = 30
    const batchSize = this.removeRate
    const offX = parseInt(canvas.style.left, 10)
    const offY = parseInt(canvas.style.top, 10)
    const ctx = canvas.getContext('2d')

    // shuffle cells
    const order = cells.slice()
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }

    const steps = Math.ceil(order.length / batchSize)
    for (let step = 0; step < steps; step++) {
      setTimeout(() => {
        const start = step * batchSize
        const end = Math.min(start + batchSize, order.length)
        for (let k = start; k < end; k++) {
          const [col, row] = order[k].split('-').map(Number)
          const x0 = col * fs - offX
          const y0 = row * fs - offY
          ctx.clearRect(x0, y0, fs, fs)
        }
      }, step * interval)
    }

    // once all batches have run, remove the canvas and free cells
    setTimeout(() => {
      if (canvas.parentNode === this.container) {
        this.container.removeChild(canvas)
      }
      this.overlays = this.overlays.filter(o => o.canvas !== canvas)
      cells.forEach(id => delete this.drawnCells[id])
    }, steps * interval + interval)
  }
}

window.NetizenASCIISplash = NetizenASCIISplash
