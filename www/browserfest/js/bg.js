/* global innerWidth, innerHeight */
const count = 10

function createCircle (i) {
  const circle = document.createElement('div')
  circle.setAttribute('class', 'circle')
  circle.style.animationDelay = i + 's'
  circle.style.animationTimingFunction = 'cubic-bezier(0.95, 0.05, 0.795, 0.035)'
  document.querySelector('.frame').appendChild(circle)
}

window.addEventListener('mousemove', (e) => {
  const dist = Maths.dist(e.clientX, e.clientY, innerWidth / 2, innerHeight / 2)
  const max = Maths.dist(0, 0, innerWidth / 2, innerHeight / 2)
  const b = Maths.map(dist, 0, max, 0, 15)
  document.querySelector('.frame').style.filter = `blur(${b}px)`
})

class Maths {
  static norm (value, min, max) { return (value - min) / (max - min) }

  static lerp (norm, min, max) { return (max - min) * norm + min }

  static map (value, sourceMin, sourceMax, destMin, destMax) {
    return this.lerp(this.norm(value, sourceMin, sourceMax), destMin, destMax)
  }

  static dist (p1x, p1y, p2x, p2y) {
    return Math.sqrt(Math.pow(p2x - p1x, 2) + Math.pow(p2y - p1y, 2))
  }
}

for (let i = 0; i < count; i++) createCircle(i)
