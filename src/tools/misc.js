var util = require('util');
var http = require('http');

/**
 * Creates new error with given @name and @message. @message is format string for `util.format`
 * and can be followed by arbitrary number of arguments.
 *
 * @param  {String}   name    Name of error (like 'ENOENT')
 * @param  {String}   message Short and meaningful error message (like 'File `%s` Not Found'),
 * @param  {Anything} other   Any number of optional arguments (like file's path) for @message
 *                            (which is format string for `util.format`)
 * @return {Error}            Instance of Error
 */
function error (name, message/*, other...*/) {
  var e = new Error(util.format.apply(null, Array.prototype.slice.call(arguments, 1)));
  e.name = name;
  return e;
}

/**
 * Same as `error` except @name is already defined. Useful for modules:
 *   error = require('misc').errorFn('EMYMODULE');
 *
 * @param  {String}   name Name of error (like 'EMYMODULE')
 * @return {Function}      error(message)
 */
function errorFn (name) {
  return error.bind(null, name);
}

/**
 * Returns HTTP error created by `error` with `message` based on @statusCode passed.
 * @param  {Number} statusCode HTTP Status Code
 * @return {Error}             Instance of Error with 'EHTTP' as `error.name`
 */
function httpError (statusCode) {
  return error('EHTTP', '%d %s', statusCode, http.STATUS_CODES[statusCode]);
}

/**
 * No operation.
 * @return {undefined}
 */
function noop () {}

/**
 * Returns `noop`, if @cb is not callable and @cb otherwise.
 * Useful in async function with optional callback:
 *   function someAsyncOperation(callback) {
 *     callback = require('misc').cbify(callback);
 *     // Do your thing...
 *   }
 *
 * @param  {Anything} cb
 * @return {Function}    @cb or noop, if @cb isn't callable
 */
function cbify (cb) {
  return (cb instanceof Function) ? cb
                                  : noop;
}

module.exports = {
  error     : error,
  errorFn   : errorFn,
  httpError : httpError,

  noop  : noop,
  cbify : cbify
};
