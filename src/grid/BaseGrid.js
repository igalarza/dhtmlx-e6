
import { isNode , OBJECT_TYPE, SKIN, DEBUG } from 'global/config';
import { BaseObject } from 'global/BaseObject';

export class BaseGrid extends BaseObject {

	constructor (container, actionManager = null) {
		if (DEBUG) {
			console.log('BaseGrid constructor');
		}

		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length >= 1) {
			this.init(container, actionManager);
		}
	}

	init (container, actionManager = null) {

		if (arguments.length >= 1) {

			// Creates the dhtmlx object (see function below)
			var impl = this.initDhtmlxGrid(container);
			impl.setSkin(SKIN);

			// BaseObject init method
			super.init(OBJECT_TYPE.GRID, container, impl);
			
			// Enable onSelect event 
			if (actionManager != null) {
				this.attachEvent("onSelect", actionManager);
			}

		} else {
			throw new Error('BaseGrid init method requires one parameter');
		}
	}

	initDhtmlxGrid (container) {

		var impl = null;
		if (isNode(container)) {
			
			impl = new dhtmlXGridObject(container);
		
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL) {			
			impl = container.impl.attachGrid();
		}
		return impl;
	}

}