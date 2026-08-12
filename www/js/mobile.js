/* global nn, NetizenGrid, loadData, NetizenSyrupImage */
/*
*.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
..............................................................................
    Hi jon! any variables or simple javascript functions can go below this
    comment (any complex fucntions or classes should go in their own files)
..............................................................................
*.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
*/

let grid // i put this variable here so it can be accessed in any function u make (not just main)
let currentSection = 'home'
let currentInitiative = null
let isNavigating = false
let gridSeparators = []
let syrupImages = [] // Store syrup image instances
let navCloseTimer = null

// default settings for processed images - same as desktop
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

// Mobile color palette system - following brand colors
const mobileColorPalette = [
  // Primary brand colors
  'var(--prim-a)', 'var(--prim-b)', 'var(--blue)',
  // Extended palette
  '#1a1a1a', '#333333', '#666666', '#999999', '#cccccc',
  '#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7',
  '#e74c3c', '#c0392b', '#e67e22', '#f39c12', '#f1c40f',
  '#27ae60', '#2ecc71', '#16a085', '#1abc9c', '#3498db',
  '#2980b9', '#8e44ad', '#9b59b6', '#e91e63', '#f06292'
]

// Global color state for mobile
let currentColorIndex = 0
let mobileColors = []

// Initialize mobile color system
function initMobileColors() {
  // Generate a set of colors for this session
  mobileColors = []
  for (let i = 0; i < 20; i++) {
    const color1 = mobileColorPalette[Math.floor(Math.random() * mobileColorPalette.length)]
    const color2 = mobileColorPalette[Math.floor(Math.random() * mobileColorPalette.length)]
    mobileColors.push([color1, color2])
  }
}

// Get next color pair for syrup
function getNextSyrupColors() {
  const colors = mobileColors[currentColorIndex % mobileColors.length]
  currentColorIndex++
  return colors
}

// Update all syrup colors globally
function updateAllSyrupColors() {
  initMobileColors() // Generate new color set
  currentColorIndex = 0 // Reset index
  
  // Update all existing syrup images
  syrupImages.forEach(syrup => {
    const newColors = getNextSyrupColors()
    syrup.updateColors(newColors)
  })
}

