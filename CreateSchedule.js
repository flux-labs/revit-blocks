'use strict';


var revit = require("flux-modelingjs").revit;
var core = require("flux/core");

/**
 * Create a table schedule by extracting parameters from a list of Revit elements.
 * 
 * @param {revitElements}     revitElements	  	List of Revit elements to extract the information from.
 * @param {[]String}		  parameterList		List of parameters to add in the schedule.
 *
 * @returns {{Table: 2D Array.<*>}}
 */

function run(revitElements, parameterList) {

	var newRow = function(){var Row = []; return Row};
	var schedule = [];
	schedule.push(parameterList);
	for (var i=0;i<revitElements.length;i++){
		var thisRow = newRow();
		for (var j=0;j<parameterList.length;j++){
			
			thisRow.push((revit.selectParameter(revitElements[i], parameterList[j]).Out));
			
		}
		schedule.push(thisRow);
	}

return {schedule:schedule} 
	
}

module.exports = {
    run: run
};
