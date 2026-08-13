/* global nn, NetizenNav, NetizenGrid, NetizenASCIISplash, NetizenContentBlock, NetizenBendPanel, NetizenBentText, NetizenSyrupImage, loadASCIIArt, loadData */

window.data = null // contains all the content data
let nav, splash, content, grid, bendPanel, subNav

// default settings for processed images
// TODO: make customizable via bend panel
const syrupSettings = {
  huffhack: {
    process: false,
    opacity: 0.66,
    zIndex: 3,
    seed: 7
  },
  dither: {
    process: true,
    opacity: 0.67,
    zIndex: 2,
    algorithm: 'atkinson',
    dotSize: 1,
    threshold: 174
  },
  pixelate: {
    process: true,
    opacity: 1,
    zIndex: 1,
    size: 8,
    threshold: 128
  },
  ascii: {
    process: true,
    opacity: 0.5,
    zIndex: 4,
    chars: 'O*',
    fontSize: 8,
    fgColor: 'white'
  }
}

// *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
// *.O                             util functions                          *.O
// *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O

function resetGridAndContent (exceptInitatives) {
  grid.clearAllBlocks()
  // clear all syrup images
  nn.getAll('.syrup').forEach(ele => {
    ele.classList.remove('syrup')
    ele.querySelectorAll('img').forEach(img => img.remove())
    ele.onmouseover = null
    ele.onmouseout = null
    ele.onclick = null
  })
  // remove any extra grids
  nn.getAll('.grid').filter(d => d.id !== 'main-grid').forEach(d => d.remove())

  if (exceptInitatives) return
  // reset initiatives
  subNav.classList.remove('sub-nav')
  subNav.querySelectorAll('*').forEach(e => e.remove())
  // revert center cell-content to original colors
  content.ele.children[1].style.background = 'var(--prim-b)'
  content.ele.children[1].style.color = 'var(--prim-a)'
}

function addSyrupImgToGrid (opts = {}) {
  opts.ele1.classList.add('syrup')

  const syrup = new NetizenSyrupImage({
    image: opts.path,
    ele: opts.ele1,
    colors: [opts.ele1.style.backgroundColor, opts.ele2.style.backgroundColor],
    huffhack: syrupSettings.huffhack,
    dither: syrupSettings.dither,
    pixelate: syrupSettings.pixelate,
    ascii: syrupSettings.ascii
  })

  nn.create('img')
    .set('src', opts.path)
    .set('name', 'clean')
    .addTo(opts.ele1)

  const fadeIn = e => { e.style.opacity = 1 }
  const fadeOut = e => { e.style.opacity = 0 }

  opts.ele1.onmouseover = () => {
    opts.ele1.querySelectorAll('.syrup-pre').forEach(fadeOut)
    opts.ele1.querySelectorAll('.syrup-post').forEach(fadeIn)
    opts.ele1.querySelectorAll('img').forEach(img => {
      if (img.name !== 'clean') img.style.opacity = 0
    })
  }
  opts.ele1.onmouseout = () => {
    opts.ele1.querySelectorAll('.syrup-pre').forEach(fadeIn)
    opts.ele1.querySelectorAll('.syrup-post').forEach(fadeOut)
    opts.ele1.querySelectorAll('img').forEach(img => {
      if (img.name !== 'clean') {
        img.style.opacity = syrup[img.name].opacity
      }
    })
  }

  if (opts.callback) opts.ele1.onclick = () => opts.callback()
}

// *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
// *.O                  nav section change functions                       *.O
// *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O