// Function to add syrup effects to images - with randomization!
function addSyrupImgToMobile(opts = {}) {
  console.log('addSyrupImgToMobile called with:', opts.path)
  opts.ele.classList.add('syrup')
  
  // Create randomized syrup settings for each image
  const randomSyrupSettings = {
    huffhack: {
      process: Math.random() > 0.7, // 30% chance of huffhack
      opacity: 0.3 + Math.random() * 0.4, // 0.3-0.7
      zIndex: 3,
      seed: Math.floor(Math.random() * 20) + 1 // 1-20
    },
    dither: {
      process: true,
      opacity: 0.4 + Math.random() * 0.4, // 0.4-0.8
      zIndex: 2,
      algorithm: ['atkinson', 'floyd-steinberg', 'bayer'][Math.floor(Math.random() * 3)],
      dotSize: Math.floor(Math.random() * 3) + 1, // 1-3
      threshold: 100 + Math.random() * 100 // 100-200
    },
    pixelate: {
      process: true,
      opacity: 0.6 + Math.random() * 0.4, // 0.6-1.0
      zIndex: 1,
      size: 4 + Math.random() * 12, // 4-16
      threshold: 80 + Math.random() * 100 // 80-180
    },
    ascii: {
      process: Math.random() > 0.3, // 70% chance of ascii
      opacity: 0.2 + Math.random() * 0.4, // 0.2-0.6
      zIndex: 4,
      chars: ['O*', '.*', 'O+', '*+', 'O.+'][Math.floor(Math.random() * 5)],
      fontSize: 6 + Math.random() * 6, // 6-12
      fgColor: ['white', '#fff', '#f0f0f0', '#e0e0e0'][Math.floor(Math.random() * 4)]
    }
  }
  
  // Get coordinated colors from mobile color system
  const syrupColors = getNextSyrupColors()
  
  let syrup
  try {
    syrup = new NetizenSyrupImage({
      image: opts.path,
      ele: opts.ele,
      colors: syrupColors,
      huffhack: randomSyrupSettings.huffhack,
      dither: randomSyrupSettings.dither,
      pixelate: randomSyrupSettings.pixelate,
      ascii: randomSyrupSettings.ascii
    })
    console.log('Syrup created successfully for:', opts.path)
  } catch (error) {
    console.error('Error creating syrup for:', opts.path, error)
    // Fallback: just show the clean image
    const fallbackImg = document.createElement('img')
    fallbackImg.src = opts.path
    fallbackImg.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `
    opts.ele.appendChild(fallbackImg)
    return
  }
  
  // Add clean image
  const cleanImg = document.createElement('img')
  cleanImg.src = opts.path
  cleanImg.style.opacity = '0'
  cleanImg.style.position = 'absolute'
  cleanImg.style.top = '0'
  cleanImg.style.left = '0'
  cleanImg.style.width = '100%'
  cleanImg.style.height = '100%'
  cleanImg.style.objectFit = 'cover'
  cleanImg.setAttribute('name', 'clean')
  opts.ele.appendChild(cleanImg)
  
  // Store syrup instance (only if it exists)
  if (syrup) {
    syrupImages.push(syrup)
  }
  
  // Simple toggle functionality with syrup regeneration
  let isRevealed = false // Track if clean image is currently shown
  let lastTapTime = 0
  let tapCount = 0
  
  function regenerateSyrup() {
    if (!syrup) {
      console.log('No syrup object to regenerate')
      return
    }
    
    // Create new random settings
    const newRandomSyrupSettings = {
      huffhack: {
        process: Math.random() > 0.7,
        opacity: 0.3 + Math.random() * 0.4,
        zIndex: 3,
        seed: Math.floor(Math.random() * 20) + 1
      },
      dither: {
        process: true,
        opacity: 0.4 + Math.random() * 0.4,
        zIndex: 2,
        algorithm: ['atkinson', 'floyd-steinberg', 'bayer'][Math.floor(Math.random() * 3)],
        dotSize: Math.floor(Math.random() * 3) + 1,
        threshold: 100 + Math.random() * 100
      },
      pixelate: {
        process: true,
        opacity: 0.6 + Math.random() * 0.4,
        zIndex: 1,
        size: 4 + Math.random() * 12,
        threshold: 80 + Math.random() * 100
      },
      ascii: {
        process: Math.random() > 0.3,
        opacity: 0.2 + Math.random() * 0.4,
        zIndex: 4,
        chars: ['O*', '.*', 'O+', '*+', 'O.+'][Math.floor(Math.random() * 5)],
        fontSize: 6 + Math.random() * 6,
        fgColor: ['white', '#fff', '#f0f0f0', '#e0e0e0'][Math.floor(Math.random() * 4)]
      }
    }
    
    try {
      // Update syrup with new settings and colors
      syrup.huffhack = newRandomSyrupSettings.huffhack
      syrup.dither = newRandomSyrupSettings.dither
      syrup.pixelate = newRandomSyrupSettings.pixelate
      syrup.ascii = newRandomSyrupSettings.ascii
      
      // Get new colors for this regeneration
      const newColors = getNextSyrupColors()
      syrup.updateColors(newColors)
      syrup.update()
    } catch (error) {
      console.error('Error regenerating syrup:', error)
    }
  }
  
  function toggleImage() {
    if (isRevealed) {
      // Show syrup effect
      opts.ele.querySelectorAll('.syrup-pre').forEach(el => el.style.opacity = '1')
      opts.ele.querySelectorAll('.syrup-post').forEach(el => el.style.opacity = '0')
      opts.ele.querySelectorAll('img').forEach(img => {
        if (img.getAttribute('name') !== 'clean') img.style.opacity = '1'
      })
      cleanImg.style.opacity = '0'
      isRevealed = false
    } else {
      // Show clean image
      opts.ele.querySelectorAll('.syrup-pre').forEach(el => el.style.opacity = '0')
      opts.ele.querySelectorAll('.syrup-post').forEach(el => el.style.opacity = '1')
      opts.ele.querySelectorAll('img').forEach(img => {
        if (img.getAttribute('name') !== 'clean') img.style.opacity = '0'
      })
      cleanImg.style.opacity = '1'
      isRevealed = true
    }
    
    // Light haptic feedback for toggle
    if (navigator.vibrate) {
      navigator.vibrate(5) // Very short vibration (5ms)
    }
  }
  
  // Touch events with real-time horizontal drag syrup updates
  let touchStartX = 0
  let touchStartY = 0
  let lastUpdateX = 0
  let isHorizontalDrag = false
  let lastUpdateTime = 0
  let updateThrottle = 100 // Update every 100ms max
  
  opts.ele.addEventListener('touchstart', (e) => {
    const touch = e.touches[0]
    touchStartX = touch.clientX
    touchStartY = touch.clientY
    lastUpdateX = touch.clientX
    isHorizontalDrag = false
    lastUpdateTime = 0
  })
  
  opts.ele.addEventListener('touchmove', (e) => {
    const touch = e.touches[0]
    const currentX = touch.clientX
    const currentY = touch.clientY
    const deltaX = Math.abs(currentX - touchStartX)
    const deltaY = Math.abs(currentY - touchStartY)
    const currentTime = Date.now()
    
    // Detect if this is a horizontal drag (more horizontal than vertical movement)
    if (deltaX > 20 && deltaX > deltaY * 1.5) {
      isHorizontalDrag = true
      
      // Throttle updates to prevent too many regenerations
      if (currentTime - lastUpdateTime > updateThrottle) {
        const dragDistance = Math.abs(currentX - lastUpdateX)
        
        // Update syrup every 30px of horizontal movement
        if (dragDistance > 30) {
          regenerateSyrup()
          
          // Trigger haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(10) // Short vibration (10ms)
          }
          
          lastUpdateX = currentX
          lastUpdateTime = currentTime
        }
      }
    }
  })
  
  opts.ele.addEventListener('touchend', (e) => {
    // If it was a horizontal drag, don't process taps
    if (isHorizontalDrag) {
      return
    }
    
    // Regular tap detection
    const currentTime = Date.now()
    const timeDiff = currentTime - lastTapTime
    
    if (timeDiff < 300) {
      tapCount++
      if (tapCount === 2) {
        // Double tap - open lightbox
        if (navigator.vibrate) {
          navigator.vibrate([10, 50, 10]) // Double tap pattern
        }
        if (opts.callback) opts.callback()
        tapCount = 0
      }
    } else {
      // Single tap - toggle image
      toggleImage()
      tapCount = 1
    }
    
    lastTapTime = currentTime
  })
  
  // Click events for desktop
  opts.ele.addEventListener('click', (e) => {
    const currentTime = Date.now()
    const timeDiff = currentTime - lastTapTime
    
    if (timeDiff < 300) {
      tapCount++
      if (tapCount === 2) {
        // Double click - open lightbox
        if (opts.callback) opts.callback()
        tapCount = 0
      }
    } else {
      // Single click - toggle image
      toggleImage()
      tapCount = 1
    }
    
    lastTapTime = currentTime
  })
  
  if (opts.callback) {
    opts.ele.style.cursor = 'pointer'
  }
}

// Initialize mobile color system
initMobileColors()

//
// -----------------------------------------------------------------------------
//                                                            THE MAIN FUCNCTION
// this runs as soon as the page loads
async function main () {
  console.log('Mobile site loading...')
  
  /*
  *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
  ..............................................................................
      Hi jon! any JS u need to run on page load should go BELOW this comment!
  ..............................................................................
  *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
  */

  try {
    console.log('Loading data...')
  // This part loads all our data from the data folder
  // && structures it all in a userful way into "window.data" (see docs)
  window.data = await loadData()
    console.log('Data loaded:', window.data)
    
    // Check if initiatives data is loaded
    if (window.data && window.data._initiativesOrder) {
      console.log('Checking initiatives data...')
      console.log('Initiatives order:', window.data._initiativesOrder)
      console.log('Initiatives data:', window.data.initiatives)
      
      // If initiatives data is empty, try to load it manually
      if (Object.keys(window.data.initiatives).length === 0) {
        console.log('Initiatives data is empty, loading manually...')
        for (const fileName of window.data._initiativesOrder) {
          try {
            const response = await fetch(`data/initiatives/${fileName}`)
            if (response.ok) {
              const initiativeData = await response.json()
              const name = fileName.replace('.json', '') // Remove .json extension
              window.data.initiatives[name] = initiativeData
              window.data.initiatives[name].name = name
              console.log(`Loaded ${name}:`, initiativeData)
            } else {
              console.error(`Failed to load ${fileName}:`, response.status)
            }
          } catch (error) {
            console.error(`Error loading ${fileName}:`, error)
          }
        }
      }
    }

  // little mobile hack...
  window.scrollTo({ top: 0, behavior: 'smooth' })

    console.log('Setting up navigation...')
    setupNavigation()
    
    console.log('Creating grid separators...')
    createGridSeparators()
    
    console.log('Setting up hero image...')
    setupHeroImage()

    buildHomeInitiatives()
    buildHomeExtras()

    console.log('Loading content...')
    loadContent()
    
    // Handle initial URL
    handleInitialPath()

    // Listen for browser back/forward
    window.addEventListener('popstate', handlePopState)
    
    // Sub-navigation removed - Initiatives now navigates directly to page
    
    console.log('Mobile site initialized successfully')

  } catch (error) {
    console.error('Error initializing mobile site:', error)
    // Show error message to user
    const main = document.querySelector('main')
    if (main) {
      main.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--prim-a);">Error loading content. Please refresh the page.</div>'
    }
  }

  /*
  *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
  ..............................................................................
      Hi jon! any JS u need to run on page load should go ABOVE this comment!
  ..............................................................................
  *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
  */

  // little hack if u want to add a little wait time to the loader
  // await nn.sleep(1000) // load buffer (change as needed)

  // this part waits for all the data to be fully loaded
  // && once it is it removes the loader
  if (window.data && window.data._initiativesOrder) {
  const total = window.data._initiativesOrder.length
  const waitingForDataToLoad = setInterval(async () => {
    const loaded = Object.keys(window.data.initiatives).length
    if (loaded === total) { // if data is all loaded...
      clearInterval(waitingForDataToLoad)
        const loader = document.getElementById('loader')
        if (loader) {
          loader.style.opacity = '0'
          setTimeout(() => {
            loader.style.display = 'none'
          }, 800)
        }
    }
    // ... otherwise, keep looping
  }, 200)
  } else {
    // If no data, just hide the loader
    setTimeout(() => {
      const loader = document.getElementById('loader')
      if (loader) {
        loader.style.opacity = '0'
        setTimeout(() => {
          loader.style.display = 'none'
        }, 800)
      }
    }, 1000)
  }
}

// Create grid separators with random patterns and colors
function createGridSeparators() {
  const separators = document.querySelectorAll('.grid-separator')
  console.log('Found separators:', separators.length)
  
  // Available grid patterns
  const gridPatterns = ['default', 'default2', 'variant', 'variant2']
  
  separators.forEach((separator, index) => {
    const gridContainer = document.createElement('div')
    gridContainer.className = 'grid'
    gridContainer.id = `grid-separator-${index}`
    separator.appendChild(gridContainer)

    try {
      // Randomly select a grid pattern
      const randomPattern = gridPatterns[Math.floor(Math.random() * gridPatterns.length)]
      console.log(`Creating grid separator ${index + 1} with pattern: ${randomPattern}`)

      // NetizenGrid expects a CSS selector string (it interpolates this.ele
      // into template-literal selectors elsewhere, e.g. updateColors) --
      // passing the element itself stringifies to "[object HTMLDivElement]"
      const grid = new NetizenGrid({
        selector: `#grid-separator-${index}`,
        grid: window.grids[randomPattern]
      })
      
      // Add to our array for potential future updates
      gridSeparators.push(grid)
      
      // Randomly update colors after a short delay to ensure grid is rendered
      setTimeout(() => {
        grid.updateColors()
        console.log(`Updated colors for grid separator ${index + 1}`)
      }, 100)
      
    } catch (error) {
      console.error('Error creating grid separator:', error)
    }
  })
}


