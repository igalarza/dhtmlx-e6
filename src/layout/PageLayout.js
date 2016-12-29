
import { BaseLayout } from 'layout/BaseLayout';

/** Layout with page-like structure: header, body and footer */
export class PageLayout extends BaseLayout {
	
	/**
	 * Creates the SimpleLayout object
	 * @constructor
	 * @param {mixed} container - Object or dom id of the parent element.
	 * @param {int} headerHeight - Fixed header height in pixels.
	 * @param {int} footerHeight - Fixed footer height in pixels.
	 */
	constructor (container, headerHeight, footerHeight) {
		super(container, '3E');
		
		this.header.height = headerHeight;
		this.header.impl.fixSize(false, true);
		
		this.footer.height = footerHeight;
		this.footer.impl.fixSize(false, true);
	}
	
	/** The only LayoutCell object in the layout */
	get header () {
		return this.cells[0];
	}
	
	get body () {
		return this.cells[1];	
	}
	
	get footer () {
		return this.cells[2];	
	}
}