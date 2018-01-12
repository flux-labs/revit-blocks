'use strict';

/**
 * Creates updated Revit elements based of an updated table schedule.
 * 
 * @param {revitElements}     revitElements	  	List of Revit elements to update.
 * @param {[][]String}		  scheduleUpdate	List of updated parameters.
 *
 * @returns {{revitElements: []revitElement}}
 */

var revit = require("flux-modelingjs").revit;
var core = require("flux/core");
//var _ = require("flux/lodash");

function matchId(idParameter,revitElements, ParameterMap){
	for(var t = 0; t<revitElements.length; t++)
	{
		if(idParameter == 'ElementId'){
			if (revitElements[t]['instanceParameters']['ElementId'] == ParameterMap[idParameter]){
				revit.updateParameters(revitElements[t], ParameterMap);
			}
		}
		else if(idParameter == 'UniqueId'){
			if (revitElements[t]['instanceParameters']['UniqueId'] == ParameterMap[idParameter]){
				revit.updateParameters(revitElements[t], ParameterMap);
			}
		}
		else{
			if (revitElements[t]['fluxId'] == ParameterMap[idParameter]){
				revit.updateParameters(revitElements[t], ParameterMap);
			}
		}
	}
};

function newParamMap(){return new Object};

/**
 * Code block template.
 *
 */
function run(revitElements, scheduleUpdate) {
	//console.log(_.nth(scheduleUpdate,0));
	/*
	//	console.log(topRow);
	//console.log(revitElements.length);
	var newRow = function(){var Row = []; return Row};
	var schedule = [];
	//	schedule.push(parameterList);
	for (var i=0;i<revitElements.length;i++){
		//console.log("ok");
		var thisRow = newRow();
	//	for (var j=0;j<parameterList.length;j++){
			
	//		thisRow.push((revit.selectParameter(revitElements[i], parameterList[j]).Out));
			
	//	}
		schedule.push(thisRow);
		
	}
	*/
	//console.log(scheduleUpdate.length);
	var setParams = scheduleUpdate.shift();
	
	// UPDATE REVIT ELEMENTS BASED ON INCOMING UPDATED SCHEDULE
	var ParameterMap;
	
	for(var z = 0; z<scheduleUpdate.length;z++){
		ParameterMap = newParamMap();
		var path = [];
		var oldValues = [];
		var newValues = [];
		var curValues = [];
		var attributes = Object.keys(revitElements[z]);
		
		for (var i in setParams){
			core.Set(ParameterMap, setParams[i], scheduleUpdate[z][i]);
			
			// Finding the path of the attribute
			for (var j in attributes){
				var paramList = Object.keys(revitElements[z][attributes[j]])
				if (paramList.includes(setParams[i])){
					path.push(attributes[j])
					
					// Listing out the old and desired new values
					oldValues.push(revitElements[z][attributes[j]][setParams[i]])
					newValues.push(ParameterMap[setParams[i]])
					break
				}
			}
		}
		
		if (ParameterMap.fluxId != undefined)
		{
			//if schedule contains fluxId's, update according to fluxId
			//console.log(revitElements)
			matchId("fluxId",revitElements,ParameterMap);
		}
		else if(ParameterMap.UniqueId != undefined)
		{
			//if schedule contains UniqueId, update according to fluxId
			//console.log(revitElements)
			matchId("UniqueId",revitElements,ParameterMap);
		}
		else if(ParameterMap.ElementId != undefined)
		{
			//if schedule contains Revit elementId's, update according to elementId
			matchId("ElementId",revitElements,ParameterMap);
		}
		else
		{
			// OTHERWISE ASSUME ELEMENTS IN SAME ORDER POST EXCEL
			revit.updateParameters(revitElements[z], ParameterMap);
		}
		
		// Back-up brute force method to manually update the parameters value
		for (var i in setParams){
			curValues.push(revitElements[z][path[i]][setParams[i]]);
		}
		if (JSON.stringify(curValues) != JSON.stringify(newValues)){
			// Attempt to hard change them
			for (var i in setParams){
				if (path[i]){
					revitElements[z][path[i]][setParams[i]] = ParameterMap[setParams[i]]
				}
			}
		}
	}


	return {revitUpdate:revitElements} 
	
}

module.exports = {
    run: run
};
