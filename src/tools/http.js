var request = require('request');
var async   = require('async');
var xml2js  = require('xml2js').parseString;
var misc    = require('./misc');

function performRequest (options, callback) {
  callback = misc.cbify(callback);
  return request(options, function (err, response, data) {
    err = err || (200 !== response.statusCode ? misc.httpError(response.statusCode) : null);
    callback(err, data);
  });
}

function getBuffer (uri, callback) {
  var options = {
    uri      : uri,
    method   : 'GET',
    encoding : null
  };

  return performRequest(options, callback);
}

function getXml (uri, qs, callback) {
  if (qs instanceof Function) {
    callback = qs;
    qs = undefined;
  }

  var getFn = performRequest.bind(null, {
    uri    : uri,
    method : 'GET',
    qs     : qs
  });

  callback = misc.cbify(callback);
  return async.waterfall([getFn, xml2js], callback);
}

module.exports = {
  request   : performRequest,
  getBuffer : getBuffer,
  getXml    : getXml
};
