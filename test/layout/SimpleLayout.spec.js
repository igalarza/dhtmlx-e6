
import { OBJECT_TYPE } from 'global/config';
import { SimpleLayout } from 'layout/SimpleLayout';

describe("Checks the SimpleLayout object", function() {
	
	var obj = null;
	
	beforeEach(function() {
		obj = new SimpleLayout('name', document.body);
	});
	
	afterEach(function() {
		obj.destroy();
	});

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
	});
	
	it("checking if the object has its properties", function() {
		expect(obj.type).toEqual(OBJECT_TYPE.LAYOUT);
		expect(obj.cell.type).toEqual(OBJECT_TYPE.LAYOUT_CELL);
	});	
});