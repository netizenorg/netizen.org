/* global nn */
/*

   To test this, in index.html, replace this:
    <div id="splash-canvas"></div>

   with this:
    <canvas id="splash-canvas"></canvas>

  Then in main.js
  ----------------
  splash = new NetizenASCIISplash({
    fontSize: 16,
    ele: '#splash-canvas', // actual canvas element

    image: [
      'images/walking-tour/netwalkingtour4.jpg',
      'images/walking-tour/netwalkingtour3.jpg',
      'images/walking-tour/netwalkingtour2.jpg',
      'images/walking-tour/netwalkingtour1.jpg'
    ],
    holdTime: 6000,
    fadeTime: 1000,
    scrambleTime: 10,
    asciiHoldTime: 3000,
    aspectWidth: 16,
    aspectHeight: 9
  })

*/

class NetizenASCIISplash {
  constructor (opts = {}) {
    this.ele = opts.ele
    this.images = opts.images || []
    this.holdTime = opts.holdTime || 5000
    this.fadeTime = opts.fadeTime || 1000
    this.scrambleTime = opts.scrambleTime || 4000
    this.asciiHoldTime = opts.asciiHoldTime || 3000
    this.aspectWidth = opts.aspectWidth || 16
    this.aspectHeight = opts.aspectHeight || 9
    this.fontSize = opts.fontSize || 16
    this.fontFamily = opts.fontFamily || 'Fira Mono, Courier New, monospace'
    this.asciiCore = opts.asciiCore || ['.', '*', 'O', 'O']
    this.asciiChars = opts.asciiChars || [
      ' ', '.', ':', '-', '=', '+', '*', '#', '%', '@', 'O',
      'O', '@', '%', '#', '*', '+', '=', '-', ':', '.', ' ',
      ' ', '.', ':', '-', '=', '+', '*', '#', '%', '@', 'O',
      'O', '@', '%', '#', '*', '+', '=', '-', ':', '.', ' ',
      ' ', '.', ':', '-', '=', '+', '*', '#', '%', '@', 'O',
      'O', '@', '%', '#', '*', '+', '=', '-', ':', '.', ' '
    ]

    this._currentImage = null
    this._currentAscii = null
    this._mode = 'color'
    this._imgs = null
    this._running = false

    this.canvas = nn.get(this.ele)
    this.canvas.css({
      width: '100vw',
      height: 'auto',
      display: 'block'
    })
    this.ctx = this.canvas.getContext('2d')

    const altTxt = 'A Slide show of netizen.org initiatives, the ASCII symbols "*", "." and "O" print across the screen to transition various images of events and projects from netizen\'s history'
    this.canvas.setAttribute('aria-label', altTxt)
    this.canvas.textContent = altTxt

    this.initCanvasSize()
    this.start()

    this._transitioning = false
    this._needResize = false

    nn.on('resize', () => {
      clearTimeout(this._splashResize)
      this._splashResize = setTimeout(() => {
        if (this._transitioning) {
          this._needResize = true
        } else {
          this._onResize()
        }
      }, 200)
    })
  }

  async preloadImages () {
    if (this._imgs) return
    this._imgs = await Promise.all(
      this.images.map(src => nn.loadImage(src))
    )
  }

  initCanvasSize () {
    const w = this.canvas.clientWidth
    const h = Math.floor(w * this.aspectHeight / this.aspectWidth)
    this.canvas.width = w
    this.canvas.height = h
  }

  _onResize () {
    // 1) resize the canvas element & buffer
    this.initCanvasSize()

    // 2) redraw whichever mode we’re in, at the new resolution/font
    if (this._mode === 'color') {
      this.drawFullColor()
    } else if (this._mode === 'ascii') {
      // regenerate ASCII at this new size
      const ascii = this.generateAscii(this._currentImage)
      this._currentAscii = ascii
      this.drawCurrentAscii()
    }
  }

