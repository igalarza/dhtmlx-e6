
import { OBJECT_TYPE, SKIN, DEBUG, GRID_ICONS_PATH } from 'global/config';
import { Util } from 'global/Util';
import { BaseObject } from 'global/BaseObject';

export class PropertyGrid extends BaseObject {
	
	constructor (name, container, actionManager = null) {
		if (DEBUG) {
			console.log('BaseGrid constructor');
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
			var impl = this.initDhtmlxPropertyGrid(container);
			impl.setSkin(SKIN);
			impl.setIconsPath(GRID_ICONS_PATH);

			// BaseObject init method
			super.init(name, OBJECT_TYPE.GRID, container, impl);
			
			// Enable onSelect event 
			if (actionManager != null) {
				this.attachActionManager("onSelect", actionManager);
			}

		} else {
			throw new Error('PropertyGrid init method requires 2 parameters');
		}
	}
	
	initDhtmlxPropertyGrid (container) {
		
		var impl = null;
		if (Util.isNode(container)) {
			
			impl = new dhtmlXPropertyGrid(container);
		
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL ||
			container.type === OBJECT_TYPE.WINDOW ||
			container.type === OBJECT_TYPE.TAB) {
				
			impl = container.impl.attachPropertyGrid();
		} else {
			throw new Error('initDhtmlxToolbar: container is not valid.');
		}
		return impl;
	}
}
