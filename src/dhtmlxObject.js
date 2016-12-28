
/**
  * Parent object of all the wrappers, it holds some common variables.
  */	 
export class dhtmlxObject {
	
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
	
	/**
	 * Adds a reference to a child object (e. g. adds a menu to a layout)
	 * @param {dhtmlxObject} child - The child object that will be attached to this object
	 */
    addChild (child) {
        this._childs.push(child);
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
	 * Child objects, they must be added manually with the addChild function
	 */
	get childs () {
		return this._childs;
	}
}