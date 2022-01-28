const path = require('path')

const hostDict = {
  '161.35.57.186': '../www/index.html',
  'netizen.org': '../www/index.html',
  'www.netizen.org': '../www/index.html',
  'dream.netizen.org': '../www/dream/index.html',
  'browserfest.netizen.org': '../www/browserfest/index.html'
}

const urlDict = {
  '/events.html': { host: 'dream.netizen.org', path: '../www/dream/events.html' }
}

const redirectDict = {
  'www.dataruleseverythingaroundme.net': 'dream.netizen.org',
  'dataruleseverythingaroundme.net': 'dream.netizen.org'
}

module.exports = (req, res, next) => {
  const host = req.headers.host
  const url = req.originalUrl
  console.log(host, url)
  if (hostDict[host] && url === '/') {
    console.log('in 1')
    res.sendFile(path.join(__dirname, hostDict[host]))
  } else if (hostDict[host] && urlDict[url]) {
    console.log('in 2')
    if (urlDict[url].host === host) {
      res.sendFile(path.join(__dirname, urlDict[url].path))
    } else next()
  } else if (redirectDict[host]) {
    console.log('in 3')
    res.redirect(redirectDict[host])
  } else next()
}
