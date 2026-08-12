/* global nn, NetizenBentText, Netitor */
class NetizenBendPanel {
  constructor (opts = {}) {
    this.showing = false // displaying the bend panel itself

    // parent for the clickable canvas text
    this.textEle = opts.textEle
    this.panelEle = opts.panelEle

    this.text = new NetizenBentText({
      parent: this.textEle,
      text: ['BEND', 'THIS', 'SITE'],
      color: nn.get('.grid div:nth-child(2)').style.backgroundColor,
      padding: 10,
      xOverlap: 30,
      yOverlap: 80
    })

    this.text.canvas.style.cursor = 'pointer'
    this.text.canvas.style.transition = 'all var(--tt) var(--out-cubic)'
    this.text.canvas.onclick = () => this.togglePanel()

    // element for the bend panel itself
    this.panel = nn.create('div').set('class', 'bend-panel').addTo(this.panelEle)
    this.panel.innerHTML = `
      <div class="options">
        <div class="row">
          <button type="button" name="close" class="sec-nav">close panel</button>
          <button type="button" name="reset" class="sec-nav">reset code</button>
          <small style="margin-left: 20px;">THIS IS IN BETA (BUGS ABOUND)</small>
        </div>
      </div>
      <div id="editor"></div>
    `

    this._setupOptions()
    this._setupEditor()
    this.panel.remove()

    this.onShow = opts.onShow
    this.onHide = opts.onHide
  }

  getCode () {
    // let str = '\n  /*\n    edit this site\'s CSS using the controls above\n    or modifying the code below \n  */\n  main {\n'
    let str = '\n  main {\n'
    Object.entries(this.cssObj).forEach(a => {
      str += `    ${a[0]}: ${a[1]};\n`
    })
    str += '  }'
    return str
  }

  enable () {
    // if it's been removed, add it back in
    if (this.textEle.children.length === 0) {
      this.textEle.appendChild(this.text.canvas)
    }

    if (this.text.canvas.style.display === 'block' &&
      this.text.canvas.style.opacity === 1) return

    // display the text canvas
    this.text.canvas.style.display = 'block'
    setTimeout(() => {
      this.text.canvas.style.opacity = 1
    }, 100)
  }

  disable () {
    if (this.text.canvas.style.display === 'none' &&
      this.text.canvas.style.opacity === 0) return

    this.text.canvas.style.opacity = 0
    setTimeout(() => {
      this.text.canvas.style.display = 'none'
    }, 800)
  }

  showPanel () {
    if (this.showing) return
    if (typeof this.onShow === 'function') this.onShow()
    this.panel.css('display', 'block')
    setTimeout(() => this.panel.css('opacity', 1), 100)
    this.panel.addTo(this.panelEle)
    setTimeout(() => { this.ne.code = this.getCode() }, 800)
    this.showing = true
  }

  hidePanel () {
    if (!this.showing) return
    this.panel.remove()
    this.panel.css('display', 'none')
    this.panel.css('opacity', 0)
    if (typeof this.onHide === 'function') this.onHide()
    this.showing = false
  }

  togglePanel () {
    if (this.showing) this.hidePanel()
    else this.showPanel()
  }

  reset () {
    nn.get('main').removeAttribute('style')
    this.filters = {}
    this.cssObj = JSON.parse(JSON.stringify(this.originalCSS))
    this.ne.code = this.getCode()
    Object.entries(this.defaultFilts).forEach(a => {
      nn.get(`#bp-${a[0]}`).checked = false
      if (this._hasRange(a[0])) {
        nn.get(`input[name="bp-${a[0]}"]`).value = a[1].def
        nn.get(`input[name="bp-${a[0]}"]`).css('display', 'none')
      }
    })
  }

  // ...........................................................................

