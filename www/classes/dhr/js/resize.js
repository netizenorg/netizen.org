/* global nn */
window.resize = {
  resizing: false,
  move: function (e) {
    const nfo = nn.get('#nfo')
    const edt = nn.get('#editor')

    if (e.y - nfo.offsetTop <= 10) {
      nfo.css({ cursor: 'row-resize' })
    } else if (nfo.offsetWidth - e.x <= 10) {
      nfo.css({ cursor: 'col-resize' })
    } else {
      nfo.css({ cursor: 'auto' })
    }

    if (edt.offsetWidth - e.x <= 10) {
      edt.css({ cursor: 'col-resize' })
    } else {
      edt.css({ cursor: 'auto' })
    }

    if (window.resize.resizing === 'row-resize') {
      const t = 100 * (e.y / nn.height)
      const b = 100 - t
      nn.get('section').css({ gridTemplateRows: `${t}% ${b}%` })
    } else if (window.resize.resizing === 'col-resize') {
      const l = 100 * (e.x / nn.width)
      const r = 100 - l
      nn.get('section').css({ gridTemplateColumns: `${l}% ${r}%` })
    }
  },
  pressNfo: function () {
    const self = nn.get('#nfo')
    if (self.style.cursor === 'row-resize') {
      window.resize.resizing = 'row-resize'
    } else if (self.style.cursor === 'col-resize') {
      window.resize.resizing = 'col-resize'
    } else {
      window.resize.resizing = false
    }
  },
  pressEdt: function () {
    const self = nn.get('#editor')
    if (self.style.cursor === 'col-resize') {
      window.resize.resizing = 'col-resize'
    } else {
      window.resize.resizing = false
    }
  },
  release: function () {
    window.resize.resizing = false
  }
}
