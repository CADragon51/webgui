/**
 * File: browser-communication.js
 * 
 * This module allows the communication between the browser and the server using socket.io module.
 * The communication protocol between the browser and the server uses objects.
 * It uses the queue module to store and send the outcome messages, the socket.io module that uses
 * websockets if the browser support that or other alternatives like continuous http requests if
 * websocket is not available in the browser.
 * 
 * Author: Nil Sanz Bertran
 * Created on: Mar 13, 2013
 */

/**
 * Load the modules
 */
var httpServer = require('./http-server.js');
var io = require('socket.io');
var arduino = require('./windows-communication');
var board = require('../board.js');
var myutilities = require('../myutilities.js');

var oVirtualServer = null;
var aBrowsers = [];

var Browser = function(oSocket){
	this.sId = myutilities.uuid();
	this.oSocket = oSocket;
	this.fnSend = function(oMessageToSend){
//		console.log('Sending to '+this.sId+ ': '+JSON.stringify(oMessageToSend));
		this.oSocket.emit('data', oMessageToSend);
	};
};

var oHashHistory = {'nHash': null, 'idTimeout': null};


/**
 * This function receives an object and sends that object to all the browsers through the socket.io.
 * @param  {object} oMessage is the message that it is going to send to all the browsers.
 */
var _broadcast = function (oMessage, asIdsExceptions) {
//	if(JSON.stringify(oMessage).indexOf("update")<0 && JSON.stringify(oMessage).indexOf("connexion")<0)
//	console.log('This message is going to be sent: '+JSON.stringify(oMessage));
	try{
		asIdsExceptions = asIdsExceptions || [];
		aBrowsers.forEach(function(elementOBrowser){
			for (var i = 0; i < asIdsExceptions.length; i++) {
				if (asIdsExceptions[i] === elementOBrowser.sId){
					return;
				}
			}
			elementOBrowser.fnSend(oMessage);
		});
		return true;
	}
	catch(err){
		console.log(err.name+'|'+err.message);
		return false;
	}
};

/**
 * start is a function that creates and starts the socket.io sever and defines the basic events of the
 *  connection.
 */
var start = function(){
	try{
		oVirtualServer = io(httpServer.oServer, {log: true});
		oVirtualServer.sockets.on('connection', function (socket) {
			console.log('Connection with new browser established.');
			var oBrowser = new Browser(socket);
			aBrowsers.push(oBrowser);
			oBrowser.fnSend({'sCommand': 'refresh', 'aElements': board.getElements()}); //send all elements
			oBrowser.oSocket.on('data', function (data) {
				//console.log('Message from the browser: ');
				//console.dir(data);
				_onNewMessage(data, oBrowser);
			});
			oBrowser.oSocket.on('disconnect', function () {
				console.log('Lost connection with the browser '+oBrowser.sId);
				for (var i = 0; i < aBrowsers.length; i++) { //remove from list
					if (aBrowsers[i].sId === oBrowser.sId){
						return aBrowsers.splice(i, 1);
					}
				}
			});
		});
	}catch(err){
		console.log(err.name+'|'+err.message);
	}
};

