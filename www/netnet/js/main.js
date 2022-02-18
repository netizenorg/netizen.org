/* global BGGradient, CyberSpace, THREE, GradShaderMaterial, TWEEN, Averigua */
const bg = new BGGradient('#82ccd7', '#515199')
// const bg = new BGGradient('#E6DB6F', '#81c994')
const splash = document.querySelector('.splash')
const header = document.querySelector('header')
const nav = document.querySelector('header > nav')
const main = document.querySelector('.main')
const footer = document.querySelector('footer')
const playMessage = document.querySelector('#play-message')

const anchors = { init: 0 }
const desktopSpots = {
  selected: 'init',
  init: {
    pos: { x: 0, y: 0, z: 0 },
    rot: { x: -0.683, y: 0, z: 0 }
  },
  students: {
    pos: { x: 0.313, y: -0.415, z: -0.491 },
    rot: { x: 0.46, y: 0.136, z: 0.185 }
  },
  educators: {
    pos: { x: -0.614, y: -0.447, z: 0.049 },
    rot: { x: 2.053, y: 1.221, z: -2.392 }
  }
}
const mobileSpots = {
  selected: 'init',
  init: {
    pos: { x: 0, y: 0, z: 0 },
    rot: { x: -0.683, y: 0, z: 0 }
  },
  students: {
    pos: { x: -0.487, y: -0.215, z: -0.491 },
    rot: { x: 0.46, y: 0.436, z: 0.185 }
  },
  educators: {
    pos: { x: -0.1139, y: -0.1469, z: -0.351 },
    rot: { x: 2.053, y: 1.221, z: -2.392 }
  }
}
let spots = window.innerWidth <= 700
  ? JSON.parse(JSON.stringify(mobileSpots))
  : JSON.parse(JSON.stringify(desktopSpots))

const vids = {
  'hypermedia-tutorials': 'hyper-tut.mp4',
  educators: 'hyper-tut.mp4',
  examples: 'code-ex.mp4',
  'code-editor': 'editor.mp4',
  realtime: 'editor.mp4',
  'code-refs': 'editor.mp4',
  'friendly-errors': 'friendly-errors.mp4',
  github: 'github.mp4',
  share: 'share.mp4'
}

function setup () {
  window.scrollTo(0, 0)
  setupAnchors()
  const platform = Averigua.platformInfo().platform
  if (platform.includes('Mac')) {
    document.querySelector('#save-shortcut').textContent = 'Cmd+S'
  }
}

function resize () {
  if (!Averigua.isMobile()) setup()
  spots = window.innerWidth <= 700
    ? JSON.parse(JSON.stringify(mobileSpots))
    : JSON.parse(JSON.stringify(desktopSpots))
}

function intro () {
  const bg3 = document.querySelector('.THREE')
  bg3.style.opacity = 1
  main.style.opacity = 1
  header.style.animation = '1s ease-out 1s forwards headerintro'
  nav.style.animation = '1s ease-out 1s forwards navintro'
  const hash = window.location.hash
  if (hash === '') { splash.style.animation = '1s ease-out 1s forwards splastro' }
  goTo(hash || '#init')
  if (WORLD.video.paused && window.scrollY !== 0) playMsg('show')
  else playMsg('hide')
  if (window.innerWidth < 700) {
    setTimeout(() => { header.style.animation = 'none' }, 1000)
  }
}

function setupAnchors () {
  document.querySelectorAll('article[name]').forEach(ele => {
    const name = ele.getAttribute('name')
    const box = ele.getBoundingClientRect()
    if (window.innerWidth <= 700) { // mobile anchor spots
      anchors[name] = box.y - window.innerHeight / 2
    } else { // desktop anchor spots
      const sub = window.innerHeight > box.height
        ? (window.innerHeight - box.height) / 2 : 80
      anchors[name] = box.y - sub
    }
  })
}

function playVid (name) {
  const src = vids[name] || 'netnet.mp4'
  if (!WORLD.video.src.includes(src)) {
    WORLD.updateVideo(`videos/${src}`)
  } else WORLD.playVideo()
}

function playMsg (type) {
  // if (Averigua.isMobile()) {
  //   playMessage.style.display = 'none'
  //   return
  // }
  if (type === 'show') {
    playMessage.style.display = 'block'
    setTimeout(() => {
      playMessage.style.opacity = 1
    }, 100)
  } else if (type === 'hide') {
    WORLD.playVideo()
    playMessage.style.opacity = 0
    setTimeout(() => {
      playMessage.style.display = 'none'
    }, 1000)
  }
}

