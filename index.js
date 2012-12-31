var fs = require('fs');
var path = require('path');
var request = require('request');
var misc = require('./lib/misc');

var error = misc.errorFn('ECLEANWEB');

/**
 * Currently only holds your API Key.
 * @param {String} apiKey API Key (get one here http://api.yandex.ru/cleanweb/form.xml)
 */
function CleanWeb (apiKey) {
  // TODO:
  // Check API Key format.
  if (typeof apiKey != 'string')
    throw CleanWeb.errors.apiKey('Provided API Key must be string; got `%s` instead', typeof apiKey);

  this.apiKey = apiKey;
}

CleanWeb.prototype.request = function (options, callback) {
  callback = misc.cbify(callback);

  request(options, function (err, response, body) {
    err = err || (response.statusCode !== 200 ? misc.httpError(response.statusCode) : null);
    if (err) {
      console.error('CleanWeb.prototype.request() failed: %s', err);
      return callback(err);
    }

    callback(null, body);
  });
};

CleanWeb.prototype.requestOptions = function (method, params) {
  if (('get-captcha' !== method) && ('check-captcha' !== method))
    throw CleanWeb.errors.invalidMethod('Invalid method `%s`', method);

  params     = params || {};
  params.key = params.apiKey || params.key || this.apiKey;
  var options = {
    url    : CleanWeb.URLS[method],
    method : 'GET',
    qs     : params
  };

  return options;
};

/**
 * Queries CleanWeb for CAPTCHA.
 * http://api.yandex.ru/cleanweb/doc/dg/concepts/get-captcha.xml
 *
 * Passing @id is ok, but you should get it from somewhere else,
 * since `check-spam` is not currently supported.
 *
 * Callback will be called with `captcha` Object of following format:
 * { captcha : String,  // CAPTCHA ID
 *   url     : String   // URL to related CAPTCHA image
 * }
 *
 * @param  {String}   id       TODO
 * @param  {Function} callback callbkack(err, captcha)
 */
CleanWeb.prototype.getCaptcha = function (id, callback) {
  if (typeof id == 'function') {
    callback = id;
    id = null;
  }

  callback    = misc.cbify(callback);
  var options = this.requestOptions('get-captcha', id ? {id: id} : {});

  this.request(options, function (err, xmlBody) {
    if (err)
      return callback(err);

    // TODO:
    // RegExp feels so wrong here...
    // Parsing should probably be happening inside CleanWeb.prototype.request().
    var ret = /.*<captcha>(.*)<\/captcha>.*<url>(.*)<\/url>.*/.exec(xmlBody);
    callback(null, {
      captcha : ret[1],  // captcha id
      url     : ret[2]   // image url
    });
  });
};

/**
 * Checks whether @value is the correct answer to @captcha. Note that each CAPTCHA ID
 * can only be checked once, all further checks will always fail (regardless of @value).
 * http://api.yandex.ru/cleanweb/doc/dg/concepts/check-captcha.xml
 *
 * Passing @id is ok, but you should get it from somewhere else,
 * since `check-spam` is not currently supported.
 *
 * @param  {Object|String} captcha  Result of `getCaptcha()` or CAPTCHA ID
 * @param  {String}        value    Answer to CAPTCHA
 * @param  {Function}      callback callback(err, Boolean)
 */
CleanWeb.prototype.checkCaptcha = function (captcha, value, id, callback) {
  if (typeof id == 'function') {
    callback = id;
    id = null;
  }

  var captchaId = (typeof captcha == 'string') ? captcha
                                               : captcha.captcha;
  callback = misc.cbify(callback);
  var params = {
    captcha : captchaId,
    value   : value
  };

  if (id)
    params.id = id;

  var options = this.requestOptions('check-captcha', params);
  this.request(options, function (err, xmlBody) {
    if (err)
      return callback(err);

    // TODO:
    // Very strange result detection...
    // Parsing should probably be happening inside CleanWeb.prototype.request().
    callback(null, -1 === xmlBody.indexOf('failed'));
  });
};

CleanWeb.NAME         = 'Yandex.CleanWeb';
CleanWeb.VERSION      = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version;
CleanWeb.API_VERSION  = '1.0';
CleanWeb.API_BASE_URL = 'http://cleanweb-api.yandex.ru/' + CleanWeb.API_VERSION + '/';
CleanWeb.URLS = {
  'get-captcha'   : CleanWeb.API_BASE_URL + 'get-captcha',
  'check-captcha' : CleanWeb.API_BASE_URL + 'check-captcha'
};

CleanWeb.errors = {
  apiKey        : misc.errorFn('ECLEANWEB_INVALID_API_KEY'),
  invalidMethod : misc.errorFn('ECLEANWEB_INVALID_METHOD')
};

module.exports = CleanWeb;
