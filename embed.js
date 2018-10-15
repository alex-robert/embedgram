const debug = require('debug')('ebdgram')
const request = require('request-promise-native')
const cheerio = require('cheerio')
const pug = require('pug')
const path = require("path");

const qError = 'div.error-container'
const qFeed = 'body script'

const getLastPosts = function(profileHandle) {
  return request('https://www.instagram.com/' + profileHandle)
    .then( response => {
      return cheerio.load(response)
    })
    .then( $ => {
      debug('Loading profile : %s', profileHandle)
      if(!$(qFeed).length) throw new Error('cannot get profile ' + profileHandle)

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

module.exports.lastPosts = getLastPosts

module.exports = function(profileHandle) {
  return getLastPosts(profileHandle).then( (thumbs) => {
    return pug.renderFile( path.join(__dirname, "view/feed.pug"), {
      handle: profileHandle,
      thumbs: thumbs,
      ig_link: 'https://www.instagram.com/' + profileHandle
    })
  })
}
