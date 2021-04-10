/* global THREE, TWEEN, Twitch */

let camera, scene, renderer
// let controls
let durOff = 1000
let durMin = 1000
let stream, test
let mouseX = 0
let mouseY = 0
let windowHalfX = window.innerWidth / 2
let windowHalfY = window.innerHeight / 2

let status = 'stream'
const dict = {
  perene: {
    layer: 1,
    obj: null,
    origin: {
      position: { x: -361.0774347598323, y: -388.4529313939218, z: -180.73976145892843 },
      rotation: { x: 0.21111352684005347, y: -0.5061568937138285, z: 0.6719987098106666 }
    },
    award: 'xuper 1337 gr4ND Champ of teh wwweb awwward!',
    img: 'https://netnet.studio/perenewang-1617563236128.png',
    url: 'https://netnet.studio/?gh=perenewang/Internet-Art-Final-Project/main',
    title: 'DISCO!',
    artist: 'perne'
  },
  emmy: {
    layer: 1,
    obj: null,
    origin: {
      position: { x: 214.6863542633805, y: 323.1308065897556, z: -244.351829458573 },
      rotation: { x: 0.8624008900180113, y: -0.2849079623919133, z: 0.8421152092530197 }
    },
    award: 'grooviest UX',
    img: 'https://netnet.studio/emmy-html-1616730872934.png',
    url: 'https://netnet.studio/?gh=emmy-html/the-new-vibe-check/main',
    title: 'vibe check v0.5',
    artist: 'emmy',
    homepage: 'https://twitter.com/emmydoesit'
  },
  ilai: {
    layer: 2,
    obj: null,
    origin: {
      position: { x: -698.5699743381765, y: 165.89672039479342, z: -538.7761386620978 },
      rotation: { x: -0.01278183380667941, y: 0.32384428317088365, z: -0.4620776390812713 }
    },
    award: 'code+chill wildcard award',
    img: 'https://netnet.studio/il41-1617857642892.png',
    url: 'https://netnet.studio/?gh=il41/blobsound/main',
    title: 'blob sound',
    artist: '11ai',
    homepage: 'http://www.ilai.link/'
  },
  jhancock532: {
    layer: 2,
    obj: null,
    origin: {
      position: { x: 217.8730351719796, y: -252.84821297760396, z: -410.9512248070864 },
      rotation: { x: 0.3249473745105378, y: -0.8513423872046033, z: -0.01947451642907083 }
    },
    award: 'the ouroboros award',
    img: 'https://netnet.studio/jhancock532-1616795242167.jpeg',
    url: 'https://netnet.studio/?gh=jhancock532/know-thyself/main',
    title: 'Know Thyself',
    artist: 'jhancock532',
    homepage: 'https://twitter.com/jhancock532'
  },
  zoa: {
    layer: 2,
    obj: null,
    origin: {
      position: { x: 310.85339060797446, y: 57.16979389860967, z: -310.634650260444 },
      rotation: { x: 0.39876405012186944, y: -0.8263595504690064, z: 0.07894242998413681 }
    },
    award: 'best surprise UX',
    img: 'https://netnet.studio/zk794-1614899007536.png',
    url: 'https://netnet.studio/?gh=zk794/discoSquares/main',
    title: 'Disco Squares',
    artist: 'Zoa K.'
  },
  ali: {
    layer: 2,
    obj: null,
    origin: {
      position: { x: -457.2520116010312, y: -268.70257357010405, z: -114.03169791618843 },
      rotation: { x: -0.3230852908949382, y: -0.2603145906597719, z: -0.607994896487571 }
    },
    award: 'can\'t touch this award',
    img: 'https://netnet.studio/afregistry-1617848304602.png',
    url: 'https://netnet.studio/?gh=afregistry/Cursor-changes-Browserfest/main',
    title: ' Cursed Clicker',
    artist: 'Ali Fakhari',
    homepage: 'https://afregistry.github.io/Cursor-changes-Browserfest/'
  },
  jon: {
    layer: 2,
    obj: null,
    origin: {
      position: { x: 769.3006195613239, y: 127.30401672148594, z: -557.8322510342896 },
      rotation: { x: -0.1031388307800356, y: -0.9453315131115323, z: -0.535362837599723 }
    },
    award: 'best slowwwest',
    img: 'https://netnet.studio/jonchambers-1617471688752.png',
    url: 'https://netnet.studio/?gh=jonchambers/Internet-Skybox/main',
    title: 'Internet Skylight',
    artist: 'jon chambers',
    homepage: 'https://jonchambers.net/'
  }
}

function randomSpot () {
  return {
    x: Math.random() * 2000 - 1000,
    y: Math.random() * 1000 - 500,
    z: -Math.random() * 800 - 100
  }
}

function repositionDemo () {
  for (const key in dict) {
    if (dict[key].obj.position.x === 0) {
      const p = randomSpot()
      dict[key].ele.style.opacity = 0.5
      new TWEEN.Tween(dict[key].obj.position)
        .to({ x: p.x, y: p.y, z: p.z }, Math.random() * durMin + durOff)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onComplete(() => {
          dict[key].obj.rotation.x = Math.random() * 2 - 1
          dict[key].obj.rotation.y = Math.random() * 2 - 1
          dict[key].obj.rotation.z = Math.random() * 2 - 1
        })
        .start()
    }
  }
}