// Below-the-fold initiative teasers on the home grid. Only initiatives with
// real images in their own `grid` array can feature here (bias-out-of-the-box,
// browserfest, and artware-incubator have none yet) -- same random-pick
// pattern showInitiatives() already uses for D.R.E.A.M.'s own thumbnail.
// goToPath is the same routine deep links and the splash credit use:
// loadCaseStudy() assumes the initiatives sub-nav already exists in the DOM
// (it looks up `.sub-nav-item[name=...]`), which is only true after
// nav.updatePage('initiatives') has run and had time to render it -- calling
// loadCaseStudy() straight from home throws on that lookup.
//
// Called from both showHome() and main()'s own "populate the initial grid"
// block below: showHome() is guarded by `if (nav.state === 0) return`, which
// is already true on a cold load (nav.state starts at 0), so it never runs on
// first paint -- main() has always had its own separate, unguarded call for
// exactly that reason (see the-crew.jpg being added in both places already).
function populateHomeGrid () {
  // WHICH initiatives feature on home is shared data (data/main.json
  // "featuredOnHome" -- mobile reads the same key), so content changes only
  // happen in one place. WHERE they land is desktop-specific: grid block
  // slots, assigned positionally. Reading order per Jon: video first (block
  // 2, the big top cell), projects between, NEWSLETTER (5) before BEND THIS
  // SITE (6), cows (7), dream teaser (8). Two teaser slots means the third
  // featuredOnHome entry only shows on mobile and the initiatives page --
  // the trade for giving BEND its own block instead of it sharing block 1
  // with a teaser whose syrup images painted right over the canvas.
  const slots = [[1, 2], [8, 7]]
  const featured = (window.data.featuredOnHome || []).slice(0, slots.length)
  const featuredInitiatives = featured.map((name, i) => ({ name, blocks: slots[i] }))
  featuredInitiatives.forEach(({ name, blocks }) => {
    const init = window.data.initiatives[name]
    const images = (init.grid || []).map(g => g.image)
    if (!images.length) return
    addSyrupImgToGrid({
      path: nn.random(images),
      ele1: grid.getBlock(blocks[0]),
      ele2: grid.getBlock(blocks[1]),
      callback: () => goToPath('/initiatives/' + name)
    })
  })

  // Newsletter CTA: same graphical-lettering treatment as BEND THIS SITE
  // (NetizenBentText, stroke colour borrowed from a neighbouring cell --
  // the convention bendPanel established). Block 5. Re-entering home
  // re-populates the grid, so destroy the previous instance first or its
  // ResizeObserver keeps watching a detached canvas.
  if (window.data.newsletterUrl) {
    if (window._newsletterText) window._newsletterText.destroy()
    window._newsletterText = new NetizenBentText({
      parent: grid.getBlock(5),
      text: ['NEWS', 'LETTER'],
      color: grid.getBlock(6).style.backgroundColor,
      padding: 10,
      xOverlap: 30,
      yOverlap: 80
    })
    window._newsletterText.canvas.style.cursor = 'pointer'
    window._newsletterText.canvas.onclick = () =>
      window.open(window.data.newsletterUrl, '_blank')
  }

  // Feature video (new release spotlight), block 2 -- the first big element.
  // Same syrup treatment as every other grid image (addSyrupImgToGrid),
  // instead of a plain thumbnail, for visual consistency with the rest of
  // the grid. Paired with block 1 for its second colour -- the reverse of
  // the pairing populateHomeGrid() already uses when block 1 hosts a
  // teaser (ele1: block 1, ele2: block 2).
  //
  // hqdefault.jpg (not maxresdefault.jpg) because it's guaranteed to exist
  // for every video -- maxresdefault silently 200s with a tiny placeholder
  // instead of 404ing when it's missing, so there'd be no reliable way to
  // detect and fall back.
  if (window.data.featureVideo && window.data.featureVideo.youtubeId) {
    const v = window.data.featureVideo
    const block = grid.getBlock(2)
    block.classList.add('feature-video')
    addSyrupImgToGrid({
      path: `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`,
      ele1: block,
      ele2: grid.getBlock(1),
      callback: () => window.open(`https://www.youtube.com/watch?v=${v.youtubeId}`, '_blank', 'noopener')
    })
    // a CSS background-image, not an <img> -- addSyrupImgToGrid's hover
    // handlers do querySelectorAll('img') and assume every non-"clean" img
    // has a matching entry in `syrup` (huffhack/pixelate/dither/ascii); an
    // actual <img> here would hit that and throw on mouseout
    nn.create('span').set('class', 'play-icon').addTo(block)
  }

  // BEND THIS SITE lives in block 6 now (its own block -- reading order puts
  // it after the newsletter). resetGridAndContent()'s clearAllBlocks() strips
  // every block's children on each home re-entry, bend canvas included, so
  // re-home it here. Re-pointing .container keeps NetizenBentText's sizing
  // honest before the redraw.
  if (typeof bendPanel !== 'undefined' && bendPanel && bendPanel.text) {
    const bendBlock = grid.getBlock(6)
    if (bendPanel.text.canvas.parentNode !== bendBlock) {
      bendPanel.text.container = bendBlock
      bendBlock.appendChild(bendPanel.text.canvas)
      bendPanel.text.update()
    }
  }
}