function pageScrolled (e) {
  const y = window.scrollY
  const sEle = document.querySelector('article[name="students"]')
  const stu = sEle.getBoundingClientRect().y - window.innerHeight
  const eEle = document.querySelector('article[name="educators"]')
  const edu = eEle.getBoundingClientRect().y - window.innerHeight
  splash.style.animation = 'none'

  let sec
  if (y < 10) {
    splash.style.opacity = 1
    sec = 'init'
  } else {
    splash.style.opacity = 0
    if (WORLD.video.paused && window.scrollY !== 0) playMsg('show')
    else playMsg('hide')
  }

  if (edu < 0) { sec = 'educators' } else if (stu < 0) { sec = 'students' }

  if (spots.selected !== sec) {
    WORLD.moveLappy(sec, 'Cubic', 'InOut', 3000)
    spots.selected = sec
  }

  const articles = document.querySelectorAll('article[name]')
  for (let i = 0; i < articles.length; i++) {
    const y = articles[i].getBoundingClientRect().y
    if (y > 0) {
      const name = articles[i].getAttribute('name')
      playVid(name)
      window.location.hash = name
      break
    }
  }

  // mobile shit
  if (Averigua.isMobile()) {
    // avoid flashing
    WORLD.screen.material.transparent = true
    WORLD.screen.material.opacity = 0
    if (window.avoidFlash) clearTimeout(window.avoidFlash)
    window.avoidFlash = setTimeout(() => {
      WORLD.screen.material.opacity = 1
    }, 100)
    // alt bg gradient logic (b/c no mouse)
    const h = document.body.offsetHeight
    const x = window.innerWidth * 0.2
    bg.draw(x, (y / h) * window.innerHeight)
    // hide footer
    if (y < 10) footer.style.opacity = 1
    else footer.style.opacity = 0
  }
}

function goTo (e) {
  const href = e.target ? e.target.getAttribute('href') : e
  const name = href.substr(1, href.length)
  playVid(name)

  if (name !== 'init' && splash.style.opacity !== '0') { // hide splash
    splash.style.animation = 'none'
    splash.style.opacity = 1
    setTimeout(() => { splash.style.opacity = 0 }, 100)
  }

  const ele = document.querySelector(`article[name="${name}"]`)
  const sec = ele ? ele.parentNode.className : 'init'
  if (spots.selected !== sec) {
    WORLD.moveLappy(sec, 'Cubic', 'InOut', 3000)
    spots.selected = sec
  }

  main.style.opacity = 0
  setTimeout(() => {
    window.scrollTo(0, anchors[name])
    main.style.opacity = 1
  }, 600)
}

function hideMenuWhenScrolledOver () {
  let article
  const y = window.scrollY
  const header = document.querySelector('header')
  const stu = header.querySelector('a[href="#students"]')
  const edu = header.querySelector('a[href="#educators"]')
  const off = header.offsetTop + header.offsetHeight
  const eduOff = document.querySelector('.educators').offsetTop
  const articles = document.querySelectorAll('article[name]')
  for (let i = 0; i < articles.length; i++) {
    const box = articles[i].getBoundingClientRect()
    if (box.y + box.height > 0) { article = box; break }
  }

  if (article && window.innerWidth <= 700) {
    if (article.y - off < 0) header.style.display = 'none'
    else header.style.display = 'flex'
  } else if (article) {
    if (y > eduOff + window.innerHeight - off) {
      if (article.y - off < 0) edu.style.visibility = 'hidden'
      else edu.style.visibility = 'visible'
      stu.style.visibility = 'visible'
    } else {
      if (article.y - off < 0) stu.style.visibility = 'hidden'
      else stu.style.visibility = 'visible'
      edu.style.visibility = 'visible'
    }
  }
}

window.addEventListener('mousemove', (e) => bg.draw(e.clientX, e.clientY))
window.addEventListener('scroll', (e) => pageScrolled(e))
window.addEventListener('scroll', (e) => hideMenuWhenScrolledOver(e))
window.addEventListener('resize', (e) => resize())
window.addEventListener('load', (e) => setup())
document.querySelectorAll('a[href^="#"]')
  .forEach(a => a.addEventListener('click', e => goTo(e)))
playMessage.addEventListener('click', () => playMsg('hide'))

