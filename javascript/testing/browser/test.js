var Testing = (function(){
	var testExecuted = false;
	var _run = function(){
		if (testExecuted){
			console.log('The test has already run. Try to reload the page.');
			return;
		}
		var oVirtualSocket;

		(function loadsocket(){

			oVirtualSocket = io.connect('http://' + window.location.hostname + ':8134');
			oVirtualSocket.on('data', function (oData) {
				console.log('new data from fk-server:'+JSON.stringify(oData));
				oMediator.publish('data from fk-server', oData.data);
			});
			oMediator.subscribe('data to fk-server', function(sData){
				oVirtualSocket.emit('data', {'data': sData});
			});
		})();

		$('body').prepend('<div id="mocha"></div>');
		mocha.setup({ui: 'bdd', timeout: 30000});
		describe('WebGUI browser-side test code', function(){
			describe('Input commands', function(){
				describe('RESET command', function(){
					before(function(done){
						$('div#wrapper>div#body')[0].innerHTML = '<div id="c4c0fccd" class="control"><span class="title">Engine panel</span><button class="btn0">Start / Stop engine</button><button class="btn1">Increase Power</button><button class="btn2">Decrease Power</button></div>'; //create some buttons
						done();
					});
					it('Clear the div#wrapper>div#body content', function(done){
						var sData = 'RESET\n';
						oMediator.publish('data to fk-server', sData);
						oMyUtilities.polling(
							function check(){
								return ($('div#wrapper>div#body')[0].innerHTML === '');
							},
							function action(success){
								if(success){
									chai.assert.equal($('div#wrapper>div#body')[0].innerHTML, '', 'There is some content inside the wrapper');
								}
								else{
									chai.assert(false, 'The div#wrapper>div#body has not been cleared. timeout expired');
								}
								done();
							},
							2000
						);
					});
				});
				describe('Basic controls', function(){
					after(function(done){
						var sData = 'RESET\n';
						oMediator.publish('data to fk-server', sData);
						oMyUtilities.polling(
							function check(){
								return ($('div#wrapper>div#body')[0].innerHTML === '');
							},
							function action(success){
								if(!success){
									chai.assert(false, 'The div#wrapper>div#body has not been cleared. timeout expired');
								}
								done();
							},
							2000
						);
					});
					it('Create the buttons control', function(done){
						var sId = oMyUtilities.uuid().slice(0,4);
						var sData = 'ADD_CONTROL:'+sId+',`Engine panel`,buttons,`Start / Stop engine`,`Increase Power`,`Decrease Power`\n';
						oMediator.publish('data to fk-server', sData);
						oMyUtilities.polling(
							function check(){
								return ($('div#wrapper>div#body>div#'+sId).length === 1);
							},
							function action(success){
								if(success){
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+sId), 1, 'Error with the number of divs in buttons control with the id '+sId);
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' span.title')[0].innerHTML, 'Engine panel', 'The title of the buttons control is not correct.');
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+sId+' button'), 3, 'The number of buttons is not correct.');
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' button')[0].innerHTML, 'Start / Stop engine', 'The button 0 is not correct.');
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' button')[1].innerHTML, 'Increase Power', 'The button 1 is not correct.');
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' button')[2].innerHTML, 'Decrease Power', 'The button 2 is not correct.');
								}
								else{
									chai.assert(false, 'The div of buttons control has not been created. timeout expired');
								}
								done();
							},
							2000
						);
					});
					it('Create the switches control', function(done){
						var sId = oMyUtilities.uuid().slice(0,4);
						var sData = 'ADD_CONTROL:'+sId+',`Reactor panel`,switches,on,off,off,on,off,off,on\n';
						oMediator.publish('data to fk-server', sData);
						oMyUtilities.polling(
							function check(){
								return ($('div#wrapper>div#body>div#'+sId).length === 1);
							},
							function action(success){
								if(success){
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+sId), 1, 'Error with the number of divs in switches control with the id '+sId);
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' span.title')[0].innerHTML, 'Reactor panel', 'The title of the switches control is not correct.');
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+sId+' input'), 7, 'The number of switches is not correct.');
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' input')[0].checked, true, 'The switch 0 is not correct.');
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' input')[0].type, 'checkbox', 'The switch 0 is not correct.');
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' input')[5].checked, false, 'The switch 5 is not correct.');
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' input')[5].type, 'checkbox', 'The switch 5 is not correct.');								
								}
								else{
									chai.assert(false, 'The div of switches control has not been created. timeout expired');
								}
								done();
							},
							2000
						);
					});
					it('Create the analog control', function(done){
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
						var sId = oMyUtilities.uuid().slice(0,4);
						var sData = 'ADD_CONTROL:'+sId+',`Motor Speed`,analog,-100,100,80\n';
						oMediator.publish('data to fk-server', sData);
						oMyUtilities.polling(
							function check(){
								return ($('div#wrapper>div#body>div#'+sId).length === 1);
							},
							function action(success){
								if(success){
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+sId), 1, 'Error with the number of divs in analog control with the id '+sId);
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' span.title')[0].innerHTML, 'Motor Speed', 'The title of the analog control is not correct.');
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+sId+(bNative ? ' input' : ' div.ui-slider')), 1, 'The number of inputs is not correct.');
									if (bNative){
										chai.assert.equal($('div#wrapper>div#body>div#'+sId+' input')[0].type, 'range', 'The type is not range.');
										chai.assert.equal($('div#wrapper>div#body>div#'+sId+' input')[0].min, "0", 'The input min is not correct.');
										chai.assert.equal($('div#wrapper>div#body>div#'+sId+' input')[0].max, "100", 'The input max is not correct.');
										chai.assert.equal($('div#wrapper>div#body>div#'+sId+' input')[0].step, "4", 'The input step is not correct.');
										chai.assert($('div#wrapper>div#body>div#'+sId+' input')[0].value <= "92", 'The input default value is not correct.');
										chai.assert($('div#wrapper>div#body>div#'+sId+' input')[0].value >= "88", 'The input default value is not correct (2).');
									}else{
										chai.assert.equal($('div#wrapper>div#body>div#'+sId+' div.ui-slider').slider('option', 'min'), 0, 'The slider min is not correct.');
										chai.assert.equal($('div#wrapper>div#body>div#'+sId+' div.ui-slider').slider('option', 'max'), 100, 'The slider max is not correct.');
										chai.assert.equal($('div#wrapper>div#body>div#'+sId+' div.ui-slider').slider('option', 'step'), 4, 'The slider step is not correct.');
										chai.assert($('div#wrapper>div#body>div#'+sId+' div.ui-slider').slider('option', 'value') <= 92, 'The slider default value is not correct.');
										chai.assert($('div#wrapper>div#body>div#'+sId+' div.ui-slider').slider('option', 'value') >= 88, 'The slider default value is not correct (2).');
									}
								}
								else{
									chai.assert(false, 'The div of switches control has not been created. timeout expired');
								}
								done();
							},
							2000
						);
					});
					it('Create the string control', function(done){
						var sId = oMyUtilities.uuid().slice(0,4);
						var sData = 'ADD_CONTROL:'+sId+',`Display`,string\n';
						oMediator.publish('data to fk-server', sData);
						oMyUtilities.polling(
							function check(){
								return ($('div#wrapper>div#body>div#'+sId).length === 1);
							},
							function action(success){
								if(success){
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+sId), 1, 'Error with the number of divs in string control with the id '+sId);
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' span.title')[0].innerHTML, 'Display', 'The title of the string control is not correct.');
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+sId+' input'), 1, 'The number of inputs is not correct.');
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' input')[0].type, 'text', 'The type is not text.');
								}
								else{
									chai.assert(false, 'The div of analog control has not been created. timeout expired');
								}
								done();
							},
							2000
						);
					});
					it('Create the options control', function(done){
						var sId = oMyUtilities.uuid().slice(0,4);
						var sData = 'ADD_CONTROL:'+sId+',`Select output PIN`,options,`PIN 10`,`PIN 11`,`PIN 12`\n';
						oMediator.publish('data to fk-server', sData);
						oMyUtilities.polling(
							function check(){
								return ($('div#wrapper>div#body>div#'+sId).length === 1);
							},
							function action(success){
								if(success){
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+sId), 1, 'Error with the number of divs in options control with the id '+sId);
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' span.title')[0].innerHTML, 'Select output PIN', 'The title of the options control is not correct.');
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+sId+' select'), 1, 'The number of select tags is not correct.');
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+sId+' select option'), 3, 'The number of option tags is not correct.');
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' select option')[0].value, '0', 'The value of the option is not correct');
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' select option')[2].value, '2', 'The value of the option is not correct');
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' select option')[2].innerHTML, 'PIN 12', 'The inner of the option is not correct');
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' select option')[2].selected, '0', 'The default option is not correct');
								}
								else{
									chai.assert(false, 'The div of analog control has not been created. timeout expired');
								}
								done();
							},
							2000
						);
					});
				});
				describe('Adding Monitors', function(){
					after(function(done){
						var sData = 'RESET\n';
						oMediator.publish('data to fk-server', sData);
						oMyUtilities.polling(
							function check(){
								return ($('div#wrapper>div#body')[0].innerHTML === '');
							},
							function action(success){
								if(!success){
									chai.assert(false, 'The div#wrapper>div#body has not been cleared. timeout expired');
								}
								done();
							},
							2000
						);
					});
					it('Create the boolean monitor', function(done){
						var sId = oMyUtilities.uuid().slice(0,4);
						var sData = 'ADD_MONITOR:'+sId+',`Pressure warning`,boolean\n';
						oMediator.publish('data to fk-server', sData);
						oMyUtilities.polling(
							function check(){
								return ($('div#wrapper>div#body>div#'+sId).length === 1);
							},
							function action(success){
								if(success){
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+sId), 1, 'Error with the number of divs in boolean monitor with the id '+sId);
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' span.title')[0].innerHTML, 'Pressure warning', 'The title of the boolean monitor is not correct.');
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' div.monitor-boolean').length, 1, 'Missing monitor-boolean div');
									chai.assert($('div#wrapper>div#body>div#'+sId+' div.monitor-boolean').hasClass('off'), 'Image div does not have class "off"');
								}
								else{
									chai.assert(false, 'The div of boolean monitor has not been created. timeout expired');
								}
								done();
							},
							2000
						);
					});
					it('Create the analog monitor', function(done){
						var sId = oMyUtilities.uuid().slice(0,4);
						var sData = 'ADD_MONITOR:'+sId+',`Speed [mph]`,analog,0,130.56\n';
						oMediator.publish('data to fk-server', sData);
						oMyUtilities.polling(
							function check(){
								return ($('div#wrapper>div#body>div#'+sId).length === 1);
							},
							function action(success){
								if(success){
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+sId), 1, 'Error with the number of divs in analog monitor with the id '+sId);
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' span.title')[0].innerHTML, 'Speed [mph]', 'The title of the analog monitor is not correct.');
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' div.monitor-analog').length, 1, 'Missing monitor-analog div');
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' div.monitor-analog>img.needle').length, 1, 'Missing needle image');
								}
								else{
									chai.assert(false, 'The div of analog monitor has not been created. timeout expired');
								}
								done();
							},
							2000
						);
					});
					it('Create the digital monitor', function(done){
						var sId = oMyUtilities.uuid().slice(0,4);
						var sData = 'ADD_MONITOR:'+sId+',`Time [sec]`,digital\n';
						oMediator.publish('data to fk-server', sData);
						oMyUtilities.polling(
							function check(){
								return ($('div#wrapper>div#body>div#'+sId).length === 1);
							},
							function action(success){
								if(success){
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+sId), 1, 'Error with the number of divs in digital monitor with the id '+sId);
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' span.title')[0].innerHTML, 'Time [sec]', 'The title of the digital monitor is not correct.');
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' div.monitor-digital').length, 1, 'Missing monitor-digital div');
								}
								else{
									chai.assert(false, 'The div of digital monitor has not been created. timeout expired');
								}
								done();
							},
							2000
						);
					});
					it('Create the string monitor', function(done){
						var sId = oMyUtilities.uuid().slice(0,4);
						var sData = 'ADD_MONITOR:'+sId+',`Message received`,string\n';
						oMediator.publish('data to fk-server', sData);
						oMyUtilities.polling(
							function check(){
								return ($('div#wrapper>div#body>div#'+sId).length === 1);
							},
							function action(success){
								if(success){
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+sId), 1, 'Error with the number of divs in string monitor with the id '+sId);
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' span.title')[0].innerHTML, 'Message received', 'The title of the string monitor is not correct.');
									chai.assert.equal($('div#wrapper>div#body>div#'+sId+' span.monitor-string').length, 1, 'Missing string-digital div');
								}
								else{
									chai.assert(false, 'The div of digital monitor has not been created. timeout expired');
								}
								done();
							},
							2000
						);
					});
				});
				describe('Setting Monitors', function(){
					var eBo, eAn, eDi, eSt;
					before(function(done){
						var sData;
						eBo = oMyUtilities.uuid().slice(0,4);
						sData = 'ADD_MONITOR:'+eBo+',`Pressure warning`,boolean\n';
						oMediator.publish('data to fk-server', sData);
						eAn = oMyUtilities.uuid().slice(0,4);
						sData = 'ADD_MONITOR:'+eAn+',`Temp`,analog,-30,60\n';
						oMediator.publish('data to fk-server', sData);
						eDi = oMyUtilities.uuid().slice(0,4);
						sData = 'ADD_MONITOR:'+eDi+',`Time [sec]`,digital\n';
						oMediator.publish('data to fk-server', sData);
						eSt = oMyUtilities.uuid().slice(0,4);
						sData = 'ADD_MONITOR:'+eSt+',`Message received 2`,string\n';
						oMediator.publish('data to fk-server', sData);
						oMyUtilities.polling(
							function check(){
								return ($('div#'+eSt).length === 1);
							},
							function action(success){
								if(!success){
									chai.assert(false, 'Error while creating the monitors');
								}
								done();
							},
							2000
						);
					});
					after(function(done){
						var sData = 'RESET\n';
						oMediator.publish('data to fk-server', sData);
						oMyUtilities.polling(
							function check(){
								return ($('div#wrapper>div#body')[0].innerHTML === '');
							},
							function action(success){
								if(!success){
									chai.assert(false, 'The div#wrapper>div#body has not been cleared. timeout expired');
								}
								done();
							},
							2000
						);
					});
					it('Set the boolean monitor', function(done){
						chai.assert.lengthOf($('div#'+eBo), 1, 'Error with the number of divs boolean monitor');
						var sData = 'SET_MONITOR:'+eBo+',on\n';
						oMediator.publish('data to fk-server', sData);
						oMyUtilities.polling(
							function check(){
								return ($('div#wrapper>div#body>div#'+eBo+'>div.monitor-boolean').hasClass('on'));
							},
							function action(success){
								if(success){
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+eBo), 1, 'Error with the number of divs '+eBo);
									chai.assert($('div#wrapper>div#body>div#'+eBo+' div.monitor-boolean').hasClass('on'), 'Div does not have class "on"');
								}
								else{
									chai.assert(false, 'The div of boolean monitor has not been setted. timeout expired');
								}
								done();
							},
							2000
						);
					});
					it('Set the analog monitor', function(done){
						chai.assert.lengthOf($('div#'+eAn), 1, 'Error with the number of divs analog monitor');
						var finish = false;
						(function moveneedle(){
							var val = -30;
							var id = window.setInterval(function(){
								var sData = 'SET_MONITOR:'+eAn+','+val+'\n';
								oMediator.publish('data to fk-server', sData);
								val+=2;
								if (val > 60){
									window.clearInterval(id);
									finish = true;
								}
							}, 50);
						})();
						oMyUtilities.polling(
							function check(){
								return (finish && $('div#wrapper>div#body>div#'+eAn+' img')[0].style.webkitTransform !== '');
							},
							function action(success){
								if(success){
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+eAn), 1, 'Error with the number of divs '+eAn);
									chai.assert(window.confirm('Did everything go well?'), 'Needle rotation error');
								}
								else{
									chai.assert(false, 'The div of analog monitor has not been setted. timeout expired');
								}
								done();
							},
							6000
						);
					});
					it('Set the digital monitor', function(done){
						chai.assert.lengthOf($('div#'+eDi), 1, 'Error with the number of divs digital monitor');
						var sData = 'SET_MONITOR:'+eDi+',-3.14159\n';
						oMediator.publish('data to fk-server', sData);
						oMyUtilities.polling(
							function check(){
								return ($('div#wrapper>div#body>div#'+eDi+'>div.monitor-digital')[0].innerHTML === '-3.14159');
							},
							function action(success){
								if(success){
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+eDi), 1, 'Error with the number of divs '+eDi);
									chai.assert.equal($('div#wrapper>div#body>div#'+eDi+'>div.monitor-digital')[0].innerHTML , '-3.14159', 'The digital value is not correct');
								}
								else{
									chai.assert(false, 'The div of digital monitor has not been setted. timeout expired');
								}
								done();
							},
							2000
						);
					});
					it('Set the string monitor', function(done){
						chai.assert.lengthOf($('div#'+eSt), 1, 'Error with the number of divs string monitor');
						var sData = 'SET_MONITOR:'+eSt+',`A random string !@#$%^&"`\n';
						oMediator.publish('data to fk-server', sData);
						oMyUtilities.polling(
							function check(){
								return ($('div#wrapper>div#body>div#'+eSt+'>span.monitor-string')[0].innerHTML === 'A random string !@#$%^&amp;"');
							},
							function action(success){
								if(success){
									chai.assert.lengthOf($('div#wrapper>div#body>div#'+eSt), 1, 'Error with the number of divs '+eSt);
									chai.assert.equal($('div#wrapper>div#body>div#'+eSt+'>span.monitor-string')[0].innerHTML , 'A random string !@#$%^&amp;"', 'The string value is not correct');
								}
								else{
									chai.assert(false, 'The div of string monitor has not been setted. timeout expired');
								}
								done();
							},
							2000
						);
					});
				});
			});
			describe('Output commands', function(){
				var eBu, eSw, eOp, eAn, eSt;
				before(function(done){
					var sData;
					eBu = oMyUtilities.uuid().slice(0,4);
					sData = 'ADD_CONTROL:'+eBu+',`Increment counter`,buttons,`1 unit`,`2 unit`,`5 unit`,`10 unit`,`20 unit`,`50 unit`\r\n';
					oMediator.publish('data to fk-server', sData);
					eSw = oMyUtilities.uuid().slice(0,4);
					sData = 'ADD_CONTROL:'+eSw+',`Opened pipes`,switches,off,off,off,off\r\n';
					oMediator.publish('data to fk-server', sData);
					eOp = oMyUtilities.uuid().slice(0,4);
					sData = 'ADD_CONTROL:'+eOp+',`Select pin`,options,`Data pin`,`Clock pin`,`Voltage pin`,Ground pin`\r\n';
					oMediator.publish('data to fk-server', sData);
					eAn = oMyUtilities.uuid().slice(0,4);
					sData = 'ADD_CONTROL:'+eAn+',`Select motor speed`,analog,0,100,20\r\n';
					oMediator.publish('data to fk-server', sData);
					eSt = oMyUtilities.uuid().slice(0,4);
					sData = 'ADD_CONTROL:'+eSt+',`Motor name:`,string\r\n';
					oMediator.publish('data to fk-server', sData);
					oMyUtilities.polling(
						function check(){
							return ($('div#'+eSt).length === 1);
						},
						function action(success){
							if(!success){
								chai.assert(false, 'Error while creating the controls');
							}
							done();
						},
						2000
					);
				});
				after(function(done){
					var sData = 'RESET\n';
					oMediator.publish('data to fk-server', sData);
					oMyUtilities.polling(
						function check(){
							return ($('div#wrapper>div#body')[0].innerHTML === '');
						},
						function action(success){
							if(!success){
								chai.assert(false, 'The div#wrapper>div#body has not been cleared. timeout expired');
							}
							done();
						},
						2000
					);
				});
				it('Click a button', function(done){
					var sData;
					var subsid = oMediator.subscribe('data from fk-server', function(sDta){
						sData = sDta;
					});
					$('div#'+eBu+' .btn5').click();
					oMyUtilities.polling(
						function check(){
							return (!!sData);
						},
						function action(success){
							if(success){
								chai.assert.equal(sData, 'ACTION:'+eBu+',5\n', 'The ACTION command is not correct: '+JSON.stringify(sData));
							}
							else{
								chai.assert(false, 'The ACTION command was not received');
							}
							oMediator.unsubscribe(subsid);
							done();
						},
						2000
					);
				});
				it('Mousedown a button', function(done){
					var sData;
					var subsid = oMediator.subscribe('data from fk-server', function(sDta){
						sData = sDta;
					});
					$('div#'+eBu+' .btn4').mousedown();
					oMyUtilities.polling(
						function check(){
							return (!!sData);
						},
						function action(success){
							if(success){
								chai.assert.equal(sData, 'ACTION:'+eBu+',4,mousedown\n', 'The ACTION command is not correct: '+JSON.stringify(sData));
							}
							else{
								chai.assert(false, 'The ACTION command was not received');
							}
							oMediator.unsubscribe(subsid);
							done();
						},
						2000
					);
				});
				it('Press a checkbox', function(done){
					var sData;
					var subsid = oMediator.subscribe('data from fk-server', function(sDta){
						sData = sDta;
					});
					$('div#'+eSw+' .switch3').click();
					oMyUtilities.polling(
						function check(){
							return (!!sData);
						},
						function action(success){
							if(success){
								chai.assert.equal(sData, 'ACTION:'+eSw+',off|off|off|on\n', 'The ACTION command is not correct: '+JSON.stringify(sData));
							}
							else{
								chai.assert(false, 'The ACTION command was not received');
							}
							oMediator.unsubscribe(subsid);
							done();
						},
						2000
					);
				});
				it('Press a range', function(done){
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
					var sData;
					var subsid = oMediator.subscribe('data from fk-server', function(sDta){
						sData = sDta;
					});
					if (bNative) {
						$('div#'+eAn+' input')[0].value = 0;
						$('div#'+eAn+' input').trigger('change');
					}else{
						$('div#'+eAn+' div.ui-slider').slider('option', 'value', 0);
						$('div#'+eAn+' div.ui-slider').trigger('slide', {'value': 0});
					}
					oMyUtilities.polling(
						function check(){
							return (!!sData);
						},
						function action(success){
							if(success){
								chai.assert.equal(sData, 'ACTION:'+eAn+',0\n', 'The ACTION command is not correct: '+JSON.stringify(sData));
							}
							else{
								chai.assert(false, 'The ACTION command was not received');
							}
							oMediator.unsubscribe(subsid);
							done();
						},
						2000
					);
				});
				it('Press a option', function(done){
					var sData;
					var subsid = oMediator.subscribe('data from fk-server', function(sDta){
						sData = sDta;
					});
					$('div#'+eOp+' select')[0].value = 2;
					$('div#'+eOp+' select').trigger('change');
					oMyUtilities.polling(
						function check(){
							return (!!sData);
						},
						function action(success){
							if(success){
								chai.assert.equal(sData, 'ACTION:'+eOp+',2\n', 'The ACTION command is not correct: '+JSON.stringify(sData));
							}
							else{
								chai.assert(false, 'The ACTION command was not received');
							}
							oMediator.unsubscribe(subsid);
							done();
						},
						2000
					);
				});
				it('Send a string', function(done){
					var sData;
					var subsid = oMediator.subscribe('data from fk-server', function(sDta){
						sData = sDta;
					});

					$('div#'+eSt+' input')[0].value = 'A random text';
					$('div#'+eSt+' input')[0].focus();
					console.log('Press enter key !');
					oMyUtilities.polling(
						function check(){
							return (!!sData);
						},
						function action(success){
							if(success){
								chai.assert.equal(sData, 'ACTION:'+eSt+',`A random text`\n', 'The ACTION command is not correct: '+JSON.stringify(sData));
							}
							else{
								chai.assert(false, 'The ACTION command was not received');
							}
							oMediator.unsubscribe(subsid);
							done();
						},
						10000
					);
				});
			});
		});
		$(function(){
			mocha.run().globals([ 'jQuery*' ]);
			testExecuted = true;
		});
	};
	return {
		run: _run
	};
})();