// Create simple syrup effect using CSS filters
function createSimpleSyrupEffect(imagePath, alt = '') {
  console.log('Creating simple syrup effect for:', imagePath)
  
  const wrapper = document.createElement('div')
  wrapper.className = 'simple-syrup-wrapper'
  wrapper.style.position = 'relative'
  wrapper.style.cursor = 'pointer'
  wrapper.style.border = '2px solid rgba(255,255,255,0.5)'
  wrapper.style.borderRadius = '8px'
  wrapper.style.overflow = 'hidden'
  wrapper.style.background = '#000'
  wrapper.style.width = '100%'
  wrapper.style.height = 'auto' // Let it size naturally
  
  // Create the main image container
  const imageContainer = document.createElement('div')
  imageContainer.style.position = 'relative'
  imageContainer.style.width = '100%'
  imageContainer.style.height = 'auto'
  
  // Create multiple layers for the syrup effect
  const layers = []
  const layerCount = 4
  
  for (let i = 0; i < layerCount; i++) {
    const layer = document.createElement('div')
    layer.style.position = 'absolute'
    layer.style.top = '0'
    layer.style.left = '0'
    layer.style.width = '100%'
    layer.style.height = '100%'
    layer.style.backgroundImage = `url(${imagePath})`
    layer.style.backgroundSize = 'contain'
    layer.style.backgroundPosition = 'center'
    layer.style.backgroundRepeat = 'no-repeat'
    layer.style.zIndex = layerCount - i
    
    // Apply different filters to each layer based on desktop settings
    switch (i) {
      case 0: // Base layer - pixelate effect
        layer.style.filter = 'contrast(200%) brightness(150%) saturate(0%)'
        layer.style.opacity = syrupSettings.pixelate.opacity
        layer.style.transform = 'scale(0.5)'
        layer.style.transformOrigin = 'center'
        break
      case 1: // Dither effect
        layer.style.filter = 'grayscale(100%) contrast(300%) brightness(200%)'
        layer.style.opacity = syrupSettings.dither.opacity
        layer.style.transform = 'translateX(-1px)'
        break
      case 2: // ASCII effect (simulated)
        layer.style.filter = 'contrast(400%) brightness(300%) saturate(0%)'
        layer.style.opacity = syrupSettings.ascii.opacity
        layer.style.transform = 'translateX(1px)'
        break
      case 3: // Huffhack effect (simulated)
        layer.style.filter = 'hue-rotate(90deg) contrast(150%)'
        layer.style.opacity = syrupSettings.huffhack.opacity
        layer.style.transform = 'translateY(1px)'
        break
    }
    
    imageContainer.appendChild(layer)
    layers.push(layer)
  }
  
  // Add a placeholder image to set the container size
  const placeholder = document.createElement('img')
  placeholder.src = imagePath
  placeholder.alt = alt
  placeholder.style.width = '100%'
  placeholder.style.height = 'auto'
  placeholder.style.display = 'block'
  placeholder.style.opacity = '0' // Make it invisible but keep it for sizing
  imageContainer.appendChild(placeholder)
  
  wrapper.appendChild(imageContainer)
  
  // Add tap-to-reveal functionality
  let isRevealed = false
  wrapper.addEventListener('click', () => {
    console.log('Simple syrup image clicked, revealing original...')
    if (!isRevealed) {
      // Reveal original image
      wrapper.innerHTML = `<img src="${imagePath}" alt="${alt}" style="width: 100%; height: auto; display: block;">`
      isRevealed = true
      wrapper.style.cursor = 'default'
      wrapper.style.border = 'none'
    }
  })
  
  // Add hover effect
  wrapper.addEventListener('mouseenter', () => {
    if (!isRevealed) {
      wrapper.style.border = '2px solid rgba(255,255,255,0.8)'
    }
  })
  
  wrapper.addEventListener('mouseleave', () => {
    if (!isRevealed) {
      wrapper.style.border = '2px solid rgba(255,255,255,0.5)'
    }
  })
  
  return wrapper
}

