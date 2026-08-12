/* global NetizenSyrupImage */
/* netizen.org — mobile hero (syrup canvas + drifting wordmark)
 *
 * The mobile translation of the desktop splash reveal
 * (js/netizen-splash-reveal.js). Same aesthetics, deliberately less
 * machinery — see CLAUDE.md. What carries over and what doesn't:
 *
 *   KEPT      the syrup'd cover (real NetizenSyrupImage, same settings, so the
 *             hero speaks the same language as every other treated image), the
 *             wordmark punched through it, the idle drift (DVD-logo bounce,
 *             polarity flips on every wall hit so the mark can never sit
 *             invisible), image advance + credit update.
 *
 *   DROPPED   the pointer-erase brush (no hover on touch, and a drag gesture
 *             would fight scroll — the drift needs no input at all, which is
 *             exactly why it's the mobile answer), the recover/replace/explode
 *             click modes, interior-page persistence, and all the
 *             ownership-patching the desktop file needs to co-exist with
 *             NetizenASCIISplash. Mobile has no legacy splash component, so
 *             none of that fight exists here.
 *
 *   CHANGED   tap (click) advances the image — the whole gesture, not a
 *             resolve-then-advance. Auto-advance stays as a fallback for
 *             people who never tap, on a longer clock than the old 5s
 *             background rotation; a tap resets it. Each advance picks a
 *             fresh column-1/column-3 pair from window.colors (the brand
 *             pairing rule), where desktop hardcodes one pair.
 *
 * Renders at CSS pixels, not devicePixelRatio — the syrup is dithered and
 *             blocky on purpose; 1x keeps the per-frame cost phone-sized.
 *
 * The drift pauses via IntersectionObserver whenever the hero is off-screen
 * (scrolled away, or its section display:none'd) — no reason to burn battery
 * animating something nobody can see.
 *
 * Boot contract: window.NetizenMobileHero.boot(opts) returns true if the
 * canvas hero took over, false if the caller should keep its old
 * background-image rotation (feature checks fail, etc). mobile.js keeps that
 * fallback path alive; this module never removes the underlying
 * background-image, so a mid-flight failure still leaves a working hero.
 */
