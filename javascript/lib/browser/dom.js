var oDom = (function(){
	var oIndicator = { //depends on the indicator png and needle png
		sFileNameBckgnd: 'img/indicator-bckgnd.png',
		sFileNameNeedle: 'img/indicator-needle.png',
		nStartAngle: -193,
		nEndAngle: 71
	};
	var oRelativePositionElements = {};
	var addControl = function(oElement, eReplaceElement){
		var eDiv, eTitle, eInput, eButton, i;
		eDiv = document.createElement('div');
		eDiv.id = oElement.sId;
		const myArray = oElement.sName.split(",");
		var aName=myArray[0];
		var x=myArray[1]+'px';
		var y=myArray[2]+'px';
		var title=myArray[3];
		var className = myArray[4];	
		eDiv.className = className;

			eDiv.style.position = "absolute";
			eDiv.style.left = x
			eDiv.style.top =y;
			if(title.substring(0,1)=='t')
			{
				eTitle = document.createElement('span');
				eTitle.className = title;
				eTitle.innerHTML = aName;
				eDiv.appendChild(eTitle);
			}


		if (oElement.sType === 'buttons'){
				
			for (i = 0; i < oElement.asButtons.length; i++) { //for each button
				eButton = document.createElement('button');
			if(className=="rot"||className=="hide"||className=="redhide"||className=="synth"||className=="smallhide")
				eButton.className = className;
			else
				eButton.className = "btn"+eDiv.id+i;
				eButton.innerHTML=oElement.asButtons[i];
				eButton.type = "button"; //avoid IE to trigger click event when Enter Key is pressed.
				eDiv.appendChild(eButton);
			}
			eDiv.className += ' buttons';
		}
		else if (oElement.sType === 'switches'){
			if(title=="x")
			{
				for (i = 0; i < oElement.value.length; i++) { //for each switch
				var rid=eDiv.id*100+i;
					eInput = document.createElement('div');
					eInput.innerHTML = '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox switch'+rid+'" id="myonoffswitch'+rid+'" '+(oElement.value[i] ? 'checked' : '')+'><label class="onoffswitch-label" for="myonoffswitch'+rid+'"><div class="onoffswitch-inner"></div><div class="onoffswitch-switch"></div></label>';
					eInput.className = 'onoffswitch';
					eDiv.appendChild(eInput);
				}
				eDiv.className += ' switches';
			}
			else
			{
		//		for (i = 0; i < oElement.value.length; i++) { //for each switch
					i=eDiv.id;
					eInput = document.createElement('div');
//		<input type="checkbox" id="checkbox-1-1" class="onoffswitch-checkbox" /><label  class="onoffswitch-label" for="checkbox-1-1"></label>
//					eInput.innerHTML = '<input type="checkbox" '+(oElement.value[i] ? 'checked' :'')+ ' name="onoffswitch" class="onoffswitch-checkbox switch'+i+'" id="myonoffswitch'+i+'"><label class="onoffswitch-label" for="myonoffswitch'+i+'"></label>';
					if(oElement.value[0])
					eInput.innerHTML = '<input type="checkbox" checked  name="onoffswitch" class="onoffswitch-checkbox switch'+i+'" id="myonoffswitch'+i+'"><label class="onoffswitch-label" for="myonoffswitch'+i+'"></label>';
					else
					eInput.innerHTML = '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox switch'+i+'" id="myonoffswitch'+i+'"><label class="onoffswitch-label" for="myonoffswitch'+i+'"></label>';
					eInput.className = 'onoffswitch';
					eDiv.appendChild(eInput);
				}
				eDiv.className += ' switches';
//			}
		}
		else if (oElement.sType === 'analog'){
			//detect the native input range feature
			var bNative = false;
			try{
				var eInputRange = document.createElement('input');
				eInputRange.type = "range";
				if (eInputRange.type === 'range'){
					bNative = true;
				}
			}catch(err){
				//console.log();
			}
			if (bNative&&className==='hor'){
				eInput = document.createElement('input');
				eInput.type = 'range';
				eInput.min = "0";
				eInput.max = "100";
				eInput.step = "4";
				eInput.value = ((((100)/(oElement.nMax - oElement.nMin))*oElement.value) + (100 - oElement.nMax*(100/(oElement.nMax - oElement.nMin))));
				eInput.className = "analoghor";
				eDiv.appendChild(eInput);
				eDiv.className += ' analoghor';
			}
			else
			if (bNative&&className!='hor'){
				eInput = document.createElement('input');
				eInput.type = 'range';
				eInput.min = "0";
				eInput.max = "100";
				eInput.step = "4";
				eInput.value = ((((100)/(oElement.nMax - oElement.nMin))*oElement.value) + (100 - oElement.nMax*(100/(oElement.nMax - oElement.nMin))));
				eInput.className = "analog";
				eDiv.appendChild(eInput);
				eDiv.className += ' analog';
			}
			else {
				eInput = document.createElement('div');
				eInput.style.width = "140px";
				$(eInput).slider({ 'min': 0, 'max': 100, 'step': 4, 'value': ((((100)/(oElement.nMax - oElement.nMin))*oElement.value) + (100 - oElement.nMax*(100/(oElement.nMax - oElement.nMin))))});
				eDiv.appendChild(eInput);
			}
		}
		else if(className==='edit')
			{
			eInput = document.createElement('textarea');
			eInput.type = 'text';
			eInput.className = "string";
			eInput.cols=120;
			eInput.rows=10;
			var value = myArray[5];
			if(value.indexOf('&')>-1)
			{
				value = value.replaceAll('&','\n');
				value = value.replaceAll(';',',');
			}
			eInput.value = value;
//			eButton = document.createElement('button');
//			eButton.innerHTML = 'Send';

			eDiv.appendChild(eTitle);
			eDiv.appendChild(eInput);
//			eDiv.appendChild(eButton);
			eDiv.className = 'control';
			}
	else if (oElement.sType === 'string'){
			if(className!='scroll')
			{
			eInput = document.createElement('input');
			eInput.type = 'text';
			eInput.className = "string";
			var value = myArray[5];
			eInput.value = value;
//			eButton = document.createElement('button');
//			eButton.innerHTML = 'Send';
			eDiv.appendChild(eTitle);
			eDiv.appendChild(eInput);
//			eDiv.appendChild(eButton);
			eDiv.className += ' string';
			}
			else
			{
				eInput = document.createElement('input');
				eInput.setAttribute("type", "file");
				eInput.setAttribute("onchange",'read(this)');
				eInput.className = 'box';
				eButton = document.createElement('button');
 				var ebox = document.createElement('textarea');
				ebox.cols=60;
				ebox.rows=10;
				ebox.id="importbox";
				ebox.class="scrollabletextbox";
				ebox.name="uploaded";
				/*
				var ubox = document.createElement('textarea');
				ubox.cols=60;
				ubox.rows=10;
				ubox.id="exportbox";
				ubox.class="scrollabletextbox";
				*/
				eButton.innerHTML = 'import';
				eTitle = document.createElement('span');
				eTitle.innerHTML = '<h3>Content:</h3>';
				eDiv.appendChild(eInput);
				eDiv.appendChild(eButton);
				eDiv.appendChild(eTitle);
				eDiv.appendChild(ebox);
//				eDiv.appendChild(ubox);
				eDiv.className += ' string';
			}
			
		}
		else if (oElement.sType === 'options'){
			eInput = document.createElement('select');
			var selopt = 0;
			if(myArray.length >5)
				selopt=myArray[5];
		eInput.className = className;

			for (i =0;i<oElement.asOptions.length;i++) {
//				if(i!=2)
//					eInput.innerHTML = '<option value="'+i+'">'+oElement.asOptions[i]+'</option>'; //FAILS IN IE				
//				else
//					eInput.innerHTML = '<option selected=true;value="'+i+'">'+oElement.asOptions[i]+'</option>'; //FAILS IN IE
				var eOption = document.createElement('option');
				eOption.value = ''+i;
				if(oElement.asOptions[i].indexOf("_")==0)
				{
					eOption.style="color:yellow";
					eOption.disabled=true;
					eOption.innerHTML =oElement.asOptions[i].substring(1);
				}
				else
					eOption.innerHTML =oElement.asOptions[i];
				eInput.appendChild(eOption);
				console.log(eInput.innerHTML );
			}
			eInput.value = oElement.value;
			eInput.innerHTML=eInput.innerHTML.replace('value="'+selopt+'"','selected="true" value="'+selopt+'"');
			eDiv.appendChild(eInput);
			eDiv.className = className;
		}
		if (!eReplaceElement){
			$('div#wrapper>div#body')[0].appendChild(eDiv);
		}else{
			$('div#wrapper>div#body')[0].replaceChild(eDiv, eReplaceElement);
		}
	};

	var addMonitor = function(oElement){
		var eTitle, eOutput, eNeedle;
		var eDiv = document.createElement('div');

		eDiv.draggable = false;
		const myArray = oElement.sName.split(",");
		var aName=myArray[0];
		var x=myArray[1]+'px';
		var y=myArray[2]+'px';
		var title=myArray[3];
		var className = myArray[4];
		eDiv.className = className;

			eDiv.style.position = "absolute";
			eDiv.style.left = x
			eDiv.style.top =y;
			eDiv.id = oElement.sId;
			if(title=="title")
			{
				eTitle = document.createElement('span');
				eTitle.className = 'titlex';
				eTitle.innerHTML = aName;
				eDiv.appendChild(eTitle);
			}


		if (oElement.sType === 'boolean'){
			eOutput = document.createElement('div');
			if(className==='monitor')
			{
				eOutput.className = 'monitor-boolean';
				if (oElement.value){
					eOutput.className += ' on';
				}
				else {
					eOutput.className += ' off';
				}
				eOutput.innerHTML = '<div class="notification active"><div class="hover-effect"></div><div class="metal"><div class="light"><div class="glowing-red"><div class="glowing-yellow"></div></div></div></div></div>';
			}
			else 			if(className==='gmonitor')
			{
				eOutput.className = 'smonitor-boolean';
				if (oElement.value){
					eOutput.className += ' on';
				}
				else {
					eOutput.className += ' off';
				}
				eOutput.innerHTML = '<div class="snotification active"><div class="hover-effect"></div><div class="smetal"><div class="slight"><div class="sglowing-green"><div class="sglowing-yellow"></div></div></div></div></div>';
			}
			else 			if(className==='gmonitor')
			{
				eOutput.className = 'smonitor-boolean';
				if (oElement.value){
					eOutput.className += ' on';
				}
				else {
					eOutput.className += ' off';
				}
				eOutput.innerHTML = '<div class="snotification active"><div class="hover-effect"></div><div class="smetal"><div class="slight"><div class="sglowing-green"><div class="sglowing-yellow"></div></div></div></div></div>';
			}		}
		else if (oElement.sType === 'analog'){
			eOutput = document.createElement('div');
			eOutput.className = 'monitor-analog';
			eNeedle = document.createElement('img');
			eNeedle.src = oIndicator.sFileNameNeedle;
			eNeedle.className = 'needle';
			eNeedle.draggable = false;
			eOutput.appendChild(eNeedle);
			/*eDiv.data.nMin = oCommand.nMin;
			eDiv.data.nMax = oCommand.nMax;*/
			for (var i = 0; i < 9; i++) { //each number indicator
				var eNumber = document.createElement('span');
				eNumber.className = "number pos"+i;
				var sText = oElement.nMin + i*((oElement.nMax - oElement.nMin)/8);
				sText += ''; //convert to string
				if (sText.length > 5){
					var sText2 = '' + (parseFloat(sText).toExponential(1));
					if (sText2.length < sText.length){
						sText = sText2;
					}
				}
				_rotate(eNeedle, oElement.value, oElement.nMin, oElement.nMax);
				eNumber.innerHTML = sText;
				eOutput.appendChild(eNumber);
			}
		}
		else if (oElement.sType === 'digital'){
			eOutput = document.createElement('div');
			eOutput.className = 'monitor-digital';
			eOutput.innerHTML = oElement.value;			
		}
		else if (oElement.sType === 'string'){
			eOutput = document.createElement('span');
			eOutput.className = 'monitor-string';
	//		if(className=="metro")
	//			eOutput.className = 'monitor-metro';
			eOutput.innerHTML = oElement.value;
		}
		eDiv.appendChild(eOutput);
		$('div#wrapper>div#body')[0].appendChild(eDiv);
	};
	var setControl = function(oElement){
		var eOldDiv = $('div#'+oElement.sId)[0];
		addControl(oElement, eOldDiv);
	};
	function readFile(file) {
  return new Promise((resolve, reject) => {
    let fr = new FileReader();
    fr.onload = x=> resolve(fr.result);
    fr.readAsBinaryString(file);
})}

async function read(input) {
	var text=await readFile(input.files[0]);
	var element = document.getElementById('importbox');
  importbox.innerText = text;

}
	var setMonitor = function(oElement){
		var eValue, eDiv;
		if ($('div#'+oElement.sId+'>.monitor-boolean').length === 1){
			eValue = $('div#'+oElement.sId+' .monitor-boolean');
			if (oElement.value){
				eValue.removeClass('off');
				eValue.addClass('on');
			}
			else{
				eValue.removeClass('on');
				eValue.addClass('off');
			}
		}
		else if ($('div#'+oElement.sId+'>.monitor-analog').length === 1){
			eValue = $('#'+oElement.sId+' .monitor-analog img')[0];
			eDiv = $('div#'+oElement.sId)[0];
			_rotate(eValue, oElement.value, oElement.nMin, oElement.nMax);
		}
		else if ($('div#'+oElement.sId+'>.monitor-digital').length === 1){
			eValue = $('#'+oElement.sId+' .monitor-digital')[0];
			eValue.innerHTML = oElement.value;
		}
		else if ($('div#'+oElement.sId+'>.monitor-string').length === 1){
			eValue = $('#'+oElement.sId+'>span.monitor-string')[0];
			eValue.innerHTML = oElement.value;
		}
		else{
			console.log('Error. Element not found in the dom: '+JSON.stringify(oElement));
		}
	};
	var deleteElement = function(sId){
		var eElement = $('div#'+sId)[0];
		$('div#wrapper>div#body')[0].removeChild(eElement);
	};
	var _rotate = function (eImage, sValue, nMin, nMax){
		var nValue = window.parseFloat(sValue);
		var nRotationAngle = ((oIndicator.nEndAngle - oIndicator.nStartAngle)/(nMax - nMin))*nValue + (oIndicator.nStartAngle - ((oIndicator.nEndAngle - oIndicator.nStartAngle)/(nMax - nMin))*nMin) ;
		eImage.style.webkitTransform="rotate("+nRotationAngle+"deg)"; //chrome and safari
		eImage.style.MozTransform="rotate("+nRotationAngle+"deg)"; //firefox
		eImage.style.msTransform="rotate("+nRotationAngle+"deg)"; //ie
		eImage.style.OTransform="rotate("+nRotationAngle+"deg)"; //opera
	};
	/*var _remove = function(sId){
		$('#'+sId).remove();
	};*/
	var _reset = function(){
		$('div#wrapper>div#body')[0].innerHTML = '';
	};
	var refresh = function(){
		_reset();
		var aElements = window.oBoard.getElements();
		if (aElements.length === 0) { //if RESET command
			oRelativePositionElements = {};
		}
		for (var i = 0; i < aElements.length; i++) {
			if (aElements[i].sTypeOfElement === 'monitor'){
				addMonitor(aElements[i]);
			}
			else{
				addControl(aElements[i]);
			}
		}
		//update positions:
		var sId;
		for (sId in oRelativePositionElements){
			if (oRelativePositionElements.hasOwnProperty(sId)) {
				$('#'+sId)[0].style.top = oRelativePositionElements[sId].top;
				$('#'+sId)[0].style.left = oRelativePositionElements[sId].left;
			}
		}
	};
	var setEvents = function(){
		$('div#wrapper>div#body').click(function(oEvent){
		console.log(oEvent.target.parentNode.className);
			if (oEvent.target.tagName.toLowerCase() === 'button' && $(oEvent.target.parentNode).hasClass('buttons')){ //button
				window.oNodecom.newInputEvent({
					'sCommand': 'event',
					'sId': oEvent.target.parentNode.id,
					'sWitch': parseInt(oEvent.target.className.slice(3), 10) //the class is eg 'btn0'
				});
			}
			else if (oEvent.target.tagName.toLowerCase() === 'input' && (oEvent.target.name === 'onoffswitch'||oEvent.target.name === 'noonoffswitch')){ //switch
				var aValues = [], sId;
				sId = oEvent.target.parentNode.parentNode.id;
				for (var i = 0; i < $('div#'+sId+' input').length; i++) {
					aValues.push(!!$('div#'+sId+' input')[i].checked);
				}
				window.oNodecom.newInputEvent({
					'sCommand': 'event',
					'sId': sId,
					'value': aValues
				});
				window.oBoard.updateElement({
					'sId': sId,
					'value': aValues
				});
				//console.dir(oBoard.getElements());
			}
			else if (oEvent.target.tagName.toLowerCase() === 'button'){ //string     && $(oEvent.target.parentNode).hasClass('string')
			var otp=oEvent.target.parentNode;
	//			if($(oEvent.target.parentNode).hasClass('control'))
				{
					var sDivId = oEvent.target.parentNode.id;
					var eInputText = $('div#'+sDivId+' textarea')[0];
					window.oNodecom.newInputEvent({
						'sCommand': 'event',
						'sId': sDivId,
						'value': eInputText.value
					});
					window.oBoard.updateElement({
						'sId': sDivId,
						'value': eInputText.value
					});
				}
				if($(oEvent.target.parentNode).hasClass('textarea'))
				{
					var sDivId = oEvent.target.parentNode.id;
					var eInputText = $('div#'+sDivId+' textarea')[0];
					window.oNodecom.newInputEvent({
						'sCommand': 'event',
						'sId': sDivId,
						'value': eInputText.value
					});
					window.oBoard.updateElement({
						'sId': sDivId,
						'value': eInputText.value
					});
				}

				if($(oEvent.target.parentNode).hasClass('scroll'))
				{
					var element = document.getElementById('importbox');
//					var oelement = document.getElementById('exportbox');
					var sDivId = oEvent.target.parentNode.id;
					var eInputText = element.textContent;
						window.oNodecom.newInputEvent({
							'sCommand': 'event',
							'sId': sDivId,
							'value':eInputText
						});
						element.textContent="";
//						oelement.textContent=oEvent.target.parentNode.className;
					window.oBoard.updateElement({
						'sId': sDivId,
						'value': 'upload'
					});
				}
			}
			//else {
				//console.log('Neither button control nor switch');
			//}
		});
/*
		$('div#wrapper>div#body').mousedown(function(oEvent){ //buttons
			if (oEvent.target.tagName.toLowerCase() === 'button' && $(oEvent.target.parentNode).hasClass('buttons')){
				window.oNodecom.newInputEvent({
					'sCommand': 'event',
					'sId': oEvent.target.parentNode.id,
					'sWitch': parseInt(oEvent.target.className.slice(3), 10) ,//the class is eg 'btn0'
					'sType': 'mousedown'
				});
			}
			else if ($(oEvent.target).hasClass('analog')){
				oEvent.target.parentNode.draggable = false; //don't allow to drag the div
			}
		});
*/
		$('div#wrapper>div#body').mouseup(function(oEvent){ //buttons
			//console.log('mouseup');
			if ($(oEvent.target).hasClass('analog')){
				oEvent.target.parentNode.draggable = false; //allow to drag the div
			}
		});

		var handleAnalogAndOptions = function(oEvent, ui){
				console.log(oEvent.target.parentNode.id);
			if ($(oEvent.target).hasClass('analog')||$(oEvent.target).hasClass('analoghor') || typeof ui === 'object'){ //range or slider
				console.log('slider');
				var sId = oEvent.target.parentNode.id;
				var oControl = window.oBoard.getElementById(sId);
				if (!oControl){
					console.log("Control not found !!!");
					return;
				}
				var fnMap = function(){ //range is always between 0 ans 100
					var nVal = ui ? ui.value : parseInt(oEvent.target.value, 10);
					if (nVal === 0) {
						return ''+oControl.nMin;
					}
					if (nVal === 100) {
						return ''+oControl.nMax;
					}
					return ((oControl.nMax - oControl.nMin)/(100))*nVal + oControl.nMin;
				};
				var sValue = fnMap();
				window.oNodecom.newInputEvent({
					'sCommand': 'event',
					'sId': sId,
					'value': sValue
				});
				window.oBoard.updateElement({
					'sId': sId,
					'value': sValue
				});
			}
			else if (oEvent.target.tagName.toLowerCase() === 'select'){ //options
				window.oNodecom.newInputEvent({
					'sCommand': 'event',
					'sId': oEvent.target.parentNode.id,
					'sWitch': oEvent.target.value
				});
				window.oBoard.updateElement({
					'sId': oEvent.target.parentNode.id,
					'value': oEvent.target.value
				});
			}
			//else{
				//console.log('Neither analog nor options !!!');
			//}
		};
		$('div#wrapper>div#body').change(handleAnalogAndOptions); //analog type range (chrome) and options
//		$('div#wrapper>div#body').input(handleAnalogAndOptions); //analog type range (chrome) and options
		$('div#wrapper>div#body').on("slide", handleAnalogAndOptions); //analog slider (firefox ie)
		$('div#wrapper>div#body').on("input", handleAnalogAndOptions); //analog slider (firefox ie)

		$('div#wrapper>div#body').keyup(function(oEvent){ //string
			if(oEvent.keyCode ===13||oEvent.keyCode ===27||oEvent.keyCode ===112){ //enter key
				if ($(oEvent.target).hasClass('string')){
					var value=oEvent.target.value;
					if(oEvent.keyCode ===27)
						value='Esc'+value;
					if(oEvent.keyCode ===112)
						value='F1'+value;
					window.oNodecom.newInputEvent({
						'sCommand': 'event',
						'sId': oEvent.target.parentNode.id,
						'value': value
					});
					window.oBoard.updateElement({
						'sId': oEvent.target.parentNode.id,
						'value': oEvent.target.value
					});
				}
			}

		});
		//drag and drop functionality
		
		document.addEventListener("DOMNodeInserted", function() {
			//console.log('new node');
			var ofnEvents = {
				stop: function(oEvent){
					var sId = oEvent.target.id;
					var sLeft = oEvent.target.style.left;
					var sTop = oEvent.target.style.top;
					var oNewPosition = {
						left: sLeft,
						top: sTop
					};
					oRelativePositionElements[sId] = oNewPosition;
					//console.dir(oRelativePositionElements);
				}
			};
//			$( "div#body>div.control" ).draggable(ofnEvents);
//			$( "div#body>div.monitor" ).draggable(ofnEvents);
		});
	};
	var alertServerDown = function(){
		console.log('server is down. trying to reconnect.');
	};
	var alertServerConnected = function(){
		console.log('connected to server.');
	};
	var changeConnexionStatus = function(bStatus){
		if (bStatus) {
			$('div#connexion-status div.circle')[0].className = 'circle connected';
		}
		else{
			$('div#connexion-status div.circle')[0].className = 'circle disconnected';
		}
	};
	//return the public methods
	return {
		refresh: refresh,
		addControl: addControl,
		addMonitor: addMonitor,
		setControl: setControl,
		setMonitor: setMonitor,
		deleteElement: deleteElement,
		setEvents: setEvents,
		alertServerDown: alertServerDown,
		alertServerConnected: alertServerConnected,
		changeConnexionStatus: changeConnexionStatus
	};
})();
console.log('dom.js loaded');
