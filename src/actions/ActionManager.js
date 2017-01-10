
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

	addActionObj (action) {
		this._actions[action.name] = action.impl;
	}

	addAction (name, impl) {
		this._actions[name] = impl;
	}
	
	get context () {
		return this._context;
	}
	
	get actions () {
		return this._actions;
	}
}