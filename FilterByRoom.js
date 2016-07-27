'use strict';

/**
 * Filters Revit instances based on the different rooms in the model.
 * 
 * @author Thomas Trinelle <thomas@flux.io>
 * @version 0.0.1
 *
 * @param {revitElement|[]revitElement} 	In			Any Revit instance defined by a location point.
 * @param {revitElement|[]revitElement} 	Room		Room instance from Revit.
 * 
 * @return {polyline} 						Countour	Boundary of the input room.
 * 
 * @notes: The point-in-polygon algorithm is written based on:
 * https://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
 *
 */
 
var list = require('flux/list');
var revit = require('flux-modelingjs').revit;
var modeling = require('flux-modelingjs').modeling();

// Get level of the room
function getMeshPoints(room){
	var mesh = list.Flatten(revit.selectParameter(room, "geometry").Out)
	var points = mesh[0].vertices
	return points;
}

function getMeshUnit(room){
	var mesh = list.Flatten(revit.selectParameter(room, "geometry").Out)
	var unit = mesh[0].units['\\']
	return unit;
}

// Get the elevation of the lower level to which the room is attached
function getRoomLowestElevation(points){
	var min = null;
	for (var p in points){
		if (min == null || min > points[p][2]) {
			min = points[p][2]
		}
	}
	return min;
}

// Get the list of points located on the lower level to which the room is attached
function getPointsOnLowerFace(points, minElevation, unit){
	var lowerCoor = []
	var lowerPoints = []
	for (var i = 0; i < list.Length(points); i++){
		var point = points[i]
		if (point[2] == minElevation){
			lowerCoor.push(point)
			var newPt = modeling.entities.point(point)
			newPt.units.point = unit
			lowerPoints.push(newPt)
		}
	}
	return {
		XYZ: lowerCoor,
		Obj: lowerPoints
	}
}

// Returns lines with clockwise ordered points of a polygon
function createLowerCountourPolyline(points, unit) {
	var polylinePoints = points
	polylinePoints.push(points[0])
    var polyline = {
    	primitive: "polyline",
    	units:{
    		points: unit
    	},
    	points: points
    }
    return polyline;
}

// Retrieve room boundary points & countour line
function getRoomBoundaries(Room) {
	var lowerPolyline = []
	var boundaryPoints = []
	for (var i = 0; i < Room.length; i++){
		var points = getMeshPoints(Room[i])
		var unit = getMeshUnit(Room[i])
		var minElevation = getRoomLowestElevation(points)
		var pts = getPointsOnLowerFace(points, minElevation, unit)
		// Adding outputs to the list
		boundaryPoints.push(pts.Obj)
		lowerPolyline.push(createLowerCountourPolyline(pts.XYZ, unit))
	}
	return {
		Points: boundaryPoints,
		Line: lowerPolyline
	}
}

// Checks if a pointis within a 2D polygon
function pointInPolygon(point, polygon){
	var x = point[0], y = point[1];
    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        var xi = polygon[i][0], yi = polygon[i][1];
        var xj = polygon[j][0], yj = polygon[j][1];
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// Retrieves the location points of the revit elements
function getElementLocations(revitElt){
	var location = revit.selectParameter(revitElt, "location")
	if ((location.Found) == false){
		console.error('Revit object has no location parameters.');
		return {
			point: "outsider",
			flag: true
		}
	}
	if ((location.Out.primitive) != "point"){
		console.error('Please input Revit Elements with "points" as location primitive');
		return {
			point: "outsider",
			flag: true
		}
	}
	return {
		point: location.Out.point,
		flag: false
	}
}


function run(In, Room) {
	var roomBoundaries = getRoomBoundaries(Room).Line
	var revitElement = list.Flatten(In)
	var revitEltLoc = []
	var Inside = []
	var Outside = revitElement
	// Get revit element location points
	for (var i = 0; i < revitElement.length; i++){
		var currLoc = getElementLocations(revitElement[i])
		if (currLoc.flag){
			return;
		}
		revitEltLoc.push(currLoc.point)
	}
	// Loop over the different rooms and check if the revit elements are located in it
	for (var j = 0; j < roomBoundaries.length; j++){
		var roomElt = []
		for (var i = 0; i < revitEltLoc.length; i++){
			var inRoom = pointInPolygon(revitEltLoc[i], roomBoundaries[j].points)
			if(inRoom){
				roomElt.push(In[i])
			}
			Outside.splice(i,1)
		}
		Inside.push(roomElt)
	}
	
	return {
		Inside: Inside,
		Outisde: Outside
	}
}

module.exports = {
    run: run
};