  // main transition logix
  async transition (imgA, imgB) {
    this._transitioning = true
    try {
      const asciiA = this.generateAscii(imgA)
      const asciiB = this.generateAscii(imgB)
      await this.fadeToAscii(imgA, asciiA)
      await this.fadeOutBackground(imgA, asciiA)
      await nn.sleep(this.asciiHoldTime)
      if (!this._running) return
      // await this.scanLineWaveAscii(asciiA, asciiB)
      await this.sequentialAscii(asciiA, asciiB)
      await this.fadeToColor(imgB, asciiB)
    } finally {
      this._transitioning = false
      if (this._needResize) {
        this._needResize = false
        this._onResize()
      }
    }
  }

  drawFullColor () {
    if (!this._currentImage) return
    const img = this._currentImage
    const { sx, sy, sw, sh } = this.getCoverParams(img, this.canvas.width, this.canvas.height)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.drawImage(
      img,
      sx, sy, sw, sh,
      0, 0, this.canvas.width, this.canvas.height
    )
  }

  drawCurrentAscii () {
    if (!this._currentAscii) return
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.font = `${this.fontSize}px ${this.fontFamily}`
    this.ctx.textBaseline = 'top'
    this.ctx.fillStyle = 'white'
    this._currentAscii.forEach((row, y) =>
      this.ctx.fillText(row, 0, y * this.fontSize)
    )
  }

  // same effect as CSS bg "cover"
  /* returns { sx, sy, sw, sh } in image‐space */
  getCoverParams (img, cvsW, cvsH) {
    const iw = img.naturalWidth
    const ih = img.naturalHeight
    const scale = Math.max(cvsW / iw, cvsH / ih)
    // size of the source box we need to crop out of the image
    const sw = cvsW / scale
    const sh = cvsH / scale
    // center that box in the image
    const sx = (iw - sw) / 2
    const sy = (ih - sh) / 2
    return { sx, sy, sw, sh }
  }

  showFullColor (img) {
    return new Promise(resolve => {
      // track
      this._currentImage = img
      this._currentAscii = null
      this._mode = 'color'
      // draw + hold
      this.drawFullColor()
      this._holdTimeout = setTimeout(() => {
        delete this._holdTimeout
        resolve()
      }, this.holdTime)
    })
  }

