
import { OBJECT_TYPE, DEBUG, SKIN } from 'global/config';
import { Util } from 'global/Util';
import { BaseObject } from 'global/BaseObject';

export class Form extends BaseObject {
		
	constructor (name, container, actionManager = null) {
		if (DEBUG) {
			console.log('Form constructor');
		}
		
		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length === 3) {
			this.init(name, container, actionManager);
		}
	}
	
	init (name, container, actionManager = null) {

		// Creates the dhtmlx object
		var impl = this.initDhtmlxForm(container);
		impl.setSkin(SKIN);

		// BaseObject init method
		super.init(name, OBJECT_TYPE.FORM, container, impl);
	}
	
	initDhtmlxForm (container) {
		var impl = null;
		if (Util.isNode(container)) {
			impl = new dhtmlXForm(container, null);
			
		} else if (container.type === OBJECT_TYPE.LAYOUT_CELL
			|| container.type === OBJECT_TYPE.WINDOW
			|| container.type === OBJECT_TYPE.TAB) {
			
			impl = container.impl.attachForm();			
		} else {
			throw new Error('initDhtmlxForm: container is not valid.');
		}
		
		return impl;
	}
}