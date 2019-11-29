const debug = require('debug')('embedgram')
const request = require('request-promise-native')
const cheerio = require('cheerio')
const pug = require('pug')
const path = require('path')

const qFeed = 'body script'

const getLastPosts = function (profileHandle, nbPosts) {
  if (nbPosts > 12) throw new Error('Cannot get more than 12 posts')
  if (nbPosts % 3) nbPosts = (nbPosts - nbPosts % 3)

  return getIgFeed(profileHandle)
    .then(response => {
      return cheerio.load(response)
    })
    .then($ => {
      debug('Loading profile : %s', profileHandle)
      if (!$(qFeed).length) throw new Error('cannot get profile ' + profileHandle)

      const embededScript = $(qFeed).first().html().replace('window._sharedData =', '').replace(/(;)$/, '')
      const data = JSON.parse(embededScript)
      const edges = data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges
      const thumbs = edges.slice(0, nbPosts).map((edge) => edge.node.thumbnail_src)

      return thumbs
    })
    .catch(error => {
      debug(error)
      return []
    })
}

const getIgFeed = async function (profileHandle) {
  return request(getIgLink(profileHandle))
}

const getIgLink = function (profileHandle) {
  return 'https://www.instagram.com/' + profileHandle
}

const getRenderContext = function (profileHandle, thumbs) {
  return {
    handle: profileHandle,
    thumbs: thumbs,
    ig_link: getIgLink(profileHandle)
  }
}

const embed = async function (profileHandle, nbPosts = 12) {
  const thumbs = await getLastPosts(profileHandle, nbPosts)
  return pug.renderFile(path.join(__dirname, 'view/feed.pug'), getRenderContext(profileHandle, thumbs))
}

module.exports = {
  getIgFeed,
  getIgLink,
  getRenderContext,
  getLastPosts,
  embed
}
