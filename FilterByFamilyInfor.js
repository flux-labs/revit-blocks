'use strict';

var core = require("flux/core");
var list = require("flux/list");
var revit = require("flux-modelingjs").revit;

/**
 * Filters Revit element with given Category, Family or Type.
 *
 * @param {revitElement|[]revitElement} In
 * @param {String|[]String} Category
 * @param {String|[]String} Family
 * @param {String|[]String} Type
 *
 * @return {
 *     {Out: revitElement|[]revitElement} Elements possessing requested Category, Family or Type
 *     {Rest: revitElement|[]revitElement}  Elements which do not possess requested Category, Family or Type
 *     {Found: Boolean|[]Boolean}  True if element possesses requested Category, Family or Type
 *         }
 */

var defaultFamily = ""


function getElementOfCategory(elements, Category, catMask) {
	var catPath = "familyInfo/Category"
	for (var i = 0; i < elements.length; i++) {
		var eltCat = core.Get(elements[i], catPath).Out
		catMask[i] = (eltCat == Category)
	}
	return catMask;
}

function getElementOfFamily(elements, Family, famMask) {
	var famPath = "familyInfo/Family"
	for (var i = 0; i < elements.length; i++) {
		var eltFam = core.Get(elements[i], famPath).Out
		famMask[i] = (eltFam == Family)
	}
	return famMask;
}

function getElementOfType(elements, Type, typeMask) {
	var typePath = "familyInfo/Type"
	for (var i = 0; i < elements.length; i++) {
		var eltType = core.Get(elements[i], typePath).Out
		typeMask[i] = (eltType == Type)
	}
	return typeMask;
}

function run(In, Category, Family, Type) {
	// Initializing input list
	var elements = list.Flatten(In, false)
	var catList = list.Flatten([Category], false)
	var famList = list.Flatten([Family], false)
	var typeList = list.Flatten([Type], false)
	
	// Initializing Masks
	var catMask = Array(elements.length).fill(true)
	var famMask = Array(elements.length).fill(true)
	var typeMask = Array(elements.length).fill(true)
	
	// Get Masks for each inputs
	if (!!Category) {
		for (var i = 0; i < catList.length; i++) {
			getElementOfCategory(In, catList[i], catMask)
		}
	}
	
	if (!!Family) {
		for (var i = 0; i < famList.length; i++) {
			getElementOfFamily(In, famList[i], famMask)
		}
	}
	
	if (!!Type) {
		for (var i = 0; i < typeList.length; i++) {
			getElementOfType(In, typeList[i], typeMask)
		}
	}
	
	var mask = []
	var maskNot = []
	for (var i=0; i < elements.length; i++){
		var filter = catMask[i] && famMask[i] && typeMask[i]
		mask.push(filter)
		maskNot.push(!filter)
	}

    return {
    	Out: list.Filter(elements, mask),
    	Rest: list.Filter(elements, maskNot),
    	Found: mask
    };
}

module.exports = {
    run: run
};
