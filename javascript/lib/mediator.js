(function(exports){
	var nId = 0;
	var oTopics = {}; // Storage for topics that can be broadcast or listened to

	// Subscribe to a topic, supply a callback to be executed
	// when that topic is broadcast to
	var _subscribe = function( sTopic, fn ){
		if ( !oTopics[sTopic] ){ 
			oTopics[sTopic] = [];
		}
		oTopics[sTopic].push({ 'id': nId++, context: this, callback: fn });
		return nId;
	};

	var _unsubscribe = function(numId){
		var sProp, i;
		for (sProp in oTopics){
			if (oTopics.hasOwnProperty(sProp)){
				for (i = oTopics[sProp].length - 1; i >= 0; i--) {
					if (numId === oTopics[sProp][i].id){
						return oTopics[sProp].splice(i, 1);
					}
				}
			}
		}
	};

	// Publish/broadcast an event to the rest of the application
	var _publish = function( sTopic ){
		var args, l, i;
		if ( !oTopics[sTopic] ){
			return false;
		}
		args = Array.prototype.slice.call( arguments, 1 );
		for (i = 0, l = oTopics[sTopic].length; i < l; i++ ) {
			var subscription = oTopics[sTopic][i];
			subscription.callback.apply( subscription.context, args );
		}
		return this;
	};

	/*return {
		publish: _publish,
		subscribe: _subscribe,
		unsubscribe: _unsubscribe,
		installTo: function( obj ){
			obj.subscribe = _subscribe;
			obj.publish = _publish;
		}
	};*/
	exports.publish = _publish;
	exports.subscribe = _subscribe;
	exports.unsubscribe = _unsubscribe;
	exports.installTo = function(obj){
		obj.subscribe = _subscribe;
		obj.publish = _publish;
	};
})(typeof exports === 'undefined' ? window.oMediator = {} : exports);
