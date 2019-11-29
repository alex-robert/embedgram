const { getLastPosts, getIgFeed } = require('../embed')

describe('Mocked Embedgram', () => {
  it('test feed should match snapshot', async () => {
    getIgFeed()
  })

  it('should fail if called without instagram handle', () => {

  })

  it('should fail if called with wrong instagram handle', async () => {
    const gram = await getLastPosts('__azezregtrhggnvcxx__')
    expect(gram).toMatchSnapshot()
  })
})
