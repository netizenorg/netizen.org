/* global HTMLElement */
class BrowserWindow extends HTMLElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.title = 'WINDOW'
    this.mousedown = false
    this.winOff = null
  }

  get left () { return parseInt(this.style.left) }
  set left (v) { this._css('left', v) }

  get top () { return parseInt(this.style.top) }
  set top (v) { this._css('top', v) }

  get right () { return window.innerWidth - this.width - this.left }
  set right (v) { this._css('right', v) }

  get bottom () { return window.innerHeight - this.height - this.top }
  set bottom (v) { this._css('bottom', v) }

  get zIndex () { return parseInt(this.style.zIndex) }
  set zIndex (v) { this._css('zIndex', v) }

  get width () { return this.ele.offsetWidth }
  set width (v) { this._css('width', v) }

  get height () { return this.ele.offsetHeight }
  set height (v) {
    this._css('height', v)
    const c = this.ele.querySelector('.content')
    const t = this.ele.querySelector('.title-bar')
    c.style.height = `calc(100% - ${t.offsetHeight}px)`
  }

  static get observedAttributes () {
    return ['title', 'padding']
  }

  attributeChangedCallback (attrName, oldVal, newVal) {
    if (newVal !== oldVal) this[attrName] = newVal
    if (attrName === 'padding') {
      if (this.ele) this.ele.querySelector('.content').style.padding = newVal
    }
  }

  connectedCallback () {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: absolute;
          --bg-color: #000;
          --fg-color: #0f0;
        }

        @font-face {
          font-family: 'Roboto Mono';
          font-style: normal;
          font-weight: 100;
          src: url('fonts/roboto-mono-v12-latin-100.eot'); /* IE9 Compat Modes */
          src: local(''),
               url('fonts/roboto-mono-v12-latin-100.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
               url('fonts/roboto-mono-v12-latin-100.woff2') format('woff2'), /* Super Modern Browsers */
               url('fonts/roboto-mono-v12-latin-100.woff') format('woff'), /* Modern Browsers */
               url('fonts/roboto-mono-v12-latin-100.ttf') format('truetype'), /* Safari, Android, iOS */
               url('fonts/roboto-mono-v12-latin-100.svg#RobotoMono') format('svg'); /* Legacy iOS */
        }

        * { box-sizing: border-box; }

        *::-moz-selection {
          background-color: var(--fg-color);
          color: var(--bg-color);
        }

        *::selection {
          background-color: var(--fg-color);
          color: var(--bg-color);
        }

        .window {
          position: absolute;
          min-width: 320px;
          min-height: 240px;
          border: 12px inset var(--fg-color);
          background: var(--bg-color);
          color: var(--fg-color);
          font-family: 'Roboto Mono', monospace;
          overflow: hidden scroll;
          scrollbar-width: thin;
          scrollbar-color: var(--bg-color) var(--fg-color);
        }

        .title-bar {
          border-bottom: 2px solid var(--fg-color);
          padding: 10px 20px;
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 30px;
          cursor: grab;
          font-weight: 400;
        }

        .title {
          font-size: 10px;
        }

        .close {
          cursor: pointer;
        }

        .content {
          padding: ${this.padding || '10px'};
          font-size: 18px;
          width: 100%;
          height: 100%;
        }

      </style>

      <section class="window">
        <div class="title-bar">
          <span class="title">${this.title}</span>
          <span class="close">✕</span>
        </div>
        <div class="content">
          <slot>Hello World Wide Web</slot>
        </div>
      </section>
    `

    this.style.top = '100px'
    this.style.left = '100px'

    this.ele = this.shadowRoot.querySelector('section')
    this.ele.addEventListener('mousemove', (e) => {
      if (this.shouldResize(e)) {
        this.ele.style.cursor = 'se-resize'
      } else this.ele.style.cursor = 'auto'
    })
    this.ele.addEventListener('click', () => this.bring2front())

    this.ele.querySelector('.close').addEventListener('click', () => {
      this.style.display = 'none'
    })

    // const tb = this.ele.querySelector('.title-bar').offsetHeight
    // this.ele.querySelector('.content').style.height = `calc(100% - ${tb}px)`
  }

  update (opts, time) {
    time = time || 0
    const t = `${time}ms`
    const ease = 'cubic-bezier(0.165, 0.84, 0.44, 1)'
    this.style.transition = `all ${t} ${ease}`
    this.ele.style.transition = `all ${t} ${ease}`
    // trigger transition
    setTimeout(() => {
      for (const prop in opts) this._css(prop, opts[prop])
      setTimeout(() => {
        this.style.transition = 'none'
        this.ele.style.transition = 'none'
        this.keepInFrame()
      }, time)
    }, 25)
  }

  keepInFrame () {
    if (this.top + this.height + 20 > window.innerHeight) {
      this.update({ height: window.innerHeight - this.top - 20 }, 500)
    } else if (this.top < 20) {
      this.update({ top: 20 }, 500)
    } else if (this.left + this.width + 20 > window.innerWidth) {
      this.update({ right: 20 }, 500)
    } else if (this.left < 0) {
      this.update({ left: 20 }, 500)
    }
  }

  recenter () {
    this._css('left', window.innerWidth / 2 - this.width / 2)
    this._css('top', window.innerHeight / 2 - this.height / 2)
  }

  bring2front () {
    const wins = [...this.parentNode.querySelectorAll('browser-window')]
    let z = 100
    wins.filter(w => w !== this)
      .sort((a, b) => { return parseFloat(a.zIndex) - parseFloat(b.zIndex) })
    wins.forEach(w => { w.zIndex = ++z })
    this.zIndex = ++z
  }

  _css (prop, val) {
    const p = ['top', 'right', 'bottom', 'left']
    const s = ['width', 'height']
    if (s.includes(prop)) {
      this.ele.style[prop] = (typeof val === 'number') ? `${val}px` : val
    } else if (p.includes(prop)) {
      if (prop === 'left' || prop === 'right') {
        const left = (prop === 'left')
          ? val : window.innerWidth - val - this.width
        this.style.left = `${left}px`
      } else { // top || bottom
        const top = (prop === 'top')
          ? val : window.innerHeight - val - this.height
        this.style.top = `${top}px`
      }
    } else if (prop === 'zIndex') {
      this.style.zIndex = val
    }
  }

  shouldResize (e) {
    const offX = this.scrollWidth + this.offsetLeft - 20
    const offY = this.scrollHeight + this.offsetTop - 20
    return e.clientX > offX && e.clientY > offY
  }

  shouldMove (e) {
    const top = this.offsetTop
    const bar = this.ele.querySelector('.title-bar').offsetHeight
    const bot = top + bar
    return e.clientY > top && e.clientY < bot
  }

  mouseDown (e) {
    if (this.shouldMove(e)) {
      this.ele.querySelector('.title-bar').style.cursor = 'move'
      document.body.style.cursor = 'move'
    } else if (this.shouldResize(e)) {
      document.body.style.cursor = 'se-resize'
    } else document.body.style.cursor = 'auto'
    this.bring2front()
  }

  mouseUp (e) {
    this.winOff = null
    this.ele.querySelector('.title-bar').style.cursor = 'grab'
    document.body.style.cursor = 'auto'
    this.keepInFrame()
  }

  mouseMove (e) {
    if (document.body.style.cursor === 'move') {
      if (!this.winOff || typeof this.winOff === 'undefined') {
        this.winOff = {
          x: e.clientX - this.offsetLeft,
          y: e.clientY - this.offsetTop
        }
      }
      this.style.left = e.clientX - this.winOff.x + 'px'
      this.style.top = e.clientY - this.winOff.y + 'px'
    } else if (document.body.style.cursor === 'se-resize') {
      const width = e.clientX - this.offsetLeft
      const height = e.clientY - this.offsetTop
      this.ele.style.width = width + 'px'
      this.ele.style.height = height + 'px'
      const c = this.ele.querySelector('.content')
      const t = this.ele.querySelector('.title-bar')
      c.style.height = `calc(100% - ${t.offsetHeight}px)`
    }
  }
}

window.customElements.define('browser-window', BrowserWindow)