// Create syrup image with tap-to-reveal
function createSyrupImage(imagePath, container, alt = '') {
  console.log('Creating syrup image for:', imagePath)
  console.log('nn library available:', typeof nn !== 'undefined')
  console.log('NetizenSyrupImage available:', typeof NetizenSyrupImage !== 'undefined')
  
  if (typeof nn !== 'undefined') {
    console.log('nn.random function available:', typeof nn.random === 'function')
    console.log('nn.randomColor function available:', typeof nn.randomColor === 'function')
  }
  
  try {
    // Check if NetizenSyrupImage and nn are available
    if (typeof NetizenSyrupImage === 'undefined') {
      console.error('NetizenSyrupImage is not available')
      throw new Error('NetizenSyrupImage not loaded')
    }
    
    if (typeof nn === 'undefined') {
      console.error('nn library is not available')
      throw new Error('nn library not loaded')
    }
    
    if (typeof nn.random !== 'function') {
      console.error('nn.random function is not available')
      throw new Error('nn.random not available')
    }
    
    console.log('NetizenSyrupImage and nn are available, creating instance...')
    
    // Create a wrapper div for the syrup image
    const wrapper = document.createElement('div')
    wrapper.className = 'syrup-image-wrapper'
    wrapper.style.position = 'relative'
    wrapper.style.cursor = 'pointer'
    wrapper.style.width = '100%'
    wrapper.style.height = 'auto'
    wrapper.style.overflow = 'hidden'
    wrapper.style.background = '#000'
    
    // Create the syrup image using nn library with desktop settings
    const syrup = new NetizenSyrupImage({
      image: imagePath,
      ele: wrapper,
      colors: ['#ffffff', '#000000'], // White and black for contrast
      huffhack: {
        process: false, // Disabled as per desktop settings
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
    })
    
    console.log('Syrup image created successfully')
    
    // Add tap-to-reveal functionality
    let isRevealed = false
    wrapper.addEventListener('click', () => {
      console.log('Syrup image clicked, revealing original...')
      if (!isRevealed) {
        // Reveal original image
        wrapper.innerHTML = `<img src="${imagePath}" alt="${alt}" style="width: 100%; height: auto; display: block;">`
        isRevealed = true
        wrapper.style.cursor = 'default'
      }
    })
    
    // Store the syrup instance
    syrupImages.push(syrup)
    
    return wrapper
  } catch (error) {
    console.error('Error creating syrup image:', error)
    console.log('Falling back to regular image...')
    
    // Fallback to regular image without any border or overlay
    const wrapper = document.createElement('div')
    wrapper.className = 'regular-image-wrapper'
    wrapper.style.position = 'relative'
    wrapper.style.cursor = 'pointer'
    wrapper.style.overflow = 'hidden'
    
    const img = document.createElement('img')
    img.src = imagePath
    img.alt = alt
    img.style.width = '100%'
    img.style.height = 'auto'
    img.style.display = 'block'
    
    wrapper.appendChild(img)
    
    // Add tap to reveal functionality
    let isRevealed = false
    wrapper.addEventListener('click', () => {
      if (!isRevealed) {
        console.log('Regular image clicked, revealing original...')
        // Already showing original, just remove cursor
        isRevealed = true
        wrapper.style.cursor = 'default'
      }
    })
    
    return wrapper
  }
}

// Load individual initiative data
async function loadInitiativesData() {
  console.log('Loading individual initiatives...')
  const initiativesOrder = window.data._initiativesOrder || []
  console.log('Initiatives order:', initiativesOrder)
  
  for (const file of initiativesOrder) {
    try {
      const response = await fetch(`data/initiatives/${file}`)
      if (!response.ok) {
        console.error(`Failed to load ${file}: ${response.status}`)
        continue
      }
      const json = await response.json()
      const name = file.split('.')[0]
      window.data.initiatives[name] = json
      window.data.initiatives[name].name = name
      console.log(`Loaded initiative: ${name}`)
    } catch (error) {
      console.error(`Error loading ${file}:`, error)
    }
  }
  
  console.log('All initiatives loaded:', Object.keys(window.data.initiatives))
  return window.data.initiatives
}

// Navigation setup
function setupNavigation() {
  console.log('Setting up navigation...')
  
  // Hamburger menu
  const hamburger = document.getElementById('hamburger-menu')
  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      console.log('Hamburger clicked')
      toggleMobileNav()
    })
  }
  
  // Nav items
  const navItems = document.querySelectorAll('.nav-item')
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (isNavigating) return // Prevent rapid clicking
      const section = e.target.getAttribute('name')
      console.log('Nav item clicked:', section)
      
      // Initiatives now navigates directly to the page (no submenu)
      
      // Navigate to the section
      navigateTo(section)
      closeMobileNav()
    })
  })

  // Logo click handler - navigate to homepage
  const logo = document.getElementById('netizen-logo')
  if (logo) {
    logo.addEventListener('click', () => {
      if (isNavigating) return // Prevent rapid clicking
      console.log('Logo clicked - navigating to home')
      navigateTo('home')
      closeMobileNav()
    })
  }
  
  // Submenu toggle is now handled by the nav item click handler above
  
  // Back button
  const backButton = document.querySelector('.back-button')
  if (backButton) {
    backButton.addEventListener('click', () => {
      if (isNavigating) return
      navigateTo('initiatives')
    })
  }
  
  // Close nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#hamburger-menu') && !e.target.closest('#mobile-nav')) {
      closeMobileNav()
    }
  })
}

// Submenu functionality removed - Initiatives now navigates directly to page

// Sub-navigation functionality removed - Initiatives now navigates directly to page

// Route a path that may carry an initiative slug. "initiatives/netnet" used
// to be passed straight to navigateTo(), which did
// getElementById('initiatives/netnet'), found nothing, hid every section, and
// left a blank page -- shared deep links died silently on mobile. Split the
// slug off, land on the initiatives list, then open the detail once its data
// exists (initiative JSONs load async; on a cold load the slug's record may
// not be there yet, hence the bounded poll).
function routePath(path) {
  if (path.startsWith('initiatives/')) {
    const slug = path.split('/')[1]
    navigateTo('initiatives')
    let tries = 0
    const wait = setInterval(() => {
      // !isNavigating matters: navigateTo holds that flag for 300ms and
      // showInitiativeDetail silently returns while it's set -- clearing the
      // poll on data alone would call into a no-op and the detail would
      // never open
      if (!isNavigating && window.data && window.data.initiatives && window.data.initiatives[slug]) {
        clearInterval(wait)
        showInitiativeDetail(slug)
      } else if (++tries > 25) {
        clearInterval(wait) // unknown slug: stay on the initiatives list
      }
    }, 120)
  } else {
    navigateTo(path)
  }
}

// Handle the initial URL on page load. `?redirect=` carries a path here
// when desktop.js bounced a mobile visitor off a deep link (e.g.
// /initiatives/dream) -- see the isMobile check in desktop.js's main().
// Once read, the address bar is normalized back to the clean path so it
// doesn't keep mobile.html or the redirect param dangling in the URL.
function handleInitialPath() {
  const params = new URLSearchParams(window.location.search)
  const redirect = params.get('redirect')
  let path = redirect || window.location.pathname
  if (path === '/mobile.html') path = '/'

  if (window.location.pathname !== path || window.location.search) {
    window.history.replaceState(null, '', path)
  }

  const clean = path.replace(/^\/+/, '')
  console.log('Initial path:', clean)

  if (clean && clean !== 'home') {
    routePath(clean)
  }
}

