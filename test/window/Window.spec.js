
import { OBJECT_TYPE } from 'global/config';
import { windowManager } from 'window/WindowManager';
import { Window } from 'window/Window';

describe("Checks the Window object", function() {
	
	var win = null;
	
	beforeAll(function() {
		win = new Window('window_id', 800, 600);
	});
	
	afterAll(function() {
		win.destroy();
	});

	it("checking if the object is defined", function() {
		expect(windowManager).toBeDefined();
		expect(win).toBeDefined();
	});
});