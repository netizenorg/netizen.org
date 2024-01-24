/* global io, nn, Netitor, resize */

const socket = io()
const group = window.location.toString().split('dhr/')[1].split('/')[0]

const ne = new Netitor({
  ele: '#editor',
  render: '#output',
  renderWithErrors: true,
  theme: window.localStorage.getItem('theme') || 'dark',
  wrap: true,
  language: 'html',
  code: '<h1>Hello World Wide Web</h1>'
})

window.addEventListener('load', window.reset)

// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•
// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•* handling Netitor's events

ne.on('lint-error', (eve) => {
  // console.log('lint-error', eve)
  window.markErrors(eve)
})

ne.on('edu-info', (eve) => {
  // console.log('edu-info', eve)
  if (eve.nfo) {
    ne.spotlight(eve.line)
    document.querySelector('#nfo').className = ''
    if (eve.language === 'html') window.showHTMLNFO(eve)
    else if (eve.language === 'css') window.showCSSNFO(eve)
    else if (eve.language === 'javascript') window.showJSNFO(eve)
  }
})

ne.on('cursor-activity', (eve) => {
  window.reset()
})

ne.on('code-update', () => {
  const name = window.localStorage.getItem('name') || 'anonymous'
  socket.emit('editor-update', { group, name, code: ne.code })
})

ne.cm.on('keydown', (cm, e) => window.numChange(e))

// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•
// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•* socket events

socket.on('editor-init', (data) => {
  console.log(data, group)
  ne.code = data[group].code
})

socket.on('editor-broadcast', (data) => {
  if (data.group === group) ne.code = data.code
})

// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•
// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•* handling window events

nn.on('keydown', (e) => {
  if (!ne.autoUpdate && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    ne.update()
  }
})

nn.on('mouseup', e => resize.release())
nn.on('mousemove', e => resize.move(e))

nn.get('#nfo').on('mouseup', e => resize.release())
nn.get('#nfo').on('mousedown', e => resize.pressNfo())

nn.get('#editor').on('mouseup', e => resize.release())
nn.get('#editor').on('mousedown', e => resize.pressEdt())

nn.get('#settings').on('click', window.showSettings)
nn.get('#tools').on('click', window.showTools)
nn.get('#kit').on('click', window.showKit)