// Handle browser back/forward navigation
function handlePopState() {
  const path = window.location.pathname.replace(/^\/+/, '')
  console.log('Path changed to:', path)

  if (path && path !== currentSection) {
    routePath(path)
  } else if (!path && currentSection !== 'home') {
    navigateTo('home')
  }
}

// Toggle mobile navigation
function toggleMobileNav() {
  const hamburger = document.getElementById('hamburger-menu')
  const nav = document.getElementById('mobile-nav')
  
  if (nav.classList.contains('active')) {
    closeMobileNav()
  } else {
    openMobileNav()
  }
}

// Open mobile navigation
function openMobileNav() {
  console.log('Opening mobile nav')
  const hamburger = document.getElementById('hamburger-menu')
  const nav = document.getElementById('mobile-nav')

  clearTimeout(navCloseTimer)
  document.body.classList.add('nav-open')
  if (hamburger) hamburger.classList.add('active')
  if (nav) nav.classList.add('active')
}

// Close mobile navigation
function closeMobileNav() {
  console.log('Closing mobile nav')
  const hamburger = document.getElementById('hamburger-menu')
  const nav = document.getElementById('mobile-nav')

  if (hamburger) hamburger.classList.remove('active')
  if (nav) nav.classList.remove('active')

  // keep the header opaque until the panel has finished sliding up,
  // otherwise the hero shows through behind a still-visible dropdown
  clearTimeout(navCloseTimer)
  navCloseTimer = setTimeout(() => {
    document.body.classList.remove('nav-open')
  }, 300)
}

// Navigation function
function navigateTo(section) {
  if (isNavigating) return
  
  console.log('Navigating to:', section)
  isNavigating = true
  
  // Hide all sections
  const sections = document.querySelectorAll('.content-section')
  sections.forEach(section => {
    section.style.display = 'none'
    section.classList.remove('active')
  })

  // Show target section
  const targetSection = document.getElementById(section)
  if (targetSection) {
    targetSection.style.display = 'block'
    targetSection.classList.add('active')
  }
  
  // Update navigation active state
  const navItems = document.querySelectorAll('.nav-item')
  navItems.forEach(item => item.classList.remove('active'))
  
  const activeNavItem = document.querySelector(`[name="${section}"]`)
  if (activeNavItem) {
    activeNavItem.classList.add('active')
  }
  
  // Update the URL to match desktop's path-based routing (only if it
  // actually needs to move -- guards against double-pushing when this runs
  // in response to a popstate event, where the address bar already moved)
  if (section !== 'initiative-detail') {
    const path = section === 'home' ? '/' : '/' + section
    if (window.location.pathname !== path) {
      window.history.pushState({ section }, '', path)
    }
  }

  currentSection = section
  currentInitiative = null
  
  // Load content for the section
  loadContent()
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
  
  // Reset navigation lock after animation
  setTimeout(() => {
    isNavigating = false
  }, 300)
}

// Load content based on current section
function loadContent() {
  try {
    console.log('Loading content for section:', currentSection)
    switch(currentSection) {
      case 'home':
        loadHomeContent()
        break
      case 'about':
        loadAboutContent()
        break
      case 'initiatives':
        loadInitiativesContent()
        break
      case 'support':
        loadSupportContent()
        break
      case 'initiative-detail':
        loadInitiativeDetail()
        break
    }
  } catch (error) {
    console.error('Error loading content:', error)
  }
}

// Load home section content
function loadHomeContent() {
  console.log('Loading home content...')
  if (!window.data || !window.data.copy) {
    console.log('No data available for home content, retrying in 100ms...')
    setTimeout(() => loadHomeContent(), 100)
    return
  }
  
  console.log('About data for home:', window.data.copy.about)
  
  const aboutMain = document.getElementById('about-main')
  const aboutSub = document.getElementById('about-sub')
  
  console.log('About main element:', aboutMain)
  console.log('About sub element:', aboutSub)

  if (aboutMain && window.data.copy.about.main) {
    aboutMain.innerHTML = window.data.copy.about.main
    console.log('Set about main content for home')
  }
  
  if (aboutSub && window.data.copy.about.sub) {
    aboutSub.innerHTML = window.data.copy.about.sub
    console.log('Set about sub content for home')
  }
}

// Load about section content
function loadAboutContent() {
  console.log('Loading about content...')
  if (!window.data || !window.data.copy) {
    console.log('No data available for about content, retrying in 100ms...')
    setTimeout(() => loadAboutContent(), 100)
    return
  }
  
  console.log('About data:', window.data.copy.about)
  
  const aboutContent = document.getElementById('about-content')
  const aboutSub = document.getElementById('about-sub')
  
  console.log('About content element:', aboutContent)
  console.log('About sub element:', aboutSub)
  
  if (aboutContent) {
    aboutContent.innerHTML = window.data.copy.about.main
    console.log('Set about content')
  }
  if (aboutSub) {
    aboutSub.innerHTML = window.data.copy.about.sub
    console.log('Set about sub content')
  }
  
  // Simple crew image - no effects, just clean display
  setTimeout(() => {
    const crewImage = document.querySelector('.crew-image')
    if (crewImage) {
      console.log('Crew image found, keeping it simple')
      
      // Just ensure the image is properly styled
      crewImage.style.width = '100%'
      crewImage.style.height = 'auto'
      crewImage.style.display = 'block'
      crewImage.style.margin = '20px 0'
      
      console.log('Crew image styled cleanly')
    } else {
      console.log('Crew image not found')
    }
  }, 1000)
  
  // Helper function for simple syrup effect
  function applySimpleSyrupEffect(crewImage) {
    console.log('Applying simple syrup effect...')
    
    try {
      // Create a wrapper for the syrup effect
      const wrapper = document.createElement('div')
      wrapper.className = 'simple-syrup-wrapper'
      wrapper.style.position = 'relative'
      wrapper.style.cursor = 'pointer'
      wrapper.style.width = '100%'
      wrapper.style.height = 'auto'
      wrapper.style.overflow = 'hidden'
      wrapper.style.background = '#000'
      
      // Create multiple layers for the syrup effect
      const layers = []
      const layerCount = 4
      
      for (let i = 0; i < layerCount; i++) {
        const layer = document.createElement('div')
        layer.style.position = 'absolute'
        layer.style.top = '0'
        layer.style.left = '0'
        layer.style.width = '100%'
        layer.style.height = '100%'
        layer.style.backgroundImage = `url(images/the-crew.jpg)`
        layer.style.backgroundSize = 'contain'
        layer.style.backgroundPosition = 'center'
        layer.style.backgroundRepeat = 'no-repeat'
        layer.style.zIndex = layerCount - i
        
        // Apply different filters to each layer based on desktop settings
        switch (i) {
          case 0: // Base layer - pixelate effect
            layer.style.filter = 'contrast(200%) brightness(150%) saturate(0%)'
            layer.style.opacity = '0.4'
            layer.style.transform = 'scale(0.5)'
            layer.style.transformOrigin = 'center'
            break
          case 1: // Dither effect
            layer.style.filter = 'grayscale(100%) contrast(300%) brightness(200%)'
            layer.style.opacity = '0.3'
            layer.style.transform = 'translateX(-1px)'
            break
          case 2: // ASCII effect (simulated)
            layer.style.filter = 'contrast(400%) brightness(300%) saturate(0%)'
            layer.style.opacity = '0.2'
            layer.style.transform = 'translateX(1px)'
            break
          case 3: // Huffhack effect (simulated)
            layer.style.filter = 'hue-rotate(90deg) contrast(150%)'
            layer.style.opacity = '0.1'
            layer.style.transform = 'translateY(1px)'
            break
        }
        
        wrapper.appendChild(layer)
        layers.push(layer)
      }
      
      // Add a placeholder image to set the container size
      const placeholder = document.createElement('img')
      placeholder.src = 'images/the-crew.jpg'
      placeholder.alt = 'The netizen.org crew'
      placeholder.style.width = '100%'
      placeholder.style.height = 'auto'
      placeholder.style.display = 'block'
      placeholder.style.opacity = '0' // Make it invisible but keep it for sizing
      wrapper.appendChild(placeholder)
      
      // Insert wrapper before the crew image
      crewImage.parentNode.insertBefore(wrapper, crewImage)
      
      // Hide the original image
      crewImage.style.display = 'none'
      
      // Add tap-to-reveal functionality
      let isRevealed = false
      wrapper.addEventListener('click', () => {
        console.log('Simple syrup image clicked, revealing original...')
        if (!isRevealed) {
          // Reveal original image
          wrapper.innerHTML = `<img src="images/the-crew.jpg" alt="The netizen.org crew" style="width: 100%; height: auto; display: block;">`
          isRevealed = true
          wrapper.style.cursor = 'default'
        }
      })
      
      console.log('Simple syrup effect applied successfully')
    } catch (error) {
      console.error('Error applying simple syrup effect:', error)
      // Keep the original image visible if there's an error
      crewImage.style.display = 'block'
    }
  }
}

