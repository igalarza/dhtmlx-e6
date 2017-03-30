
import { BaseLayout } from 'layout/BaseLayout';

/** Layout with only one cell */
export class SimpleLayout extends BaseLayout {
	
	/**
	 * Creates the SimpleLayout object
	 * @constructor
	 * @param {mixed} container - Object or dom id of the parent element.
	 */
	constructor (name, container) {
		super(name, container, '1C');
	}
	
	/** The only LayoutCell object in the layout */
	get cell () {
		return this.childs[0];
	}
}