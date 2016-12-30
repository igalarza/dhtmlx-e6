
import { isNode , OBJECT_TYPE , DEBUG , SKIN } from 'global/config';
import { BaseObject } from 'global/BaseObject';
import { Action } from 'actions/Action';
import { MenuItem } from 'menu/MenuItem';

/**
 * Base class for Menu objects, see:
 * http://docs.dhtmlx.com/menu__index.html
 */
export class Menu extends BaseObject {
	
	constructor (container, actionManager) {
		if (DEBUG) {
			console.log('Menu constructor');
		}
		var impl = null;
		if (isNode(container)) {
			impl = new dhtmlXMenuObject(container, SKIN);
			
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL  
			|| container.type === OBJECT_TYPE.LAYOUT
			|| container.type === OBJECT_TYPE.WINDOW) {
			
			impl = container.impl.attachMenu();
			impl.setSkin(SKIN);
		}
		
		super(OBJECT_TYPE.MENU, container, impl);
		
		this._itemCounter = 0;
		this._actionManager = actionManager;
		
		var self = this;
		impl.attachEvent("onClick", function (id, zoneId, cas) {
			if (DEBUG) {
				console.log('Menu onClickEvent');
			}
			
			if (typeof self._childs[id] === 'function') {
				// The context in the actionManager is sent to the action
				self._childs[id](self._actionManager.context);
			}
		});
	}
	
	addTextContainer (name, caption, parentName = null) {		
		return this.addMenuItem(new MenuItem(parentName, name, null, caption));
	}
	
	addMenuItem (menuItem) {
		if (menuItem.parentName === '') {
			this.impl.addNewSibling(null, menuItem.name, menuItem.caption, menuItem.icon, menuItem.iconDisabled);
		} else {
			this.impl.addNewChild(menuItem.parentName, (++ this._itemCounter), menuItem.name, menuItem.caption, menuItem.icon, menuItem.iconDisabled);
		}
		this._childs[menuItem.name] = menuItem.action;
		// curryfing!
		return this;
	}
	
	set childs (menuItems) {
		// Clean array first
		this._childs = [];
		
		// Populate array
		for (var i = 0; i < menuItems.length; i++) {
			this.addMenuItem(menuItems[i]);
		}
	}
}