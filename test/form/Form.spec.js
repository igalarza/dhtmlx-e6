
import { Form } from 'form/Form';

describe("Checks the Form object", function() {

	var obj = null;
	
	beforeAll(function() {
		obj = new Form();
		obj.init('name', document.body);
	});
	
	afterAll(function() {
		obj.destroy();
	});

	it("checking if the object is defined", function() {
		expect(obj).toBeDefined();
	});
});