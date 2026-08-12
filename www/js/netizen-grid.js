/* global nn */
// also global: window.colors
/*

  // create a netizen.org grid

  grid = new NetizenGrid({
    selector: '.grid',
    grid: [
      { x: 0, y: 0, w: 1, h: 2 },
      { x: 1, y: 0, w: 2, h: 2 },

      { x: 3, y: 0, w: 3, h: 1 },
      { x: 3, y: 1, w: 3, h: 2 },

      { x: 0, y: 2, w: 2, h: 1 },
      { x: 2, y: 2, w: 1, h: 1 },

      { x: 0, y: 3, w: 4, h: 1 },
      { x: 4, y: 3, w: 2, h: 1 }
    ]
  })

*/

class NetizenGrid {
  constructor (opts = {}) {
    this.ele = opts.selector
    this.totalCols = opts.cols || 6
    this.totalRows = opts.rows || 4
    this.placed = []
    this.grid = opts.grid || [
      { x: 0, y: 0, w: 1, h: 2 },
      { x: 1, y: 0, w: 2, h: 2 },

      { x: 3, y: 0, w: 3, h: 1 },
      { x: 3, y: 1, w: 3, h: 2 },

      { x: 0, y: 2, w: 2, h: 1 },
      { x: 2, y: 2, w: 1, h: 1 },

      { x: 0, y: 3, w: 4, h: 1 },
      { x: 4, y: 3, w: 2, h: 1 }
    ]

    if (!window.colors) {
      window.colors = [
        ['#ff9999', '#ff99cc', '#ff99ff', '#cc99ff', '#9999ff', '#99ccff', '#99ffff', '#99ffcc', '#99ff99', '#ccff99', '#ffff99', '#ffcc99'],
        ['#993333', '#993366', '#993399', '#663399', '#333399', '#336699', '#339999', '#339966', '#339933', '#669933', '#999933', '#996633']
      ]
    }

    this.generateGrid(this.grid)
  }

  getBlock (num) {
    return nn.get(`${this.ele} div:nth-child(${num})`)
  }

  // *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
  // *.O                         creation logix                              *.O
  // *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O

  generateGrid (grid) {
    for (let i = 0; i < grid.length; i += 2) {
      const cellA = grid[i]
      const cellB = grid[i + 1]

      const [i1, i2] = this.pickPairIndices(cellA, cellB, this.placed)
      const c1 = window.colors[0][i1]
      const c2 = window.colors[1][i2]

      // remember who we placed where
      this.placed.push({ cell: cellA, palette: 0, index: i1 })
      this.placed.push({ cell: cellB, palette: 1, index: i2 })

      this.createGridBlock(cellA, c1)
      this.createGridBlock(cellB, c2)
    }
  }

  createGridBlock (cell, color) {
    const leftPct = cell.x / this.totalCols * 100
    const topPct = cell.y / this.totalRows * 100
    const widthPct = cell.w / this.totalCols * 100
    const heightPct = cell.h / this.totalRows * 100

    nn.create('div')
      .css({
        position: 'absolute',
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: `${widthPct}%`,
        height: `${heightPct}%`,
        backgroundColor: color
      })
      .addTo(this.ele)
  }

  // *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
  // *.O                             color logix                             *.O
  // *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O

  isAdjacent (a, b) {
    const horiz = (a.x + a.w === b.x || b.x + b.w === a.x) &&
      (a.y < b.y + b.h && b.y < a.y + a.h)
    const vert = (a.y + a.h === b.y || b.y + b.h === a.y) &&
      (a.x < b.x + b.w && b.x < a.x + a.w)
    return horiz || vert
  }

  randomColorIndexes () {
    const max = window.colors[0].length
    const idxs = [...Array(max).keys()]
    nn.shuffle(idxs)
    return [idxs[0], idxs[1]]
  }

  pickPairIndices (cellA, cellB, placed) {
    const L = window.colors[0].length
    const all = [...Array(L).keys()]

    // gather forbidden indices from neighbours
    const forbid0 = placed
      .filter(p => p.palette === 0 && this.isAdjacent(p.cell, cellA))
      .map(p => p.index)
    const forbid1 = placed
      .filter(p => p.palette === 1 && this.isAdjacent(p.cell, cellB))
      .map(p => p.index)

    // allowed sets
    const allow0 = all.filter(i => !forbid0.includes(i))
    const allow1 = all.filter(i => !forbid1.includes(i))

    // build all (i,j) with i≠j
    const pairs = []
    allow0.forEach(i => {
      allow1.forEach(j => {
        if (i !== j) pairs.push([i, j])
      })
    })

    if (pairs.length > 0) {
      return pairs[Math.floor(Math.random() * pairs.length)]
    }
    // fallback to totally random distinct pair
    return this.randomColorIndexes()
  }

