'use strict';

var http    = require('http');
var request = require('request');
var URL     = require('url');

exports.httpClient = function(url, parmas, method, certificate, callback) {

    var parmas     = parmas ? parmas : {};
    var options = {
        url: typeof(url) == 'object' ? URL.format(url) : url,
        method: method.toUpperCase(),
        json: parmas,
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        }
    };

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

        if (!error) {
            try {               
                var info = JSON.parse(body);

                if (info.message.indexOf('Invalid access token') != -1) {
                    return callback({error: true, message: info.message, data: null}, null);
                }

                return callback(null,info);
            } catch(e) {

                if (body && body.message && body.message.indexOf('Invalid access token') != -1) {
                    return callback({error: true, message: body.message, data: 4000}, null);
                }

                return callback(null,body);
            }
        }


        return callback(error,null);
    });
}
