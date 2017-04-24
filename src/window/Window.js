
import { DEBUG, OBJECT_TYPE } from 'global/config';
import { BaseObject } from 'global/BaseObject';
import { windowManager } from 'window/WindowManager';

/**
  * 
  */	 
export class Window extends BaseObject {

	constructor (name, container, width, height) {
		if (DEBUG) {
			console.log('Window constructor');
		}

		// We will init the BaseObject properties in the init method
		super();
                
                let impl = windowManager.create(name, width, height);
		
		if (arguments.length === 4) {
			this.init(name, container, impl);
		}
	}

	init (name, container, impl) {
		if (arguments.length === 4) {

			// BaseObject init method
			super.init(name, OBJECT_TYPE.WINDOW, container, impl);

			// Centered by default
			impl.centerOnScreen();

			// Modal by default
			impl.setModal(true);

		} else {
			throw new Error('Window init method requires 3 parameters');
		}
	}
}