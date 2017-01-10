
import { isNode , OBJECT_TYPE, SKIN, DEBUG } from 'global/config';
import { BaseObject } from 'global/BaseObject';

/**
  * Base class for all tree objects, see:
  * http://docs.dhtmlx.com/tree__index.html
  */
export class BaseTree extends BaseObject {

	constructor (container, actionManager = null) {
		if (DEBUG) {
			console.log('BaseTree constructor');
		}

		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length >= 1) {
			this.init(container, actionManager);
		}
	}

	init (container, actionManager = null) {

		if (arguments.length === 1) {

			// Creates the dhtmlx object (see function below)
			var impl = this.initDhtmlxTree(container);

			impl.setSkin(SKIN);

		} else {
			throw new Error('BaseTree init method requires one parameter');
		}
	}

	addItem (treeItem) {

		this.impl.insertNewItem(treeItem.parentId, treeItem.id, treeItem.text);

	}

	initDhtmlxTree (container) {

		var impl = null;
		if (isNode(container)) {
			
			impl = new dhtmlXTreeObject(container, "100%", "100%", 0);
		
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL) {			
			impl = container.impl.attachTree(pattern);
		}
		return impl;
	}
}