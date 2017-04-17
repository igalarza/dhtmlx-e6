
import { Message } from 'window/Message';

describe("Checks the Messages static object", function() {
	
	it("checking if the messages functions work", function() {
		Message.alert('Title', 'Alert content');
		Message.warning('Title', 'Warning content');
		Message.error('Title', 'Error content');
	});
	
	it("checking if the modal messages functions work", function() {
		Message.alert('Title', 'Alert content', true);
		Message.warning('Title', 'Warning content', true);
		Message.error('Title', 'Error content', true);
	});
});