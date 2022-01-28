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
  'www.dataruleseverythingaroundme.net': 'https://dream.netizen.org',
  'dataruleseverythingaroundme.net': 'https://dream.netizen.org'
}

module.exports = (req, res, next) => {
  const host = req.headers.host
  const url = req.originalUrl
  if (hostDict[host] && url === '/') {
    res.sendFile(path.join(__dirname, hostDict[host]))
  } else if (hostDict[host] && urlDict[url]) {
    if (urlDict[url].host === host) {
      res.sendFile(path.join(__dirname, urlDict[url].path))
    } else next()
  } else if (redirectDict[host]) {
    res.redirect(redirectDict[host])
  } else next()
}
