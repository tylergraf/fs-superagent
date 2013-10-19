if ('undefined' === typeof window) {
  module.exports = require('./lib/fs-superagent');
} else {
  module.exports = require('./lib/client');
}