// Load initiatives section content
function loadInitiativesContent() {
  console.log('Loading initiatives content...')
  if (!window.data || !window.data.copy) {
    console.log('No data available for initiatives content, retrying in 100ms...')
    setTimeout(() => loadInitiativesContent(), 100)
    return
  }
  
  const initiativesMain = document.getElementById('initiatives-main')
  const initiativesSub = document.getElementById('initiatives-sub')
  
  if (initiativesMain) {
    initiativesMain.innerHTML = window.data.copy.initiatives.main
    console.log('Set initiatives main content')
  }
  if (initiativesSub) {
    initiativesSub.innerHTML = window.data.copy.initiatives.sub
    console.log('Set initiatives sub content')
  }
  
  // Populate sub-navigation header with initiative links
  const subheader = document.getElementById('initiatives-subheader')
  if (subheader && window.data._initiativesOrder) {
    subheader.innerHTML = ''
    
    window.data._initiativesOrder.forEach(fileName => {
      const name = fileName.replace('.json', '')
      const initiative = window.data.initiatives[name]
      
      if (initiative) {
        const link = document.createElement('span')
        link.className = 'initiative-subnav-link'
        link.textContent = initiative.title || name
        link.addEventListener('click', () => {
          showInitiativeDetail(name)
        })
        subheader.appendChild(link)
      }
    })
    console.log('Populated initiatives subheader')
  }
  
  // Build initiatives grid
  const initiativesContainer = document.getElementById('initiatives-list')
  if (!initiativesContainer) return
  
  initiativesContainer.innerHTML = ''
  
  if (!window.data._initiativesOrder) return
  
  window.data._initiativesOrder.forEach(fileName => {
    const initiativeName = fileName.replace('.json', '')
    const initiative = window.data.initiatives[initiativeName]
    if (!initiative) return
    
    const card = document.createElement('div')
    card.className = 'initiative-card'
    card.innerHTML = `
      <h3>${initiative.title || 'Untitled'}</h3>
      <p>${initiative['sub-title'] || ''}</p>
    `
    
    card.addEventListener('click', () => {
      showInitiativeDetail(initiativeName)
    })
    
    initiativesContainer.appendChild(card)
  })
}

// Load support section content
function loadSupportContent() {
  console.log('Loading support content...')
  if (!window.data || !window.data.copy) {
    console.log('No data available for support content, retrying in 100ms...')
    setTimeout(() => loadSupportContent(), 100)
    return
  }
  
  const supportMain = document.getElementById('support-main')
  const supportSub = document.getElementById('support-sub')
  
  if (supportMain) supportMain.innerHTML = window.data.copy.support.main
  
  if (supportSub) supportSub.innerHTML = window.data.copy.support.sub
}

