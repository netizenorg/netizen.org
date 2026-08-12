# hi jon :)

...u know i love docs, at some point i really do want to document this whole thing, but for now i'm going to focus on just the parts u need to know in order to work on the mobile stuff. having said that, if there's any part of the code base that seems confusing let me know && i'll add docs for any important bits i might have overlooked!


## Site Architecture

- `ascii-art`: this folder contains ascii art stored in txt files. It's currently used by the desktop site to add ascii art to specific grid elements (see ASCII Art section below for more details)
- `css`: all our CSS code. `fonts.css` && `brand.css` are used by both mobile && desktop.
- `data`: our "flat file database", all our content goes here. (see "Database" section below for more details)
- `docs`: these docs
- `identity`: the plan is to include any identity related files or experiments here, right now it's just our syrup-test pages && the last grid experiment.
- `images`: all our site's images, the root directory contains logos && icons. Images related to specific projects are stored in their own sub folders
- `js`: all our JavaScript files, there's a lot here, some of it is documented below (the rest i'll get to eventually)
- `videos`: all our site's videos. u'll only see a "test.mp4" video in this repo, but there is also a "dream" folder with web friendly local versions of all the dream vids for when we eventually build the in-site video player (u don't see the dream vids b/c i'm "git-ignoring" them to avoid bloating the repo, but it will exist on the published site)
- `index.html` desktop homepage
- `mobile.html` mobile homepage


## Mobile Considerations

for all the reasons discussed in our meeting, i've separated out the code for the mobile site (this should make it way easier for u to work on without worrying about creating weird side-effects on the desktop version), at the moment this includes:
- `mobile.html` in the root directory, just a very basic template i put together to get started
- `js/mobile.js` main JS file for mobile, i left comments in that file which should get u oriented (but let me know if/when u need more details). if we need to make other mobile-specific js files i suggest we prefix each one with `mobile-` for clarity
- `css/mobile.css` file for mobile specific CSS rules


i know u mentioned not having worked on an SPA before, but it's easier than it might seem (if u don't mind a little JavaScript), i created a basic demo below in the "netnet standard library" section. but if u feel like we need to add new directories to the project architecture for the mobile site, i'd suggest we prefix them with `mobile-`, while testing this of course means u'll have to navigate to an ugly looking URL, but seeing as how i've got to work on custom logic for the URL routing we'll be able to change this once we deploy to our server. Just keep track of what u want the actual URLs to look like to the public && i'll make sure to implement that on the server side before we launch.


## Database

All of the website's text content is stored (apart from meta tag data, b/c that gets messy, unless we move it to the server) is stored in the `data` folder in .json files. I don't think there's any need for a fancy database (though if it becomes important i can implement that when we get there) but it's still always a good idea to separate out the "view" from the "data" (for one of many reasons, including now so that our desktop && mobile site content is coming from the same place).

It also means we can use GitHub as a cheap CMS, at any point we can edit the files directly on GitHub if we want to make any copy edits && then deploy the site to update. (if at some point we want to create some simple web interface CMS for ourselves i can separate these files out && keep them server-side only).

`main.json` contains all the copy for the "about", "initiatives" && "support" section, as well as a list of the "initiatives" we want published live as well as the images to get randomly displayed on our splash/hero section (of the desktop, but we could also use this list for mobile).

`initiatives`, the initiatives folder contains one file for each case-study, all the content follows the same structure (should be fairly obvious what that is after taking a look at em).

assuming that u've run the `loadData()` function (which i included in the `mobile.js` file in the load function),u can access this data in the JavaScript code like this:
```js
window.data.splashImages // array of all the header images

window.data.copy // object with all the main copy text
window.data.copy.about.main // about main text
window.data.copy.about.sub // about sub text
window.data.copy.initiatives.main // initiatives main text
window.data.copy.initiatives.sub // initiatives sub text
window.data.copy.support.main // support main text
window.data.copy.support.sub // support sub text

window.data.initiatives // object with all the case study data
// individual case study data can be accessed like this:
window.data.initiatives.dream['title']
window.data.initiatives.dream['sub-title']
window.data.initiatives.dream['date']
window.data.initiatives.dream['urls']

window.data.initiatives.dream.name // for keys/paths/etc

window.data.initiatives.dream.grid // an array with all the grid data
// for example...
window.data.initiatives.dream.grid[0].image // path
window.data.initiatives.dream.grid[0].credit
window.data.initiatives.dream.grid[0].alt
// in some casese also...
window.data.initiatives.dream.grid[0].date
window.data.initiatives.dream.grid[0].title
window.data.initiatives.dream.grid[0].content // array of paragraphs
window.data.initiatives.dream.grid[0].urls
```

