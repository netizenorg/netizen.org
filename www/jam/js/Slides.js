class Slides {
  constructor (opts) {
    this.data = null // slides
    this.i = null // index

    this.socket = opts.socket
    this.parent = opts.parent
    this.ele = document.createElement('section')
    this.parent.appendChild(this.ele)

    this.menu = document.createElement('div')
    this.menu.style.marginBottom = '10px'
    this.ele.appendChild(this.menu)

    this.video = document.createElement('video')
    this.video.style.display = 'none'
    this.video.style.width = '100%'
    this.ele.appendChild(this.video)
    this.video.addEventListener('canplaythrough', () => {
      this.video.style.border = 'none'
      this.video.controls = true
    })

    this.quote = document.createElement('quote')
    this.quote.style.display = 'none'
    this.ele.appendChild(this.quote)

    this.slide = document.createElement('div')
    this.slide.style.display = 'none'
    this.ele.appendChild(this.slide)

    this.cred = document.createElement('div')
    this.ele.appendChild(this.cred)

    this.socket.on('play-video', () => this.video.play())
    this.socket.on('pause-video', () => this.video.pause())
    this.socket.on('change-time', (t) => { this.video.currentTime = t })
    this.socket.on('load-slide', (n) => {
      this.i = n
      this.loadSlide()
    })
  }

  loadData (path) {
    window.fetch(path)
      .then(res => res.json())
      .then(json => {
        this.data = json
        this.i = 0
        this.loadSlide()
      })
      .catch(err => console.error(err))
  }

  loadSlide () {
    const n = this.i
    if (this.data[n].video) {
      this.display('video')
      this.video.style.border = '3px solid var(--err-color)'
      this.video.src = `data/${this.data[n].video}`
      this.updateMenu({ reload: true })
    } else if (this.data[n].quote) {
      this.display('quote')
      // TODO
    } else if (this.data[n].html) {
      this.display('slide')
      this.slide.innerHTML = this.data[n].html
      this.updateMenu()
    }

    if (this.data[n].source) this.updateCred(this.data[n].source)

    if (this.data[n].width) this.parent.width = parseInt(this.data[n].width)
    if (this.data[n].height) this.parent.height = parseInt(this.data[n].height)
    setTimeout(() => this.parent.keepInFrame(), 250)
  }

  display (type) {
    this.video.style.display = 'none'
    this.quote.style.display = 'none'
    this.slide.style.display = 'none'
    this[type].style.display = 'block'
  }

  updateCred (obj) {
    this.cred.style.fontSize = '16px'
    if (typeof obj === 'string') this.cred.innerHTML = obj
    else {
      const html = `source: <a href=${obj.url} target="_blank">${obj.text}</a>`
      this.cred.innerHTML = html
    }
  }

  updateMenu (obj) {
    obj = obj || {}
    this.menu.innerHTML = ''
    if (obj.reload) {
      const reload = document.createElement('button')
      reload.textContent = 'reload'
      reload.addEventListener('click', () => this.loadSlide())
      this.menu.appendChild(reload)
    }
  }

  play () { this.socket.emit('play') }
  pause () { this.socket.emit('pause') }
  time (n) { this.socket.emit('time', n) }
  load (v) { this.socket.emit('load', v) }
}

window.Slides = Slides

// document.addEventListener('keydown', (e) => {
//   // console.log(e)
//   if (e.keyCode === 39) { // right arrow
//     v.currentTime += e.altKey ? 1 / 30 : e.shiftKey ? 5 : 1
//     time(v.currentTime)
//   } else if (e.keyCode === 37) { // left arrow
//     v.currentTime -= e.altKey ? 1 / 30 : e.shiftKey ? 5 : 1
//     time(v.currentTime)
//   } else if (e.keyCode === 38) {
//     console.log(v.currentTime)
//   }
// })
