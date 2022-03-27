(function adapter(){
	var alertFallback = false;
	if (typeof console === "undefined" || typeof console.log === "undefined") {
		console = {};
		if (alertFallback) {
			console.log = function(msg) {
				alert(msg);
			};
			console.dir = function(){};
			console.error = function(){};
		} else {
			console.log = function() {};
			console.dir = function(){};
			console.error = function(){};
		}
	}
})();
