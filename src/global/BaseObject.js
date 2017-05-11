
import { DEBUG } from 'global/config';
import { Util } from 'global/Util';

/**
  * Parent class of all the objects in the library, it holds some common variables.
  */	 
export class BaseObject {
	
	/**
	 * Called by child objects.
	 * @constructor
	 * @param {string} name - Object name, useful for searching child objects.
	 * @param {string} type - Type of component: layout, window, grid, etc.
	 * @param {mixed} container - Object or dom id of the parent element.
	 * @param {object} impl - dhtmlx object, must be created by child class.
	 */
    constructor (name, type, container, impl) {
		// It can be called without arguments, for testing integration reasons.
		if (arguments.length === 4) {
			this.init(name, type, container, impl);
		}		
    }
	
	init (name, type, container, impl) {			
		if (arguments.length === 4) {
			// Clean up before assignations
			this.destroy();
			// Init properties
			this._name = name;
			this._type = type;
			this._container = container;
			this._impl = impl;
			this._childs = [];
			
			if (container !== null &&
                !Util.isNode(container) &&
                container.childs instanceof Array) {
				// Adds this to parent as a child
				container.childs.push(this);
			}
		} else {
			throw new Error('BaseObject init method requires 4 parameters');
		}
	}
	
	/** Destroys the object and all this childs. */
	destroy () {
		// First, the childs
		if (typeof this._childs !== 'undefined') {
			while (this._childs.length > 0) {
				var child = this._childs.pop();
				if (typeof child === 'object' 
					&& typeof child.destroy === 'function') {
						
					child.destroy();
				}			
			}
		}
		
		// Finally, the object
		if (typeof this._impl !== 'undefined' &&
			typeof this._impl.unload === 'function') {
			if (DEBUG) {
				console.log(this.type +': Call to unload() in destroy method.');
			}
			this._impl.unload();
		}
	}
	
	/** Finds a child object by name */
	find (name) {
		if (this.name === name) {
			return this;
		} else {
			if (typeof this._childs !== 'undefined') {
				for (let i=0; i<this._childs.length; i++) {
					var child = this._childs[i];
					if (typeof child === 'object' && typeof child.find === 'function') {
						var result = child.find(name);
						if (result != null) {
							return result;
						}
					}
				}
			}
		}
		return null;
	}
	
	/** Adds an event to the object, with an ActionManager object as a collection of actions. */
	attachActionManager (eventName, actionManager) {
		this.impl.attachEvent(eventName, function (id) {
			// Checking if the actionManager has the action with the right id
			if (typeof actionManager.actions[id] === 'function') {
				// The context in the actionManager is sent to the action
				return actionManager.actions[id](arguments, actionManager.context);
			}
		});
	}
	
	/** Adds an event to the object, with a function parameter as an action. */
	attachAction (eventName, action, context) {
		this.impl.attachEvent(eventName, function () {
			// Making sure the action param is really an object
			if (typeof action === 'function') {
				// The context in the actionManager is sent to the action
				return action(arguments, context);
			}
		});
	}
	
	get name () {
		if (typeof this._name !== 'undefined') {
			return this._name;
		} else {
			throw new Error('this._name is undefined: init method has not been called');
		}
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
     * Usually is other dhtmlx-e6 object, the root container should be inside document.body
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