function showHome () {
  if (nav.state === 0) return

  if (content.showing) {
    content.hide()
    splash.start()
  }

  resetGridAndContent()

  addSyrupImgToGrid({
    path: 'images/the-crew.jpg',
    ele1: grid.getBlock(4),
    ele2: grid.getBlock(3),
    callback: () => nav.updatePage('about')
  })

  loadASCIIArt({
    path: 'ascii-art/cows.txt',
    parent: grid.getBlock(7),
    link: 'http://www.textfiles.com/art/cow.txt'
  })

  populateHomeGrid()

  grid.transitionTo(window.grids.default)

  if (bendPanel.showing) bendPanel.hidePanel()
  bendPanel.enable()
}

// --------------------------------------------------------------- ABOUT SECTION
function showAbout () {
  if (nav.state === 'about') return

  resetGridAndContent()

  content.show('about')

  splash.stop()

  grid.transitionTo(window.grids.default)

  loadASCIIArt({
    path: 'ascii-art/cows.txt',
    parent: grid.getBlock(7),
    link: 'http://www.textfiles.com/art/cow.txt'
  })

  nn.create('img')
    .set('src', 'images/the-crew.jpg')
    .css({ cursor: 'auto' })
    .addTo(grid.getBlock(4))
}

// --------------------------------------------------------- INITIATIVES SECTION
async function showInitiatives () {
  if (nav.state === 'initiatives') return
  content.show('initiatives')

  resetGridAndContent()

  subNav.classList.add('sub-nav')
  window.data._initiativesOrder.forEach(proj => {
    const key = proj.split('.')[0]
    const obj = window.data.initiatives[key]
    const item = nn.create('span')
      .content(obj.title)
      .set('class', 'sub-nav-item')
      .set('name', key)
      .addTo(subNav)
      .on('click', () => window.loadCaseStudy(obj))
    setTimeout(() => { item.style.opacity = 1 }, 900)
  })

  grid.transitionTo(window.grids.default2)

  const dreamPics = [1, 2, 3, 7, 9, 12]
  const dreamObj = window.data.initiatives.dream
  addSyrupImgToGrid({
    path: `images/dream/dream${nn.random(dreamPics)}.jpg`,
    ele1: grid.getBlock(3),
    ele2: grid.getBlock(4),
    callback: () => window.loadCaseStudy(dreamObj)
  })

  const ascii = await loadASCIIArt({
    path: 'ascii-art/netnet.txt',
    parent: grid.getBlock(1),
    css: { fontSize: '2rem', cursor: 'pointer' }
  })
  const nnObj = window.data.initiatives.netnet
  ascii.onclick = () => window.loadCaseStudy(nnObj)
}

// ------------------------------------------------------------- SUPPORT SECTION
function showSupport () {
  if (nav.state === 'support') return
  resetGridAndContent()
  content.show('support')

  grid.transitionTo(window.grids.default)

  const asciiBlock = grid.grid === window.grids.default
    ? grid.getBlock(4) : grid.getBlock(5)
  loadASCIIArt({
    path: 'ascii-art/netizen-heart.txt',
    parent: asciiBlock,
    css: { letterSpacing: '0.75rem' }
  })
}

// *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
// *.O                             main function                           *.O
// *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O

