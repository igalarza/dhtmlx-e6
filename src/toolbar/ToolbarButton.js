


export class ToolbarButton {
	
	constructor (type, name, action, caption, icon = null, iconDisabled = null) {
		
		this._type = type;
		this._name = name;
		this._action = action;
		this._caption = caption;
		this._icon = icon;
		this._iconDisabled = iconDisabled;
	}
	
	get type () { return this._type; }
	get name () { return this._name; }
	get action () { return this._action; }
	get caption () { return this._caption; }
	get icon () { return this._icon; }
	get iconDisabled () { return this._iconDisabled; }
}