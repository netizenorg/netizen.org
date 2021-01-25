class Slides {
  constructor (opts) {
    this.i = null // slide index
    this.socket = opts.socket
    this.parent = opts.parent
    this.video = null
    this.data = document.querySelectorAll('.slide')

    this.socket.on('play-video', () => this.video.play())
    this.socket.on('pause-video', () => this.video.pause())
    this.socket.on('change-time', (t) => { this.video.currentTime = t })
    this.socket.on('load-slide', (n) => this.setup(n))

    document.addEventListener('keydown', (e) => {
      console.log(e)
      if (e.ctrlKey && e.keyCode === 190) this.next()
      else if (e.ctrlKey && e.keyCode === 188) this.prev()
      else if (e.ctrlKey && e.keyCode === 32) this.toggle()
    })
  }

  setup (i) {
    this.data.forEach(s => { s.style.display = 'none' })
    this.i = i
    this.data[this.i].style.display = 'block'
    this.video = this.data[this.i].querySelector('video')
  }

  next () {
    this.i = this.i + 1 < this.data.length ? this.i + 1 : 0
    this.socket.emit('load', this.i)
  }

  prev () {
    this.i = this.i - 1 >= 0 ? this.i - 1 : this.data.length - 1
    this.socket.emit('load', this.i)
  }

  play () { this.socket.emit('play') }

  pause () { this.socket.emit('pause') }

  time (n) { this.socket.emit('time', n) }

  toggle () {
    if (this.video && this.video.paused) this.play()
    else if (this.video && !this.video.paused) this.pause()
  }
}

window.Slides = Slides
