/* global nn */
class NetizenNav {
  constructor (opts = {}) {
    this.ele = nn.get(opts.parent || 'header')
    this.state = 0 // 0 = not activated
    this.onSelection = opts.onSelection

    nn.get(opts.logo || '#netizen-logo').on('click', () => this.updatePage('logo'))
    nn.get(opts.logo || '#netizen-logo').on('keydown', (e) => {
      if (e.key === 'Enter') this.updatePage('logo')
    })

    nn.getAll(`${opts.parent} > nav > span`).forEach(span => {
      span.set({ role: 'button', tabindex: 0 })
      span.on('click', () => this.updatePage(span.getAttribute('name')))
    })
  }

  _activate (sec) {
    if (this.state === sec) return

    nn.get('body').css('background', 'white')
    nn.get('#splash-canvas').css('opacity', 0)

    nn.getAll('header nav span').forEach(span => {
      span.classList.remove('sec-nav')
      span.classList.remove('selected')
      span.classList.add('prim-nav')
    })

    nn.get(`header nav span[name=${sec}]`).classList.add('selected')
  }

  _deactivate () {
    if (this.state === 0) return

    nn.get('body').css('background', 'black')
    nn.get('#splash-canvas').css('opacity', 1)

    nn.getAll('header nav span').forEach(span => {
      span.classList.remove('prim-nav')
      span.classList.remove('selected')
      span.classList.add('sec-nav')
    })
  }

  updatePage (sec) {
    window.location.hash = '#' + sec
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (sec === 'logo') this._deactivate()
    else this._activate(sec)
    if (typeof this.onSelection === 'function') this.onSelection(sec)
    this.state = sec === 'logo' ? 0 : sec
  }
}

window.NetizenNav = NetizenNav