## netnet standard library

not sure how much we've talke about this library, but the [netnet standard library](https://github.com/netizenorg/netnet-standard-library) is a JavaScript library that i use both to create netnet itself, but also to teach students basic creative JavaScript stuff. it's sort of a bridge between basic "vanilla" JavaScript && all the other creative coding JS libraries (just makes it easier to do some of the basic JavaScript stuff). I'm also using it to create our website, u don't have to use it... but it would definitely make ur life easier.

Anytime u see `nn` followed by a `.` && some other function name, that's the library. I'm using it in some of the examples below. u can check out some [basic examples here](https://github.com/netizenorg/netnet-standard-library/blob/main/docs/examples.md), but there's loads more it can do, [all the functions are listed here](https://github.com/netizenorg/netnet-standard-library?tab=readme-ov-file#api--documentation).

[I've made a navigation example in netnet for u of some SPA-like behavior using this library](https://netnet.studio/?layout=dock-left#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) but here's the basic principle:

```js
// the element' with the id of "some-element" now has the main copy in it
nn.get('#some-element')
  .content(window.data.copy.about.main)
```

## The Grid

u mentioned wanting to use the grid as a stylistic thing, here's everything u'll need to know (&& more) to make use of that (if i'm missing something let me know && i can update this section).

There's a JavaScript class i made called `NetizenGrid` stored in `js/netizen-grid.js`. To use it, this file needs to be included in a script tag of the HTML page:
```html
<script src="js/netizen-grid.js"></script>
```

&& that page also needs to have some HTML element (like a div) where u're gonna put the grid, for example:

```html
<div class="grid"></div>
```

Then in CSS u define the dimensions of the grid u want, for example:

```css
.grid {
  position: relative;
  width: 100%;
  height: 320px;
}
```

Then in ur JavaScript u need to create a new instance of the NetizenGrid class, this class takes a "settings" object which requires at least one parameter, the `selector`, which is a CSS selector for the HTML element which is to contain the grid
```js
const grid = new NetizenGrid({ selector: '.grid' })
```

Here's a [basic grid example in netnet](https://netnet.studio/?layout=dock-left#code/eJydkM9OwzAMxu95CqsS2h+JpMAtS3vlxjt0aZR4CkkVm20w7d1pWiFx4MTRnz//bH+G+DO6XgjpC45wEwBTJmTMSUNxcWA8u8OsXnDkoOGpbR9qGRz6wBpentvpehB3IYz6QQkz4hlsHIi6pmKb3qhZmluGbMGJgYrtmsA8kVYqOcYvl3Lx0iOHj6PErOia1IlUSvIdkzxRZazD/T8oa++xHvM3qxdqDz7m4xDhbXW/1kD2CuZvhc2JGJaIOkju8tuzvQG56CznomGz5LiB+04sQzk6GbPfVnW3hLSu+wabUXyu)

u can customize the grid a few different ways. u can change the grid cells by passing an optional "grid" property. i've defined a few different grids in the `js/grids.js` file (feel free to add to these, but don't edit the ones that are already there, these are used by the desktop version) which can be used like this:

```js
const grid = new NetizenGrid({
  selector: '.grid',
  grid: window.grids.variant
})
```

u can also manually define a grid by passing an array of cell objects to the "grid" property. a cell object should contain 4 properties `{ x, y, w, h}`
1. `x` is the index value of which column the cell should start on (0 = first column, 1 = second column, etc)
2. `y` is the index value of which row that cell should start on (0 = first row, 1 = second row, etc)
3. `w` is how many columns wide this cell should be (1 = 1 column wide)
4. `h` is how many rows tall this cell should be (1 = 1 row tall)

here's an example:

```js
const grid = new NetizenGrid({
  selector: '.grid',
  grid: [
    { x: 0, y: 0, w: 1, h: 2 },
    { x: 1, y: 0, w: 2, h: 2 },

    { x: 3, y: 0, w: 1, h: 3 },
    { x: 4, y: 0, w: 2, h: 3 },

    { x: 0, y: 2, w: 2, h: 1 },
    { x: 2, y: 2, w: 1, h: 1 },

    { x: 0, y: 3, w: 2, h: 1 },
    { x: 2, y: 3, w: 4, h: 1 }
  ]
})
```

The grid above assumes the default dimensions of 4 rows && 6 columns total (which is how all our grids work so far) but this is also something u can modify:

```js
const grid = new NetizenGrid({
  selector: '.grid',
  cols: 6,
  rows: 4,
  grid: [
    { x: 0, y: 0, w: 1, h: 2 },
    { x: 1, y: 0, w: 2, h: 2 },

    { x: 3, y: 0, w: 1, h: 3 },
    { x: 4, y: 0, w: 2, h: 3 },

    { x: 0, y: 2, w: 2, h: 1 },
    { x: 2, y: 2, w: 1, h: 1 },

    { x: 0, y: 3, w: 2, h: 1 },
    { x: 2, y: 3, w: 4, h: 1 }
  ]
})
```

Once u've created a grid && stored in a variable u can do things with that grid by calling different methods on it.

- `grid.updateColors()`: this will randomly update the colors of the grid (following our brand's color rules)
- `grid.updateBlock(cellNumber, someElement)`: this can be used to add some content (another HTML element) into a specific cell of the grid.
- `grid.clearBlock(cellNumber)`: this can be used to remove the content of a specific cell
- `grid.clearAllBlocks()`: this removes all the content from all the cells
- `grid.transitionTo(newGrid)`: this transitions the grid from it's current form to a new form matching the array of cell objects passed into the function (NOTE: it requires that u set transition settings for `.grid > div` in ur CSS)

[Here's a more complex netnet sketch that shows some of this in action!!!](https://netnet.studio/?layout=dock-left#code/eJydVE2P2jAQvedXTCNVCQiSAKWVsoDUrqpequ1h91b1YByTeNfYke3AbtH+945tWALtqZdImTefb55nYeyLYKsoymrNKzhEAK0y3HIlS9BMEMt37Aate17ZpoRJUbx3vw3jdWNLmE2L9vkmeo2ifIhmLkHpimnYKA2x1USGXA8qBqtgr/QT7BlIxir3b5gFo7YMI2/v7+HsDzsiOmZ8GtVpoEwIEw3zY5srqPjON3sOGbdatUzblxKIEDeXWNVpEmYqsk/mCrR8y2U93nSSBh/arTkdr9lvznRaZNPJfFRkHyf4mc3no8nAzZsP4e7Hw9cSbKMMxP2Q+NQ90QyMVRqHdcTgHPF4rDo79t6xn3lHNCdrwZyHbRissa8qo8YAThst8tN+ooUbmQpizDJ2JMSrRY4mhBaGat4ik5ou48ba1pR5Lpnlv5lUus5qbptunXGVm2eZP5pcygwnzh6NyxGCV/+RJWBj18y/c60cS7VQayJAyhHchYhvboXDHHALEVXSWPBLXaIs9n2f9IACEYwigyUkfvMJvA5QajnqD7nlyY7BllQMCJy2hyQSi2oVordiF+HIrdiGdOJYj0tUIPFFBXnBtQAyjwwzoo0LQBWB2vg4X9oANmuZtNFbLYz1w6QDL8YwDBq/h3xL+IlWgAM8o/BG8OK/e3xFI3BvCV5HZ3zSw6dn/Oww6znMvMP0IkHApz38KkHoYNKrcJlg2sMnZ/w6wey6xasEAf9wwhH+5TYNnsWsfxPSN6oGJ7hrK2LZrRJKm/TN6pfyWYgvQtEnZ8d701PBFqhm+L5l7a+JXykKZ4u7MkeFuceDApOZ92RpgobE5c+OS02TBm+MP1GieneEjEkPfryWVBWmxxGLMO8Go+7d00RlcksEp0kPQAWXMC/Q4OQaOmg5veyAb+tQBq9gmuCzS0aQ0Aof2uZcPqGdNko7qFWoWKYDpiRCWPUJkaMKB4CM6E5CfDTEsG+YdPfWe6KSuQGsGriTau+pawWhjjnU+dYdIdMyyjfYbEu0Nf0XEPU25DeRokpwrMHfAG4fCR74AxZOwR84APg/)



<!-- TODO: more complex exmaples -->

## ASCII Art

There's a utility function called `loadASCIIArt()` in the `js/utils.js` file (which is included in the mobile template i made) which can be used to load any of the ASCII drawings saved in the `ascii-art` folder. to use it, u pass a settings object with two parameters, the `path` to the txt file && a reference to the `parent` element u want to inject the ASCII art into, for example:
```js
const ascii = await loadASCIIArt({
  path: 'ascii-art/netnet.txt', // which ascii file
  parent: nn.get('#some-div'), // where do u want to put it
})
```

u can optionally also turn it into a link +/or add some custom CSS with the following properties:
```js
// this one places the ascii cow in the 7th block of the grid
// when clicked it opens a new tab to textfiles.com
// it has a specific fontSize && cursor
loadASCIIArt({
  path: 'ascii-art/cows.txt',
  parent: grid.getBlock(7),
  link: 'http://www.textfiles.com/art/cow.txt',
  css: { fontSize: '2rem', cursor: 'pointer' }
})
```

## The "Syrup" Code

if u want to create any "syrup" images, there's a JavaScript class i made called `NetizenSyrupImage` stored in `js/netizen-syrup-image.js`. To use it, this file needs to be included in a script tag of the HTML page:
```html
<script src="js/netizen-syrup-image.js"></script>
```

&& that page also needs to have some HTML element (like a div) where u're gonna put the syrup image, for example:

```html
<div id="example"></div>
```

Then in ur JavaScript u need to create a new instance of the NetizenSyrupImage class, this class takes a "settings" object which requires at least two parameters, `ele` a reference to the element which is to contain the image and `image` a path to the image file:
```js
const syrup = new NetizenSyrupImage({
  ele: nn.get('#example'), // element to place the syrup image
  image: 'images/dream/brannon.jpg' // path to the image file
})
```

By default it will choose random colors, but u can also pass an optional property `colors` with an array of two color values like this:
```js
const syrup = new NetizenSyrupImage({
  ele: nn.get('#example'),
  image: 'images/dream/brannon.jpg',
  colors: ['#f00', '#ff0']
})
```

There are four different "syrup" layers which get applied by default:
1. `huffhack` this is the "glitch" layer, where i hack the huffman codes in the header of the jpg file to corrupt the image (keep in mind, this is a "feral" glitch, so it won't look the same on all browsers)
2. `dither` this layer creates a dithered version of the image
4. `pixelate` this layer creates a pixelated version of the image
5. `ascii` this layer creates an ASCII version of the image using the netizen logo characters `*.O` (but this can be edited)

all the layers are on by default, but u can modify any of their properties by passing a settings object for each. all the layers have their own specific settings, but they all share at least these three properties:
```js
{
  process: true // whether or not to include this layer
  zIndex: 1 // stacking order of the layer
  opacity: 0.5 // transparency of the layer
}
```

the best way to get a sense for these settings is to use the [syrup demo](https://netizenorg.github.io/sxn/identity/syrup.html) in our identity page. Below is an example where the layer gets added to a specific cell in an instance of a netizen grid, with colors from specific cells applied to it.

```js
const syrup = new NetizenSyrupImage({
  image: 'images/dream/brannon.jpg',
  ele: grid.getBlock(4),
  colors: [
    grid.getBlock(4).style.backgroundColor,
    grid.getBlock(3).style.backgroundColor
  ],
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
})
```

u could also change any of the values after the syrup has already been created by adjusting the specific property && then calling `syrup.update()`

```js
syrup.pixelate.process = true
syrup.pixelate.opacity = nn.random(0.5, 1)
syrup.pixelate.zIndex = 1
syrup.pixelate.size = nn.random(6, 28)
syrup.pixelate.threshold = nn.random(16, 128)

syrup.update()
```

u could also update the image as well as the colors directly at any time like this:

```js
syrup.updateColors([ '#fffff', '#00000'])

syrup.updateImage('path/to/newImage')

// or like this
syrup.update({
  image: img, // instance of image
  colors: [ '#fffff', '#00000'] // fg/bg colors
})
```

[Here's a netnet example with some of that in action!!!](https://netnet.studio/?layout=dock-left#code/eJydkrFu2zAQhnc+xUEZKAUy5bgJUAiWlk5ZsmQMMtDUSaJDkwRJtXaCvHtIqU0QxAWKTuLd/9/HuxO3SuoncKiazIeTQj8ihgxGh32TjSFYX1eVxiCfURs3sEGGcdoxaSp/1JXwvuqNDp7FU9YSsu3kT5Bdk+GRH6zCrN1WMZUUL5y0AbwT/wDe+0prdpCa7X1iLMXtf1AWbeVPbrIreeADnke2pLqEQZkdV6B1CXdL4X2qu01lcFkRIoz28faUhAY0/vrqy18IACqsI4YNGHJ68XsZtCijNPdQA1VSrXax170daMoLo4zzNTzQi369piXEb7+mj0nr4ljoangB64xAH209Vx7hNanj1PcjF09/0608ouIBkx5D+DAFN2G55IzlQoZTDWt2U86Z51vd4bGGqxjNHO6FlBFyhvEZcfUZsFnCfviRRoyj71TsliYseS0IIV8XxYzOqVAy2krIC2ja+dp58ezPPMzHzaffoJnjujOH/LqEzffi3Tg3zNIDvT/j/Lb5cE62i8C8mPt5fxtvNXX/Og==)
