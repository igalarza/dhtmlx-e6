
import { Action } from 'actions/Action';
import { MenuItem } from 'menu/MenuItem';
import { TreeItem } from 'tree/TreeItem';

export class ActionManager {
	
	constructor (context) {
		this._context = context;
		this._actions = [];
	}
	
	createMenuItem (parentName, actionName, caption, icon, iconDisabled) {		
		var action = this.actions[actionName];
		return new MenuItem(parentName, actionName, action, caption, icon, iconDisabled);
	}

	createTreeItem (parentName, actionName, caption) {		
		var action = this.actions[actionName];
		return new TreeItem(parentName, actionName, caption, action);
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