  _setupOptions () {
    this.filters = {}

    this.defaultFilts = {
      contrast: { min: 0, max: 2, step: 0.01, def: 1 },
      // brightness: { min: 0, max: 2, step: 0.01, def: 1 },
      saturate: { min: 0, max: 2, step: 0.01, def: 1 },
      // invert: { min: 0, max: 1, step: 1, def: 0 }
      invert: { def: 0 }
    }

    const updateFiltCSS = (e, name) => {
      if (e) this.filters[name] = e.target.value
      if (Object.entries(this.filters).length > 0) {
        this.cssObj.filter = this._buildFilterString(this.filters)
      } else {
        delete this.cssObj.filter
      }
      nn.get('main').removeAttribute('style')
      this.ne.code = this.getCode()
    }

    const toggleFiltCSS = (e, name) => {
      if (e.target.checked) {
        if (this._hasRange(name)) {
          nn.get(`input[name="bp-${name}"]`).css('display', 'inline')
        }
        this.filters[name] = this._hasRange(name) ? this.defaultFilts[name].def : 1
        if (!this._hasRange(name)) updateFiltCSS()
      } else {
        if (this._hasRange(name)) {
          nn.get(`input[name="bp-${name}"]`).css('display', 'none')
        }
        delete this.filters[name]
        updateFiltCSS()
      }
    }

    // .... create controls

    Object.entries(this.defaultFilts).forEach(a => {
      const f = nn.create('div').set('class', 'row').addTo('.bend-panel .options')
      const n = a[0]
      const v = a[1]
      f.innerHTML = `
        <label class="toggle-switch">
          <input type="checkbox" id="bp-${n}">
          <span class="slider"></span>
        </label>
        <span class="label">${n}</span>
      `
      if (v.step) {
        f.innerHTML += `
          <input type="range" name="bp-${n}"
            min="${v.min}" max="${v.max}" step="${v.step}" value="${v.def}">
        `
      }
    })

    // ..... setup listeners

    nn.get('.bend-panel button[name="close"]')
      .on('click', () => this.hidePanel())

    nn.get('.bend-panel button[name="reset"]')
      .on('click', () => this.reset())

    Object.entries(this.defaultFilts).forEach(a => {
      nn.get(`#bp-${a[0]}`)
        .on('change', e => toggleFiltCSS(e, a[0]))
      if (this._hasRange(a[0])) {
        nn.get(`input[name="bp-${a[0]}"]`)
          .css('display', 'none')
          .on('input', e => updateFiltCSS(e, a[0]))
      }
    })
  }

  _setupEditor () {
    this.cssObj = {
      'font-family': "'Zen Maru Gothic', serif"
    }

    this.originalCSS = JSON.parse(JSON.stringify(this.cssObj))

    this.ne = new Netitor({
      ele: '#editor',
      theme: 'sonnenzimmer',
      hint: false,
      language: 'css',
      code: this.getCode()
    })

    this.ne.on('code-update', () => {
      this.cssObj = this._parseCSSClass(this.ne.code)
      // update <main> styles && .case-study-detail styles
      Object.entries(this.cssObj).forEach(a => nn.get('main').css(a[0], a[1]))
      // bi-directional editing (upate UI)
      if (this.cssObj.filter) {
        const filts = this._parseFilter(this.cssObj.filter)
        Object.entries(filts).forEach(a => { this.filters[a[0]] = a[1] })
        this._updateFilterUI(this.filters)
      }
    })
  }

  // ...........................................................................

  _updateFilterUI (obj) {
    if (obj) this.filters = obj
    Object.entries(this.defaultFilts).forEach(a => {
      if (this.filters[a[0]]) {
        nn.get(`#bp-${a[0]}`).checked = this.filters[a[0]]
        if (this._hasRange(a[0])) {
          nn.get(`input[name="bp-${a[0]}"]`).value = parseFloat(this.filters[a[0]])
        }
      } else {
        nn.get(`#bp-${a[0]}`).checked = false
        if (this._hasRange(a[0])) {
          nn.get(`input[name="bp-${a[0]}"]`).value = a[1].def
        }
      }
    })
  }

  _hasRange (name) {
    return typeof this.defaultFilts[name].step === 'number'
  }

  _getCSSVar (varname) {
    const name = varname.startsWith('--') ? varname : `--${varname}`
    return window.getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim()
  }

  _parseCSSClass (cssString) {
    // find the content between the first `{` and the last `}`
    const start = cssString.indexOf('{')
    const end = cssString.lastIndexOf('}')
    if (start < 0 || end < 0) return {}
    const body = cssString.slice(start + 1, end)

    const result = {}
    body.split(';').forEach(decl => {
      const [prop, ...valParts] = decl.split(':')
      if (!valParts.length) return
      const key = prop.trim()
      const value = valParts.join(':').trim()
      if (key) result[key] = value
    })

    return result
  }

  _parseFilter (filterString) {
    const regex = /([a-z-]+)\(([^)]+)\)/gi
    const result = {}
    let match

    while ((match = regex.exec(filterString))) {
      const name = match[1]
      const value = match[2].trim()

      if (result[name]) {
        // if already seen, convert to array (or push into it)
        if (Array.isArray(result[name])) {
          result[name].push(value)
        } else {
          result[name] = [result[name], value]
        }
      } else {
        result[name] = value
      }
    }

    return result
  }

  _buildFilterString (filters) {
    const parts = []
    Object.entries(filters).forEach(([name, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => {
          parts.push(`${name}(${v})`)
        })
      } else {
        parts.push(`${name}(${value})`)
      }
    })
    return parts.join('\n      ')
  }
}

window.NetizenBendPanel = NetizenBendPanel
