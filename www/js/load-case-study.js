/* global nn, content, resetGridAndContent, grid, bendPanel, NetizenGrid, addSyrupImgToGrid */
// NB: [] and {} are both truthy, so a plain `o[k] ?` test showed the "Partners"
// and "Links" labels with nothing under them whenever an initiative had none.
const csHasValue = v => {
  if (v === undefined || v === null || v === '') return false
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'object') return Object.keys(v).length > 0
  return true
}
const csDisplay = (o, k) => `style="display: ${csHasValue(o[k]) ? 'inline-block' : 'none'};"`
const csOpacity = (o, k) => `style="opacity: ${o[k] ? 1 : 0};"`

window.cases = []
window.casesIdx = 0
window.cassesProj = null

function caseStudyTemplate (o) {
  nn.get('.cell-content.visible').innerHTML = `
    <section class="case-study">
      <div>
        <h2>${o.title}</h2>
        <h4 class="bold-blue" ${csDisplay(o, 'sub-title')}>${o['sub-title']}</h4>
        ${o.content.map(c => `<p>${c}</p>`).join('\n')}
      </div>
      <div>
        <small ${csDisplay(o, 'date')}>
          <small class="bold-blue">Date</small>
          <br>${o.date}
        </small>
        <small ${csDisplay(o, 'partners')}>
          <small class="bold-blue">Partners</small><br>
          ${o.partners.map(p => p).join('<br>')}
        </small>
        <small  ${csDisplay(o, 'urls')}>
          <small class="bold-blue">Links</small><br>
          ${Object.entries(o.urls).map(o => `<a href="${o[1]}" target="_blank" style="text-transform: uppercase">${o[0]}</a>`).join('<br>')}
        </small>
      </div>
    </section>
  `
}

function popUpTemplate (cs, obj, proj) {
  cs.innerHTML = `
    <div class="title-bar">
      <h2>netizen.org/initiatives/${proj}</h2>
      <span class="close">
        CLOSE <img src="images/close.svg" alt="close pop up">
      </span>
    </div>
    <div class="featured-image">
      <img src="${obj.image}" alt="${obj.alt}">
      <div class="back-next-row">
        <img src="images/left-arrow-white.svg" alt="previous pop up">
        <img src="images/right-arrow-white.svg" alt="next pop up">
      </div>
    </div>
    <div class="content">
      <div>
        <h2 ${csOpacity(obj, 'title')}>${obj.title}</h2>
        ${obj.content ? obj.content.map(p => `<p>${p}</p>`).join('') : ''}
      </div>
      <div>
        <div>
          <small ${csDisplay(obj, 'alt')} class="bold-blue">Media Caption:</small><br>
          <small ${csDisplay(obj, 'alt')}>${obj.alt}</small>
        </div>
        <div>
          <small ${csDisplay(obj, 'credit')} class="bold-blue">Credit:</small><br>
          <small ${csDisplay(obj, 'credit')}> ${obj.credit}</small>
        </div>
        <div>
          <small ${csDisplay(obj, 'urls')} class="bold-blue">Links:</small><br>
          <small ${csDisplay(obj, 'urls')}>
            ${obj.urls ? Object.entries(obj.urls).map(o => `<a href="${o[1]}" target="_blank">${o[0]}</a>`).join(', ') : ''}
          </small>
        </div>
      </div>
    </div>
  `
}

