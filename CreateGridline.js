'use strict';

var core = require("flux/core");
var revit = require("flux-modelingjs").revit;

/**
 * Helper block to construct Level Revit elements.
 *
 * @param {String || Array.<String>} [FluxId]
 * @param {String || Array.<String>} [LevelType] Type of gridline to create.
 * @param {Array.<Number> || Number} Line The line for the gridline.
 * @param {Array.<String> || String} Name The name of each gridline
 * @param {Object || []Object} [ParameterMap] Instance parameters to be assigned to the Level.
 * @param {Object || []Object} [ParameterMap] Custom parameters to be assigned to the Level.
 * @returns {{Out: Array.<revitElement> || revitElement}} The created gridlines.
 */

function isInvalid(x) {
    return x === null || x === undefined;
}
 
function checkForKeys(obj, keys) {
    var missingKeys = keys.filter(function(key) {
        return !obj.hasOwnProperty(key) || isInvalid(obj[key]);
    });
    if (missingKeys.length > 0) {
        return missingKeys;
    }
}
 
function createGridline(fluxId, GridType, line, name, instanceParams, customParams) {
    var familyInfo = {
        category: "Grids",
        family: "Grid",
        type: GridType,
        placementType: "Invalid"
    };
    var geomParams = {
        name: name,
        curve: line
    };
    var missingParams = checkForKeys(familyInfo, ["type"]);
    if (missingParams) {
        return {Error: "Gridline element could not be created: Missing required familyinfo parameters " + missingParams.join(", ")};
    }
    missingParams = checkForKeys(geomParams, ["name", "curve"]);
    if (missingParams) {
        return {Error: "Gridline element could not be created: Missing required geometry parameters " + missingParams.join(", ")};
    }
    var gridline = revit.createElement(fluxId, familyInfo, geomParams, instanceParams, undefined, customParams);
    if (gridline.Error) {
        return {Error: "Gridline " + gridline.Error};
    }
    return gridline;
} 
 
 

function run(FluxId, Type, Line, Name, InstanceParamMap, CustomParamMap) {
    // Escape early if required inputs are not provided.
    if (core.IsInvalid(Type) || core.IsInvalid(Line) || core.IsInvalid(Name)) {
        // TODO (Jaydeep): Remove this when we can visually indicate required parameters.
        console.warn("Missing required parameter(s). Require Type, Line and Name.");
        return;
    }

    // Line is the mandatory parameter. We would create as many gridlines
    // as number of lines provided.
    var isSingleton = !Array.isArray(Line);
    var hasFluxId = !core.IsInvalid(FluxId);
    var len = 1;
    if (!isSingleton) {
        // We will create one gridline for each Line input provided
        len = Line.length;

        // Make sure that if FluxIds are provided then there is one FluxId
        // for each elevation value provided.
        if (hasFluxId) {
            if (!Array.isArray(FluxId) || (Array.isArray(FluxId) && len !== FluxId.length)) {
                console.error("Please provide a unique FluxId for each input Line.");
                return;
            }
        }

    }

    // Warn if any other inputs are too long. If they're too short, we rely on the constructor to warn.
    core.WarnInputTooLong(Type, "Type", len);
    core.WarnInputTooLong(Name, "Name", len);
    core.WarnInputTooLong(InstanceParamMap, "Instance Parameters", len);
    core.WarnInputTooLong(CustomParamMap, "Custom Parameters", len);

    var gridlines = [];
    var line, fluxId, type, name, instParamMap, custParamMap;
    for (var i = 0; i<len; i++) {
        line = core.GetIndexOrLast(Line, i);
        type = core.GetIndexOrLast(Type, i);
        name = core.GetIndexOrLast(Name, i);
        instParamMap = core.GetIndexOrLast(InstanceParamMap, i);
        custParamMap = core.GetIndexOrLast(CustomParamMap, i);
        if (hasFluxId) {
            fluxId = core.GetIndexOrLast(FluxId, i);
        }
        
        var gridline = createGridline(fluxId, type, line, name, instParamMap, custParamMap);
        if (gridline.Error) {
            if (isSingleton) {
                console.warn(gridline.Error);
            } else {
                console.warn("%dth " + gridline.Error, i);
            }
        }
        gridlines.push(gridline.Out);
    }

    return {
        Out: isSingleton ? gridlines[0] : gridlines
    };
}

module.exports = {
    run: run
};
