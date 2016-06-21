'use strict';


var revit = require("flux-modelingjs").revit;
var core = require("flux/core");
/**
 * Code block template.
 *
 */
function run(revitElements, editParam, xSortParam, ySortParam, scheduleUpdate) {

// REMOVE X AND Y AXIS TITLES FROM INCOMING SCHEDULE UPDATE
for(var e = 0; e<scheduleUpdate.length; e++){scheduleUpdate[e].shift()}
scheduleUpdate.pop();

// EXTRACT THE X-AXIS SORTING PARAM, Y-AXIS SORTING PARAM, AND EDITABLE PARAM FROM REVIT ELEMENTS
var data = [];
var miniRow;
var miniRowCreate = function(){var miniRow = []; return miniRow};

for(var q = 0; q<revitElements.length;q++){
	miniRow = miniRowCreate();
	miniRow.push(revit.selectParameter(revitElements[q], editParam).Out);
	miniRow.push(revit.selectParameter(revitElements[q], xSortParam).Out);
	miniRow.push(revit.selectParameter(revitElements[q], ySortParam).Out);
	data.push(miniRow);
}

// data NOW CONTAINS THE INFO TO CONSTRUCT THE 2D TABLE AND INSERT THE PARAMS


// FIND THE UNIQUE VALUES IN THE X AND Y AXIS SORTING PARAMS
var colMarkSet = new Set();
var levelsSet = new Set();

for (var i = 0; i<data.length;i++){
	// LEVELS REFERS TO Y-AXIS PARAM
	if (levelsSet.has(data[i][2])){}
	else
	{levelsSet.add(data[i][2])}
	// COL MARK REFERS TO X-AXIS PARAM
	if (colMarkSet.has(data[i][1])){}
	else
	{colMarkSet.add(data[i][1])}
}

// SORT THE AXES PARAMS SO THAT THE ORIGIN IS LOWER LEFT CORNER
// ASSUMINGING HERE THAT USERS PREFER TO EXTRACT SORT AND UPDATE VALUES ON Y-AXIS BY LEVEL
let levels = Array.from(levelsSet).sort().reverse();
let colMark = Array.from(colMarkSet).sort();

// CONSTRUCT THE BLANK ARRAY
var schedule = [];

var cell = function(){var cellBlank = ""; return cellBlank}
var row = function(){
	var rowBlank = [];
	for (var q = 0;q<colMark.length;q++){
		rowBlank.push(cell());
	}
	return rowBlank
};

for (var t = 0; t<levels.length;t++){schedule.push(row())}

// PLACE THE DATA FROM THE REVIT ELEMENTS IN THE CORRECT EXCEL CELLS
// (CURRENTLY ONLY ONE VALUE PER CELL) - SHOULD UPDATE CELLS TO BE STACKS?
var revitUpdate = [];
for (var j = 0; j<data.length;j++){
	var x = levels.indexOf(data[j][2]);
	var y = colMark.indexOf(data[j][1]);
	schedule[x][y] = data[j][0];
	revitUpdate.push(scheduleUpdate[x][y]);
}

// REMOVE X AND Y AXIS TITLES FROM INCOMING SCHEDULE
schedule.push(colMark);
for (var w = 0;w<levels.length+1;w++){
	schedule[w].unshift(levels[w]);
}

// UPDATE REVIT ELEMENTS BASED ON INCOMING UPDATED SCHEDULE
var ParameterMap = new Object;

for(var z = 0; z<revitElements.length;z++){
	core.Set(ParameterMap, editParam, revitUpdate[z])
	revit.updateParameters(revitElements[z], ParameterMap)
}

// WRITE BLOCK OUTPUTS
return {schedule:schedule, revitUpdate:revitElements} 
	
}

module.exports = {
    run: run
};
