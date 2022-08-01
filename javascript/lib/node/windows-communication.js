/**
 * File: arduino-communication.js
 * 
 * This module provides webgui with a set of methods that handles the communication between the server
 * and the arduino through the tcp connection.
 * 
 * Author: Nil Sanz Bertran
 * Created on: Mar 13, 2013
 */

var net = require('net'); //for tcp connections
var board = require('../board.js');
var Queue = require('../queue.js');
var browser = require('./browser-communication.js');
const datagram = require("dgram");
/**
 * This object is used to send and receive data through the tcp connection.
 */
var oSocket;
var oQueue = new Queue(function(sMessageToSend){
	if (oSocket.writable){
		return oSocket.write(sMessageToSend);
	}
	return false;
});

/**
 * All the data received from the arduino, is stored in the sStream variable.
 * One command may be splitted in more than one paquets or one paquet may contain some commands.
 * For this reason it is necessary to store the data received and analize it since one or more whole
 * commands are available to read.
 * @type {String}
 */
var sStream = '';
function udpconnect() {
const message = Buffer.from('web gui IP:');
const client = datagram.createSocket('udp4');
client.connect(6123, '192.168.1.177', (err) => {
 client.send(message, (err) => {
 client.close();
 });
});
}
/**
 * This function creates the tcp server that is going to establish connection with the arduino.
 * @param {number} nPort is the tcp port that the server is going to listen to.
 */
var start = function(nPort){
	//create tcp server. arduino
	var oTCPServer = net.createServer(function(c) { //'connection' listener
		oSocket = c;
		oQueue.send(); //send queued messages
		oSocket.on('connect', function(){
			console.log('A client connected to TCP server');
			//oSocket.write('Welcome to WEBGUI TCP server\n');
			sStream = '';
			browser.send({sCommand: 'connexion', bStatus: true});
		});
		oSocket.on('end', function() {
			console.log('Client disconnected from TCP server');
			sStream = '';
			browser.send({sCommand: 'connexion', bStatus: false});
		});
		oSocket.on('data', function(data){
			//console.log('client: '+JSON.stringify(data.toString()));
			onNewMessage(data.toString());
			browser.send({sCommand: 'connexion', bStatus: true});
		});
		oSocket.on('timeout', function(){
			console.log('tcp client disconnected due to timeout');
			browser.send({sCommand: 'connexion', bStatus: false});
		});
		oSocket.on('drain', function(){
			//console.log('Write buffer to tcp client became empty');
		});
		oSocket.on('error', function(){
			console.log('An error occurred about tcp connection');
			sStream = '';
			browser.send({sCommand: 'connexion', bStatus: false});
		});
		oSocket.on('close', function(){
			console.log('tcp connection became fully closed.');
			sStream = '';
			browser.send({sCommand: 'connexion', bStatus: false});
		});
	});
//	setInterval(udpconnect, 1500);
	oTCPServer.listen(nPort, function() { //'listening' listener
		console.log('TCP server listening on port '+nPort);
	});
};

/**
 * This function receives a message and sends it to the outcome queue in order to arduino receives
 * the message.
 * @param {string} sMessage is the message that is going to be sent to arduino.
 */
var send = function(sMessage){
	oQueue.send(sMessage);
};

/**
 * This function is executed every time the tcp server receives data from arduino. This function stores
 * the data in the sStream variable and analize it in oreder to find possible commanmds. If a command is
 * found, newCommand function is called. It must be analized in syntax to assure it is a
 * correct command.
 * @param {string} sData is the data that server receives.
 */
