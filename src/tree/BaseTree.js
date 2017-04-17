
import { OBJECT_TYPE, SKIN, DEBUG, TREE_ICONS_PATH } from 'global/config';
import { Util } from 'global/Util';
import { BaseObject } from 'global/BaseObject';

/**
  * Base class for all TreeView objects, see:
  * http://docs.dhtmlx.com/treeview__index.html
  */
export class BaseTree extends BaseObject {

	constructor (name, container, actionManager = null) {
		if (DEBUG) {
			console.log('BaseTree constructor');
		}

		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length >= 2) {
			this.init(name, container, actionManager);
		}
	}

	init (name, container, actionManager = null) {

		if (arguments.length >= 2) {

			// Creates the dhtmlx object (see function below)
			var impl = this.initDhtmlxTree(container);
			impl.setSkin(SKIN);
			impl.setIconsPath(TREE_ICONS_PATH);

			// BaseObject init method
			super.init(name, OBJECT_TYPE.TREE, container, impl);
			
			// Enable onSelect event 
			if (actionManager != null) {
				this.attachActionManager("onSelect", actionManager);
			}

		} else {
			throw new Error('BaseTree init method requires 2 parameters');
		}
	}

	addItem (treeItem) {

		this.impl.addItem(treeItem.id, treeItem.text, treeItem.parentId);
		this._childs[treeItem.id] = treeItem.action;
	}

	initDhtmlxTree (container) {

		var impl = null;
		if (Util.isNode(container)) {
			// call to dhtmlx object constructor 
			impl = new dhtmlXTreeObject(container, "100%", "100%", 0);
		
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL) {
			impl = container.impl.attachTree();
			
		} else {
			throw new Error('initDhtmlxTree: container is not valid.');
		}
		return impl;
	}
}
