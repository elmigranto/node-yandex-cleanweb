var util  = require('util');
var tools = require('./tools');

function Captcha (id, url) {
  this.id     = id;
  this.url    = url;
  this._image = null;
}

/**
 * Downloads CAPTCHA's image which later can be retrieved with call to `Captcha.image()`.
 * @param  {Function} callback callback(err, this)
 */
Captcha.prototype.download = function (callback) {
  var self = this;
  tools.http.getBuffer(self.url, function (err, buf) {
    if (err)
      return callback(err);

    self._image = buf;
    callback(null, self);
  });
};

/**
 * Gets GIF Image for this CAPTCHA. Call `download()` first.
 * @param  {Function} converter One of `Captcha.IMAGE`.
 */
Captcha.prototype.image = function (converter) {
  var fn = converter instanceof Function
    ? converter
    : Captcha.IMAGE.DEFAULT;
  return fn(this._image);
};

Captcha.fromXml = function (parsedXml) {
  var id  = parsedXml['get-captcha-result']['captcha'][0];
  var url = parsedXml['get-captcha-result']['url'][0];
  return new Captcha(id, url);
};

/**
 * Getter functions for `Captcha.prototype.image()`.
 */

Captcha.IMAGE = {
  // Raw Node.js Buffer with GIF image.
  AS_BUFFER: function (buf) {
    return buf;
  },

  // Data URL which can be used as`src` attribute of HTML `<img/>` tag.
  AS_DATA_URL: function (buf) {
    return 'data:image/gif;base64,' + buf.toString('base64');
  }
};

Captcha.IMAGE.DEFAULT = Captcha.IMAGE.AS_BUFFER;

/**
 * Describes type of symbols in CAPTCHA.
 */

Captcha.TYPE = {
  STD  : 'estd',   // Digits only.
  LITE : 'elite',  // Digits only, easier to read.
  LATL : 'elatl',  // Lower-case latin letters.
  LATU : 'elatu',  // Upper-case latin letters.
  LATM : 'elatm',  // Mixed-case latin letters.
  RUS  : 'rus'     // Cyrillic letters.
};

Captcha.TYPE.DEFAULT = Captcha.TYPE.LITE;

module.exports = Captcha;
