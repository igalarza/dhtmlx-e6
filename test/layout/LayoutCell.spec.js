
import { OBJECT_TYPE } from 'globals';
import { LayoutCell } from 'LayoutCell';

describe("Checks the dhtmlxObject object!", function() {
	
	// We need to create a layout to have a cell implementation
	var layout = new dhtmlXLayoutObject({
		// id or object for parent container
		parent: document.body,    	
		// layout's pattern			
		pattern: '1C'          	
	});
	
	var obj = new LayoutCell('testContainer', layout.cells('a'));

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
	});
	
	it("checking if the object has its properties", function() {
		expect(obj.container).toEqual('testContainer');
		expect(obj.type).toEqual(OBJECT_TYPE.LAYOUT_CELL);
		expect(obj.impl).toBeDefined();
	});
});