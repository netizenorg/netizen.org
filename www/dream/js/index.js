/* / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \  */
/* \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ /  */
/*  |   |   |   |   |   bg photo slide show |   |   |   |   |   |   |   */
/* / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \  */
/* \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ /  */

let imgCnt = 37
let curImg = 1
let bg = document.querySelectorAll('.bg')
let imgs = []
for (let i = 1; i <= imgCnt; i++) imgs.push(`url(images/events/${i}.jpg)`)
const shuffle = (array) => array.sort(() => Math.random() - 0.5)
shuffle(imgs)
bg[1].style.backgroundImage = imgs[0]

setInterval(() => {
  curImg++; if (curImg > imgCnt) curImg = 1
  bg[0].style.backgroundImage = imgs[curImg]
  bg[1].style.opacity = 0
  setTimeout(() => {
    bg[1].style.backgroundImage = imgs[curImg]
    bg[1].style.opacity = 1
  }, 1000)
}, 3000)

/* / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \  */
/* \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ /  */
/*  |   |   |   |   |   tiles transition    |   |   |   |   |   |   |   */
/* / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \  */
/* \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ /  */

const watch = document.querySelector('.watch-vid')
const tileNames = [
  'arrows', 'arrow', 'boxes', 'circle', 'circles', 'curly', 'dots',
  'half-circles', 'lines-diagnal', 'lines-horizontal', 'pound', 'slash'
]
const tiles = []

function tile () {
  const s = document.createElement('img')
  const tile = tileNames[Math.floor(Math.random() * tileNames.length)]
  s.setAttribute('src', `images/tiles/${tile}.svg`)
  s.className = 'anim-tiles'
  return s
}

function createTiles () {
  const offX = watch.offsetLeft - window.scrollX + (40 * 3)
  const offY = watch.offsetTop - window.scrollY + (40)
  const s = 40
  const xsegs = Math.floor(window.innerWidth / s)
  const ysegs = Math.floor(window.innerHeight / s)

  const ele = document.createElement('div')
  ele.style.position = 'fixed'
  ele.style.left = '0px'
  ele.style.top = '0px'
  ele.style.zIndex = '1000'
  ele.style.lineHeight = '10px'
  document.body.appendChild(ele)

  for (let y = 0; y < ysegs; y++) {
    for (let x = 0; x < xsegs; x++) {
      const t = tile()
      const tx = offX - (x * s)
      const ty = offY - (y * s)
      t.setAttribute('data-x', (x * s))
      t.setAttribute('data-y', (y * s))
      t.style.transform = `translate(${tx}px,${ty}px)`
      ele.appendChild(t)
      tiles.push(t)
    }
    ele.appendChild(document.createElement('br'))
  }
}

function scatterTiles () {
  tiles.forEach(t => {
    let tx, ty
    const x = parseInt(t.getAttribute('data-x'))
    const y = parseInt(t.getAttribute('data-y'))
    const ran = Math.random() * 300 - 150
    const deg = Math.floor(Math.random() * 360)
    if (x < window.innerWidth / 2) tx = -ran; else tx = ran
    if (y < window.innerHeight / 2) ty = -ran; else ty = ran
    t.style.transitionDuration = Math.random() + 's'
    t.style.transform = `rotate(${deg}deg) translate(${tx}px,${ty}px)`
  })

  setTimeout(() => {
    tiles.forEach(t => { t.style.transform = `rotate(0deg) translate(0px,0px)` })
    setTimeout(() => { window.location = 'events.html#t' }, 1500)
  }, 1000)
}

watch.addEventListener('click', () => {
  createTiles()
  setTimeout(scatterTiles, 100)
})
