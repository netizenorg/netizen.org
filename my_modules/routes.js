const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()
const path = require('path')
const fs = require('fs')

router.use(bodyParser.json({ limit: '10mb' }))

router.get('/readme', (req, res) => {
  res.sendFile(path.join(__dirname, '../README.md'))
})

router.post('/api/test', (req, res) => {
  const message = `u said ${req.body.message}`
  res.json({ message })
})

// nick's Internet Art II class assignment submissions end point
router.post('/api/netart2/assignment', (req, res) => {
  let message = 'thnx! your work has been submitted'
  const dbpath = '../data/classes/netart2-spring2021.json'
  const db = require(path.join(__dirname, dbpath))
  if (!db) {
    message = 'oops! there was an issue with the database :('
    res.json({ message })
  } else if (!req.body.name || !db[req.body.name]) {
    message = 'oops! that username is not in the database :('
    res.json({ message })
  } else {
    const data = { url: req.body.url, type: req.body.assignment }
    db[req.body.name].push(data)
    const dbJSON = JSON.stringify(db, null, 2)
    fs.writeFile(path.join(__dirname, dbpath), dbJSON, (err) => {
      if (err) res.json({ message: 'oops! server error :(' })
      else res.json({ message })
    })
  }
})

// nick's PostInternet receipts submissions end point
router.get('/api/postnet/receipts', (req, res) => {
  const rosterPath = path.join(__dirname, '../data/classes/postnet-spring2022.json')
  const roster = JSON.parse(fs.readFileSync(rosterPath, 'utf8'))
  res.json(roster)
})

router.post('/api/postnet/new-receipt', (req, res) => {
  try {
    const rosterPath = path.join(__dirname, '../data/classes/postnet-spring2022.json')
    const roster = JSON.parse(fs.readFileSync(rosterPath, 'utf8'))
    const s = roster[req.body.id]
    const r = req.body.data
    r.assignment = req.body.assignment
    if (s.receipts.map(d => d.url).includes(r.url)) {
      return res.json({ message: 'You\'ve already submitted that receipt' })
    } else {
      s.receipts.push(r)
      fs.writeFileSync(rosterPath, JSON.stringify(roster, null, 2))
    }
  } catch (err) {
    return res.json({ message: err })
  }
  res.json({ message: 'thnx! your receipt has been submitted' })
})

module.exports = router
