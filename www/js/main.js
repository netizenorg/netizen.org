/* global innerWidth */
const logo = document.querySelector('header > img')
const infos = document.querySelectorAll('#info p')
const foot = document.querySelector('footer')

window.addEventListener('load', (e) => {
  logo.src = ''
  document.querySelector('header').style.visibility = 'visible'
  logo.src = 'images/netizen.gif'
  setTimeout(() => {
    const y = (innerWidth < 767) ? '22vw' : '125px'
    logo.src = 'images/logo-poster.svg'

    setTimeout(() => {
      if (innerWidth < 767) logo.style.top = '-14vw'
      else logo.style.top = '-100px'
    }, 100)

    infos.forEach((p, i) => {
      setTimeout(() => {
        p.style.opacity = 1
        p.style.transform = `translateY(${y})`
      }, (i + 1) * 250)
    })

    setTimeout(() => {
      foot.style.opacity = 1
      foot.style.transform = `translateY(${y})`
    }, (infos.length + 1) * 250)
  }, 1800)
})

window.addEventListener('resize', (e) => {
  const t = (innerWidth < 767) ? '-14vw' : '-100px'
  const y = (innerWidth < 767) ? '22vw' : '125px'
  logo.style.top = t
  infos.forEach(p => { p.style.transform = `translateY(${y})` })
  foot.style.transform = `translateY(${y})`
})