  // convert one image→array of strings at current resolution
  generateAscii (img) {
    // measure char dims
    const mctx = nn.create('canvas').getContext('2d')
    mctx.font = `${this.fontSize}px ${this.fontFamily}`
    const cw = mctx.measureText('M').width
    const ch = this.fontSize
    const cols = Math.floor(this.canvas.width / cw)
    const rows = Math.floor(this.canvas.height / ch)

    // get the same cover‐crop you use for the main canvas
    const cover = this.getCoverParams(img, this.canvas.width, this.canvas.height)

    // offscreen draw with cover cropping → low‐res grid
    const off = nn.create('canvas')
    off.width = cols
    off.height = rows
    const oc = off.getContext('2d')
    oc.drawImage(
      img,
      cover.sx, cover.sy, cover.sw, cover.sh, // source rect
      0, 0, cols, rows // dest rect
    )

    const data = oc.getImageData(0, 0, cols, rows).data
    const out = []
    for (let y = 0; y < rows; y++) {
      let row = ''
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4
        const bri = (data[i] + data[i + 1] + data[i + 2]) / 3
        row += this.pickAscii(bri)
      }
      out.push(row)
    }
    return out
  }

  pickAscii (bri) {
    // bri: 0-255
    const norm = bri / 255 // 0-1
    const maxI = this.asciiCore.length - 1
    const idx = Math.floor(norm * maxI)
    return this.asciiCore[idx]
  }

  // fade full-color→ascii overlay
  fadeToAscii (img, ascii) {
    return new Promise(resolve => {
      // capture color frame with cover
      const cOff = nn.create('canvas')
      cOff.width = this.canvas.width
      cOff.height = this.canvas.height
      const cc = cOff.getContext('2d')
      const cover = this.getCoverParams(img, this.canvas.width, this.canvas.height)
      cc.drawImage(
        img,
        cover.sx, cover.sy, cover.sw, cover.sh,
        0, 0, this.canvas.width, this.canvas.height
      )

      const steps = Math.ceil(this.fadeTime / 16)
      let i = 0
      const step = () => {
        // …draw…
        if (i++ < steps) {
          this._animFrame = window.requestAnimationFrame(step)
        } else {
          delete this._animFrame
          this._mode = 'ascii'
          this._currentAscii = ascii
          resolve()
        }
      }
      step()
    })
  }

  async sequentialAscii (asciiA, asciiB, batchSize = 8) {
    const rows = asciiA.length
    const cols = asciiA[0].length
    const total = rows * cols
    const numBatches = Math.ceil(total / batchSize)
    const msPerBatch = this.scrambleTime / numBatches

    // measure character cell size
    const mctx = nn.create('canvas').getContext('2d')
    mctx.font = `${this.fontSize}px ${this.fontFamily}`
    const cw = mctx.measureText('M').width
    const ch = this.fontSize

    // flatten all positions in row-major order
    const positions = []
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        positions.push({ y, x })
      }
    }

    // current mutable grid
    const current = asciiA.map(r => r.split(''))

    // track mode & state
    this._mode = 'ascii'
    this._currentAscii = asciiA

    // prepare drawing style
    this.ctx.font = `${this.fontSize}px ${this.fontFamily}`
    this.ctx.textBaseline = 'top'
    this.ctx.fillStyle = 'white'

    // process each batch
    for (let b = 0; b < numBatches; b++) {
      const start = b * batchSize
      const end = Math.min(start + batchSize, total)
      for (let i = start; i < end; i++) {
        const { y, x } = positions[i]
        const chTarget = asciiB[y][x]
        current[y][x] = chTarget

        // clear & draw this cell
        this.ctx.clearRect(x * cw, y * ch, cw, ch)
        this.ctx.fillText(chTarget, x * cw, y * ch)
      }
      // wait before next batch
      await nn.sleep(msPerBatch)
      if (!this._running) return
    }

    // finalize stored ASCII
    this._currentAscii = current.map(r => r.join(''))
  }

  // wave-staggered sequential scramble
  scanLineWaveAscii (asciiA, asciiB) {
    return new Promise(resolve => {
      const chars = this.asciiChars
      const L = chars.length
      const rows = asciiA.length
      const cols = asciiA[0].length

      // map each cell to start/target indices
      const startIdx = asciiA.map(r => r.split('').map(c => chars.indexOf(c)))
      const targetIdx = asciiB.map(r => r.split('').map(c => chars.indexOf(c)))

      // local steps needed per cell = one full cycle + forward distance
      const localSteps = startIdx.map((row, y) =>
        row.map((s, x) => {
          const dist = (targetIdx[y][x] - s + L) % L
          return L + dist
        })
      )

      // find the max local steps across all cells
      const maxLocal = localSteps.reduce(
        (m, row) => Math.max(m, ...row), 0
      )

      // global timeline runs long enough for last column to finish
      const globalMax = maxLocal + (cols - 1)
      const interval = this.scrambleTime / globalMax

      let step = 0
      const iv = setInterval(() => {
        // clear & prep
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.font = `${this.fontSize}px ${this.fontFamily}`
        this.ctx.textBaseline = 'top'
        this.ctx.fillStyle = 'white'

        // draw row by row
        for (let y = 0; y < rows; y++) {
          let line = ''
          for (let x = 0; x < cols; x++) {
            if (step < x) {
              // not started yet: show original
              line += chars[startIdx[y][x]]
            } else {
              const localStep = step - x
              if (localStep < localSteps[y][x]) {
                // mid-cycle: advance one per tick
                const idx = (startIdx[y][x] + localStep) % L
                line += chars[idx]
              } else {
                // done: lock on target
                line += chars[targetIdx[y][x]]
              }
            }
          }
          this.ctx.fillText(line, 0, y * this.fontSize)
        }

        step++
        if (step > globalMax) {
          clearInterval(iv)
          resolve()
        }
      }, interval)
    })
  }

  // fade ascii→full-color
  fadeToColor (img, ascii) {
    return new Promise(resolve => {
      // build ascii offscreen
      const aOff = nn.create('canvas')
      aOff.width = this.canvas.width
      aOff.height = this.canvas.height
      const ac = aOff.getContext('2d')
      ac.font = `${this.fontSize}px ${this.fontFamily}`
      ac.textBaseline = 'top'
      ac.fillStyle = 'white'
      ascii.forEach((row, y) =>
        ac.fillText(row, 0, y * this.fontSize)
      )

      // build color offscreen with cover
      const cOff = nn.create('canvas')
      cOff.width = this.canvas.width
      cOff.height = this.canvas.height
      const cc = cOff.getContext('2d')
      const cover = this.getCoverParams(img, this.canvas.width, this.canvas.height)
      cc.drawImage(
        img,
        cover.sx, cover.sy, cover.sw, cover.sh,
        0, 0, this.canvas.width, this.canvas.height
      )

      const steps = Math.ceil(this.fadeTime / 16)
      let i = 0
      const step = () => {
        const t = i / steps
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.globalAlpha = 1 - t
        this.ctx.drawImage(aOff, 0, 0)
        this.ctx.globalAlpha = t
        this.ctx.drawImage(cOff, 0, 0)
        this.ctx.globalAlpha = 1
        if (i++ < steps) window.requestAnimationFrame(step)
        else {
          // track
          this._mode = 'color'
          this._currentAscii = null
          resolve()
        }
      }
      step()
    })
  }

  // fade out the color beneath your ASCII, leaving ASCII only
  fadeOutBackground (img, ascii) {
    return new Promise(resolve => {
      // build offscreen color buffer
      const cOff = nn.create('canvas')
      cOff.width = this.canvas.width
      cOff.height = this.canvas.height
      const cc = cOff.getContext('2d')
      const cover = this.getCoverParams(img, this.canvas.width, this.canvas.height)
      cc.drawImage(
        img,
        cover.sx, cover.sy, cover.sw, cover.sh,
        0, 0, this.canvas.width, this.canvas.height
      )

      // build offscreen ASCII buffer
      const aOff = nn.create('canvas')
      aOff.width = this.canvas.width
      aOff.height = this.canvas.height
      const ac = aOff.getContext('2d')
      ac.font = `${this.fontSize}px ${this.fontFamily}`
      ac.textBaseline = 'top'
      ac.fillStyle = 'white'
      ascii.forEach((row, y) =>
        ac.fillText(row, 0, y * this.fontSize)
      )

      const steps = Math.ceil(this.fadeTime / 16)
      let i = 0
      const step = () => {
        const t = i / steps
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        // draw color fading out
        this.ctx.globalAlpha = 1 - t
        this.ctx.drawImage(cOff, 0, 0)
        // draw ASCII fully
        this.ctx.globalAlpha = 1
        this.ctx.drawImage(aOff, 0, 0)
        if (i++ < steps) window.requestAnimationFrame(step)
        else resolve()
      }
      step()
    })
  }

  // helper to draw an ascii array
  drawAscii (ascii) {
    this.ctx.font = `${this.fontSize}px ${this.fontFamily}`
    this.ctx.textBaseline = 'top'
    this.ctx.fillStyle = 'white'
    ascii.forEach((row, y) =>
      this.ctx.fillText(row, 0, y * this.fontSize)
    )
  }

  // -----------------

  async start () {
    if (this._running) return
    this._running = true
    await this.preloadImages()
    let idx = 0
    while (this._running) {
      const curr = this._imgs[idx]
      await this.showFullColor(curr)
      if (!this._running) break
      const nextIdx = (idx + 1) % this._imgs.length
      await this.transition(curr, this._imgs[nextIdx])
      idx = nextIdx
    }
  }

  stop () {
    this._running = false
    if (this._holdTimeout) {
      clearTimeout(this._holdTimeout)
      delete this._holdTimeout
    }
    if (this._animFrame) {
      window.cancelAnimationFrame(this._animFrame)
      delete this._animFrame
    }
  }
}

window.NetizenASCIISplash = NetizenASCIISplash
