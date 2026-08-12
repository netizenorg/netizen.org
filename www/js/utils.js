/* global nn */

window.colors = [
  ['#ff9999', '#ff99cc', '#ff99ff', '#cc99ff', '#9999ff', '#99ccff', '#99ffff', '#99ffcc', '#99ff99', '#ccff99', '#ffff99', '#ffcc99'],
  ['#993333', '#993366', '#993399', '#663399', '#333399', '#336699', '#339999', '#339966', '#339933', '#669933', '#999933', '#996633']
]

async function loadASCIIArt (o) {
  const asciiBlockCSS = {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }

  try {
    const res = await window.fetch(o.path)
    if (!res.ok) throw new Error(`Failed to fetch ${o.path}: ${res.status} ${res.statusText}`)
    const ascii = await res.text()
    const asciiFrame = nn.create('div').css(asciiBlockCSS).addTo(o.parent)
    const color = nn.isLight(o.parent.style.backgroundColor) ? '#000' : '#fff'
    const styles = o.css || {}
    styles.color = color
    const ele = nn.create('pre')
      .content(ascii)
      .addTo(asciiFrame)
      .css(styles)
    if (o.link) ele.on('click', () => window.open(o.link, '_blank'))
    return ele
  } catch (err) {
    console.error('loadTextFile error:', err)
    throw err
  }
}

// splashImages entries may be a plain string or an object:
//
//   "images/x.jpg"                              no credit
//   { src }                                     no credit
//   { src, initiative: "dream" }                initiative's title + its page
//   { src, initiative: "dream", label: "..." }  YOUR wording, still links to
//                                               the initiative page
//   { src, label: "...", href: "..." }          fully manual
//
// `label` always wins for the wording; `href` always wins for the destination.
// Anything not given falls back to the initiative. Storing the slug rather than
// the title means the default wording and the URL both come from
// data/initiatives/<slug>.json, so a rename can't strand a stale copy here.
function splashSrc (entry) {
  return typeof entry === 'string' ? entry : entry.src
}

function splashCredit (entry) {
  if (!entry || typeof entry === 'string') return null
  // initiatives load asynchronously, so this may be absent on an early call
  const init = entry.initiative && window.data && window.data.initiatives
    ? window.data.initiatives[entry.initiative]
    : null
  const label = entry.label || (init && init.title) || null
  const href = entry.href || (entry.initiative ? `#initiatives/${entry.initiative}` : null)
  if (!label) return null   // nothing to say yet (or deliberately muted)
  return { label, href }
}

function splashCreditForSrc (src) {
  const list = (window.data && window.data.splashImages) || []
  return splashCredit(list.find(e => splashSrc(e) === src))
}

async function loadData () {
  const res = await window.fetch('data/main.json')
  if (!res.ok) throw new Error(`Failed to load data: ${res.status}`)
  window.data = await res.json()
  // normalise once so desktop and mobile never have to care which shape it is
  window.data.splashImages = (window.data.splashImages || [])
    .map(e => (typeof e === 'string' ? { src: e } : e))
  window.data._initiativesOrder = [...window.data.initiatives]
  window.data.initiatives = {}
  window.data._initiativesOrder.forEach(async file => {
    const res = await window.fetch(`data/initiatives/${file}`)
    const json = await res.json()
    const name = file.split('.')[0]
    window.data.initiatives[name] = json
    window.data.initiatives[name].name = name
  })
  return window.data
}

window.loadASCIIArt = loadASCIIArt
window.loadData = loadData
window.splashSrc = splashSrc
window.splashCredit = splashCredit
window.splashCreditForSrc = splashCreditForSrc
