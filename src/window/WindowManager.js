

import { SKIN, DEBUG, OBJECT_TYPE } from 'global/config';
import { BaseObject } from 'global/BaseObject';
import { Window } from 'window/Window';


export class WindowManager extends BaseObject {

	constructor () {
		if (DEBUG) {
			console.log('WindowManager constructor');
		}

		// We will init the BaseObject properties in the init method
		super();
		
		this.init();
	}

	init () {
		if (arguments.length === 0) {

			// Creates the dhtmlx object (see function below)
			var impl = new dhtmlXWindows(SKIN);

			// BaseObject init method
			super.init(OBJECT_TYPE.WINDOW_MANAGER, null, impl);

		} else {
			throw new Error('WindowManager init method requires no parameters');
		}
	}

	create (id, width, height) {
		// The window gets centered inside the Window object
		var coordX = 0 ; 
		var coordY = 0 ; 
		var windowImpl = this.impl.createWindow(id, coordX, coordY, width, height);
		var win = new Window(id, this, windowImpl);
		this.childs.push(win);
		return win;
	}
}
