(function(exports){	
	/**
	 * File: board.js
	 * 
	 * This module stores all the controls and monitors that are in the web.
	 * It uses an array and some methods to get or delete the controlls or monitors by its id.
	 * 
	 * Author: Nil Sanz Bertran
	 * Created on: Mar 13, 2013
	 */

	/**
	 * Arrays where monitors and controls are saved.
	 * @type {Array}
	 */
	var aElements = [];

	/**
	 * This function takes an array and returns the element within the array whose id matches the sId.
	 * @param  {array} aArray is the provided array to search into.
	 * @param  {string} sId    The key
	 * @return the element of the array or undefined if any element has the desired id.
	 */
	var getElementById = function (sId){
		for (var i = aElements.length - 1; i >= 0; i--) {
			if (aElements[i].sId === sId){
				return aElements[i];
			}
		}
	};

	/**
	 * This function returns a copy of the array of elements aElements
	 * @return {array} Copy of aElements
	 */
	var getElements = function(){
		var aCopy, sjsonElements;
		sjsonElements = JSON.stringify(aElements);
		aCopy = JSON.parse(sjsonElements);
		return aCopy;
	};

	/**
	 * Deletes the element with id sId within the array aElements.
	 * @param  {string} sId is the id.
	 */
	var deleteById = function (sId){
		var fnDelete = function(val, ind, arr){
			if (val.sId === sId){
				arr.splice(ind, 1);
			}
		};
		aElements.forEach(fnDelete);
	};

	var addElement = function (oElement){
		if (
			oElement && 
			oElement.sTypeOfElement in {'monitor':0, 'control':0} && 
			typeof(oElement.sId) === 'string' && 
			oElement.sType in {'buttons':0, 'switches':0, 'analog':0, 'string':0, 'options':0, 'boolean':0, 'digital':0} &&
			typeof(oElement.sName) === 'string' &&
			!getElementById(oElement.sId)
		){
			aElements.push(oElement);
			return oElement;
		}
		console.log('Error when adding the element to board: '+JSON.stringify(oElement));
		if (oElement){
			console.log('1');
		}
		if (oElement.sTypeOfElement in {'monitor':0, 'control':0}){
			console.log('2');
		}
		if (typeof(oElement.sId) === 'string') {
			console.log('3');
		}
		if (oElement.sType in {'buttons':0, 'switches':0, 'analog':0, 'string':0, 'options':0, 'boolean':0, 'digital':0}) {
			console.log('4');
		}
		if (typeof(sName) === 'string') {
			console.log('5');
		}
		if (!getElementById(oElement.sId)) {
			console.log('6');
		}
		return false;
	};

	/**
	 * This function sets the properties of the element corresponding to id
	 * @param  {object} oElement must contain at least 'sId' property
	 * @return {object}          The element modified
	 */
	var updateElement = function(oElement){
		if (!(oElement && oElement.sId)){
			console.log('Error when updating element in board. Must have "sId" property :'+JSON.stringify(oElement));
		}
		var oElem = getElementById(oElement.sId);
		if (oElem){
			var sProp;
			for (sProp in oElement){
				if (oElement.hasOwnProperty(sProp)){
					oElem[sProp] = oElement[sProp];
				}
			}
		}
		return oElem;
	};

	var clear = function(){
		return aElements.splice(0);
	};

	exports.getElementById = getElementById;
	exports.getElements = getElements;
	exports.deleteById = deleteById;
	exports.addElement = addElement;
	exports.updateElement = updateElement;
	exports.clear = clear;
})(typeof exports === 'undefined' ? window.oBoard = {} : exports);