// Show initiative detail
function showInitiativeDetail(initiativeName) {
  if (isNavigating) return
  
  currentInitiative = initiativeName
  currentSection = 'initiative-detail'

  const path = '/initiatives/' + initiativeName
  if (window.location.pathname !== path) {
    window.history.pushState({ section: 'initiative-detail', initiative: initiativeName }, '', path)
  }

  // Hide all sections
  const sections = document.querySelectorAll('.content-section')
  sections.forEach(section => {
    section.style.display = 'none'
    section.classList.remove('active')
  })

  // Show initiative detail section
  const detailSection = document.getElementById('initiative-detail')
  if (detailSection) {
    detailSection.style.display = 'block'
    detailSection.classList.add('active')
  }
  
  // Load the detail content
  loadInitiativeDetail()
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Load initiative detail content
function loadInitiativeDetail() {
  if (!currentInitiative || !window.data || !window.data.initiatives) return
  
  const initiative = window.data.initiatives[currentInitiative]
  if (!initiative) return
  
  // Set header content
  const title = document.getElementById('initiative-title')
  const subtitle = document.getElementById('initiative-subtitle')
  const date = document.getElementById('initiative-date')
  
  if (title) title.textContent = initiative.title || 'Untitled'
  if (subtitle) subtitle.textContent = initiative['sub-title'] || ''
  if (date) date.innerHTML = initiative.date || ''
  
  // Set content
  const textContainer = document.getElementById('initiative-text')
  if (textContainer) {
    textContainer.innerHTML = ''
    
    if (initiative.content && Array.isArray(initiative.content)) {
      initiative.content.forEach(paragraph => {
        const p = document.createElement('p')
        // Replace blue links with white links for black background
        const processedParagraph = paragraph.replace(
          /<span style="color:blue">([^<]+)<\/span>/g, 
          '<span style="color:white; text-decoration:underline;">$1</span>'
        )
        p.innerHTML = processedParagraph
        textContainer.appendChild(p)
      })
    }
  }
  
  // Set links
  const linksContainer = document.getElementById('initiative-links')
  const linksSection = document.getElementById('initiative-links-section')
  if (linksContainer) {
    linksContainer.innerHTML = ''
    
    if (initiative.urls && typeof initiative.urls === 'object') {
      Object.entries(initiative.urls).forEach(([key, url]) => {
        const link = document.createElement('a')
        link.href = url
        link.target = '_blank'
        link.textContent = key.toUpperCase() // Match desktop uppercase
        linksContainer.appendChild(link)
      })
      if (linksSection) linksSection.style.display = 'flex'
    } else {
      if (linksSection) linksSection.style.display = 'none'
    }
  }
  
  // Set partners
  const partnersContainer = document.getElementById('initiative-partners')
  const partnersSection = document.getElementById('initiative-partners-section')
  if (partnersContainer) {
    if (initiative.partners && Array.isArray(initiative.partners) && initiative.partners.length > 0) {
      partnersContainer.innerHTML = initiative.partners.join('<br>')
      if (partnersSection) partnersSection.style.display = 'flex'
    } else {
      partnersContainer.innerHTML = ''
      if (partnersSection) partnersSection.style.display = 'none'
    }
  }
  
  // Set gallery with syrup effects - following desktop pattern
  const galleryContainer = document.getElementById('initiative-gallery')
  if (galleryContainer) {
    galleryContainer.innerHTML = ''
    
    if (initiative.grid && Array.isArray(initiative.grid)) {
      console.log('Processing', initiative.grid.length, 'gallery items for', currentInitiative)
      initiative.grid.forEach((item, index) => {
        if (!item.image) {
          console.log('Skipping item', index, '- no image')
          return
        }
        console.log('Processing gallery item', index, ':', item.image)
        
        const galleryItem = document.createElement('div')
        galleryItem.className = 'gallery-item'
        galleryItem.style.position = 'relative'
        galleryItem.style.width = '100%'
        galleryItem.style.height = '200px'
        galleryItem.style.margin = '0'
        galleryItem.style.padding = '0'
        galleryItem.style.backgroundColor = '#000'
        
        // Add syrup effect
        addSyrupImgToMobile({
          path: item.image,
          ele: galleryItem,
          callback: () => openMobileLightbox(initiative.grid, index)
        })
        
        // Add caption with proper content
        const caption = document.createElement('div')
        caption.className = 'caption'
        caption.style.position = 'absolute'
        caption.style.bottom = '0'
        caption.style.left = '0'
        caption.style.right = '0'
        caption.style.background = 'rgba(0,0,0,0.7)'
        caption.style.color = 'white'
        caption.style.padding = '0.5rem'
        caption.style.fontSize = '0.8rem'
        
        let captionText = ''
        if (item.alt) captionText += item.alt
        if (item.credit) captionText += (captionText ? ' - ' : '') + item.credit
        if (item.title) captionText += (captionText ? ' - ' : '') + item.title
        
        caption.textContent = captionText || 'Image'
        
        galleryItem.appendChild(caption)
        galleryContainer.appendChild(galleryItem)
        console.log('Gallery item appended:', index, 'Total items in container:', galleryContainer.children.length)
      })
    } else {
      console.log('No grid items found for', currentInitiative)
    }
  } else {
    console.log('Gallery container not found')
  }
}

// Mobile lightbox function - following desktop pattern
function openMobileLightbox(gridItems, currentIndex) {
  // Create lightbox container
  const lightbox = document.createElement('div')
  lightbox.className = 'mobile-lightbox'
  lightbox.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--prim-b);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    opacity: 0;
    transition: opacity 0.3s ease;
  `
  
  // Create header with close button
  const header = document.createElement('div')
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--prim-b);
    color: var(--prim-a);
  `
  
  const title = document.createElement('h3')
  title.textContent = window.data.initiatives[currentInitiative]?.title || 'Gallery'
  title.style.margin = '0'
  
  const closeBtn = document.createElement('button')
  closeBtn.innerHTML = 'CLOSE <img src="images/close.svg" alt="close">'
  closeBtn.style.cssText = `
    background: none;
    border: none;
    color: var(--prim-a);
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  `
  closeBtn.onclick = () => {
    lightbox.style.opacity = '0'
    setTimeout(() => lightbox.remove(), 300)
  }
  
  header.appendChild(title)
  header.appendChild(closeBtn)
  
  // Create image container
  const imageContainer = document.createElement('div')
  imageContainer.style.cssText = `
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--prim-b);
    padding-bottom: 0;
    flex-shrink: 0;
  `
  
  // Create navigation arrows
  const prevBtn = document.createElement('button')
  prevBtn.innerHTML = '<img src="images/left-arrow-white.svg" alt="previous">'
  prevBtn.style.cssText = `
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    padding: 1rem;
    cursor: pointer;
    z-index: 10;
  `
  
  const nextBtn = document.createElement('button')
  nextBtn.innerHTML = '<img src="images/right-arrow-white.svg" alt="next">'
  nextBtn.style.cssText = `
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    padding: 1rem;
    cursor: pointer;
    z-index: 10;
  `
  
  // Create main image
  const mainImage = document.createElement('img')
  mainImage.style.cssText = `
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
  `
  
  // Navigation functions
  function showImage(index) {
    if (index < 0) index = gridItems.length - 1
    if (index >= gridItems.length) index = 0
    
    const item = gridItems[index]
    if (item && item.image) {
      mainImage.src = item.image
      mainImage.alt = item.alt || ''
    }
  }
  
  prevBtn.onclick = () => {
    currentIndex = (currentIndex - 1 + gridItems.length) % gridItems.length
    showImage(currentIndex)
    updateContent() // Update captions when navigating
  }
  
  nextBtn.onclick = () => {
    currentIndex = (currentIndex + 1) % gridItems.length
    showImage(currentIndex)
    updateContent() // Update captions when navigating
  }
  
  // Create content section
  const contentSection = document.createElement('div')
  contentSection.style.cssText = `
    padding: 0.25rem 1rem;
    background: var(--prim-b);
    color: var(--prim-a);
    max-height: 100px;
    overflow-y: auto;
    margin-top: 0;
  `
  
  function updateContent() {
    const item = gridItems[currentIndex]
    if (item) {
      let content = ''
      if (item.alt) content += `<div><strong>Caption:</strong> ${item.alt}</div>`
      if (item.credit) content += `<div><strong>Credit:</strong> ${item.credit}</div>`
      if (item.title) content += `<div><strong>Title:</strong> ${item.title}</div>`
      if (item.content && Array.isArray(item.content)) {
        content += `<div><strong>Content:</strong> ${item.content.join(' ')}</div>`
      }
      contentSection.innerHTML = content || '<div>No additional information</div>'
    }
  }
  
  // Assemble lightbox
  imageContainer.appendChild(prevBtn)
  imageContainer.appendChild(mainImage)
  imageContainer.appendChild(nextBtn)
  
  lightbox.appendChild(header)
  lightbox.appendChild(imageContainer)
  lightbox.appendChild(contentSection)
  
  // Add to page
  document.body.appendChild(lightbox)
  
  // Show initial image and content
  showImage(currentIndex)
  updateContent()
  
  // Fade in
  setTimeout(() => {
    lightbox.style.opacity = '1'
  }, 10)
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden'
  
  // Clean up on close
  const originalClose = closeBtn.onclick
  closeBtn.onclick = () => {
    document.body.style.overflow = ''
    originalClose()
  }
}

