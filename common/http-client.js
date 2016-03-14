'use strict';

var http    = require('http');
var request = require('request');
var URL     = require('url');
var Q       = require('q');
var _       = require('underscore');

exports.httpClient = function(url, parmas, method, certificate, callback) {

    var parmas      = parmas ? parmas : {};

    var options     = {
        url: typeof(url) == 'object' ? URL.format(url) : url,
        method: method.toUpperCase()
    };

    if (parmas.contentType  == 'xml') {
        options.headers = {
            'Content-Type': 'text/xml',
            'accept': 'text/xml'
        };

        options.body = parmas.content;
    } else {
        options.headers = {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        };

        options.json = parmas;
    }


    if(certificate){
        var auth = null;

        if (certificate.type && certificate.token) {
            auth = certificate.type +' ' + certificate.token;
        } else {
            auth = 'Basic ' + new Buffer(certificate.username + ':' + certificate.password).toString('base64');
        }

        options.headers['Authorization']    = auth;
    }

    request(options, function(error, response, body) {

        var deferred    = Q.defer();

        if (error) {
            deferred.reject(error);             
            return callback ? deferred.promise.nodeify(callback) : deferred.promise;
        }

        try {               
            var info = _.isString(body) ? JSON.parse(body) : body;

            if (info.message && info.message.indexOf('Invalid access token') != -1) {
                var theError    = {error: true, message: info.message, data: null};

                deferred.reject(theError);       
                return callback ? deferred.promise.nodeify(callback) : deferred.promise;
            }

            deferred.resolve(info);     
            return callback ? deferred.promise.nodeify(callback) : deferred.promise;
        } catch(e) {

            if (body && body.message && body.message.indexOf('Invalid access token') != -1) {
                var theError    = {error: true, message: body.message, data: null};

                deferred.reject(theError); 
                return callback ? deferred.promise.nodeify(callback) : deferred.promise;
            }

            deferred.resolve(body);     
            return callback ? deferred.promise.nodeify(callback) : deferred.promise;
        }
        
    });
}
