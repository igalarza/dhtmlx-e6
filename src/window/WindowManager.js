

import { SKIN, DEBUG, OBJECT_TYPE } from 'global/config';
import { BaseObject } from 'global/BaseObject';
import { Window } from 'window/Window';


export class WindowManager extends BaseObject {

	constructor (name, container) {
		if (DEBUG) {
			console.log('WindowManager constructor');
		}

		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length === 2) {
			this.init(name, container);
		}
	}

	init (name, container) {
		if (arguments.length === 2) {

			// Creates the dhtmlx object (see function below)
			var impl = new dhtmlXWindows(SKIN);

			// BaseObject init method
			super.init(name, OBJECT_TYPE.WINDOW_MANAGER, container, impl);

		} else {
			throw new Error('WindowManager init method requires 2 parameters');
		}
	}

	create (name, width, height) {
		// The window gets centered inside the Window object
		var coordX = 0 ; 
		var coordY = 0 ; 
		var windowImpl = this.impl.createWindow(name, coordX, coordY, width, height);
		var win = new Window(name, this, windowImpl);
		this.childs.push(win);
		return win;
	}
}
