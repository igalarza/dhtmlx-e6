
import { OBJECT_TYPE, DEBUG, SKIN, MENU_ICONS_PATH } from 'global/config';
import { Util } from 'global/Util';
import { BaseObject } from 'global/BaseObject';
import { Action } from 'actions/Action';
import { MenuItem } from 'menu/MenuItem';

/**
 * Base class for Menu objects, see:
 * http://docs.dhtmlx.com/menu__index.html
 */
export class Menu extends BaseObject {
	
	/**
	 * @constructor
	 * @param {mixed} container - Object or dom id of the parent element.
	 * @param {actionManager} ActionManager - Contains the actions the menu will execute.
	 */
	constructor (name, container, actionManager) {
		if (DEBUG) {
			console.log('Menu constructor');
		}

		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length === 3) {
			this.init(name, container, actionManager);
		}	
	}

	init (name, container, actionManager) {

		// Creates the dhtmlx object
		var impl = this.initDhtmlxMenu(container);
		impl.setIconsPath(MENU_ICONS_PATH);

		// BaseObject init method
		super.init(name, OBJECT_TYPE.MENU, container, impl);
		
		// Enable onClick event 
		this.attachActionManager("onClick", actionManager);
	}
	
	/**
	 * Adds a text container (with no action) to the menu.
	 * @param {mixed} container - Object or dom id of the parent element.
	 * @param {name} string - The name that identifies the MenuItem.
	 * @param {caption} string - The visible text of the container.
	 * @param {parentName} string - The name of the parent MenuItem (default null).
	 * returns {Menu} The menu object itself, to chain item creation.
	 */
	addTextContainer (name, caption, parentName = null) {
            let menuItem = new MenuItem(parentName, name, null, caption);
            return this.addMenuItem(menuItem);
	}
	
	/**
	 * Adds a MenuItem (with action) to the menu container 
	 * @param {MenuItem} menuItem - The MenuItem object, usually created in the ActionManager
	 * returns {Menu} The menu object itself, to chain item creation
	 */
	addMenuItem (menuItem) {
		if (typeof menuItem.parentName === 'undefined') {
                    menuItem.parentName = null;
		} 
                this.impl.addNewChild(menuItem.parentName, (this._childs.length), menuItem.name, menuItem.caption, false, menuItem.icon, menuItem.iconDisabled);		
		this._childs.push(menuItem);
		// curryfing!
		return this;
	}

	/** Creates the dhtmlXMenuObject inside its container. */
	initDhtmlxMenu(container) {
		var impl = null;
        // container can be null
		if (container == null || Util.isNode(container)) {
			impl = new dhtmlXMenuObject(container, SKIN);
			
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL  
			|| container.type === OBJECT_TYPE.LAYOUT
			|| container.type === OBJECT_TYPE.WINDOW) {
			
			impl = container.impl.attachMenu();
			impl.setSkin(SKIN);
		} else {
			throw new Error('initDhtmlxMenu: container is not valid.');
		}
		return impl;
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