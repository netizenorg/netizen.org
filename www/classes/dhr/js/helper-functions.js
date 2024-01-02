/* global ne, nn */
// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•
// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•* some example helper functions

window.reset = () => {
  // const netnetFace = '<div class="face"><a href="https://netnet.studio"><div></div></a></div class="face">'
  document.querySelector('.title').innerHTML = ''
  document.querySelector('.content').innerHTML = ''
  document.querySelector('.content').classList.remove('error')
  document.querySelector('.content').classList.remove('edu')
  ne.spotlight('clear')
  window.resizeNFO(100)
}

window.resizeNFO = (h) => {
  nn.get('section').css({ transition: 'all 0.5s' })
  setTimeout(() => {
    const b = 100 / (nn.height / h)
    const t = 100 - b
    nn.get('section').css({ gridTemplateRows: `${t}% ${b}%` })
    setTimeout(() => {
      nn.get('section').css({ transition: 'none' })
    }, 610)
  }, 100)
}

window.showJSNFO = (eve) => {
  const status = (eve.nfo.status && eve.nfo.status !== 'standard')
    ? `. (<b>NOTE</b>: this CSS feature is ${eve.nfo.status}). ` : ''

  document.querySelector('.content').classList.add('edu')
  document.querySelector('.content').innerHTML = `
    <h1>${eve.nfo.keyword.html}</h1>
    <p>${eve.nfo.description.html} ${status}</p>
  `

  const h = nn.get('.content').offsetHeight + 120
  window.resizeNFO(h < 244 ? h : 244)
}

window.showHTMLNFO = (eve) => {
  const type = (typeof eve.nfo.singleton === 'boolean')
    ? 'element' : 'attribute'
  const note = eve.nfo.note
    ? eve.nfo.note.html
    : (eve.nfo.status && eve.nfo.status !== 'standard')
      ? `This ${type} is ${eve.nfo.status}. ` : ''

  document.querySelector('.content').classList.add('edu')
  document.querySelector('.content').innerHTML = `
    <h1>${eve.nfo.keyword.html}</h1>
    <p>${eve.nfo.description.html} ${note}</p>
  `

  const h = nn.get('.content').offsetHeight + 120
  window.resizeNFO(h < 244 ? h : 244)
}

window.showCSSNFO = (eve) => {
  const status = (eve.nfo.status && eve.nfo.status !== 'standard')
    ? `. (<b>NOTE</b>: this CSS feature is ${eve.nfo.status}). ` : ''

  let links = '' // css properties have multiple reference URLs
  if (eve.nfo.urls) {
    links = Object.keys(eve.nfo.urls)
      .map(k => `<a href="${eve.nfo.urls[k]}" target="_blank">${k}</a>`)
    if (links.length > 0) {
      links = `To learn more visit ${links.join(', ').slice(0, -2)}.`
    }

    const h = nn.get('.content').offsetHeight + 120
    window.resizeNFO(h < 244 ? h : 244)
  }

  document.querySelector('.content').classList.add('edu')
  document.querySelector('.content').innerHTML = `
    <h1>${eve.nfo.keyword.html}</h1>
    <p>${eve.nfo.description.html} ${status} ${links}</p>
  `
}

window.markErrors = (eve) => {
  const explainError = (err) => {
    ne.spotlight(err.line)
    document.querySelector('.content').classList.add('error')
    document.querySelector('.content').innerHTML = err.friendly
      ? `<p>${err.friendly}</p>` : `<p>${err.message}</p>`
    const h = nn.get('.content').offsetHeight + 120
    window.resizeNFO(h < 244 ? h : 244)
  }

  ne.marker(null)
  const lines = []
  if (eve.length === 0) window.reset()
  eve.forEach(e => {
    if (lines.includes(e.line)) return
    lines.push(e.line)
    const clk = () => explainError(e)
    if (e.type === 'warning') ne.marker(e.line, 'yellow', clk)
    else ne.marker(e.line, 'red', clk)
  })
}