  // *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
  // *.O             update / animations / transitions                       *.O
  // *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O

  transitionTo (newGrid) {
    if (!(newGrid instanceof Array)) {
      console.error('animateToGrid() expects an array of grid blocks')
      return
    } else if (newGrid.length !== this.grid.length) {
      console.error(`animateToGrid() new grid length (${newGrid.length}) mus match current grid length (${this.grid.length})`)
      return
    }

    nn.getAll(`${this.ele} > div`).forEach((block, i) => {
      const newBlock = newGrid[i]
      block.css({
        left: newBlock.x / this.totalCols * 100 + '%',
        top: newBlock.y / this.totalRows * 100 + '%',
        width: newBlock.w / this.totalCols * 100 + '%',
        height: newBlock.h / this.totalRows * 100 + '%'
      })
    })
    this.grid = newGrid
  }

  clearBlock (block, fade) {
    const div = typeof block === 'number' ? this.getBlock(block) : block
    const children = Array.from(div.children)
    if (fade) {
      children.forEach(child => {
        child.style.transition = typeof fade === 'number'
          ? `opacity ${fade}s` : typeof fade === 'boolean'
            ? 'opacity 0.3s' : typeof fade === 'string'
              ? fade : 'opacity 0.3s'

        child.style.opacity = '0'
        const onEnd = () => {
          child.removeEventListener('transitionend', onEnd)
          child.parentNode && child.parentNode.removeChild(child)
        }
        child.addEventListener('transitionend', onEnd)
      })
    } else children.forEach(child => div.removeChild(child))
  }

  // _confirmClear (fade) {
  //   // HACK: sometimes "clearAllBlocks" leaves elements behind
  //   // ...this clears anything left over
  //   let delay
  //   if (typeof fade === 'string') {
  //     const match = fade.match(/opacity\s+(\d*\.?\d+)(ms|s)\b/)
  //     if (!match) delay = 300
  //     else {
  //       const [, value, unit] = match
  //       if (unit === 's') delay = parseFloat(value) * 1000
  //       else if (unit === 'ms') delay = parseFloat(value)
  //     }
  //   } else if (typeof fade === 'number') {
  //     delay = fade * 1000
  //   } else if (typeof fade === 'boolean') {
  //     delay = 300
  //   } else {
  //     delay = 100
  //   }
  //   setTimeout(() => {
  //     nn.getAll(`${this.ele} > div`).forEach(block => {
  //       if (block.querySelector('*')) {
  //         block.querySelectorAll('*').forEach(e => e.remove())
  //       }
  //     })
  //   }, delay)
  // }

  clearAllBlocks (fade = false) {
    nn.getAll(`${this.ele} > div`).forEach(div => this.clearBlock(div, fade))
    // this._confirmClear(fade)
  }

  updateBlock (block, content, fade) { // TODO: still working on this
    const div = typeof block === 'number' ? this.getBlock(block) : block
    this.clearBlock(block, fade)
    div.appendChild(content)
  }

  updateColors () {
    this.placed = []
    const grid = this.grid
    const blocks = nn.getAll(`${this.ele} > div`)
    let idx = 0
    for (let i = 0; i < grid.length; i += 2) {
      const cellA = grid[i]
      const cellB = grid[i + 1]
      const [i1, i2] = this.pickPairIndices(cellA, cellB, this.placed)
      const c1 = window.colors[0][i1]
      const c2 = window.colors[1][i2]

      this.placed.push({ cell: cellA, palette: 0, index: i1 })
      this.placed.push({ cell: cellB, palette: 1, index: i2 })

      const blockA = blocks[idx]
      const blockB = blocks[idx + 1]
      blockA.css({ backgroundColor: c1 })
      blockB.css({ backgroundColor: c2 })

      idx += 2
    }
  }
}

window.NetizenGrid = NetizenGrid
