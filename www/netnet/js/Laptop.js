/* global THREE */
class Laptop {
  constructor (opts, callback) {
    this.laptop = null
    this.screen = null
    this.shader = opts.shader
    const geo = new THREE.BoxGeometry(0.55, 0.55, 0.50)
    const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    this.group = new THREE.Mesh(geo, mat)
    this.group.name = 'laptop-' + this.name
    if (opts.path && opts.path !== '../data/new-media/thumbnails/') {
      this.hasPath = true
      this.img = new window.Image()
      this.img.onload = () => this.loadLapTop(callback)
      this.img.src = opts.path
    } else this.loadLapTop(callback)
  }

  loop () {
    window.requestAnimationFrame(() => this.loop())
    const w = this.canvas.width
    const h = this.canvas.height
    if (this.hasPath) this.ctx.drawImage(this.img, 0, 0, w, h)
    const l = Math.random() * 5 - (5 / 2)
    this.ctx.fillStyle = `hsla(47, 42%, ${97 + l}%, 0.66)`
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    if (this.canvmat) this.canvmat.map.needsUpdate = true
  }

  createScreen () {
    this.canvas = document.createElement('canvas')
    // this.canvas.style.position = 'absolute'
    // this.canvas.style.zIndex = 100000
    // document.body.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')
    this.canvas.width = 512
    this.canvas.height = 512
    this.loop()
    const texture = new THREE.CanvasTexture(this.canvas)
    const geo = new THREE.PlaneBufferGeometry(1, 1)
    this.canvmat = new THREE.MeshBasicMaterial({ map: texture })
    this.screen = new THREE.Mesh(geo, this.canvmat)
    this.screen.position.set(0, 0.251, 0.3349)
    this.screen.scale.set(0.58, 0.409, 0.5)
    this.screen.rotation.x = -0.18
    this.group.add(this.screen)
  }

  loadLapTop (callback) {
    const loader = new THREE.GLTFLoader().setPath('../models/')
    loader.load('Laptop_01.gltf', (gltf) => {
      this.laptop = gltf.scene
      this.laptop.scale.set(0.05, 0.05, 0.05)
      this.laptop.position.z = 0.629
      // const m = new THREE.MeshStandardMaterial({ color: 0x152d73 })
      const m = this.shader.material
      this.laptop.traverse((child) => {
        if (child.isMesh) child.material = m
      })
      this.createScreen()
      this.group.add(this.laptop)
      if (callback) callback(this.group, this.laptop)
    })
  }
}

window.Laptop = Laptop