(function () {
  const settings = {
    // same values as desktop's syrupSettings / mobile.js's own copy — kept
    // locally so this file has no load-order coupling to either
    huffhack: { process: false, opacity: 0.66, zIndex: 3, seed: 7 },
    dither: { process: true, opacity: 0.67, zIndex: 2, algorithm: 'atkinson', dotSize: 1, threshold: 174 },
    pixelate: { process: true, opacity: 1, zIndex: 1, size: 8, threshold: 128 },
    ascii: { process: true, opacity: 0.5, zIndex: 4, chars: 'O*', fontSize: 8, fgColor: 'white' }
  }

  // the mark is the protagonist on a small screen, so it runs slightly larger
  // relative to canvas width than desktop's 0.1648 — strokes still need to be
  // 2-3 cells wide or the wordmark mushes into noise (same ratio rule as the
  // desktop file)
  const sizeFor = w => {
    const textPx = Math.round(Math.max(48, Math.min(120, w * 0.185)))
    return { textPx, cell: Math.max(4, Math.round(textPx / 13)) }
  }

  function boot (opts) {
    const container = opts.container
    const srcs = opts.srcs || []
    const creditEle = opts.credit || null

    if (!container || srcs.length === 0) return false
    if (typeof NetizenSyrupImage === 'undefined') return false
    if (!window.colors || !window.CanvasRenderingContext2D) return false

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return false
    container.appendChild(canvas)

    let W = 0
    let H = 0
    let cell = 6
    let textPx = 60
    let mask = null
    let clean = null // offscreen canvas: current photo, cover-fit
    let cover = null // offscreen canvas: syrup'd treatment of the same photo
    let idx = 0
    let busy = false
    let paused = false
    let drift = null
    let autoTimer = null
    const AUTO_MS = 9000

    const brandPair = () => [
      window.colors[0][Math.floor(Math.random() * window.colors[0].length)],
      window.colors[1][Math.floor(Math.random() * window.colors[1].length)]
    ]

    /* ---------- building the two layers ---------------------------------- */

    const loadImg = src => new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })

    // cover-fit, same math as the desktop splash's drawImageCover
    const buildClean = async src => {
      const img = await loadImg(src)
      const c = document.createElement('canvas')
      c.width = W; c.height = H
      const cx = c.getContext('2d')
      const ir = img.naturalWidth / img.naturalHeight
      const cr = W / H
      let sx, sy, sw, sh
      if (ir > cr) { sh = img.naturalHeight; sw = sh * cr; sx = (img.naturalWidth - sw) / 2; sy = 0 } else { sw = img.naturalWidth; sh = sw / cr; sx = 0; sy = (img.naturalHeight - sh) / 2 }
      cx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H)
      return c
    }

    // offscreen host NetizenSyrupImage renders its layers into; it scales
    // against the host's rendered size, so the host must match the canvas
    const host = document.createElement('div')
    host.style.cssText = 'position:fixed;left:-99999px;top:0;overflow:hidden;'
    document.body.appendChild(host)

    const buildCover = src => new Promise(resolve => {
      host.style.width = W + 'px'
      host.style.height = H + 'px'
      host.innerHTML = ''
      /* eslint-disable no-new */
      new NetizenSyrupImage({
        image: src,
        ele: host,
        colors: brandPair(),
        huffhack: { ...settings.huffhack },
        dither: { ...settings.dither },
        pixelate: { ...settings.pixelate },
        ascii: { ...settings.ascii }
      })
      /* eslint-enable no-new */
      let n = 0
      const poll = setInterval(() => {
        const imgs = [...host.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth)
        if (imgs.length >= 3 || ++n > 60) {
          clearInterval(poll)
          const c = document.createElement('canvas')
          c.width = W; c.height = H
          const cx = c.getContext('2d')
          cx.fillStyle = '#000'; cx.fillRect(0, 0, W, H)
          imgs.sort((a, b) => (+a.style.zIndex || 0) - (+b.style.zIndex || 0))
            .forEach(im => {
              cx.globalAlpha = parseFloat(im.style.opacity || 1)
              cx.drawImage(im, 0, 0, W, H)
            })
          cx.globalAlpha = 1
          resolve(c)
        }
      }, 100)
    })

    /* ---------- wordmark mask -------------------------------------------- */

    const buildMask = () => {
      const font = `700 ${textPx}px "Zen Maru Gothic", ui-sans-serif, sans-serif`
      const probe = document.createElement('canvas').getContext('2d')
      probe.font = font
      const w = Math.ceil(probe.measureText('netizen.org').width) + 8
      const h = Math.ceil(textPx * 1.45)
      const c = document.createElement('canvas')
      c.width = w; c.height = h
      const cx = c.getContext('2d')
      cx.font = font; cx.textBaseline = 'middle'; cx.fillStyle = '#fff'
      cx.fillText('netizen.org', 4, h / 2)
      mask = { w, h, data: cx.getImageData(0, 0, w, h).data }
    }

    const cellsInMark = (x, y) => {
      const { w, h, data } = mask
      const fs = cell
      const out = []
      const ox = x - w / 2
      const oy = y - h / 2
      for (let r = Math.max(0, Math.floor(oy / fs)); r < Math.ceil((oy + h) / fs); r++) {
        for (let c = Math.max(0, Math.floor(ox / fs)); c < Math.ceil((ox + w) / fs); c++) {
          const mx = Math.floor(c * fs + fs / 2 - ox)
          const my = Math.floor(r * fs + fs / 2 - oy)
          if (mx < 0 || my < 0 || mx >= w || my >= h) continue
          if (data[(my * w + mx) * 4 + 3] > 128) out.push([c * fs, r * fs])
        }
      }
      return out
    }

    /* ---------- idle drift ------------------------------------------------
     * Same physics + polarity logic as the desktop file: negative punches the
     * clean photo through the letterforms, positive difference-inverts the
     * syrup under them, and the flip on every wall hit is what guarantees the
     * mark can never disappear for long (the two failure cases — hole over
     * dark photo, invert over flat mid-grey — never coincide).             */

    const D = { x: 0, y: 0, vx: 0, vy: 0, polarity: 0, t: 0, raf: null }
    const SPEED = 0.45

    const startDrift = () => {
      const a = Math.random() * Math.PI * 2
      D.x = W / 2; D.y = H / 2
      D.vx = Math.cos(a) * SPEED * 60
      D.vy = Math.sin(a) * SPEED * 60
      D.polarity = 0
      D.t = performance.now()
      step()
    }

    const step = () => {
      if (paused) { D.raf = null; return }
      const now = performance.now()
      const dt = Math.min(48, now - D.t) / 16.67 // clamp: background tabs can't teleport it
      D.t = now
      D.x += D.vx * dt * 0.06
      D.y += D.vy * dt * 0.06

      const hw = mask.w / 2
      const hh = mask.h / 2
      if (D.x - hw < 0) { D.x = hw; D.vx = Math.abs(D.vx); D.polarity ^= 1 }
      if (D.x + hw > W) { D.x = W - hw; D.vx = -Math.abs(D.vx); D.polarity ^= 1 }
      if (D.y - hh < 0) { D.y = hh; D.vy = Math.abs(D.vy); D.polarity ^= 1 }
      if (D.y + hh > H) { D.y = H - hh; D.vy = -Math.abs(D.vy); D.polarity ^= 1 }

      if (cover && clean) {
        ctx.drawImage(cover, 0, 0)
        const cells = cellsInMark(D.x, D.y)
        if (D.polarity === 0) {
          cells.forEach(([x, y]) => ctx.drawImage(clean, x, y, cell, cell, x, y, cell, cell))
        } else {
          ctx.save()
          ctx.globalCompositeOperation = 'difference'
          ctx.fillStyle = '#fff'
          cells.forEach(([x, y]) => ctx.fillRect(x, y, cell, cell))
          ctx.restore()
        }
      }
      D.raf = window.requestAnimationFrame(step)
    }

    /* ---------- advance + credit ----------------------------------------- */

    const updateCredit = src => {
      if (!creditEle || !window.splashCreditForSrc) return
      const c = window.splashCreditForSrc(src)
      if (!c) { creditEle.innerHTML = ''; creditEle.hidden = true; return }
      creditEle.hidden = false
      creditEle.innerHTML = c.href
        ? `<a href="${c.href}">${c.label}</a>`
        : `<span>${c.label}</span>`
      // c.href is a real path now (e.g. /initiatives/dream), so a plain
      // click would trigger a full page reload instead of an in-app nav --
      // route it through mobile.js's router the same way desktop does for
      // its own splash credit.
      const a = creditEle.querySelector('a')
      if (a && typeof routePath === 'function') {
        a.addEventListener('click', e => {
          e.preventDefault()
          routePath(c.href.replace(/^\/+/, ''))
        })
      }
    }

    const advance = async () => {
      if (busy) return
      busy = true
      idx = (idx + 1) % srcs.length
      const src = srcs[idx]
      try {
        // build both offscreen while the drift keeps rendering the OLD pair —
        // the swap is two reference assignments, so there's never a beat of
        // bare untreated photo (desktop still has that gap; this is better)
        const [cl, cv] = await Promise.all([buildClean(src), buildCover(src)])
        clean = cl
        cover = cv
        updateCredit(src)
      } catch (e) { /* image failed to load — keep showing the old one */ }
      resetAuto()
      busy = false
    }

    const resetAuto = () => {
      clearTimeout(autoTimer)
      autoTimer = setTimeout(() => { if (!paused) advance(); else resetAuto() }, AUTO_MS)
    }

    canvas.addEventListener('click', advance)

    /* ---------- pause when nobody's looking ------------------------------- */

    if ('IntersectionObserver' in window) {
      const io = new window.IntersectionObserver(entries => {
        const vis = entries[0] && entries[0].isIntersecting
        const wasPaused = paused
        paused = !vis
        if (wasPaused && !paused && !D.raf) { D.t = performance.now(); step() }
      })
      io.observe(canvas)
    }

    /* ---------- resize / orientation -------------------------------------- */

    let resizeTimer
    const syncSize = () => {
      W = canvas.width = container.clientWidth || container.offsetWidth
      H = canvas.height = container.clientHeight || container.offsetHeight
    }
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(async () => {
        if (!container.clientWidth) return // hidden section; IO already paused us
        syncSize()
        const s = sizeFor(W)
        textPx = s.textPx; cell = s.cell
        buildMask()
        try {
          const src = srcs[idx]
          const [cl, cv] = await Promise.all([buildClean(src), buildCover(src)])
          clean = cl; cover = cv
        } catch (e) {}
      }, 250)
    })

    /* ---------- boot ------------------------------------------------------ */

    ;(async () => {
      syncSize()
      if (!W || !H) { canvas.remove(); return }
      const s = sizeFor(W)
      textPx = s.textPx; cell = s.cell
      // rasterise the mask with the real brand font, not a fallback that
      // happened to be ready first
      try { await document.fonts.load(`700 ${textPx}px "Zen Maru Gothic"`) } catch (e) {}
      buildMask()
      try {
        const src = srcs[idx]
        const [cl, cv] = await Promise.all([buildClean(src), buildCover(src)])
        clean = cl
        cover = cv
      } catch (e) { canvas.remove(); return } // fallback rotation is still under us
      canvas.classList.add('ready')
      updateCredit(srcs[idx])
      startDrift()
      resetAuto()
    })()

    return true
  }

  window.NetizenMobileHero = { boot }
})()
