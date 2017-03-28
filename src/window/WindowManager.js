

import { SKIN, DEBUG } from 'global/config';
import { BaseObject } from 'global/BaseObject';


export class WindowManager extends BaseObject {

	constructor () {
		if (DEBUG) {
			console.log('BaseTree constructor');
		}

		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length === 0) {
			this.init();
		}
	}

	init () {
		if (arguments.length === 0) {

			// Creates the dhtmlx object (see function below)
			var impl = new dhtmlXWindows(SKIN);

			// BaseObject init method
			super.init(OBJECT_TYPE.WINDOW, null, impl);

		} else {
			throw new Error('WindowManager init method requires no parameters');
		}
	}
}
