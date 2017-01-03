
import { OBJECT_TYPE } from 'global/config';
import { LayoutCell } from 'layout/LayoutCell';

describe("Checks the LayoutCell object", function() {
	
	var obj = null;
	
	beforeAll(function() {
		// We need to create a layout to have a cell implementation
		var layout = new dhtmlXLayoutObject({
			// id or object for parent container
			parent: document.body,    	
			// layout's pattern			
			pattern: '3U'          	
		});
		
		
		obj = new LayoutCell('testContainer', layout.cells('a'));
		spyOn(obj.impl, 'setHeight').and.callThrough();
		spyOn(obj.impl, 'setWidth').and.callThrough();
		spyOn(obj.impl, 'attachHTMLString').and.callThrough();
	});
	
	afterAll(function() {
		obj.unload();
	});

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
	});
	
	it("checking if the object has its properties", function() {
		expect(obj.container).toEqual('testContainer');
		expect(obj.type).toEqual(OBJECT_TYPE.LAYOUT_CELL);
		expect(obj.impl).toBeDefined();
	});
	
	it("checking if the object has been init properly", function() {
		
		var headerText = obj.impl.getText();
		expect(headerText).toBe('');
		
		var isHeaderVisible = obj.impl.isHeaderVisible();
		expect(isHeaderVisible).toBe(false);
	});
	
	it("checking if setters are working", function() {
		var widthValue = 100;
		var heightValue = 200;
		obj.height = heightValue;
		obj.width = widthValue;
		obj.html = "<p>test</p>";
		
		// This won't work if the cell can't resize itself properly
		expect(obj.width).toBe(widthValue);
		expect(obj.height).toBe(heightValue);
		
		expect(obj.impl.setHeight).toHaveBeenCalled();
		expect(obj.impl.setWidth).toHaveBeenCalled();
		expect(obj.impl.attachHTMLString).toHaveBeenCalled();
	});
	
	it("checking if init method throws exception", function() {
		expect(obj.init).toThrowError();
	});
	
	it("testing header text options", function() {
		var testHeader = "Header text";
		obj.header = testHeader;
		expect(obj.header).toBe(testHeader);
	});
});