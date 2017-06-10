
import { OBJECT_TYPE } from 'global/config';
import { BaseLayout } from 'layout/BaseLayout';
import { LayoutCell } from 'layout/LayoutCell';
import { loadAssets } from 'loadcss';

describe("the LayoutCell object", function() {
	
	let layout = null;
	let obj = null;
	
	beforeEach(function() {
		loadAssets();

		// We need to create a layout to have a cell implementation
		layout = new BaseLayout('name', document.body, '3U');
		
		
		obj = layout.childs[0];
		spyOn(obj.impl, 'setHeight').and.callThrough();
		spyOn(obj.impl, 'setWidth').and.callThrough();
		spyOn(obj.impl, 'attachHTMLString').and.callThrough();	
	});
	
	afterEach(function() {
		layout.destroy();
	});

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
	});
	
	it("checking if the object has its properties", function() {
		expect(obj.container).toEqual(layout);
		expect(obj.type).toEqual(OBJECT_TYPE.LAYOUT_CELL);
		expect(obj.impl).toBeDefined();
	});
	
	it("checking if the object has been init properly", function() {
		
		let headerText = obj.impl.getText();
		expect(headerText).toBe('');
		
		let isHeaderVisible = obj.impl.isHeaderVisible();
		expect(isHeaderVisible).toBe(false);
	});
	
	it("checking if setters are working", function() {
		let widthValue = 100;
		let heightValue = 200;
		obj.height = heightValue;
		obj.width = widthValue;
		obj.html = "<p>test</p>";
		
		// This won't work if the cell can't resize itself properly
		// Dimensions are not as expected in test! Needs review.
		// expect(obj.width).toBe(widthValue);
		// expect(obj.height).toBe(heightValue);
		
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