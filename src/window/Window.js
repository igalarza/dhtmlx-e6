
import { DEBUG, OBJECT_TYPE } from 'global/config';
import { BaseObject } from 'global/BaseObject';

/**
  * 
  */	 
export class Window extends BaseObject {

	constructor (name, container, impl) {
		if (DEBUG) {
			console.log('Window constructor');
		}

		// We will init the BaseObject properties in the init method
		super();
		
		if (arguments.length === 3) {
			this.init(name, container, impl);
		}
	}

	init (name, container, impl) {
		if (arguments.length === 3) {

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