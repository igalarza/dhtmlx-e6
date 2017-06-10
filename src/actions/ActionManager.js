
import { Action } from 'actions/Action';
import { MenuItem } from 'menu/MenuItem';
import { TreeItem } from 'tree/TreeItem';

export class ActionManager {
	
	constructor (context, parent = null) {
		this._context = context;
		this._actions = [];
		this._parent = parent;
		this._childs = [];
		
		if (parent !== null) {
			parent.childs.push(this);
		}
	}
	
	run (action, params, context) {
		this._actions[action](params, context);
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
	
	get childs () {
		return this._childs;
	}
	
	get context () {
		return this._context;
	}
	
	get parent () {
		return this._parent;
	}
	
	get actions () {
		return this._actions;
	}
}