// ----------------------------
//                             ---------------------------
//    3D stuff                                            ----------------------
class Demo extends CyberSpace {
  constructor (opts) {
    super(opts)
    const p = Averigua.platformInfo()
    const alpha = p.mobile && p.browser.name === 'Safari' ? 1 : 0.35
    this.grad = new GradShaderMaterial({ alpha: 0.35 })
    this.grad.material.transparent = alpha === 0.35
    this.loadLapTop((laptop) => {
      const geo = new THREE.BoxGeometry(0.55, 0.55, 0.50)
      const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
      this.group = new THREE.Mesh(geo, mat)
      this.group.position.x = -0.135
      this.group.position.z = -0.081
      this.group.rotation.x = -0.683
      this.group.add(laptop)
      this.createScreen()
      this.scene.add(this.group)

      this.bounceVars = { i: 0, pos: 0, rot: 0 }
      this.bounce()
      intro()
    })
  }

  bounce () {
    window.requestAnimationFrame(() => this.bounce())
    if (!this.moving) {
      const py = this.bounceVars.pos
      const ry = this.bounceVars.rot
      const i = this.bounceVars.i
      this.group.position.y = Math.sin(i * 0.007) * 0.02 + py
      this.group.rotation.y = Math.sin(i * 0.009) * 0.02 + ry
      this.bounceVars.i++
    }
  }

  moveLappy (name, ease, type, time = 2000) {
    const obj = spots[name]
    if (!obj) return
    this.moving = true
    new TWEEN.Tween(this.group.position)
      .to({ x: obj.pos.x, y: obj.pos.y, z: obj.pos.z }, time)
      .easing(TWEEN.Easing[ease][type])
      .start()
    new TWEEN.Tween(this.group.rotation)
      .to({ x: obj.rot.x, y: obj.rot.y, z: obj.rot.z }, time)
      .easing(TWEEN.Easing[ease][type])
      .onComplete(() => {
        this.bounceVars = {
          i: 0, pos: this.group.position.y, rot: this.group.rotation.y
        }
        this.moving = false
      })
      .start()
  }

  playVideo () {
    // if (Averigua.isMobile()) return
    if (this.screen.material.map.image) {
      this.texture = new THREE.VideoTexture(this.video)
      this.screen.material.map = this.texture
      this.screen.material.needsUpdate = true
    }
    if (this.video.paused) this.video.play()
  }

  updateVideo (video) {
    // if (Averigua.isMobile()) return
    if (!this.video.src.includes(video)) {
      this.video.src = video
      this.texture = new THREE.VideoTexture(this.video)
      this.screen.material.map = this.texture
      this.screen.material.needsUpdate = true
    }
    if (this.video.paused) this.video.play()
  }

  loadLapTop (callback) {
    const loader = new THREE.GLTFLoader().setPath('models/')
    loader.load('Laptop_01.gltf', (gltf) => {
      this.laptop = gltf.scene
      this.laptop.scale.set(0.05, 0.05, 0.05)
      this.laptop.scale.x *= 1.25
      this.laptop.traverse((child) => {
        if (child.isMesh) child.material = this.grad.material
        // if (child.isMesh) child.material = new THREE.MeshNormalMaterial()
      })
      if (callback) callback(this.laptop)
    })
  }

  createScreen () {
    this.video = document.createElement('video')
    this.video.loop = true
    this.video.src = 'videos/netnet.mp4'
    this.video.setAttribute('playsinline', true)
    this.texture = new THREE.VideoTexture(this.video)
    this.poster = new THREE.TextureLoader().load('images/poster.png')
    const geo = new THREE.PlaneBufferGeometry(1, 1)
    this.canvmat = new THREE.MeshBasicMaterial({ map: this.poster })
    this.screen = new THREE.Mesh(geo, this.canvmat)
    this.screen.position.set(0, 0.251, -0.294)
    this.screen.scale.set(0.58, 0.409, 0.5)
    this.screen.scale.x *= 1.38
    this.screen.rotation.x = -0.18
    this.group.add(this.screen)
  }
}

const WORLD = new Demo({
  tween: true,
  // controls: true,
  // bleed: true
})

WORLD.camera.position.x = 2.673
WORLD.camera.position.y = 0.033
WORLD.camera.position.z = 1.389
WORLD.camera.rotation.x = -0.108
WORLD.camera.rotation.y = 1.028
WORLD.camera.rotation.z = 0.092