var _onNewMessage = function(oData, oBrowser){
	try{
		if (oData.sCommand === 'event') {
			var oControl = board.getElementById(oData.sId);
			var sArduinoCommand = 'ACTION:'+oData.sId+',';
			var oMods = null;
//		console.log('From browser: '+JSON.stringify(oData));
//		console.log('From browser: '+JSON.stringify(oControl.sType));
			if (oControl.sType === "switches"){
				if (oData.value.length !== oControl.value.length){
					throw new Error('The number of switches is not correct.');
				}
				sArduinoCommand += oData.value.join().replace(/true/g, 'on').replace(/false/g, 'off').replace(/\,/g, '|');
				oMods = {'sId': oData.sId, 'value': oData.value};
			}
			else if(oControl.sType === "string"){
				sArduinoCommand += '`'+oData.value.replace(/\`/g, "'")+'`';
				oMods = {'sId': oData.sId, 'value': oData.value.replace(/\`/g, "'")};
			}
			else if(oControl.sType === "analog"){//range
				if (oData.value < oControl.nMin || oData.value > oControl.nMax){
					throw new RangeError('Analog control out of bounds.');
				}
				sArduinoCommand += ''+oData.value;
				oMods = {'sId': oData.sId, 'value': oData.value};
			}
			else if(oControl.sType === "options"){
				if (oData.sWitch >= oControl.asOptions.length){
					throw new Error('Options control incorrect value.');
				}
				sArduinoCommand += ''+oData.sWitch;
				oMods = {'sId': oData.sId, 'value': ''+oData.sWitch};
	//			console.log(oData.sWitch);
			}
			else if(oControl.sType === "buttons"){
				sArduinoCommand += oData.sWitch;
				if (oData.sType){
					sArduinoCommand += ','+oData.sType;
				}
	//	arduino.send(sArduinoCommand+'\n');
	//	console.log('arduino browser: '+JSON.stringify(sArduinoCommand));
	//	return true;
			}
			else{
				throw new Error('Unknown type of control '+JSON.stringify(oControl.sType));
			}
			if (oMods !== null){
				board.updateElement(oMods);
				_broadcast({'sCommand': 'update', 'oModifications': oMods}, [oBrowser.sId]);
			}
			//console.log('Message to arduino: '+JSON.stringify(sArduinoCommand+'\n'));
			if(sArduinoCommand.length<10000)
				arduino.send(sArduinoCommand+'\n');
			else
			{
				arduino.send(sArduinoCommand.substring(0,10000)+'\n');
				arduino.send(sArduinoCommand.substring(10000,20000)+'\n');
				if(sArduinoCommand.length>20000)
				arduino.send(sArduinoCommand.substring(20000,30000)+'\n');
				if(sArduinoCommand.length>30000)
				arduino.send(sArduinoCommand.substring(30000,40000)+'\n');
				if(sArduinoCommand.length>40000)
				arduino.send(sArduinoCommand.substring(40000,50000)+'\n');
				if(sArduinoCommand.length>50000)
				arduino.send(sArduinoCommand.substring(50000,60000)+'\n');
				if(sArduinoCommand.length>60000)
				arduino.send(sArduinoCommand.substring(60000)+'\n');
			}
			return true;
		}
		else if (oData.sCommand === 'hash'){
			var aElements = board.getElements();
			var sjsonaElements = JSON.stringify(aElements);
			var nHash = myutilities.djb2Code(sjsonaElements);
			if (nHash === oData.nHash){
				//console.log('equal');
				oHashHistory.nHash = null;
				if (oHashHistory.idTimeout !== null){
					clearTimeout(oHashHistory.idTimeout);
					oHashHistory.idTimeout = null;
				}
			}
			else { //Diferent hash. In less than 6 sec the hash should be received
				if (oHashHistory.idTimeout !== null){ //waiting for a hash
					//console.log('diferent and waiting');
					if (oData.nHash === oHashHistory.nHash) { //if it is the hash server was waiting for
						clearTimeout(oHashHistory.idTimeout);
						oHashHistory.nHash = nHash; //wait for the actual hash
						oHashHistory.idTimeout = setTimeout(function(){
							console.log('The hash did not arrive');
							oBrowser.fnSend({'sCommand': 'refresh', 'aElements': board.getElements()});
						}, 6000);
						return true;
					}
					else { //another hash received
						return true;
					}
				}
				else { //diferent and not waiting
					//console.log('diferent and not waiting:');
					//console.log(sjsonaElements);
					oHashHistory.nHash = nHash; //wait for the actual hash
					oHashHistory.idTimeout = setTimeout(function(){
						console.log('The hash did not arrive (2)');
						oBrowser.fnSend({'sCommand': 'refresh', 'aElements': board.getElements()});
					}, 6000);
					return true;
				}
			}
		}
		else {
			throw new Error('sCommand is neither event nor hash');
		}
	}catch(err){
		console.log(err.name+'|...'+err.message);
		try{
			oBrowser.fnSend({'sCommand': 'refresh', 'aElements': board.getElements()});
		}catch(err){
			console.log(err.name+'|..'+err.message);
		}
		return false;
	}
};

exports.start = start;
exports.send = _broadcast;
