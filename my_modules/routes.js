const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()
const path = require('path')

router.use(bodyParser.json({ limit: '10mb' }))

router.get('/readme', (req, res) => {
  res.sendFile(path.join(__dirname, '../README.md'))
})

router.post('/api/test', (req, res) => {
  const message = `u said ${req.body.message}`
  res.json({ message })
})

module.exports = router