// Attribution for whatever the splash is currently showing.
// NetizenASCIISplash advances its own image on click and exposes no event, so
// this polls imagePath rather than reaching into the class. Cheap, and it keeps
// the credit out of that component entirely.
function setupSplashCredit () {
  const ele = nn.get('#splash-credit')
  if (!ele) return
  // sit just above the bottom edge of the splash canvas
  const place = () => {
    const h = (splash && splash.canvas) ? splash.canvas.getBoundingClientRect().height : 0
    if (h) ele.style.top = Math.round(h - 30) + 'px'
  }
  place()
  window.addEventListener('resize', place)

  // The credit is position:fixed, so on its own it would sit in the viewport's
  // bottom right forever -- following you down the page and lingering on
  // interior sections. It belongs to the splash, so it should only be visible
  // when the splash is what you're actually looking at: at the top of the
  // page, and on the home section.
  //
  // Gated on nav.state (0 on home, the section name otherwise) rather than
  // #splash-canvas opacity. Opacity seemed reasonable at first -- NetizenNav
  // fades the canvas to 0 on interior pages -- but prototypes/splash-lab.js's
  // "keep splash alive on interior pages" feature deliberately forces that
  // same opacity back to 1, since the whole point of that feature is for the
  // reveal to keep running behind About/Support/Initiatives. Two of our own
  // features were fighting over one signal. nav.state is set synchronously by
  // NetizenNav.updatePage() no matter what any prototype does to the canvas,
  // so it can't be fought over the same way.
  let shown = null
  let resolved = false
  const visible = () => {
    if (!resolved) return false
    if (window.scrollY > 30) return false
    return !nav || nav.state === 0
  }
  const updateVisibility = () => {
    const on = visible()
    ele.style.opacity = on ? '1' : '0'
    ele.style.pointerEvents = on ? 'auto' : 'none'
  }
  window.addEventListener('scroll', updateVisibility, { passive: true })

  // React the instant nav changes, not just on the next 400ms poll --
  // separate from the fact that opacity-based timing is gone now too.
  if (nav) {
    const origActivate = nav._activate.bind(nav)
    nav._activate = function (sec) { origActivate(sec); updateVisibility() }
    const origDeactivate = nav._deactivate.bind(nav)
    nav._deactivate = function () { origDeactivate(); updateVisibility() }
  }

  const render = () => {
    place()
    const src = splash && splash.imagePath
    // initiatives load async, so a lookup can legitimately come back empty on
    // the first pass. Only stop re-checking once we've actually resolved one --
    // caching on src alone would pin the very first (empty) answer forever.
    if (src !== shown || !resolved) {
      shown = src
      const c = window.splashCreditForSrc(src)
      if (!c) {
        ele.innerHTML = ''; ele.hidden = true; resolved = false
      } else {
        resolved = true
        ele.hidden = false
        ele.innerHTML = c.href
          ? `<a href="${c.href}">${c.label}</a>`
          : `<span>${c.label}</span>`
        // href="/initiatives/dream" would otherwise trigger a real page
        // navigation on click (pushState-based routing has no native
        // equivalent of the old hash-anchor trick). Drive it through the
        // same in-app router URLHandling() uses on a cold load instead.
        const a = ele.querySelector('a')
        if (a) a.addEventListener('click', e => { e.preventDefault(); goToPath(c.href) })
      }
    }
    updateVisibility()   // also catches nav changes, which fade the canvas
  }
  render()
  setInterval(render, 400)
}

// Shared by the cold-load path handler below, by in-page links (the splash
// credit) that need the same routing but can't rely on a real navigation,
// and by the popstate listener that drives browser back/forward.
async function goToPath (path) {
  const clean = path.replace(/^\/+/, '') // '/initiatives/dream' -> 'initiatives/dream'
  if (clean.startsWith('about')) {
    nav.updatePage('about')
  } else if (clean.startsWith('initiatives')) {
    nav.updatePage('initiatives')
    const parts = clean.split('/')
    if (parts.length > 1) {
      await nn.sleep(1200)
      const item = nn.get(`.sub-nav-item[name="${parts[1]}"]`)
      if (item) item.click()
    }
  } else if (clean.startsWith('support')) {
    nav.updatePage('support')
  } else if (nav.state !== 0) {
    nav.updatePage('logo') // back/forward landed on '/'
  }
}

async function URLHandling () {
  return goToPath(window.location.pathname)
}

// window.location.pathname has already moved by the time this fires (that's
// how popstate works), so goToPath -> nav.updatePage's own pathname check
// keeps this from pushing a duplicate history entry.
window.addEventListener('popstate', () => goToPath(window.location.pathname))

function resize () {
  if (window.blockerTimer) {
    clearTimeout(window.blockerTimer)
    clearTimeout(window.killLoader)
  }

  if (nn.width < 900) bendPanel.disable()
  else bendPanel.enable()

  nn.get('#loader').css('display', 'flex')
  nn.get('#loader').css('opacity', 1)

  content.adjustHeight()

  window.blockerTimer = setTimeout(() => {
    nn.get('#loader').css('opacity', 0)
    window.killLoader = setTimeout(() => nn.get('#loader').css('display', 'none'), 800)
  }, 250)
}

