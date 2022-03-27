(function(mode){
	/**
	 * File: queue.js
	 * 
	 * This module returns a constructor function that creates an object to handle a queue that is used
	 * to send messages through a socket or whatever user desires.
	 * 
	 * Author: Nil Sanz Bertran
	 * Created on: Mar 13, 2013
	 */

	/**
	 * Queue is the constructor returned by the module.
	 * @param {function} fnSendMessage is a function that sends the stored messages in the queue.
	 * This function is called with the message as the first argument. If the function returns true,
	 * it means that the message could be delivered and the stored message in the queue is deleted.
	 * If the function returns false, it means that the message could not be delivered.
	 * @return {object} the returned object has some methods explained below.
	 */
	var Queue = function Queue(fnSendMessage){ //constructor
		var _aQueuedMessages = [];

		var _sendQueuedMessages = function (){
			var oMsg, nCount = 0;
			while (_aQueuedMessages.length > 0){
				oMsg = _aQueuedMessages[0];
				if (fnSendMessage(oMsg) === false){ //if the message could not be sent
					return nCount;
				}
				++nCount;
				_aQueuedMessages.splice(0,1); //remove the first message
			}
			return nCount;
		};
		/**
		 * send function stores the message in the queue. Then, it tries to send all the messages
		 * in the queue.
		 * @param  {object} oMessage is the message that is going to stored in the queue and sent.
		 * @return {number}          The number of message that were stored in the queue and could
		 * be delivered to its destination.
		 */
		var send = function(oMessage){
			if (typeof(oMessage) !== 'undefined'){
				_aQueuedMessages.push(oMessage);
			}
			return _sendQueuedMessages();
		};
		/**
		 * @return {number} the number of messages that queue actually contains.
		 */
		var getLength = function(){
			return _aQueuedMessages.length;
		};
		/**
		 * This function deletes all the messages in the queue so that they will not be delivered.
		 */
		var reset = function(){
			_aQueuedMessages = [];
		};
		return {
			send: send,
			getLength: getLength,
			reset: reset
		};
	};

	/**
	 * The return value of the module is not an object but it is a function so that the 'module'
	 * object must be used
	 */
	//exports.Queue = Queue;
	if (mode === 'node'){ //node server
		module.exports = Queue;
	}else{ //browser
		mode.oQueue = Queue;
	}
})((typeof module === 'undefined' || typeof module.exports === 'undefined') ? window : "node");
