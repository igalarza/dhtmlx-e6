
import { DEBUG } from 'global/config';
import { BaseLayout } from 'layout/BaseLayout';

/**
  * Layout with two columns: left and right
  */
export class TwoColumnsLayout extends BaseLayout {
	
	/**
	 * Creates the TwoColumnsLayout object
	 * @constructor
	 * @param {mixed} container - Object or dom id of the parent element.
	 */
	constructor (name, container) {
		if (DEBUG) {
			console.log('TwoColumnsLayout constructor');
		}
		super(name, container, '2U');
	}
	
	/** Left LayoutCell */
	get left () {
		return this.childs[0];
	}
	
	/** Right LayoutCell */
	get right () {
		return this.childs[1];
	}
}