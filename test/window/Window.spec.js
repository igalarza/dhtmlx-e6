
import { OBJECT_TYPE } from 'global/config';
import { WindowManager } from 'window/WindowManager';
import { Window } from 'window/Window';

describe("Checks the Window object", function() {
	
	var windowManager = null;
	var win = null;
	
	beforeAll(function() {
		windowManager = new WindowManager('name', document.body);
		win = windowManager.create('window_id', 800, 600);
	});
	
	afterAll(function() {
		windowManager.destroy();
	});

	it("checking if the object is defined", function() {
		expect(windowManager).toBeDefined();
		expect(win).toBeDefined();
	});
});