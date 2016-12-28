
import { BaseLayout } from 'BaseLayout';

/**
  * Layout with two columns: left and right
  */
export class TwoColumnsLayout extends BaseLayout {
	
	/**
	 * Creates the TwoColumnsLayout object
	 * @constructor
	 * @param {mixed} container - Object or dom id of the parent element.
	 */
	constructor (container) {
		super(container, '2U');
	}
	
	/** Left LayoutCell */
	get left () {
		return this._cells[0];
	}
	
	/** Right LayoutCell */
	get right () {
		return this._cells[1];
	}
}