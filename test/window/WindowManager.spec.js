
import { OBJECT_TYPE } from 'global/config';
import { WindowManager } from 'window/WindowManager';
import { Window } from 'window/Window';

describe("Checks the WindowManager object", function() {
	
	var obj = null;
	
	beforeAll(function() {
		obj = new WindowManager('name', document.body);
	});
	
	afterAll(function() {
		obj.destroy();
	});

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
	});
	

	
	it("checking that the create method works properly", function() {
		
		spyOn(obj.impl, 'createWindow').and.callThrough();
		
		var win = obj.create('window_id', 800, 600);
		
		expect(obj.impl.createWindow).toHaveBeenCalledTimes(1);
	});
});