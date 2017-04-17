
import { DEBUG, SKIN, getConfig, setConfig } from 'global/config';

describe("Checks if the configuration works properly", function() {
	
	it("checking default configuration", function() {
		let cfg = getConfig();
		expect(cfg).toBeDefined();
		expect(cfg.DEBUG).toEqual(true);
		expect(cfg.SKIN).toEqual('dhx_web');
	});
	
	it("checking that setConfig works", function() {
		let cfg = getConfig();
		cfg.DEBUG = false;
		cfg.SKIN = 'material';
		
		expect(cfg).toBeDefined();
		expect(cfg.DEBUG).toEqual(false);
		expect(cfg.SKIN).toEqual('material');
	});
});