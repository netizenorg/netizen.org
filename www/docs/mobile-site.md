# Mobile Site Documentation

## Overview

The mobile site (`mobile.html`) is a Single Page Application (SPA) designed specifically for mobile devices. It provides a touch-friendly interface for browsing netizen.org content with the same data as the desktop version.

## Architecture

### Files
- `mobile.html` - Main HTML structure
- `css/mobile.css` - Mobile-specific styles
- `js/mobile.js` - SPA functionality and navigation

### Key Features

1. **Responsive Design** - Optimized for mobile screens with touch-friendly interactions
2. **SPA Navigation** - Smooth transitions between sections without page reloads
3. **Content Sections**:
   - **About** - Home page with hero image rotation and crew photo
   - **Initiatives** - Grid of initiative cards that link to detail pages
   - **Support** - Support information
   - **Initiative Detail** - Individual initiative pages with galleries

## Navigation

### Main Navigation
- Logo click → About section
- "About" nav item → About section  
- "Initiatives" nav item → Initiatives section
- "Support" nav item → Support section

### Initiative Navigation
- Click any initiative card → Initiative detail page
- "← Back" button → Return to Initiatives section

## Data Structure

The mobile site uses the same data structure as the desktop site:

```javascript
window.data.copy.about.main      // About main text
window.data.copy.about.sub       // About sub text
window.data.copy.initiatives.main // Initiatives main text
window.data.copy.initiatives.sub  // Initiatives sub text
window.data.copy.support.main     // Support main text
window.data.copy.support.sub      // Support sub text

window.data.initiatives[initiativeName] // Individual initiative data
window.data.splashImages               // Hero image rotation array
```

## Styling

### Mobile-First Design
- Fixed header with navigation
- Touch-friendly button sizes (44px minimum)
- Responsive grid layouts
- Smooth animations and transitions

### Visual Elements
- Hero image rotation every 5 seconds
- Decorative grid background
- Glassmorphism effects with backdrop-filter
- Brand colors from CSS variables

## Technical Implementation

### SPA Functionality
- Section-based navigation with show/hide
- Content loading from JSON data
- Error handling and loading states
- Navigation lock to prevent rapid clicking

### Performance Optimizations
- Lazy loading for images
- Efficient DOM manipulation with netnet library
- Minimal reflows and repaints
- Touch event optimizations

## Browser Support

- Modern mobile browsers (iOS Safari, Chrome Mobile, Firefox Mobile)
- Touch event support
- CSS backdrop-filter support (with fallbacks)
- ES6+ JavaScript features

## Future Enhancements

- URL routing for direct links to sections/initiatives
- Offline support with service workers
- Push notifications
- Enhanced accessibility features
- Performance monitoring and analytics 