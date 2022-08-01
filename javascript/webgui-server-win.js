/**
 * File: webgui-server.js
 * 
 * This is the main file of the webgui server.
 * Webgui is a framework to provide an arduino wifi with a graphic user interface in the web browser.
 * This graphic user interface allows the user to communicate directly with the arduino using a set
 * of monitors and controls to view and send data from / to arduino.
 * This framework consists in an arduino library and a node server that provides a webapp to the browser.
 * This server communicates to the arduino using TCP port 8124 but it can be changed using a parameter
 * option. The server serves the web using HTTP port 80 (default http port), and it can be changed too.
 * The server communicates to the browser using websockets so that a recent browser should be used.
 * Internet Explorer 9.0 or lower does not support websockets. See a list of supported browsers in
 * caniuse website: http://caniuse.com/#search=websockets
 * To run this server execute "node webgui.js". Use "--help" parameter to see a list of available options.
 * Node must be installed to run this server. View README.html to see the instructions to install node to
 * your computer.
 *
 * Author: Nil Sanz Bertran
 * Created on: Mar 13, 2013
 */

/**
 * This variables are the references to the modules used in the server. The modules are in the lib folder.
 */
var httpServer = require('./lib/node/http-server.js');
var arduino = require('./lib/node/windows-communication.js');
var browser = require('./lib/node/browser-win-communication.js');

/**
 * This is the configuration object. It defines the default port for tcp communication with arduino and
 * the default http port where the web is served.
 * @type {Object}
 */
var oConfig = {
	tcpPort: 18124,
	httpPort: 80
};



/**
 * This autoexecutable function controls the parameters provided by the command line. It modifies the ports
 * if they are defined as an option and shows the help page if --help option was used.
 */
(function config(){
	//example: node webgui-server.js --tcp 16482 --http 8000 --testing
	if (process.argv.length > 2){ //it has arguments
		var narg=2;
		while(process.argv[narg]){
			if (process.argv[narg] === '--tcp'){
				narg++;
				if (!process.argv[narg] || /^[0-9]+$/.test(process.argv[narg]) === false || parseInt(process.argv[narg], 10) > 65535){
					console.log('The TCP port is not a valid port');
					process.exit(1);
				}
				oConfig.tcpPort = parseInt(process.argv[narg], 10);
				narg++;
			}
			else if (process.argv[narg] === '--http'){
				narg++;
				if (!process.argv[narg] || /^[0-9]+$/.test(process.argv[narg]) === false || parseInt(process.argv[narg], 10) > 65535){
					console.log('The HTTP port is not a valid port');
					process.exit(1);
				}
				oConfig.httpPort = parseInt(process.argv[narg], 10);
				narg++;
			}
			else if (process.argv[narg] === '--help'){
				var sOut = '';
				sOut += 'Webgui server communicates the arduino with the Web Graphical User Interface in the browser.\nThe list of options are:\n';
				sOut += '\t--tcp PORT: specify a tcp port used in the communication with arduino. 8124 is used if not specified.\n';
				sOut += '\t--http PORT: specify the http port server listens to. Default port is 80\n';
				sOut += '\t--testing: Use this option if you want to test the code of the server. This should be used for testing purposes only, never in a production environment.\n';
				console.log(sOut);
				process.exit(1);
			}
			else if (process.argv[narg] === '--testing'){
				global.TestingMode = true;
				console.log('Testing Mode enabled');
				narg++;
			}
			else {
				console.log('Invalid argument. Use --help option to see the list of valid arguments.');
				process.exit(1);
			}
		}
	}
})();

/**
 * The server is started. First the http server is created. A function that loads the browser communication
 * is executed as a callback.
 * The port numbers are provided as arguments to the modules.
 */
httpServer.start(oConfig.httpPort, function(){
	browser.start();
});


arduino.start(oConfig.tcpPort);

if (global.TestingMode){
	var testing = require('./testing/testing.js');
	testing.start(oConfig.tcpPort);
}

