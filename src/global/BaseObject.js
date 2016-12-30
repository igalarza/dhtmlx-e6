
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
		this._type = type;
        this._container = container;
        this._impl = impl;
		this._childs = [];
    }
	
	/** Destroys the object and all this childs. */
	destroy () {
		// First, the childs
		while (this.childs.lenght > 0) {
			var child = this.childs.pop();
			if (typeof child === 'object' 
				&& typeof child.destroy === 'function') {
					
				child.destroy();
			}			
		}
		
		// Finally, the object
		if (typeof this.impl.unload === 'function') {
			this.impl.unload();
		}
	}
	
   /**
     * Type of component: layout, window, grid, etc. 
     */
	get type () {
		return this._type;
	}
	
	/**
     * Usually is other dhtmlxObject, the root layout should be inside document.body
     */
	get container () { 
		return this._container;
	}
	
	/**
     * dhtmlx object, must be created by child class before calling super in the constructor.
     */
	get impl () {
		return this._impl;
	}
	
	/**
	 * Child objects, could be any other dhtmlxObject
	 */
	get childs () {
		return this._childs;
	}
}