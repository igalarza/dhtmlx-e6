

export class TreeItem {

	constructor(parentId, id, text, action = null) {

		this._parentId = parentId;
		this._id = id;
		this._text = text;
		this._action = action;
	}

	get parentId () {
		return this._parentId;
	}

	get id () {
		return this._id;
	}

	get text () {
		return this._text;
	}

	get action () {
		return this._action;
	}
}