async function main () {
  if (nn.isMobile()) {
    // absolute, not relative: with real paths now (e.g. /initiatives/dream)
    // a relative 'mobile.html' would resolve to /initiatives/mobile.html.
    // Carry the intended path along so mobile.js can land on the same
    // section instead of silently bouncing every deep link back to home.
    const path = window.location.pathname
    window.location = path && path !== '/'
      ? `/mobile.html?redirect=${encodeURIComponent(path)}`
      : '/mobile.html'
    return
  }

  // load initial data
  window.data = await loadData()

  // setup the nav menu
  nav = new NetizenNav({
    parent: 'header',
    logo: '#netizen-logo',
    onSelection: (sec) => {
      switch (sec) {
        case 'logo': showHome(); break
        case 'about': showAbout(); break
        case 'initiatives': showInitiatives(); break
        case 'support': showSupport(); break
      }
    }
  })

  // setup splash page slide show
  splash = new NetizenASCIISplash({
    fontSize: 16,
    ele: nn.get('#splash-canvas'),
    radius: 200,
    duration: 1000,
    images: nn.shuffle(window.data.splashImages.map(window.splashSrc))
  })

  setupSplashCredit()

  // setup content section (displays over the splash + above the grid)
  content = new NetizenContentBlock()
  subNav = content.ele.children[0]
  subNav.classList.add('sub-nav')

  // setup main grid section
  grid = new NetizenGrid({
    selector: '#main-grid',
    grid: window.grids.default
  })

  // setup bend panel
  await document.fonts.load('200px Fira Mono')
  bendPanel = new NetizenBendPanel({
    textEle: grid.getBlock(6),
    panelEle: '.grid div:nth-child(3)', // 'main',
    onShow: () => {
      const t = nn.get('.grid').top + window.pageYOffset - nn.get('header').height
      window.scrollTo({ top: t, behavior: 'smooth' })
      grid.transitionTo(window.grids.default2)
      // remove the crew fromt the grid
      nn.getAll('.syrup').forEach(ele => {
        ele.classList.remove('syrup')
        ele.querySelectorAll('img').forEach(img => img.remove())
        ele.onmouseover = null
        ele.onmouseout = null
        ele.onclick = null
      })
    },
    onHide: () => {
      grid.transitionTo(window.grids.default)
      // add crew back to grid
      addSyrupImgToGrid({
        path: 'images/the-crew.jpg',
        ele1: grid.getBlock(4),
        ele2: grid.getBlock(3),
        callback: () => nav.updatePage('about')
      })
    }
  })

  if (nn.width < 900) bendPanel.disable()

  // popualte the inital grid
  loadASCIIArt({
    path: 'ascii-art/cows.txt',
    parent: grid.getBlock(7),
    link: 'http://www.textfiles.com/art/cow.txt'
  })

  addSyrupImgToGrid({
    path: 'images/the-crew.jpg',
    ele1: grid.getBlock(4),
    ele2: grid.getBlock(3),
    callback: () => nav.updatePage('about')
  })

  window.scrollTo({ top: 0, behavior: 'smooth' })
  await nn.sleep(2000)

  // check for window location logic
  const total = window.data._initiativesOrder.length
  const waitingForDataToLoad = setInterval(async () => {
    const loaded = Object.keys(window.data.initiatives).length
    if (loaded === total) { // if data is all loaded
      clearInterval(waitingForDataToLoad)

      // loadData() kicks off each initiative's fetch without awaiting it (a
      // forEach with an async callback doesn't block), so window.data.initiatives
      // is still empty immediately after the crew-photo setup above -- this
      // loop existing at all is the tell. populateHomeGrid() needs real
      // `.grid` arrays per initiative, so it waits here too.
      populateHomeGrid()

      await URLHandling()

      nn.get('#loader').css('opacity', 0)
      setTimeout(() => nn.get('#loader').css('display', 'none'), 800)
    }
    // ... otherwise, keep looping
  }, 200)
}

nn.on('load', main)
nn.on('resize', resize)
