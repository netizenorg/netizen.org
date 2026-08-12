/* global nn */
class NetizenContentBlock {
  constructor () {
    this.ele = nn.get('#content')
    this.showing = false
    this.transitioning = false
    this._createChildDivs()
  }

  _createChildDivs () {
    const exClrs = []
    const cells = nn.getAll('.grid > div')
    for (let i = 0; i < cells.length / 2; i++) {
      const rgb = nn.colorMatch(cells[i].style.backgroundColor)
      const hex = nn.rgb2hex(Number(rgb[2]), Number(rgb[3]), Number(rgb[4]))
      exClrs.push(hex)
    }
    let fc = window.colors.map(row => row.filter(c => !exClrs.includes(c)))
    const c1 = nn.random(fc[0])
    exClrs.push(c1)
    fc = window.colors.map(row => row.filter(c => !exClrs.includes(c)))
    const c2 = nn.random(fc[0])
    const c3 = nn.random(fc[1])
    nn.create('div').css('background', c1).set('data-color', c1).addTo(this.ele)
    nn.create('div').css('background', c2).set('data-color', c2).addTo(this.ele)
    nn.create('div').css('background', c3).set('data-color', c3).addTo(this.ele)
  }

  adjustHeight () {
    if (this.showing) {
      const v = nn.get('#content .visible')
      if (!v) return
      this.ele.style.height = `calc(${v.height}px + var(--lh-title) * 2)`
    } else {
      this.ele.style.height = 'var(--splash-height)'
      this.ele.style.left = `${window.innerWidth}px`
    }
  }

  show (sec) {
    // layout() is async and sets this.transitioning synchronously at its top,
    // but show() never awaited it -- a nav click landing inside that ~900ms
    // window hit the guard above and was silently dropped. The nav pill and
    // URL hash still updated (that's driven separately by NetizenNav), but
    // #content's HTML was never touched, so it kept showing whatever the
    // PREVIOUS section had rendered. Queue the latest request instead of
    // dropping it, and drain the queue once the in-flight layout finishes.
    //
    // slide('in') stays here, unawaited, exactly where it was: it's meant to
    // run alongside the grid's own transition, not after layout() resolves.
    this.pendingSec = sec
    if (!this.showing) {
      this.slide('in')
      this.showing = true
    }
    if (this.transitioning) return
    this._drain()
  }

  async _drain () {
    while (this.pendingSec) {
      const sec = this.pendingSec
      this.pendingSec = null
      await this.layout(sec)
    }
  }

  hide () {
    if (this.transitioning) return
    this.slide('out')
    this.showing = false
    this.adjustHeight()
  }

  slide (direction = 'in') {
    const vw = window.innerWidth
    const targetLeft = direction === 'in' ? 0 : vw
    this.ele.style.left = `${targetLeft}px`
  }

  transitionTo (layout) {
    this.transitioning = true

    const cells = layout || []
    const cols = cells.length ? 6 : 3
    const frac = 100 / cols
    const duration = 800
    const easing = 'cubic-bezier(0.215,0.61,0.355,1)'
    let m
    nn.getAll('#content > div').forEach(async (div, i) => {
      const cell = cells[i]
      const targetLeft = cell ? cell.x * frac : i * 100 / 3
      const targetWidth = cell ? cell.w * frac : 100 / 3
      const bg = (cell && cell.bg) || div.dataset.color
      div.style.transition = `background 0.25s var(--out-cubic), left ${duration}ms ${easing}, width ${duration}ms ${easing}`
      div.style.background = bg
      // might need to call "div.offsetWidth" to force reflow
      // if so, wrap in /* eslint-disable no-unused-expressions */ + /* eslint-enable no-unused-expressions */
      div.style.left = `${targetLeft}%`
      div.style.width = `${targetWidth}%`
      if (cell && cell.tpl) { m = { cell, div } }
    })

    this.transitioning = false

    return m
  }

  async layout (sec) {
    this.transitioning = true

    const layouts = {
      about: [
        { x: 0, w: 3, bg: 'var(--prim-b)', tpl: 'tmpl-about' },
        { x: 3, w: 1 },
        { x: 4, w: 2 }
      ],
      initiatives: [
        { x: 0, w: 2 },
        { x: 2, w: 3, bg: 'var(--prim-b)', tpl: 'tmpl-initiatives' },
        { x: 5, w: 1 }
      ],
      support: [
        { x: 0, w: 1 },
        { x: 1, w: 2 },
        { x: 3, w: 3, bg: 'var(--prim-b)', tpl: 'tmpl-support' }
      ]
    }

    nn.getAll('#content > div').forEach(div => {
      const el = div.querySelector('.cell-content')
      if (el) el.remove()
    })

    const m = this.transitionTo(layouts[sec])
    this.transitioning = true
    await nn.sleep(800) // duration time (see transitionTo)

    const wrapper = document.createElement('div')
    wrapper.className = 'cell-content'
    const copy = window.data.copy[sec]
    wrapper.innerHTML = `
      <div class="content-copy">
          <p>${copy.main}</p>
          <small>${copy.sub}</small>
      </div>`
    m.div.appendChild(wrapper)
    await nn.sleep(100)
    wrapper.classList.add('visible')
    this.adjustHeight()
    this.transitioning = false
  }

  // _getTransitionDuration (selector) {
  //   const el = document.querySelector(selector)
  //   if (!el) return null
  //   const durationStr = window.getComputedStyle(el)
  //     .getPropertyValue('transition-duration')
  //   const first = durationStr.split(',')[0].trim()
  //   const val = parseFloat(first)
  //   return first.endsWith('ms') ? val : val * 1000
  // }
}

window.NetizenContentBlock = NetizenContentBlock
