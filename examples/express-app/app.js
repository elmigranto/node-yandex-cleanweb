var http = require('http');
var util = require('util');
var express = require('express');
var CleanWeb = require('yandex-cleanweb');

var app    = express();
var server = http.createServer(app);

/**
 * Please fill in your API Key.
 * (You can get one here http://api.yandex.ru/cleanweb/form.xml)
 *
 * @type {String}
 */
var CLEAN_WEB_API_KEY = 'cw.1.1.20121230T024634Z.254306776b1f4614.3b2338f9577bd95ebbed3fca345d804fd2d2bc2b';
var cleanWeb = new CleanWeb(CLEAN_WEB_API_KEY);

app.configure(function () {
  var isDev = 'development' === app.get('env');

  // App options
  app.set('port', process.env.PORT || 5000);
  app.set('host', process.env.HOST || 'localhost');
  app.set('isDev', isDev);
  app.set('view engine', 'jade');
  app.set('views',  __dirname);

  // Setup jade
  app.locals({
    self         : true,
    layout       : false,
    pretty       : isDev,
    compileDebug : isDev
  });

  app.locals.fn = {
    util: util
  };

  // Handlers
  app.use(express.favicon());
  if (isDev) app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.session({secret: 'This is not the secret you\'re looking for…'}));
  app.use(express.bodyParser());
  if (isDev) app.use(express.errorHandler());
});

app.all('/', function (req, res, next) {
  var renderFn = res.render.bind(res, 'index');

  if ('GET' === req.method) {
    cleanWeb.getCaptcha(function (err, captcha) {
      if (err)
        console.error('Failed obtaining captcha: %s', err);
      else
        req.session.captcha = captcha;

      renderFn({
        error   : err,
        captcha : captcha
      });
    });

    return;
  }

  if ('POST' === req.method) {
    var answer = req.body.hasOwnProperty('answer') ? req.body.answer
                                                   : null;
    var captcha = req.session.captcha ? req.session.captcha
                                      : null;
    if ( !(answer && captcha)) {
      console.log('POST / has no body or captcha wasn\'t saved in `req.session`.');
      return res.redirect('/');
    }

    cleanWeb.checkCaptcha(captcha, answer, function (err, valid) {
      if (err)
        console.error('Error validating captcha: %s', err);

      renderFn({
        error   : err,
        captcha : captcha,
        result  : valid
      });
    });

    return;
  }

  return next();
});

server.listen(app.get('port'), function () {
  console.log('Express listening at `%s:%d` in `%s` mode',
              app.get('host'), app.get('port'), app.get('env'));
});

module.exports = {
  app    : app,
  server : server
};
