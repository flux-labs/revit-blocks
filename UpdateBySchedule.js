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
		if (revitElements[t][idParameter] == ParameterMap[idParameter]){
			revit.updateParameters(revitElements[t], ParameterMap);
		}
	}
};

function newParamMap(){return new Object};

/**
 * Code block template.
 *
 */
function run(revitElements, scheduleUpdate) {
	var revitElements;
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
	
	for(var g = 0;g<setParams.length;g++){
		core.Set(ParameterMap, setParams[g], scheduleUpdate[z][g]);
	}
	if (ParameterMap.fluxId != undefined)
	{
		//if schedule contains fluxId's, update according to fluxId
		//console.log(revitElements)
		matchId("fluxId",revitElements,ParameterMap);
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
}


return {revitUpdate:revitElements} 
	
}

module.exports = {
    run: run
};
