
import { Util } from 'global/Util';

describe("Checks if the Util static methods work properly", function() {
	
	var baseObjectMock = {
		name: 'object',
		container: 'container',
		childs: []
	};
	
	it("checking the isNode static method", function() {
		
		expect(Util.isNode(baseObjectMock)).toEqual(false);
		expect(Util.isNode(document.body)).toEqual(true);
		
		// This should work!
		// expect(Util.isNode('id_string')).toEqual(true);
	});	
});