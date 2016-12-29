
import { OBJECT_TYPE } from 'globals';
import { LayoutCell } from 'layout/LayoutCell';

describe("Checks the LayoutCell object", function() {
	
	beforeEach(function() {
		// We need to create a layout to have a cell implementation
		layout = new dhtmlXLayoutObject({
			// id or object for parent container
			parent: document.body,    	
			// layout's pattern			
			pattern: '1C'          	
		});
		
		obj = new LayoutCell('testContainer', layout.cells('a'));
	});
	
	afterEach(function() {
		layout.unload();
	});

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
	});
	
	it("checking if the object has its properties", function() {
		expect(obj.container).toEqual('testContainer');
		expect(obj.type).toEqual(OBJECT_TYPE.LAYOUT_CELL);
		expect(obj.impl).toBeDefined();
	});
});