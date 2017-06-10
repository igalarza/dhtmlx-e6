
import { OBJECT_TYPE } from 'global/config';
import { TwoColumnsLayout } from 'layout/TwoColumnsLayout';

	describe("the TwoColumnsLayout object", function() {
	
	let obj = null;
	
	beforeEach(function() {
		obj = new TwoColumnsLayout('name', document.body);
	});
	
	afterEach(function() {
		obj.destroy();
	});

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
	});
	
	it("checking if the object has its properties", function() {
		expect(obj.type).toEqual(OBJECT_TYPE.LAYOUT);
		expect(obj.left.type).toEqual(OBJECT_TYPE.LAYOUT_CELL);
		expect(obj.right.type).toEqual(OBJECT_TYPE.LAYOUT_CELL);
	});	
});