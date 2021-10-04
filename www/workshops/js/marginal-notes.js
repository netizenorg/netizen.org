const sups = document.querySelectorAll('sup')

const getCSSVar = (v) => {
  return window.getComputedStyle(document.documentElement)
    .getPropertyValue(v)
}

window.addEventListener('load', () => {
  sups.forEach((sup, i) => {
    sup.textContent = i + 1
    const aside = document.createElement('aside')
    aside.innerHTML = `<b>${i + 1}.</b> ${sup.dataset.note}`
    const px = parseInt(getCSSVar('--max-width')) * 0.75
    const ox = (window.innerWidth - parseInt(getCSSVar('--max-width'))) / 2
    const oy = sup.parentElement.offsetTop
    aside.style.left = ox + px + 'px'
    aside.style.top = oy + 'px'
    sup.parentElement.appendChild(aside)
  })
})

window.addEventListener('resize', () => {
  sups.forEach(sup => {
    const aside = sup.parentElement.querySelector('aside')
    const px = parseInt(getCSSVar('--max-width')) * 0.75
    const ox = (window.innerWidth - parseInt(getCSSVar('--max-width'))) / 2
    const oy = sup.parentElement.offsetTop
    aside.style.left = ox + px + 'px'
    aside.style.top = oy + 'px'
  })
})
