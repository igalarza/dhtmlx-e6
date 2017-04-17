
import { SimpleLayout } from 'layout/SimpleLayout';
import { Toolbar } from 'toolbar/Toolbar';

describe("Checks the Toolbar object", function() {

	var obj = null;
	
	beforeAll(function() {
		var layout = new SimpleLayout('name', document.body);
		obj = new Toolbar();
		obj.init('name', layout.cell);
	});
	
	afterAll(function() {
		obj.destroy();
	});

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
	});
});