const tileNames = [
  'arrows', 'arrow', 'boxes', 'circle', 'circles', 'curly', 'dots',
  'half-circles', 'lines-diagnal', 'lines-horizontal', 'pound', 'slash'
]
const tiles = []

function tile () {
  const s = document.createElement('img')
  const tile = tileNames[Math.floor(Math.random() * tileNames.length)]
  s.setAttribute('src', `/dream/images/tiles/${tile}.svg`)
  s.className = 'anim-tiles'
  return s
}

function createTiles () {
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
      t.setAttribute('data-x', (x * s))
      t.setAttribute('data-y', (y * s))
      ele.appendChild(t)
      tiles.push(t)
    }
    ele.appendChild(document.createElement('br'))
  }
}

function centerTiles () {
  tiles.forEach(t => {
    const tx = (window.innerWidth / 2 - 20) - parseInt(t.getAttribute('data-x'))
    const ty = (window.innerHeight / 2 - 20) - parseInt(t.getAttribute('data-y'))
    const dur = Math.random()
    t.style.transitionDuration = dur + 's'
    t.style.transform = `translate(${tx}px,${ty}px)`
    setTimeout((t) => { t.style.display = 'none' }, 1000, t)
  })
}

if (window.location.hash === '#t') {
  createTiles()
  setTimeout(centerTiles, 100)
}
