const fetch = require('node-fetch')

exports.types = {
  'now-deploy': (task, hub, cwd) => {
    const options = task.get('options', {}).serialize(true)
    return fetch(`https://api.zeit.co/now/instant?registryAuthToken=${process.env.NPM_TOKEN}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOW_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    })
    .then(res => res.json())
    .then(result => {
      result.id = result.uid
      delete result.uid
      return { result, done: true }
    })
  }
}