window.caseStudyPopUpLogic = (idx) => {
  window.casesIdx = idx
  const obj = window.cases[idx]
  // console.log('obj', obj);

  const next = () => {
    window.casesIdx++
    if (window.casesIdx >= window.cases.length) window.casesIdx = 0
    window.caseStudyPopUpLogic(window.casesIdx)
  }

  const prev = () => {
    window.casesIdx--
    if (window.casesIdx < 0) window.casesIdx = window.cases.length - 1
    window.caseStudyPopUpLogic(window.casesIdx)
  }

  const closeXColor = (t) => {
    const n = t === 'white' ? 'close-white' : 'close'
    cs.querySelector('.close img').src = `images/${n}.svg`
  }

  const close = () => {
    document.body.classList.remove('no-scroll')
    cs.css('opacity', 0)
    setTimeout(() => cs.remove(), 800)
  }

  // otherwise, if no pop up exists create it
  document.body.classList.add('no-scroll')

  const cs = document.querySelector('.case-study-detail') || nn
    .create('div')
    .set('class', 'case-study-detail')
    .css({
      background: nn.random(window.colors[0]),
      filter: bendPanel._buildFilterString(bendPanel.filters) || 'none'
    })
    .addTo('body')

  popUpTemplate(cs, obj, window.cassesProj.title)
  cs.scrollTo({ top: 0, behavior: 'smooth' })
  setTimeout(() => cs.css('opacity', 1), 100)

  cs.querySelector('.close').onclick = () => close()
  cs.querySelector('.close').onmouseover = () => closeXColor('white')
  cs.querySelector('.close').onmouseout = () => closeXColor('black')
  cs.querySelector('[alt="previous pop up"]').onclick = prev
  cs.querySelector('[alt="next pop up"]').onclick = next
}

window.loadCaseStudy = function (o) {
  window.cassesProj = o
  const span = nn.getAll('.sub-nav-item')
    .filter(ele => ele.getAttribute('name') === o.name)[0]

  const path = '/initiatives/' + o.name
  if (window.location.pathname !== path) window.history.pushState(null, '', path)

  nn.getAll('.sub-nav-item').forEach(s => s.classList.remove('selected'))
  span.classList.add('selected')

  // update main content area
  content.transitionTo([{ x: 0, w: 2 }, { x: 2, w: 4 }, { x: 6, w: 0 }])

  // Was white bg + black text -- the odd one out against About/Support's
  // black bg + white text. Links already use var(--blue) unconditionally
  // (brand.css), not a background-specific override, so nothing strands here.
  nn.get('.cell-content.visible').parentNode
    .css({ background: 'var(--prim-b)', color: 'var(--prim-a)' })

  caseStudyTemplate(o)

  content.adjustHeight()

  // clear previous grids
  resetGridAndContent(true)

  const grids = [grid]
  window.cases = nn.shuffle(window.data.initiatives[o.name].grid)
  const gridNames = Object.keys(window.grids)
  const initialGrid = 'default2' // NOTE: this grid type should match the one in showInitiatives()

  // create enough grids for all the syrup images
  let gid = 3 // index of "extra"
  let openCells = window.openCells[initialGrid].length
  while (openCells < window.cases.length) {
    const type = gridNames[gid % gridNames.length]
    const layout = window.grids[type]
    const attr = { class: 'grid', id: 'g' + gid, name: type }
    nn.create('div').set(attr).addTo('main')
    grids.push(new NetizenGrid({ selector: '#g' + gid, grid: layout }))
    openCells += window.openCells[type].length
    gid++
  }

  // popualte grid with syrup images
  let c = 0
  nn.getAll('.grid').forEach((gridEle, i) => {
    const name = gridEle.getAttribute('name') || initialGrid
    const targetCells = window.openCells[name]
    const gridInstance = grids[i]
    targetCells.forEach(targ => {
      const ele1 = gridInstance.getBlock(targ)
      const targ2 = (targ - 1) % 2 === 0 ? targ + 1 : targ - 1
      const ele2 = gridInstance.getBlock(targ2)
      const obj = window.cases[c]
      if (obj) {
        // .....................................................................
        // POP UP SCREEN (funcion runs on click)
        // .............
        const idx = window.cases.indexOf(obj)
        const callback = () => window.caseStudyPopUpLogic(idx)
        // ...................................................................

        // ---------------------------------
        // add content to grid
        // ---------------------------------
        addSyrupImgToGrid({ path: obj.image, ele1, ele2, callback })

        nn.create('div')
          .content(obj.alt)
          .set('class', 'case-study-thumb-caption  syrup-post')
          .addTo(ele1)

        if (obj.title) {
          nn.create('h2')
            .content(obj.title)
            .set('class', 'case-study-thumb-title syrup-pre')
            .addTo(ele1)
        }
      }
      c++
    })
  })

  // relocate footer at bottom
  const footer = nn.get('footer')
  footer.remove()
  footer.addTo('main')
}
