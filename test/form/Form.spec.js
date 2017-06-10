
import { Form } from 'form/Form';

describe("Checks the Form object", function() {

	let obj = null;
	
	beforeEach(function() {
		obj = new Form();
		obj.init('name', document.body);
	});
	
	afterEach(function() {
		obj.destroy();
	});

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
	});
});