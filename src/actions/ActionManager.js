
import { Action } from 'actions/Action';
import { MenuItem } from 'menu/MenuItem';

export class ActionManager {
	
	constructor (context) {		
		this._context = context;
		this._actions = [];
	}
	
	createMenuItem (actionName, parentName, caption, icon, iconDisabled) {		
		var action = this.actions[actionName];
		return new MenuItem(parentName, actionName, action, caption, icon, iconDisabled);
	}
	
	addAction (action) {
		this._actions[action.name] = action.impl;
	}
	
	get context () {
		return this._context;
	}
	
	get actions () {
		return this._actions;
	}
}