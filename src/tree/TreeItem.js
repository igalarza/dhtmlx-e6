

export class TreeItem {

	constructor(parentId, id, text, actionHandler = null, image = null, 
		image2 = null, image3 = null, optionStr = null, children = null) {

		this._parentId = parentId;
		this._id = id;
		this._text = text;
		this._actionHandler = actionHandler;
		this._image = image;
		this._image2 = image2;
		this._image3 = image3;
		this._optionStr = optionStr;
		this._children = children;
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
}