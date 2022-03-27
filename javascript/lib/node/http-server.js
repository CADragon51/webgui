/**
 * File: http-server.js
 * 
 * This module provides you with an http server. It uses the http official module and the controller module.
 * 
 * Author: Nil Sanz Bertran
 * Created on: Mar 13, 2013
 */


var http = require('http');
var controller = require('./controller.js');

/**
 * This object maps the file extensions with the Multipurpose Internet Mail Extensions used in the HTTP
 * protocol.
 */
var oMimeTypes = {
	"txt": "text/plain",
	"html": "text/html",
	"jpeg": "image/jpeg",
	"jpg": "image/jpeg",
	"png": "image/png",
	"js": "text/javascript",
	"css": "text/css",
	"ttf": "font/opentype"
};
var oHTTPServer = {};
exports.oServer = oHTTPServer;

/**
 * This function creates a new http server and starts it using the http port provided in the first
 * parameter.
 * @param  {number} nPort      The http port that the http server listens to.
 * @param  {function} fnCallback The function that will be executed after the creation of the http server.
 */
var start = function(nPort, fnCallback){
	oHTTPServer = http.createServer(function(oRequest, oResponse) { //try new http.Server to indicate that a new object is defined so the reference oServer must be updated.
		//call the controller in order to send the browser the proper file.
		var sendResponse = function(nStatusCode, sContentType, bufContent){
			oResponse.writeHead(nStatusCode, {'Content-Type': oMimeTypes[sContentType]});
			oResponse.end(bufContent);
		};
		controller.onRequest(oRequest, sendResponse);
	});
	exports.oServer = oHTTPServer; //update the reference since a new object has been created
	oHTTPServer.listen(nPort, function(){
		console.log('HTTP server listening on port '+nPort);
		fnCallback();
	});
};

exports.start = start;
