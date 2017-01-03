
import { OBJECT_TYPE } from 'global/config';
import { TwoColumnsLayout } from 'layout/TwoColumnsLayout';

describe("Checks the TwoColumnsLayout object!", function() {
	
	var obj = null;
	
	beforeAll(function() {
		obj = new TwoColumnsLayout(document.body);
	});

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
	});
	
	it("checking if the object has its properties", function() {
		expect(obj.type).toEqual(OBJECT_TYPE.LAYOUT);
		expect(obj.left.type).toEqual(OBJECT_TYPE.LAYOUT_CELL);
		expect(obj.right.type).toEqual(OBJECT_TYPE.LAYOUT_CELL);
	});
	
	afterAll(function() {
		obj.destroy();
	});
});