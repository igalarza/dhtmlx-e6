
import { isNode , OBJECT_TYPE, SKIN, DEBUG } from 'global/config';
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

			// BaseObject init method
			super.init(name, OBJECT_TYPE.TREE, container, impl);
			
			// Enable onSelect event 
			if (actionManager != null) {
				this.attachEvent("onSelect", actionManager);
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
		if (isNode(container)) {
			
			impl = new dhtmlXTreeObject(container, "100%", "100%", 0);
		
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL) {			
			impl = container.impl.attachTree();
		}
		return impl;
	}
}
