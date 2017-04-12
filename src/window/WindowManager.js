

import { SKIN, DEBUG, OBJECT_TYPE } from 'global/config';
import { BaseObject } from 'global/BaseObject';
import { Window } from 'window/Window';


class WindowManager extends BaseObject {

	constructor (name) {
		if (DEBUG) {
			console.log('WindowManager constructor');
		}

		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length === 1) {
			this.init(name);
		}
	}

	init (name, container) {
		if (arguments.length === 1) {

			// Creates the dhtmlx object (see function below)
			var impl = new dhtmlXWindows(SKIN);

			// BaseObject init method
			super.init(name, OBJECT_TYPE.WINDOW_MANAGER, null, impl);

		} else {
			throw new Error('WindowManager init method requires 1 parameter');
		}
	}

	create (name, width, height) {
		// The window gets centered inside the Window object
		var coordX = 0 ; 
		var coordY = 0 ; 
		return this.impl.createWindow(name, coordX, coordY, width, height);
	}
}

// For now, only one WindowManager will do
let windowManager = new WindowManager('windowManager');

export { windowManager } ;