window.numChange = (e) => {
  const keys = [38, 40]
  const str = ne.cm.getSelection()
  const val = parseInt(str)
  if (keys.includes(e.keyCode) && !isNaN(val)) {
    e.preventDefault()
    const unt = str.replace(val, '')
    const inc = e.shiftKey ? 10 : 1
    const num = e.keyCode === 38 ? val + inc : val - inc
    const from = ne.cm.getCursor('from')
    const to = ne.cm.getCursor('to')
    const newStr = num + unt
    ne.cm.replaceSelection(newStr)
    const t = { line: to.line, ch: from.ch + newStr.length }
    ne.cm.setSelection(from, t)
    ne.spotlight(from.line + 1)
  } else if (e.keyCode === 13 && !isNaN(val)) {
    if (nn.get('.content').innerHTML !== '') window.reset()
    e.preventDefault()
    const from = ne.cm.getCursor('from')
    ne.cm.setSelection(from, from)
    ne.spotlight(null)
  }
}

window.showSettings = () => {
  window.reset()
  const hk = nn.platformInfo().platform.includes('Mac') ? 'CMD' : 'CTRL'
  const msg = `when auto-update is "false", you'll need to press ${hk} + Enter to run update`
  const name = window.localStorage.getItem('name') || 'anonymous'

  nn.get('.title').innerHTML = '<h1>settings</h1>'
  nn.get('.content').innerHTML = `
    <div class="settings">
      <span>
        name: <input class="name" value="${name}">
      </span>
      <span>
        auto-update: <select class="auto-update">
          <option value="true" ${ne.autoUpdate === true ? 'selected' : ''}>true</option>
          <option value="false" ${ne.autoUpdate === false ? 'selected' : ''}>false</option>
        </select>
      </span>
      <span>
        word-wrap: <select class="word-wrap">
          <option value="true" ${ne.wrap === true ? 'selected' : ''}>true</option>
          <option value="false" ${ne.wrap === false ? 'selected' : ''}>false</option>
        </select>
      </span>
      <span>
        theme: <select class="theme-select"></select>
      </span>
    </div>
    <div class="disclaimer">
      ${ne.autoUpdate === false ? msg : ''}
    </div>
  `

  Object.keys(ne.themes).forEach(theme => {
    const s = nn.create('option').set({ value: theme }).content(theme)
    if (theme === ne.theme) s.set({ selected: true })
    s.addTo('.settings .theme-select')
  })

  const h = nn.get('#nfo .settings').offsetHeight + 120
  window.resizeNFO(h)

  nn.get('.settings .theme-select').on('change', (e) => {
    ne.theme = e.target.value
    window.localStorage.setItem('theme', ne.theme)
  })

  nn.get('.settings .name').on('input', (e) => {
    window.localStorage.setItem('name', e.target.value)
  })

  nn.get('.settings .auto-update').on('change', (e) => {
    if (e.target.value === 'false') {
      ne.autoUpdate = false
      nn.get('.disclaimer').innerHTML = `<i>${msg}</i>`
    } else {
      ne.autoUpdate = true
      nn.get('.disclaimer').innerHTML = ''
    }
  })

  nn.get('.settings .word-wrap').on('change', (e) => {
    ne.wrap = e.target.value === 'true'
  })
}

window.showTools = () => {
  window.reset()

  nn.get('.title').innerHTML = '<h1>tools</h1>'
  nn.get('.content').innerHTML = `
    <div class="tools">
      <button class="tidy">tidy code</button>
      <button class="download">download code</button>
      <a href="https://imgur.com/upload" target="_blank">upload image</a>
      <a href="https://fffuel.co/cccolor/" target="_blank">color picker</a>
      <a href="https://css-generators.dotenv.dev/" target="_blank">CSS generators</a>
      <a href="https://chat.openai.com/share/2587808d-01da-4b6f-bd0f-51623e93c796" target="_blank">ChatGPT</a>
    </div>
  `
  const h = nn.get('#nfo .tools').offsetHeight + 120
  window.resizeNFO(h)

  nn.get('.tidy').on('click', () => ne.tidy())

  nn.get('.download').on('click', () => {
    const blob = new window.Blob([ne.code], { type: 'text/html' })
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = 'index.html'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(href)
  })
}

window.showKit = () => {
  window.reset()

  nn.get('.title').innerHTML = '<h1>code kit</h1>'
  nn.get('.content').innerHTML = `
    <div class="kit">
      <ul>
      <li><a href="https://netnet.studio/?ex=71" target="_blank">custom fonts</a></li>
      <li><a href="https://netnet.studio/?ex=70" target="_blank">full page background</a></li>
      </ul>
    </div>
  `
  const h = nn.get('#nfo .kit').offsetHeight + 120
  window.resizeNFO(h)
}