// Syrup'd initiative teasers on the home page -- the mobile mirror of
// desktop's addInitiativeTeasers(). WHICH initiatives appear comes from
// data/main.json "featuredOnHome", shared with desktop, so content changes
// happen in one place. Presentation differs on purpose: stacked full-width
// tiles instead of grid blocks, title overlaid (no hover here to reveal
// anything), tap opens the detail directly -- buildHomeInitiatives() only
// renders a tile once that initiative's data is already loaded (see the
// `ready` check below), so there's no need to route through routePath()'s
// wait-for-data poll the way a cold deep link does.
// Not addSyrupImgToMobile(): its tap toggles a clean-image reveal, which is
// the wrong gesture for a link.
function buildHomeInitiatives() {
  const wrap = document.getElementById('home-initiatives')
  if (!wrap || typeof NetizenSyrupImage === 'undefined') return

  let tries = 0
  const wait = setInterval(() => {
    const names = (window.data && window.data.featuredOnHome) || []
    const ready = names.length &&
      names.every(n => window.data.initiatives && window.data.initiatives[n])
    if (!ready) {
      if (++tries > 25) clearInterval(wait) // initiative JSONs never arrived
      return
    }
    clearInterval(wait)

    names.forEach(name => {
      const init = window.data.initiatives[name]
      const images = (init.grid || []).map(g => g.image)
      if (!images.length) return // nothing to show for this one yet

      const tile = document.createElement('div')
      tile.className = 'home-initiative-tile'
      wrap.appendChild(tile)

      try {
        /* eslint-disable no-new */
        new NetizenSyrupImage({
          image: images[Math.floor(Math.random() * images.length)],
          ele: tile,
          colors: getNextSyrupColors(),
          huffhack: syrupSettings.huffhack,
          dither: syrupSettings.dither,
          pixelate: syrupSettings.pixelate,
          ascii: syrupSettings.ascii
        })
        /* eslint-enable no-new */
      } catch (e) {
        console.warn('home tile failed for', name, e)
        tile.remove()
        return
      }

      const title = document.createElement('span')
      title.className = 'tile-title'
      title.textContent = init.title
      tile.appendChild(title)

      tile.addEventListener('click', () => {
        showInitiativeDetail(name)
      })
    })

    // Tuck the newsletter CTA in among the projects rather than leaving it
    // last -- done here (not in buildHomeExtras) because the tiles arrive
    // async and this is the only place that knows when they exist. The
    // canvas sizes from its container's CSS height, so relocation is safe
    // whether the bent text has drawn yet or not.
    const news = document.getElementById('home-newsletter')
    if (news && wrap.children.length >= 2) {
      wrap.insertBefore(news, wrap.children[2] || null)
    }
  }, 120)
}

// Feature video + newsletter CTA on home, both single-source from
// data/main.json (featureVideo / newsletterUrl, shared with desktop).
// Video stacks full-width at 16:9. Newsletter mimics desktop's BEND THIS
// SITE: NetizenBentText, stroke colour from the mobile colour system.
function buildHomeExtras() {
  const data = window.data || {}

  const feat = document.getElementById('home-feature')
  if (feat && data.featureVideo && data.featureVideo.youtubeId) {
    const v = data.featureVideo
    feat.innerHTML = `<iframe
      src="https://www.youtube.com/embed/${v.youtubeId}"
      title="${v.title || 'featured video'}"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen></iframe>`
  }

  const news = document.getElementById('home-newsletter')
  if (news && data.newsletterUrl && typeof NetizenBentText !== 'undefined') {
    try {
      // split-screen ground: two DIFFERENT pastels from the brand's light
      // websafe row (window.colors[0]), black lettering over the seam. Not
      // getNextSyrupColors(): the mobile palette includes near-blacks like
      // #34495e, and "not on black" is the whole point of this ground.
      const row = window.colors[0]
      const i = Math.floor(Math.random() * row.length)
      const j = (i + 1 + Math.floor(Math.random() * (row.length - 1))) % row.length
      news.style.background = `linear-gradient(90deg, ${row[i]} 0 50%, ${row[j]} 50% 100%)`
      const bent = new NetizenBentText({
        parent: news,
        text: ['NEWS', 'LETTER'],
        // a literal, not var(--prim-b): canvas strokeStyle can't resolve
        // CSS custom properties
        color: '#000',
        padding: 10,
        xOverlap: 30,
        yOverlap: 80
      })
      bent.canvas.style.cursor = 'pointer'
      bent.canvas.onclick = () => window.open(data.newsletterUrl, '_blank')
    } catch (e) {
      news.remove() // no CTA beats a broken block
    }
  }
}

// Set up hero image rotation
function setupHeroImage() {
  if (!window.data || !window.data.splashImages || !Array.isArray(window.data.splashImages) || window.data.splashImages.length === 0) {
    return
  }
  
  const heroImage = document.querySelector('.hero-image')
  if (!heroImage) return
  
  let currentImageIndex = 0
  // entries carry attribution now, so pull the path out of each one
  const srcs = window.data.splashImages.map(window.splashSrc)

  // Preload every image up front so rotating the background doesn't
  // flash white while the browser fetches the next one
  srcs.forEach(src => {
    const preload = new Image()
    preload.src = src
  })

  const credit = document.getElementById('hero-credit')
  const showCredit = src => {
    if (!credit) return
    const c = window.splashCreditForSrc(src)
    if (!c) { credit.innerHTML = ''; credit.hidden = true; return }
    credit.hidden = false
    credit.innerHTML = c.href
      ? `<a href="${c.href}">${c.label}</a>`
      : `<span>${c.label}</span>`
  }

  // Set initial image -- painted immediately either way, and it stays put as
  // the underlay/fallback beneath the canvas hero
  heroImage.style.backgroundImage = `url(${srcs[0]})`

  // Canvas hero: syrup'd image + drifting wordmark, tap to advance
  // (js/netizen-mobile-hero.js). It owns the credit too. If it can't boot
  // (feature checks fail), fall through to the old background rotation.
  if (window.NetizenMobileHero && window.NetizenMobileHero.boot({
    container: heroImage,
    srcs,
    credit
  })) return

  showCredit(srcs[0])

  // Rotate images every 5 seconds
  setInterval(() => {
    currentImageIndex = (currentImageIndex + 1) % srcs.length
    heroImage.style.backgroundImage = `url(${srcs[currentImageIndex]})`
    showCredit(srcs[currentImageIndex])
  }, 5000)
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
} else {
  main()
}

