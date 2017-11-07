'use strict';
var revit = require("flux-modelingjs").revit;
var core = require("flux/core");
var list = require("flux/list")


/**
 * Create a table schedule by extracting parameters from a list of Revit elements.
 * 
 * @param {revitElements}     revitElements	  	List of Revit elements to extract the information from.
 * @param {[]String}		  parameterList		List of parameters to add in the schedule.
 *
 * @returns {{Table: 2D Array.<*>}}
 */

function run(revitElements) {
	var parameterList = ["name","volume"];
	var revitEltMaterials = list.Flatten(selectParameters(revitElements, "materialInfo").Values,false);
	var newRow = function(){var Row = []; return Row};
	var schedule = [];
	var names = [];
	var volumes = {};
	for (var i=0;i<revitEltMaterials.length;i++){
		var thisElt = revitEltMaterials[i]
		if (thisElt != false) {
			let name = selectParameters(thisElt, "name").Values;
			if (!volumes[name]){
				volumes[name] = selectParameters(thisElt, "volume").Values;
				names.push(name)
			} else {
				volumes[name] += selectParameters(thisElt, "volume").Values;
			}
		}
	}
	schedule.push(["Material Name", "Material Volume"]);
	for (var i = 0; i < names.length; i++) {
		schedule.push([names[i],volumes[names[i]]])
	}
	return {
		schedule:schedule
	}
};

module.exports = {
    run: run
};



/**
 * Select the given parameter values from the input elements.
 *
 * @param {[]revitElement} Elements List of elements to select parameters from.
 * @param {[]String} Parameters List of parameters to select.
 * @returns {{Values: [][]*, ParameterMaps: []Object}} The extracted values, one row per element.
 * Also includes an array of parameter:value maps, as convenience.
 */
function getParameter(element, parameter) {
    var checkValue = revit.selectParameter(element, parameter);
    if (!checkValue.Found) {
        return {out: null, valid: true, found: false, msg: "Element does not have a " + parameter + " parameter."};
    }
    return {out: checkValue.Out, valid: true, found: true};
}

function selectParameters(Elements, Parameters) {
    if (!Array.isArray(Elements) && !Array.isArray(Parameters)) {
        var value = getParameter(Elements, Parameters);
        if (!value.valid) {
            console.error(value.msg);
        } else if (!value.found) {
            console.warn(value.msg);
        }

        var parameterMap = {};

        parameterMap[Parameters] = value.out;
        return {
            Values: value.out,
            ParameterMaps: parameterMap
        };
    }

    if (!Array.isArray(Elements)) {
        Elements = [Elements];
    }

    var allParameters = [];
    var allValues = [];
    if (!Array.isArray(Parameters)) {
        Elements.forEach(function(el, elIndex) {
            var value = getParameter(el, Parameters);
            if (!value.valid) {
                console.error("%dth " + value.msg, elIndex);
            } else if (!value.found) {
                console.warn("%dth " + value.msg, elIndex);
            }
            var parameterMap = {};
            parameterMap[Parameters] = value.out;
            allParameters.push(parameterMap);
            allValues.push(value.out);
        });
        return {
            Values: allValues,
            ParameterMaps: allParameters
        };
    }

    Elements.forEach(function(el, elIndex) {
        var parameters = {};
        var values = [];
        var missingParameters = [];
        Parameters.forEach(function(p) {
            var value = getParameter(el, p);
            if (!value.found) {
                missingParameters.push(p);
            }
            values.push(value.out);
            parameters[p] = value.out;
        });
        if (missingParameters.length > 0) {
            var msg = "%dth element does not have the following parameters: " +  missingParameters.join(", ");
            console.warn(msg, elIndex);
        }
        allParameters.push(parameters);
        allValues.push(values);
    });

    return {
        Values: allValues,
        ParameterMaps: allParameters
    };
}