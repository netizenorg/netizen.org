require('dotenv').config()

const fs = require('fs')
const express = require('express')
const app = express()
const http = require('http')
const https = require('https')
const SocketsServer = require('socket.io')
const ANALYTICS = require('stats-not-tracks')
const ROUTES = require('./my_modules/routes.js')
const SOCKETS = require('./my_modules/sockets.js')
const PROXY = require('./my_modules/proxy.js')
const BBS = require('./my_modules/bbs.js')

ANALYTICS.setup(app, {
  path: `${__dirname}/data/analytics`,
  admin: {
    route: 'analytics',
    secret: process.env.JWT_SECRET,
    hash: process.env.ADMIN_PWD,
    token: process.env.ADMIN_TOKEN
  }
})

app.use(ROUTES)
app.use(PROXY)
app.use(express.static(`${__dirname}/www`))

const io = new SocketsServer.Server()
io.on('connection', (socket) => SOCKETS(socket, io))

BBS.listen(1337, (err) => {
  if (err) return console.log(err)
  console.log('bbs server is listening => telnet host 1337')
})

if (process.env.ENV === 'dev') {
  // development server
  const httpServer = http.createServer(app)
  httpServer.listen(8000, () => console.log('listening on 8000'))
  io.attach(httpServer)
  ANALYTICS.live(httpServer, io)
} else {
  // production servers
  const credentials = {
    key: fs.readFileSync('/etc/letsencrypt/live/netizen.org-0001/privkey.pem', 'utf8'),
    cert: fs.readFileSync('/etc/letsencrypt/live/netizen.org-0001/cert.pem', 'utf8'),
    ca: fs.readFileSync('/etc/letsencrypt/live/netizen.org-0001/chain.pem', 'utf8')
  }

  const httpServer = http.createServer(app)
  const httpsServer = https.createServer(credentials, app)

  httpServer.listen(80, () => console.log('HTTP listening on port 80'))
  httpsServer.listen(443, () => console.log('HTTPS listening on port 443'))

  io.attach(httpServer)
  io.attach(httpsServer)
  ANALYTICS.live(httpServer, io)
}
