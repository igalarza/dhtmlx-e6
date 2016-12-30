
import { OBJECT_TYPE } from 'global/config';
import { LayoutCell } from 'layout/LayoutCell';

describe("Checks the LayoutCell object", function() {
	
	var obj = null;
	
	beforeEach(function() {
		// We need to create a layout to have a cell implementation
		layout = new dhtmlXLayoutObject({
			// id or object for parent container
			parent: document.body,    	
			// layout's pattern			
			pattern: '1C'          	
		});
		
		obj = new LayoutCell('testContainer', layout.cells('a'));
		spyOn(obj.impl, 'setHeight').and.callThrough();
		spyOn(obj.impl, 'setWidth').and.callThrough();
		spyOn(obj.impl, 'attachHTMLString').and.callThrough();
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
	
	it("checking if setters are working", function() {
		obj.height = 100;
		obj.width = 100;
		obj.html = "<p>test</p>";
		expect(obj.impl.setHeight).toHaveBeenCalled();
		expect(obj.impl.setWidth).toHaveBeenCalled();
		expect(obj.impl.attachHTMLString).toHaveBeenCalled();
	});
});