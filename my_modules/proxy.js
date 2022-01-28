const path = require('path')

const hostDict = {
  '161.35.57.186': '../www/index.html',
  'netizen.org': '../www/index.html',
  'www.netizen.org': '../www/index.html',
  'dream.netizen.org': '../www/dream/index.html',
  'www.dataruleseverythingaroundme.net': '../www/dream/index.html',
  'dataruleseverythingaroundme.net': '../www/dream/index.html',
  'browserfest.netizen.org': '../www/browserfest/index.html'
}

module.exports = (req, res, next) => {
  const host = req.headers.host
  // const url = req.originalUrl
  if (hostDict[host]) {
    res.sendFile(path.join(__dirname, hostDict[host]))
  } else next()
}
