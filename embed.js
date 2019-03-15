const debug = require('debug')('embedgram')
const request = require('request-promise-native')
const cheerio = require('cheerio')
const pug = require('pug')
const path = require('path')

const qFeed = 'body script'

const getLastPosts = async function (profileHandle, nbPosts = 12) {
  if (nbPosts > 12) throw new Error('Cannot get more than 12 posts')
  if (nbPosts % 3) nbPosts = (nbPosts - nbPosts % 3)

  return request('https://www.instagram.com/' + profileHandle)
    .then(response => {
      return cheerio.load(response)
    })
    .then($ => {
      debug('Loading profile : %s', profileHandle)
      if (!$(qFeed).length) throw new Error('cannot get profile ' + profileHandle)

      let script = $(qFeed).first().html()
      script = script.replace('window._sharedData =', '')
      script = script.replace(/(;)$/, '')

      const data = JSON.parse(script)
      const edges = data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges

      const thumbs = []

      for (let edgeIndex = 0; edgeIndex < nbPosts; edgeIndex++) {
        thumbs.push(edges[edgeIndex].node.thumbnail_src)
      }

      return thumbs
    })
    .catch(error => {
      debug(error)
      return []
    })
}

module.exports.lastPosts = getLastPosts

module.exports = function (profileHandle, nbPosts = 12) {
  return getLastPosts(profileHandle, nbPosts).then((thumbs) => {
    return pug.renderFile(path.join(__dirname, 'view/feed.pug'), {
      handle: profileHandle,
      thumbs: thumbs,
      ig_link: 'https://www.instagram.com/' + profileHandle
    })
  })
}