var longopt="options,`[Racktom 1]`,`[Racktom 2]`,`[Racktom 2]`,`[Floortom 1]`,`[Floortom 1]`,`[Snare]`,`hatsTrig`,`hatsTipTrig`,`hatsTipTrig`,`Closed Pedal`,`Closed`,`Open 1`,`Open 1`,`Open 2`,`Open 2`,`Open 3`,`Open 3`,`hatsTrig`,`hatsTipTrig`,`hatsTipTrig`,`Closed Pedal`,`Closed`,`Open Pedal`,`Open 1`,`Open 2`,`Open 3`,`[Crash A]`,`[Crash A]`,`[Crash A]`,`[Crash B]`,`[Crash B]`,`Metronome Click`,`Metronome Bell`,`Acoustic Bass Drum`,`Bass Drum 1`,`Side Stick`,`Acoustic Snare`,`Hand Clap`,`Electric Snare`,`Low Floor Tom`,`Closed Hi-Hat`,`High Floor Tom`,`Pedal Hi-Hat`,`Low Tom`,`Open Hi-Hat`,`Low-Mid Tom`,`Hi-Mid Tom`,`Crash Cymbal 1`,`High Tom`,`Ride Cymbal 1`,`Chinese Cymbal`,`Ride Bell`,`Tambourine f#`,`Splash Cymbal`,`Cowbell `,`Crash Cymbal 2`,`Vibraslap x`,`Ride Cymbal 2`,`Hi Bongo`,`Low Bongo`,`Mute Hi Conga`,`Open Hi Conga`,`Low Conga`,`High Timbale`,`Low Timbale`,`High Agogo`,`Low Agogo`,`Cabasa `,`Maracas `,`Short Whistle`,`Long Whistle`,`Short Guiro`,`Long Guiro`,`Claves `,`Hi Wood Block`,`Low Wood Block`,`Mute Cuica`,`Open Cuica`,`Mute Triangle`,`Open Triangle`,`Flams`,`Crescendo`,`Left Brush Hit`,`Right Brush Hit`,`Right Brushed`,`Left Brushed`,`Slap Crescendo`,`Right Muted`,`Right Open`,`Right BassTone`,`Left Open Slap`,`Right Open Slap`,`Left Closed Slap`,`Right Closed Slap`,`Left Heel`,`Right Heel`,`Crescendo`,`Flams`,`Slap Flams`,`FX`,`c2Left Open`,`c2Right Open`,`c2Left Muted`,`c2Right Muted`,`c2Left BassTone`,`c2Right BassTone`,`c2Crescendo`,`c2Flams`,`c2FX`,`c2Left Open`,`c2Right Open`,`c2Left Muted`,`c2Right Muted`,`c2Left BassTone`,`c2Right BassTone`,`c2Crescendo`,`c2Flams`,`[Bells] Crescendo`,`[Cymbal 1] *Crescendo`,`[Waterfall] Crescendo`,`[Cymbal 2] Crescendo`,`[Crickets] Crescendo`,`[Shekere] Beat`,`[Shekere] Off Beat`,`[Shekere] On Beat`,`[Shekere] Shakings`";
var onNewMessage = function(sData){
	sStream += sData;
	var sMessage, aMsg;
	var analizeMessage = function(sMsg){
		//make a regexp for each command and test all.
					if(sMsg.indexOf("options127")>-1)
					sMsg=sMsg.replace("options127,",longopt);

		var oreCommand = {
			AddControl: /^ADD_CONTROL:([a-zA-Z0-9])+,`[^\`\t\r\n\v\f]+`,(\b(buttons|switches|analog|string|options)\b)(,[^\t\r\n\v\f]+)*(\r\n|\n)$/,
			AddMonitor: /^ADD_MONITOR:([a-zA-Z0-9])+,`[^\`\t\r\n\v\f]+`,(\b(boolean|analog|digital|string)\b)(,[0-9,\.\-]+)?(\r\n|\n)$/,
			SetMonitor: /^SET_MONITOR:([a-zA-Z0-9])+,(on|off|`[^\`\t\r\n\v\f]*`|[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)(\r\n|\n)$/,
			SetMonitor1: /^SET_MONITOR1:([a-zA-Z0-9])+,(on|off|`[^\`\t\r\n\v\f]*`|[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)(\r\n|\n)$/,
			SetMonitor2: /^SET_MONITOR2:([a-zA-Z0-9])+,(on|off|`[^\`\t\r\n\v\f]*`|[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)(\r\n|\n)$/,
			SetMonitor3: /^SET_MONITOR3:([a-zA-Z0-9])+,(on|off|`[^\`\t\r\n\v\f]*`|[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)(\r\n|\n)$/,
			Remove: /^REMOVE:([a-zA-Z0-9])+(\r\n|\n)$/,
			Reset: /^RESET(\r\n|\n)$/
		};
		var sProp;
		for (sProp in oreCommand){
			if (oreCommand.hasOwnProperty(sProp)){
				if (oreCommand[sProp].test(sMsg)){
					newCommand(sMsg, sProp);
					return;
				}
			}
		}
		console.log('Syntax error in arduino message: '+JSON.stringify(sMsg));
		oSocket.end('ERROR:syntax\n');
	};
	while(sStream){
		sStream = sStream.replace(/^(\r\n|\n)*/g, ''); //delete initial new lines
		aMsg = /^[^\r\n]*(\r\n|\n)/.exec(sStream);
		if (aMsg){ //a whole command found
			sMessage = aMsg[0];
			sStream = sStream.replace(/^[^\r\n]*(\r\n|\n)/, ''); //delete the command (sMessage)
			analizeMessage(sMessage);
		}
		else { //it has not received the whole command yet
			break;
		}
	}
};

/**
 * This function is called when a new whole command is received. It analize the command and call the
 * proper methods that are necessary to execute the command.
 * @param {string} sMessage is the command itself.
 * @param {sType} sType is the type of the command
 */
var defs=` <defs>
 <linearGradient id="linearGradient5408">
 <stop style="stop-color:#00d7bd;stop-opacity:1;" offset="0" id="stop5404" />
 <stop style="stop-color:#f0e9d7;stop-opacity:0.88314605" offset="1" id="stop5406" />
 </linearGradient>
 <filter style="color-interpolation-filters:sRGB" id="filter2988" x="-0.14997823" y="-0.017457783" width="1.2999565" height="1.0349156">
 <feGaussianBlur stdDeviation="0.90700362" id="feGaussianBlur2990" />
 </filter>
 <linearGradient xlink:href="#linearGradient5408" id="linearGradient5410" x1="17.98008" y1="220.69323" x2="61.135456" y2="44.569721" gradientUnits="userSpaceOnUse" />
 </defs>
`;
var r1=`<rect style="mix-blend-mode:normal;
fill:url(#linearGradient5410);
fill-opacity:1;
fill-rule:evenodd;
stroke:#fdfdfd;
stroke-width:1;
paint-order:markers stroke fill;
filter:url(#filter2988);
opacity:0.96259843" id="rect846" width="55" `;
var def2=' <defs id="defs2"> <filter style="color-interpolation-filters:sRGB" id="filter1896" x="-0.012371032" y="-0.20621665" width="1.0247421" height="1.4124333"> <feGaussianBlur stdDeviation="0.32454052" id="feGaussianBlur1898" /> </filter> </defs>';
var blur=' style="fill:#ffffff;stroke:#ffffff;stroke-width:3;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;fill-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;opacity:0.396;filter:url(#filter1896)"';
var blur2=' style="fill:#ffffff;stroke:#ffffff;stroke-width:3;stroke-opacity:1;fill-opacity:1;opacity:0.396;"';
var synth =`
<svg
   width=\"297mm\"
   height=\"210mm\"
   viewBox=\"0 0 297 210\"
   version=\"1.1\"
   id=\"svg5\"

  <g
     id=\"layer1\">
    <path
       style=\"opacity:0.5;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:5;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"
       id=\"path846\"
       d=\"m 307.09039,256.40555 -127.45742,73.58757 0,-147.17515 z\"
       transform=\"matrix(0.26458333,0,0,0.26458333,-13.804781,28.792828)\"
       inkscape:transform-center-x=\"-5.6205171\" />
    <path
       
       style=\"opacity:0.5;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:5;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"
       id=\"path846-7\"
       inkscape:flatsided=\"true\"
       inkscape:rounded=\"0\"
       inkscape:randomized=\"0\"
       transform=\"matrix(0.26458333,0,0,0.26458333,53.615436,28.792828)\"
       inkscape:transform-center-x=\"-5.6205171\"
       d=\"m 307.09039,256.40555 -127.45742,73.58757 0,-147.17515 z\" />
    <path
       
       style=\"opacity:0.5;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:5;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"
       id=\"path846-1\"
       inkscape:flatsided=\"true\"
       inkscape:rounded=\"0\"
       inkscape:randomized=\"0\"
       transform=\"matrix(0.26458333,0,0,0.26458333,121.06164,28.792828)\"
       inkscape:transform-center-x=\"-5.6205171\"
       d=\"m 307.09039,256.40555 -127.45742,73.58757 0,-147.17515 z\" />
    <path
       
       style=\"opacity:0.5;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:5;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"
       id=\"path846-9\"
       transform=\"matrix(0.26458333,0,0,0.26458333,188.50786,28.792828)\"
       inkscape:transform-center-x=\"-5.6205171\"
       d=\"m 307.09039,256.40555 -127.45742,73.58757 0,-147.17515 z\" />
    <rect
       style=\"opacity:0.5;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:2;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"
       id=\"rect1168\"
       width=\"46.936253\"
       height=\"32.737053\"
       x=\"12.029881\"
       y=\"130.15936\" />
    <rect
       style=\"opacity:0.5;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:2;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"
       id=\"rect1168-1\"
       width=\"46.936253\"
       height=\"32.737053\"
       x=\"79.081673\"
       y=\"129.96216\" />
    <rect
       style=\"opacity:0.5;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:2;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"
       id=\"rect1168-12\"
       width=\"46.936253\"
       height=\"32.737053\"
       x=\"144.55577\"
       y=\"130.35658\" />
    <rect
       style=\"opacity:0.5;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:2;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"
       id=\"rect1168-5\"
       width=\"46.936253\"
       height=\"32.737053\"
       x=\"210.02988\"
       y=\"129.56772\" />
    <rect
       style=\"opacity:0.5;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:2;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"
       id=\"rect1168-9\"
       width=\"46.936253\"
       height=\"32.737053\"
       x=\"12.029881\"
       y=\"32.145416\" />
    <rect
       style=\"opacity:0.5;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:2;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"
       id=\"rect1168-8\"
       width=\"46.936253\"
       height=\"32.737053\"
       x=\"78.292831\"
       y=\"32.14542\" />
    <rect
       style=\"opacity:0.5;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:2;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill\"
       id=\"rect1168-91\"
       width=\"46.936253\"
       height=\"32.737053\"
       x=\"144.55577\"
       y=\"31.750999\" />
    <path
       style=\"opacity:0.570642;fill:none;stroke:#beffff;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"
       d=\"m 67.446216,96.832748 c 0.368077,-0.856775 20.373299,-0.07712 31.948209,5e-6 h -2.36654\"
       id=\"path1370\"
        />
    <path
       style=\"opacity:0.570642;fill:none;stroke:#beffff;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"
       d=\"m 58.455613,48.48303 c 0.233412,-1.00411 12.919493,-0.09038 20.25959,6e-6 h -1.500715\"
       id=\"path1370-8\"
        />
    <path
       style=\"opacity:0.570642;fill:none;stroke:#beffff;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"
       d=\"m 134.86643,96.633462 c 31.94821,5e-6 31.94821,5e-6 31.94821,5e-6 h -2.36654\"
       id=\"path1370-7\" />
    <path
       style=\"opacity:0.570642;fill:none;stroke:#beffff;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"
       d=\"m 202.31264,96.633462 c 31.94821,0 31.94821,0 31.94821,0 h -2.36654\"
       id=\"path1370-2\" />
    <path
       style=\"opacity:0.508257;fill:none;stroke:#beffff;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"
       d=\"m 22.179247,65.613552 v 19.952163 l 10.25498,0.163375\"
       id=\"path4123\"
      />
    <path
       style=\"opacity:0.508257;fill:none;stroke:#beffff;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"
       d=\"m 89.919031,65.994269 v 19.952163 l 10.254979,0.163375\"
       id=\"path4123-9\"
        />
    <path
       style=\"opacity:0.508257;fill:none;stroke:#beffff;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"
       d=\"m 156.71527,65.436472 v 19.952163 l 10.25498,0.163375\"
       id=\"path4123-0\"
        />
    <path
       style=\"fill:none;stroke:#beffff;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;opacity:0.40366972;stroke-miterlimit:4;stroke-dasharray:none\"
       d=\"m 31.948207,96.633465 -11.82446,0.115524 -0.0082,32.227101 v 0 l -0.440186,0.76243\"
       id=\"path4433\"
        />
    <path
       style=\"opacity:0.40367;fill:none;stroke:#beffff;stroke-width:1;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"
       d=\"m 235.92235,101.2187 -11.86966,0.0983 -0.008,27.41259 v 0 l -0.44186,0.64853\"
       id=\"path4433-1\"
        />
    <path
       style=\"fill:none;stroke:#beffff;stroke-width:1;stroke-linejoin:miter;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;opacity:0.56880734\"
       d=\"m 28.003984,130.55378 -0.139449,-22.66937 4.083672,-0.20712\"
       id=\"path4548\"
        />
    <path
       style=\"opacity:0.568807;fill:none;stroke:#beffff;stroke-width:1;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"
       d=\"m 96.129809,128.58588 -0.139449,-22.66937 4.08367,-0.20712\"
       id=\"path4548-6\"
        />
    <path
       style=\"opacity:0.5;fill:none;stroke:#beffff;stroke-width:1;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"
       d=\"m 163.34439,129.56203 -0.13945,-22.66937 4.08368,-0.20712\"
       id=\"path4548-8\"
        />
    <path
       style=\"opacity:0.568807;fill:none;stroke:#beffff;stroke-width:1;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"
       d=\"m 230.97732,129.28312 -0.13945,-22.66937 4.08368,-0.20712\"
       id=\"path4548-7\"
        />
    <path
       style=\"opacity:0.570642;fill:none;stroke:#beffff;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\"
       d=\"m 124.94411,48.483088 c 0.23341,-1.00411 12.91949,-0.09038 20.25959,6e-6 h -1.50072\"
       id=\"path1370-8-8\"
        />
  </g>
</svg>`;
var vco =`

<svg
   width="360mm"
   height="210mm"
   viewBox="0 0 360 210"


  <g
     inkscape:label="Layer 1"
     inkscape:groupmode="layer"
     id="layer1">
     <rect
       style="opacity:0.396;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:3;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       width="140"
       height="140.162125"
       x="145"
       y="26.91656" />
    <rect
       style="opacity:0.396;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:3;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect1168"
       width="70.273262"
       height="64.162125"
       x="9.1466856"
       y="106.91656" />
    <rect
       style="opacity:0.396;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:3;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect1168-2"
       width="71.352699"
       height="64.125969"
       x="8.6685419"
       y="26.784636" />
    <path
       style="opacity:0.370642;fill:none;stroke:#beffff;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
       d="m 79.039417,137.07377 c 67.089453,0 67.089453,0 67.089453,0 h -4.9696"
       id="path1370-2" />
    <path
       style="opacity:0.370642;fill:none;stroke:#beffff;stroke-width:2;"
       d="m 287,40  h 500"
       id="path1370-2-6" />
    <path
       style="opacity:0.370642;fill:none;stroke:#beffff;stroke-width:2;"
       d="m 287,160  h 500"
       id="path1370-2-6" />
    <path
       style="opacity:0.370642;fill:none;stroke:#beffff;stroke-width:2;"
       d="m 287,100  h 500"
       id="path1370-2-6" />
    <path
       style="opacity:0.370642;fill:none;stroke:#beffff;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
       d="m 80.943189,57.732033 c 64.021561,0 64.021561,0 64.021561,0 h -4.74235"
       id="path1370-2-7" />
  </g>
</svg>

`;
var vcfa=`<svg
   width="360mm"
   height="210mm"
   viewBox="0 0 360 210"
   version="1.1"
   id="svg5"
  <g
     inkscape:label="Layer 1"
     inkscape:groupmode="layer"
     id="layer1">
    <path
        style="opacity:0.653211;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:2;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="path846"
       d="m 307.09039,256.40555 -127.45742,73.58757 0,-147.17515 z"
       transform="matrix(1.1049302,-5.744359e-4,0.00112351,1.2071006,-45.823442,-211.05681)"
       inkscape:transform-center-x="-23.430563"
       inkscape:transform-center-y="0.024427087" />
    <rect
       style="opacity:0.396;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:3;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect1168"
       width="70.273262"
       height="64.162125"
       x="15.561356"
       y="106.35876" />
    <rect
       style="opacity:0.396;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:3;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect1168-2"
       width="90.438232"
       height="63.863438"
       x="4.2333755"
       y="26.358105" />
    <path
       style="opacity:0.370642;fill:none;stroke:#beffff;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
       d="m 85.454087,136.51597 c 67.089453,0 67.089453,0 67.089453,0 h -4.9696"
       id="path1370-2" />
    <path
       style="opacity:0.370642;fill:none;stroke:#beffff;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
       d="m 294,98 h 50"
       id="path1370-2-6" />
    <path
       style="opacity:0.370642;fill:none;stroke:#beffff;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
       d="m 96.282617,57.174236 c 55.096803,0 55.096803,0 55.096803,0 h -4.08126"
       id="path1370-2-7" />
  </g>
</svg>`;
var target=`<svg
   width="400mm"
   height="210mm"
   viewBox="0 0 400 210"

>
<g  transform="translate(-15, 25)" >
<rect
       style="display:inline;opacity:0.888073;fill:none;fill-rule:evenodd;stroke:#00090a;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860-4"
       width="250"
       height="116"
       x="65"
       y="67"
       rx="2"
       ry="2" />
    <rect
       style="opacity:0.537615;fill:none;fill-rule:evenodd;stroke:#f5f5ff;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860"
       width="252"
       height="118"
       x="64"
       y="66"
       rx="2"
       ry="2" />
<rect
       style="display:inline;opacity:0.888073;fill:none;fill-rule:evenodd;stroke:#00090a;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860-4"
       width="120"
       height="84"
       x="195"
       y="-24"
       rx="2"
       ry="2" />
    <rect
       style="opacity:0.537615;fill:none;fill-rule:evenodd;stroke:#f5f5ff;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860"
       width="122"
       height="86"
       x="194"
       y="-25"
       rx="2"
       ry="2" />
<rect
       style="display:inline;opacity:0.888073;fill:none;fill-rule:evenodd;stroke:#00090a;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860-4"
       width="60"
       height="84"
       x="65"
       y="-24"
       rx="2"
       ry="2" />
    <rect
       style="opacity:0.537615;fill:none;fill-rule:evenodd;stroke:#f5f5ff;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860"
       width="62"
       height="86"
       x="64"
       y="-25"
       rx="2"
       ry="2" />
<rect
       style="display:inline;opacity:0.888073;fill:none;fill-rule:evenodd;stroke:#00090a;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860-4"
       width="60"
       height="84"
       x="130"
       y="-24"
       rx="2"
       ry="2" />
    <rect
       style="opacity:0.537615;fill:none;fill-rule:evenodd;stroke:#f5f5ff;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860"
       width="62"
       height="86"
       x="129"
       y="-25"
       rx="2"
       ry="2" />
	   </g>
</svg>
`;
var extern=`<svg
   width="400mm"
   height="210mm"
   viewBox="0 0 400 210"
>
<g  transform="translate(-15, 25)" >
<rect
       style="display:inline;opacity:0.888073;fill:none;fill-rule:evenodd;stroke:#00090a;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860-4"
       width="250"
       height="129"
       x="55"
       y="-24"
       rx="2"
       ry="2" />
    <rect
       style="opacity:0.537615;fill:none;fill-rule:evenodd;stroke:#f5f5ff;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860"
       width="252"
       height="131"
       x="54"
       y="-25"
       rx="2"
       ry="2" />

	   </g>
</svg>
`;
var settings=`<svg
   width="500mm"
   height="210mm"
   viewBox="0 0 500 210"
>
<g  transform="translate(-15, 27)" >
<rect
       style="display:inline;opacity:0.888073;fill:none;fill-rule:evenodd;stroke:#00090a;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860-4"
       width="73"
       height="70"
       x="65"
       y="-24"
       rx="2"
       ry="2" />
    <rect
       style="opacity:0.537615;fill:none;fill-rule:evenodd;stroke:#f5f5ff;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860"
       width="75"
       height="72"
       x="64"
       y="-25"
       rx="2"
       ry="2" />
	<rect
       style="display:inline;opacity:0.888073;fill:none;fill-rule:evenodd;stroke:#00090a;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860-4"
       width="123"
       height="70"
       x="155"
       y="-24"
       rx="2"
       ry="2" />
    <rect
       style="opacity:0.537615;fill:none;fill-rule:evenodd;stroke:#f5f5ff;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860"
       width="125"
       height="72"
       x="154"
       y="-25"
       rx="2"
       ry="2" />
   	<rect
       style="display:inline;opacity:0.888073;fill:none;fill-rule:evenodd;stroke:#00090a;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860-4"
       width="320"
       height="75"
       x="65"
       y="51"
       rx="2"
       ry="2" />
    <rect
       style="opacity:0.537615;fill:none;fill-rule:evenodd;stroke:#f5f5ff;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860"
       width="322"
       height="77"
       x="64"
       y="50"
       rx="2"
       ry="2" />
 	<rect
       style="display:inline;opacity:0.888073;fill:none;fill-rule:evenodd;stroke:#00090a;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860-4"
       width="448"
       height="30"
       x="18"
       y="131"
       rx="2"
       ry="2" />
    <rect
       style="opacity:0.537615;fill:none;fill-rule:evenodd;stroke:#f5f5ff;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860"
       width="450"
       height="32"
       x="17"
       y="130"
       rx="2"
       ry="2" />
 	   </g>
</svg>
`;
var mainbg=`<svg
   width="400mm"
   height="210mm"
   viewBox="0 0 400 210"

>
<g  transform="translate(-8, -30)" >
<rect
       style="display:inline;opacity:0.888073;fill:none;fill-rule:evenodd;stroke:#00090a;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860-4"
       width="250"
       height="116"
       x="69"
       y="67"
       rx="2"
       ry="2" />
    <rect
       style="opacity:0.537615;fill:none;fill-rule:evenodd;stroke:#f5f5ff;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860"
       width="252"
       height="118.01431"
       x="68"
       y="66"
       rx="2"
       ry="2" />
    <rect
       style="display:inline;opacity:0.888073;fill:none;fill-rule:evenodd;stroke:#00090a;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860-4-5"
       width="250"
       height="28"
       x="69"
       y="33"
       rx="2"
       ry="2"
        />
    <rect
       style="opacity:0.537615;fill:none;fill-rule:evenodd;stroke:#f5f5ff;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860-1"
       width="252"
       height="30"
       x="68"
       y="32"
       rx="2"
       ry="2"
       transform="scale(1,1)" />
    <rect
       style="display:inline;opacity:0.888073;fill:none;fill-rule:evenodd;stroke:#00090a;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860-4-0"
       width="54"
       height="52"
       x="9"
       y="67"
       rx="2"
       ry="2" />
    <rect
       style="opacity:0.537615;fill:none;fill-rule:evenodd;stroke:#f5f5ff;stroke-width:0.8;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill"
       id="rect860-8"
       width="56"
       height="54"
       x="8"
       y="66"
       rx="2"
       ry="2" />
	   </g>
</svg>
`;
var notew = "fill =\"#ffffff\"  class =\"note\"  >w</text>";
var noteb = "fill =\"#ffffff\"  class =\"flat\"  >b</text>";
var notes = "fill =\"#ffffff\"  class =\"flat\"  >#</text>";
var ctext = "fill =\"white\"  class =\"small\" >";
var ttext = "fill =\"white\"  class =\"tiny\" >";
var utext = "fill =\"white\"  class =\"teeny\" >";
var tx = "<text X=\"";
var ty = "\"Y =\"";
var sw= "stroke-width=\"1 \" fill = \"none\" stroke=\"white\"";

	var samplebg=`
	<svg
   width="117mm"
   height="77mm"
   viewBox="0 0 117mm 77mm"
   >
  <g
     id="layer1"
     transform="translate(-8.8113489,-25.637003)">
    <rect
       style="opacity:0.396;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:4;"
       id="rect1168-2"
       width="114.58186mm"
       height="74.655022mm"
       x="9.8113489"
       y="26.637003" />
  </g>
</svg>
`;
	var adsrbg=`
	<svg
   width="240mm"
   height="160mm"
   viewBox="0 0 240mm 160mm"
   >
  <g
     id="layer1"
     transform="translate(-8.8113489,-25.637003)">
    <rect
       style="opacity:0.5;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:4;"
       id="rect1168-2"
       width="30mm"
       height="150mm"
       x="20"
       y="26.637003" />  
	   <rect
       style="opacity:0.5;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:4;"
       id="rect1168-2"
       width="90mm"
       height="150mm"
       x="39mm"
       y="26.637003" /> 
	   <rect
       style="opacity:0.5;fill:none;fill-rule:evenodd;stroke:#beffff;stroke-width:4;"
       id="rect1168-2"
       width="90mm"
       height="150mm"
       x="135mm"
       y="26.637003" />
  </g>
</svg>
`;
var isCollecting=false;
var collmsg="";
var gsId = 0;

var newCommand = function(sMessage, sType){
	try{
		if (sType === 'Reset'){
			board.clear();
			browser.send({'sCommand': 'refresh', 'aElements': board.getElements()});
			return true;
		}
		sMessage = sMessage.replace(/^[A-Z\_]+:/, ''); //remove "COMMAND_NAME:"

		sMessage = sMessage.replace('_defs_',defs);
		sMessage = sMessage.replace('_def2_',def2);
		sMessage = sMessage.replace('_synth_',synth);
		sMessage = sMessage.replace('_vco_',vco);
		sMessage = sMessage.replace('_main_',mainbg);
		sMessage = sMessage.replace('_target_',target);
		sMessage = sMessage.replace('_extern_',extern);
		sMessage = sMessage.replace('_set_',settings);
		sMessage = sMessage.replace('_vcfa_',vcfa);
		sMessage = sMessage.replace("_sample_",samplebg)
		sMessage = sMessage.replace("_adsr_",adsrbg)
		sMessage = sMessage.replaceAll('_blur_',blur);
		sMessage = sMessage.replaceAll('_blur2_',blur2);
		sMessage = sMessage.replaceAll('_r1_',r1);
		sMessage = sMessage.replaceAll('_n@',notew);
		sMessage = sMessage.replaceAll('_f@',noteb);
		sMessage = sMessage.replaceAll('_s@',notes);
		sMessage = sMessage.replaceAll('_c@',ttext);
		sMessage = sMessage.replaceAll('_u@',utext);
		sMessage = sMessage.replaceAll('_x@',tx);
		sMessage = sMessage.replaceAll('_y@',ty);
		sMessage = sMessage.replaceAll('_w@',sw);
		sMessage = sMessage.replaceAll('~','\n');	
		sMessage=sMessage.replace("`,options127,",longopt);

        var c1=sMessage.indexOf("`");
        var c2=sMessage.lastIndexOf("`");
		if(sType === 'SetMonitor1'||sType === 'SetMonitor2'||sType === 'SetMonitor3')
		{
	//		console.log(sType);
			if(sType === 'SetMonitor1')
			{
				var x=sMessage.indexOf(":");
				var y=sMessage.indexOf(",");
				collmsg=sMessage.substring(0,c2).replace('SET_MONITOR1','SET_MONITOR');
				if(x>-1)
				{
					gsId = sMessage.substring(x+1,y);
				}
				isCollecting=true;
	//				console.log(collmsg);
			return;
			}
			if(sType === 'SetMonitor2')
			{
				collmsg+=sMessage.substring(c1+1,c2);
	//				console.log(collmsg);
				
				return;
			}
			if(sType === 'SetMonitor3')
			{
				collmsg+=sMessage.substring(c1+1,c2+1);
				sType='SetMonitor';
				var s1=collmsg.indexOf('`');
				if(s1>-1)
					sMessage=collmsg.substring(s1);	
				else
					sMessage=collmsg;
	//			console.log(sMessage);
			}
		}
		var sId = 0;
		if(!isCollecting)
			sId=/^([a-zA-Z0-9])+/.exec(sMessage)[0];

		if (sType === 'Remove'){
			board.deleteById(sId);
			browser.send({'sCommand': 'remove', 'sId': sId});
			return true;
		}
		if(isCollecting)
		{
			sId=gsId;
			collmsg="";
		}
		else
		{
			sMessage = sMessage.replace(/^([a-zA-Z0-9])+,/, ''); //remove id+","
		}
		sMessage = sMessage.replace(/[\s]+$/, ''); //remove the final newlines

		if (sType === 'SetMonitor'){
			var sElemType = board.getElementById(sId) && board.getElementById(sId).sType;
			isCollecting=false;
			if (!sElemType){
//				oSocket.write('ERROR:The id '+sId+' does not exist\n');
//				console.log('ERROR:The id '+sId+' does not exist\n');
				return;
			}
			var oMods = {'sId': sId};
			if (sElemType === 'boolean'){
				oMods.value = (sMessage === "on");
			}
			if(sId=='170')
			{
				console.log(sId);
				console.log(sElemType);
				console.log(sMessage);
			}
			if (sElemType in {'string':0,'digital':0}){
				oMods.value = sMessage.replace(/`/g, ''); //remove grave accents. g: global to delete all matches
			}
			else {
				oMods.value = parseFloat(sMessage);
			}
			board.updateElement(oMods);
			browser.send({'sCommand': 'update', 'oModifications': oMods});
			return true;
		}

		var oNewElement = {'sId': sId};
		oNewElement.sName = /`[^\`\t\r\n\v\f]+`/.exec(sMessage)[0].slice(1, -1); //get the name field
		sMessage = sMessage.replace(/`[^\`\t\r\n\v\f]+`,/, ''); //remove name+","
		oNewElement.sType = /^(\b([a-z]+)\b)/.exec(sMessage)[0]; //get the type field
		sMessage = sMessage.replace(/^[a-z]+,/, ''); //remove type+"," depending on type
		var aux;
		if (sType === 'AddMonitor'){
			oNewElement.sTypeOfElement = 'monitor';
			if (oNewElement.sType === 'analog'){
				aux = sMessage.split(',');
				oNewElement.nMin = oNewElement.value = parseInt(aux[0], 10);
				oNewElement.nMax = parseInt(aux[1], 10);
			}
			else if(oNewElement.sType === 'digital'){
				oNewElement.value = '0';
			}
			else if(oNewElement.sType === 'string'){
				oNewElement.value = '';
			}
			else { //boolean
				oNewElement.value = false;
			}
			board.addElement(oNewElement);
			browser.send({'sCommand': 'insert', 'oElement': oNewElement});
			return true;
		}
		//sType is AddControl
		oNewElement.sTypeOfElement = 'control';

		if (oNewElement.sType === 'buttons'){
			oNewElement.asButtons = [];
			while (aux = /^`[^`]+`/.exec(sMessage)){ //while there are buttons inside sMessage. exec returns null or a non-empty array
				oNewElement.asButtons.push(aux[0].slice(1,-1)); //get the button without grave accents
				sMessage = sMessage.replace(/^`[^`]+`/, ''); //remove the first button with grave accents
				sMessage = sMessage.replace(/^,/, ''); //remove the first ','
			}
		}
		else if (oNewElement.sType === 'options'){
			oNewElement.asOptions = [];
			while (aux = /^`[^`]+`/.exec(sMessage)){ //while there are options inside sMessage. exec returns null or a non-empty array
				oNewElement.asOptions.push(aux[0].slice(1,-1)); //get the option without grave accents
				sMessage = sMessage.replace(/^`[^`]+`/, ''); //remove the first option with grave accents
				sMessage = sMessage.replace(/^,/, ''); //remove the first ','
			}

			oNewElement.value = "0";
		}
		else if (oNewElement.sType === 'switches'){
			oNewElement.value = [];
			aux = sMessage.split(',');
			for (var i = 0; i < aux.length; i++) {
				oNewElement.value.push(aux[i] === 'on');
			}
		}
		else if (oNewElement.sType === 'analog'){ //range
			aux = sMessage.split(',');
			oNewElement.nMin = parseFloat(aux[0]);
			oNewElement.nMax = parseFloat(aux[1]);
			oNewElement.value = parseFloat(aux[2]);
		}
		else if (oNewElement.sType === 'string'){
			oNewElement.value = '';
		}
		board.addElement(oNewElement);
		browser.send({'sCommand': 'insert', 'oElement': oNewElement});
		return true;
	}catch(err){
		console.log(err.name+'|'+err.message);
		return false;
	}
};

exports.start = start;
exports.send = send;
