(function(exports){
	exports.polling = (function(){
		//check will be executed every few ms. when check returns true, then action will be called with one argument true. If timeout in miliseconds occurs, the acction will be called with false argument.
		var atasks = [];
		var intervalid = null;
		var getID = (function(){
			var nCounter = 1;
			return function(){
				return nCounter++;
			};
		})();
		var start = function(){
			intervalid = window.setInterval(dotasks, 100);
		};
		var stop = function(){
			window.clearInterval(intervalid);
			intervalid = null;
		};
		var dotasks = function(){
			var i, todelete=[];
			for (i = 0; i < atasks.length; i++) {
				var now = (new Date()).getTime();
				if (atasks[i].check()){
					atasks[i].action(true);
					todelete.push(atasks[i].id);
				}
				else if (now > atasks[i].timeout){
					atasks[i].action(false);
					todelete.push(atasks[i].id);
				}
			}
			deletetasks(todelete);
		};
		var deletetasks = function(aids){
			var i=0;
			while (i < atasks.length) {
				if(aids.indexOf(atasks[i].id) >= 0){ //included
					atasks.splice(i,1);
				}
				else{
					i++;
				}
			}
			if (atasks.length === 0){
				stop();
			}
		};
		var inserttask = function(check, action, timeout){
			if (typeof(check) !== 'function' || typeof(action) !== 'function' || (typeof(timeout) !== 'number' && typeof(timeout) !== 'undefined')){
				console.error('bad arguments in polling');
				return false;
			}
			var otask = {};
			otask.id = getID();
			otask.check = check;
			otask.action = action;
			if(timeout > 0){
				otask.timeout = (new Date()).getTime() + timeout;
			}
			else {
				otask.timeout = Infinity;
			}
			atasks.push(otask);
			if (intervalid === null){
				start();
			}
			return otask.id;
		};
		var publicmethods = inserttask;
		publicmethods.clear = function(id){
			for (var i = atasks.length - 1; i >= 0; i--) {
				if (atasks[i].id === id){
					var remaining = atasks[i].timeout - (new Date()).getTime();
					deletetasks([id]);
					return remaining;
				}
			}
			return false;
		};
		publicmethods.remaining = function(id){
			for (var i = atasks.length - 1; i >= 0; i--) {
				if (atasks[i].id === id){
					var now = (new Date()).getTime();
					return atasks[i].timeout - now;
				}
			}
			return false;
		};
		return publicmethods;
	})();
	exports.uuid = function(){
		var s4 = function() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		};
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	};
	exports.djb2Code = function(str){
		var hash = 5381;
		var character;
		for (var i = 0; i < str.length; i++) {
			character = str.charCodeAt(i);
			hash = ((hash << 5) + hash) + character; /* hash * 33 + c */
		}
		return hash;
	};
})(typeof exports === 'undefined' ? window.oMyUtilities = {} : exports);
