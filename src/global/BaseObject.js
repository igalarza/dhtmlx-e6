
import { DEBUG } from 'global/config';

/**
  * Parent class of all the objects in the library, it holds some common variables.
  */	 
export class BaseObject {
	
	/**
	 * Called by child objects.
	 * @constructor
	 * @param {string} type - Type of component: layout, window, grid, etc.
	 * @param {mixed} container - Object or dom id of the parent element.
	 * @param {object} impl - dhtmlx object, must be created by child class.
	 */
    constructor (type, container, impl) {
		// It can be called without arguments, for testing integration reasons.
		if (arguments.length === 3) {
			this.init(type, container, impl);
		}		
    }
	
	init (type, container, impl) {			
		if (arguments.length === 3) {
			// Clean up before assignations
			this.destroy();
			// Init properties
			this._type = type;
			this._container = container;
			this._impl = impl;
			this._childs = [];	
		} else {
			throw new Error('BaseObject init method requires 3 parameters');
		}
	}
	
	/** Destroys the object and all this childs. */
	destroy () {
		// First, the childs
		if (typeof this._childs !== 'undefined') {
			while (this.childs.length > 0) {
				var child = this.childs.pop();
				if (typeof child === 'object' 
					&& typeof child.destroy === 'function') {
						
					child.destroy();
				}			
			}
		}
		
		// Finally, the object
		if (typeof this._impl !== 'undefined' &&
			typeof this.impl.unload === 'function') {
			if (DEBUG) {
				console.log('Call to unload() in destroy method.');
			}
			this.impl.unload();
		}
	}
	
	attachEvent (eventName, actionManager) {
		var self = this;
		this.impl.attachEvent(eventName, function (id, zoneId, cas) {
			if (DEBUG) {
				console.log('Menu onClickEvent');
			}
			
			if (typeof self._childs[id] === 'function') {
				// The context in the actionManager is sent to the action
				self._childs[id](actionManager.context);
			}
		});
	}
	
    /**
     * Type of component: layout, window, grid, etc. 
     */
	get type () {
		if (typeof this._type !== 'undefined') {
			return this._type;
		} else {
			throw new Error('this._type is undefined: init method has not been called');
		}
	}
	
	/**
     * Usually is other dhtmlxObject, the root layout should be inside document.body
     */
	get container () { 
		if (typeof this._container !== 'undefined') {
			return this._container;
		} else {
			throw new Error('this._container is undefined: init method has not been called');
		}
	}
	
	/**
     * dhtmlx object, must be created by child class before calling super in the constructor.
     */
	get impl () {
		if (typeof this._impl !== 'undefined') {
			return this._impl;
		} else {
			throw new Error('this._impl is undefined: init method has not been called');
		}
	}
	
	/**
	 * Child objects, could be any other dhtmlxObject
	 */
	get childs () {
		if (typeof this._childs !== 'undefined') {
			return this._childs;
		} else {
			throw new Error('this._childs is undefined: init method has not been called');
		}
	}
}