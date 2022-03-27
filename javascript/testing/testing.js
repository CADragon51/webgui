/**
 * This module is loaded by the webgui server if the Testing Mode is enabled.
 * It listens 8134 socket.io port to communicate with the webgui browser
 * application and it connects to 8124 tcp port of the webgui server to fake an
 * arduino connection.
 */

var app = require('http').createServer(handler);
var io = require('socket.io').listen(app, {log: true});
var net = require('net');

var tcpclient, browsersocket;

var handler = function handler (req, res) { //if an http connection occurs
	res.writeHead(200);
	res.end('You should use this server from the webgui browser aplication using socket.io');
};

var connectToTCPServer = function connectToTCPServer(nPort){
	var reconnect = (function(){
		var timeoutsetted = false;
		var _run = function(){
			if (!timeoutsetted){
				setTimeout(function(){
					connectToTCPServer(nPort);
					timeoutsetted = false;
				}, 2000);
				timeoutsetted = true;
			}
		};
		return _run;
	})();
	tcpclient = net.connect({port: nPort}, function() { //'connect' listener
		console.log('connected to tcp server in port '+nPort);
	});
	tcpclient.on('data', function(oData) { //everything that tcp server sends, forward to the browser
		var sData = oData.toString();
		console.log('from tcp server: '+JSON.stringify(sData));
		if (browsersocket){
			browsersocket.emit('data', {'data': sData});
		}
	});
	tcpclient.on('end', function() {
		console.log('disconnected from tcp server');
	});
	tcpclient.on('close', function() {
		console.log('The connection was closed from the tcp server. Trying to reconnect');
		reconnect();
	});
	tcpclient.on('error', function() {
		console.log('It could not connect to tcp server on port '+nPort+'. Trying to reconnect');
		reconnect();
	});
};

var listenHTTP = function(){
	app.listen(8134); //"virtual socket" server
};

var listenToBrowser = function(){
	io.sockets.on('connection', function (socket) {
		browsersocket = socket;
		socket.on('data', function (oData) { //everything that browser sends, forward to the tcp webgui server
			console.log('from browser: '+oData.data);
			tcpclient.write(oData.data);
		});
	});
};

var start = function(nTcpPort){
	connectToTCPServer(nTcpPort);
	listenHTTP();
	listenToBrowser();
};

exports.start = start;
