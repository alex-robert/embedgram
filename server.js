const debug = require('debug')('ebdgram:server')
const path = require("path");
const express = require('express')

const request = require('request-promise-native')
const cheerio = require('cheerio')

const qError = 'div.error-container'
const qFeed = 'body script'

function getFeed (profile) {
  return request('https://www.instagram.com/' + profile)
    .then( response => {
      return cheerio.load(response)
    })
    .then( $ => {
      debug('Loading profile : %s', profile)
      if(!$(qFeed).length) throw new Error('cannot get profile ' + profile)

      let script = $(qFeed).first().html()
      script = script.replace('window._sharedData =', '')
      script = script.replace(/(;)$/, '')

      const data = JSON.parse(script)
      const edges = data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges

      let thumbs = []

      for(edge of edges){
        thumbs.push(edge.node.thumbnail_src)
      }

      return thumbs
    })
    .catch(error => {
      debug(error)
    })
}

const app = express()

app.enable("trust proxy")
app.get('/favicon.ico', (req, res) => res.status(204))

app.use(express["static"](path.join(__dirname, "public")))
app.set("views", path.join(__dirname, "view"))
app.set("view engine", "pug")
app.set("view cache", false)

app.get('/:profile', (req, res, next) => {
  profile = req.params.profile
  getFeed(profile).then(thumbs => {
    res.render('feed', {
      title: 'Embed : ' + profile,
      thumbs: thumbs,
      ig_link: 'https://www.instagram.com/' + profile
    })
  })
  .catch(error => {
    next(error)
  })
})

app.use(function(err, req, res, next) {
  if(err) res.status(500).send(err)
})

try {
  const server = app.listen(process.env.PORT || null, '127.0.0.1', () => {
      debug("Listening on port " + server.address().port)
  })
} catch (error) {
   debug('Houston, we got a server problem... %O', error)
}