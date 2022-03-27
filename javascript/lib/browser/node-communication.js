var oNodecom = (function(){
	var oSocket;
	var oMessageQueue = new window.oQueue(function(oMessageToSend){
		oSocket.emit('data', oMessageToSend);
	});
	var _newNodeMessage = function(oCommand){
		//console.dir(oCommand);
		if (oCommand.sCommand === 'refresh'){
			window.oBoard.clear();
			for (var i = 0; i < oCommand.aElements.length; i++) {
				window.oBoard.addElement(oCommand.aElements[i]);
			}
			window.oDom.refresh();
		}
		else if(oCommand.sCommand === 'insert'){
			window.oBoard.addElement(oCommand.oElement);
			if (oCommand.oElement.sTypeOfElement === 'control'){
				window.oDom.addControl(oCommand.oElement);
			}
			else{
				window.oDom.addMonitor(oCommand.oElement);
			}
		}
		else if(oCommand.sCommand === 'update'){
			window.oBoard.updateElement(oCommand.oModifications);
			var oElement = window.oBoard.getElementById(oCommand.oModifications.sId);
			if (oElement.sTypeOfElement === 'control'){
				window.oDom.setControl(oElement);
			}
			else{
				window.oDom.setMonitor(oElement);
			}
		}
		else if(oCommand.sCommand === 'remove'){
			window.oBoard.deleteById(oCommand.sId);
			window.oDom.deleteElement(oCommand.sId);
		}
		else if(oCommand.sCommand === 'connexion'){
			window.oDom.changeConnexionStatus(oCommand.bStatus);
			return; //dont send hash
		}
		else{
			console.log('Unknown command: '+JSON.stringify(oCommand));
		}
		sendHash();
	};
	var newInputEvent = function(oCommand){
		oMessageQueue.send(oCommand);
	};
	var connect = function connect(){
		oSocket = window.io.connect('http://'+window.location.host);
		oSocket.on('data', function (oData) {
			//console.log(data);
			_newNodeMessage(oData);
		});
	};

	var sendHash = function(){
		var aElements = window.oBoard.getElements();
		var sjsonaElements = JSON.stringify(aElements);
		//console.log(sjsonaElements);
		var nHash = window.oMyUtilities.djb2Code(sjsonaElements);
		oMessageQueue.send({'sCommand': 'hash', 'nHash': nHash});
	};
	//return the public methods
	return {
		connect: connect,
		newInputEvent: newInputEvent
	};
})();
console.log('node-communication.js loaded');