function tweenDemo (id) {
  status = 'demo'
  const o = dict[id]

  sendStreamBack()
  repositionDemo()

  o.ele.style.opacity = 1
  o.obj.rotation.x = 0
  o.obj.rotation.y = 0
  o.obj.rotation.z = 0

  new TWEEN.Tween(o.obj.position)
    .to({ x: 0, y: 0, z: 0 }, Math.random() * durMin + durOff)
    .easing(TWEEN.Easing.Exponential.InOut)
    .start()
}

function Demo (opts) {
  const div = document.createElement('a')
  div.style.display = 'block'
  div.setAttribute('href', opts.url)
  div.setAttribute('target', '_blank')
  div.style.opacity = 0.5
  div.innerHTML = `
    <div class="thumb" style="background-image: url(${opts.img})"></div>
    <div>
      <a href="${opts.url}" target="_blank">${opts.title}</a>
      ${opts.homepage ? `<a href="${opts.homepage}" target="_blank">by ${opts.artist}</a>` : `${opts.artist}`}
    </div>
  `
  const object = new THREE.CSS3DObject(div)
  return { div, object }
}

// -----------------------

function sendStreamBack () {
  if (stream.position.x === 0) {
    new TWEEN.Tween(stream.position)
      .to({ x: -1000, y: 0, z: -1000 }, Math.random() * durMin + durOff)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start()
  }
}

function tweenStream () {
  repositionDemo()
  new TWEEN.Tween(stream.position)
    .to({ x: 0, y: 25, z: 0 }, Math.random() * durMin + durOff)
    .easing(TWEEN.Easing.Exponential.InOut)
    .start()
}

function StreamEmbed () {
  const div = document.createElement('div')
  div.style.width = '620px'
  div.style.height = '378px'
  div.id = 'twitch-embed'
  div.style.backgroundColor = '#000'

  const object = new THREE.CSS3DObject(div)
  return object
}

function loadStream () {
  const ele = document.querySelector('#twitch-embed')
  if (!ele) return setTimeout(loadStream, 100)
  // const t = new Twitch.Player('twitch-embed', {
  //   channel: 'jonsatrom',
  //   width: 620,
  //   height: 378
  // })
  // return t
}

// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
// -----------------------------------------------------------------------

init()
animate()

function createSpan (key) {
  const opts = dict[key]
  const span = document.createElement('span')
  span.dataset.id = key
  span.innerHTML = `
    <span class="layer-${opts.layer} award">${opts.award}</span> =&gt;
    <span>${opts.title} by ${opts.artist}</span>; ----
  `
  span.addEventListener('click', () => tweenDemo(key))
  document.querySelector(`#awards-layer-${opts.layer}`).appendChild(span)
}

function init () {

  for (const key in dict) {
    createSpan(key)
  }

  const container = document.getElementById('container')

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5000)
  // camera.position.set(500, 350, 750)
  camera.position.z = 750

  scene = new THREE.Scene()

  renderer = new THREE.CSS3DRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  stream = new StreamEmbed()
  stream.position.y = 25
  scene.add(stream)
  loadStream()

  // controls = new THREE.TrackballControls(camera, renderer.domElement)
  // controls.rotateSpeed = 4

  // let str = ''
  for (const key in dict) {
//     const p = randomSpot()
//     const r = {
//       x: Math.random() * 2 - 1,
//       y: Math.random() * 2 - 1,
//       z: Math.random() * 2 - 1
//     }
//     str += `
// origin: {
//   position: { x: ${p.x}, y: ${p.y}, z: ${p.z} },
//   rotation: { x: ${r.x}, y: ${r.y}, z: ${r.z} }
// }
//     `
    const demo = new Demo(dict[key])
    const p = dict[key].origin.position
    const r = dict[key].origin.rotation
    dict[key].obj = demo.object
    dict[key].ele = demo.div
    dict[key].obj.position.set(p.x, p.y, p.z)
    dict[key].obj.rotation.x = r.x
    dict[key].obj.rotation.y = r.y
    dict[key].obj.rotation.z = r.z
    scene.add(dict[key].obj)
  }
  // console.log(str);

  window.addEventListener('resize', onWindowResize)
  document.addEventListener('mousemove', onDocumentMouseMove)

  // Block iframe events when dragging camera

  const blocker = document.getElementById('blocker')
  blocker.style.display = 'none'

  // controls.addEventListener('start', function () {
  //   if (status === 'stream') {
  //     blocker.style.display = ''
  //   } else {
  //     blocker.style.display = 'none'
  //   }
  // })
  // controls.addEventListener('end', function () {
  //   blocker.style.display = 'none'
  // })
}

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function onDocumentMouseMove (event) {
  mouseX = (event.clientX - windowHalfX) / 100
  mouseY = (event.clientY - windowHalfY) / 100
}

function animate () {
  window.requestAnimationFrame(animate)
  // controls.update()
  TWEEN.update()

  camera.position.x += (mouseX - camera.position.x) * 0.05
  camera.position.y += (-mouseY - camera.position.y) * 0.05
  renderer.render(scene, camera)
}
