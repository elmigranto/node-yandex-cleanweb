var misc    = require('node-misc');
var Captcha = require('./captcha');
var tools   = require('./tools');

var URLS = {
  'get-captcha'   : 'http://cleanweb-api.yandex.ru/1.0/get-captcha',
  'check-captcha' : 'http://cleanweb-api.yandex.ru/1.0/check-captcha'
};

/**
 * Currently only holds your API Key.
 * @param {String} apiKey API Key (get one here http://api.yandex.ru/cleanweb/form.xml)
 */
function CleanWeb (apiKey) {
  this.apiKey = apiKey;
}

/**
 * Queries CleanWeb for new _independent_ CAPTCHA.
 * http://api.yandex.ru/cleanweb/doc/dg/concepts/get-captcha.xml
 *
 * (For `check-spam` use `CheckSpam.getCaptcha()`.)
 *
 * @param @optional {Captcha.TYPE} type
 * @param           {Function}     callback callback(err, Captcha)
 */
CleanWeb.prototype.getCaptcha = function (type, callback) {
  if (type instanceof Function) {
    callback = type;
    type     = Captcha.TYPE.DEFAULT;
  }
  callback = misc.cbify(callback);

  var qs = {
    key  : this.apiKey,
    type : type
  };

  tools.http.getXml(URLS['get-captcha'], qs, function (err, xml) {
    if (err)
      return callback(err);

    var c = Captcha.fromXml(xml);
    return c instanceof Error
      ? callback(c)
      : callback(null, c);
  });
};

/**
 * Checks whether @value is the correct answer to @captcha. Note that each CAPTCHA ID
 * can only be checked once, all further checks will always fail (regardless of @value).
 * http://api.yandex.ru/cleanweb/doc/dg/concepts/check-captcha.xml
 *
 * @param  {Object|String} captcha  Result of `getCaptcha()` or CAPTCHA ID
 * @param  {String}        value    Answer to CAPTCHA
 * @param  {Function}      callback callback(err, Boolean)
 */
CleanWeb.prototype.checkCaptcha = function (captcha, value, callback) {
  callback = misc.cbify(callback);
  var qs = {
    key     : this.apiKey,
    captcha : captcha.id,
    value   : value
  };

  tools.http.getXml(URLS['check-captcha'], qs, function (err, xml) {
    return err
      ? callback(err)
      : callback(null, xml['check-captcha-result'].hasOwnProperty('ok'));
  });
};

module.exports = CleanWeb;
