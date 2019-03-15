const debug = require('debug')('embedgram:server')
const express = require('express')
const mcache = require('memory-cache')
const embed = require('./embed')

const app = express()

app.enable('trust proxy')
app.get('/favicon.ico', (req, res) => res.status(204))

app.get('/:profile', (req, res, next) => {
  const profile = req.params.profile

  let body = mcache.get(profile)
  if (body) {
    res.status(200).send(body)
    return
  }

  embed(profile)
    .then((body) => {
      mcache.put(profile, body, 3600 * 1000)
      res.status(200).send(body)
    })
    .catch(error => {
      res.status(500).send({
        error: error.message
      })
    })
})

app.use(function (err, req, res, next) {
  if (err) res.status(500).send(err)
})

try {
  const server = app.listen(process.env.PORT || null, '127.0.0.1', () => {
    debug('Listening on port ' + server.address().port)
  })
} catch (error) {
  debug('Houston, we got a server problem... %O', error)
}
