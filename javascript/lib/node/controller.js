/**
 * File: controller.js
 * 
 * This module is responsible for sending to the browser all the files that it needs, or send an
 * http 404 error if the file requested was not found.
 * 
 * Author: Nil Sanz Bertran
 * Created on: Mar 13, 2013
 */

var url = require('url'),
	path = require('path'),
	fs = require('fs');

var aPaths = [
	'/browser',
	'/browser/img',
	'/lib',
	'/lib/browser'
];

var searchFile = function(uri){
	if (global.TestingMode && aPaths.length === 4){ //push only the first time
		aPaths.push('/testing/lib', '/testing/lib/browser', '/testing/browser');
	}
	var filename;
	for (var i = aPaths.length - 1; i >= 0; i--) {
		filename = path.join(process.cwd(), aPaths[i]+uri);
		if (fs.existsSync(filename)){
			//console.log('file: '+filename);
			return filename;
		}
	}
};

var onRequest = function(oRequest, sendResponse){
	try{
		var uri = url.parse(oRequest.url).pathname;
		if (uri === '/' || uri === ''){
			uri = global.TestingMode ? '/index-testing.html' : '/index.html' ;
		}
		if (uri.indexOf('/socket.io') !== -1) {
			return; //the socket.io module will serve the proper file
		}
		var filename = searchFile(uri);
		//console.log('uri:'+uri+' fn:'+filename);
		fs.exists(
			filename,
			function(exists) {
				if(!exists) {
					console.log("The file does not exist: " + filename);
					sendResponse(404, 'txt', 'Error 404. File not found\n');
					return;
				}
				var sMimeType = path.extname(filename).split(".")[1]; //get the extension of the file
				var onReadFile = function(err, bufContent){
					if (err){
						throw err;
					}
					sendResponse(200, sMimeType, bufContent);
				};
				fs.readFile(filename, onReadFile);
			}
		);
	}
	catch(err){
		console.log(err.name+'|'+err.message);
		return false;
	}
};

exports.onRequest = onRequest;