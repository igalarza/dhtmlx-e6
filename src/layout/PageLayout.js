
import { DEBUG } from 'global/config';
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
	constructor (name, container, headerHeight, footerHeight) {
		if (DEBUG) {
			console.log('TwoColumnsLayout constructor');
		}
		
		super();
		
		if (arguments.length === 4) {
			this.init(name, container, headerHeight, footerHeight);
		}	
	}
	
	init (name, container, headerHeight, footerHeight) {
		if (arguments.length === 4) {
			super.init(name, container, '3E');
			
			this.header.height = headerHeight;
			this.header.impl.fixSize(false, true);
			
			this.footer.height = footerHeight;
			this.footer.impl.fixSize(false, true);
			
			this.impl.setAutoSize("a;b;c", "b");
		} else {
			throw new Error('PageLayout init method requires 4 parameters');
		}
	}
	
	/** The only LayoutCell object in the layout */
	get header () {
		return this.childs[0];
	}
	
	get body () {
		return this.childs[1];	
	}
	
	get footer () {
		return this.childs[2];	
	}
}