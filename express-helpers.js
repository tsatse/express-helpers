﻿var log = require('npmlog');

function _merge(obj1, obj2) {
    var result = {},
        attribute;
    if(obj1) {
        for(attribute in obj1) {
            result[attribute] = obj1[attribute];
        }
    }
    if(obj2) {
        for(attribute in obj2) {
            result[attribute] = obj2[attribute];
        }
    }
    return result;
}


function simpleLogger(request, response, next) {
    log.verbose('http', '%s %s', request.method, request.url);
    log.verbose('http', 'route %s', request.route.path);
    next();
}

function renderAndSend(templatePath, requestParams) {
  return function(request, response, next) {
    function gotRequestParams(reqParams) {
      var params = {};
      params = _merge(params, request.params);
      params = _merge(params, reqParams);
      response.render(templatePath, params, function(error, renderedView) {
        if(error) {
          log.error('http', error);
          return;
        }
        response.send(renderedView);
      });
    }
    if(typeof requestParams === 'function') {
      requestParams(request, response, next, gotRequestParams);
    }
    else {
      gotRequestParams(requestParams);
    }
  };
}

function promiseThenNext(promise, resultName) {
  return function(request, response, next) {
    promise.then(function(result) {
      request[resultName] = result;
      next();
    });
  }
}

function redirect(targetPath) {
  return function(request, response, next) {
    response.redirect(targetPath);
  }
}

function responseOk(request, response, next) {
  response.sendStatus(200);
}

exports.renderAndSend = renderAndSend;
exports.simpleLogger = simpleLogger;
exports.promiseThenNext = promiseThenNext;
exports.redirect = redirect;
exports.responseOk = responseOk;
