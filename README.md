# revit-blocks
Experimental Flow blocks specific to Revit data structures

### `CreateSchedule`
#### Description
Create a table schedule by extracting parameters from a list of Revit elements.
#### Input:
* `revitElements`
* `parameterList`

#### Outputs:
* `schedule`

### `UpdateBySchedule`
#### Description
Creates updated Revit elements based of an updated table schedule.
#### Input:
* `revitElements`
* `scheduleUpdate`

#### Outputs:
* `revitElements`

### `CreateMaterialSchedule`
#### Description
Creates a material schedule based on a list of input Revit elements. Returns an empty array if the Material Info is not provided.
#### Input:
* `revitElements`

#### Outputs:
* `schedule`