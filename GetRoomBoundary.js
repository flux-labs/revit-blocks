'use strict';

/**
 * Retrieves the boundaries of Revit Room objects.
 * 
 * @author Thomas Trinelle <thomas@flux.io>
 * @version 0.0.1
 *
 * @param {revitElement|[]revitElement} 	Room		Room instance from Revit. 
 * 
 * @return {polyline} 						Countour	Boundary of the input room.
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
	//console.log(lowerCoor)
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

function run(Room) {
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

module.exports = {
    run: run
};
