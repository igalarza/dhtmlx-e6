


export class Util {
	/**
	 * Checks if the parameter is a DOM node or DOM id (string).
	 * @param {mixed} o - Dom Node or any other variable.
	 * @return {boolean} true if the parameter is a DOM Node.
	 */   
	static isNode (o) {
		return (
			typeof Node === "string" ||
			typeof Node === "object" ? o instanceof Node : 
			typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
		);
	}
}