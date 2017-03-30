
import { BaseLayout } from 'layout/BaseLayout';


export class WindowLayout extends BaseLayout {
	
	/**
	 * Creates the WindowLayout object
	 * @constructor
	 * @param {mixed} container - Object or dom id of the parent element.
	 */
	constructor (name, container) {
		super(name, container, '2E');
	}

	get body () {
		return this.childs[0];
	}
	
	get footer () {
		return this.childs[1];
	}
}