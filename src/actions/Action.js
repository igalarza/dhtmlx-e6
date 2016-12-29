

export class Action {
		
	constructor (name, parentName, action, caption = null, icon = null, iconDisabled = null) {
		
		// Mandatory fields
		this._name = name;
		this._parentName = parentName;
		this._action = action;
		
		// Optional fields 
		if (caption != null) {
			this._caption = caption;
		}
		
		if (icon != null) {
			this._icon = icon;
		}
		
		if (iconDisabled != null) {
			this._iconDisabled = iconDisabled;
		}
	}
	
	get name () { return this._name; }
	get parentName () { return this._parentName; }
	get action () { return this._action; }
	get caption () { return this._caption; }
	get icon () { return this._icon; }
	get iconDisabled () { return this._iconDisabled; }
}