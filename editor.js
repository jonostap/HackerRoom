(function() {
	var FIREBASE_URL = 'https://sweltering-torch-2863.firebaseio.com/';
	var EDIT_CHECK_REGEX = /https?:\/\/github\.com\/([a-zA-Z0-9_-]+\/)+edit(\/[a-zA-Z0-9\._-]+)+/;
	// Check to see if we're in editing mode
	if (window.location.href.match(EDIT_CHECK_REGEX)) {
		console.log('Now entering editing mode.');
		// We're in editing mode
		var firebaseRef = new Firebase(FIREBASE_URL);
		// Develop a ref specifically for this file using the url
		var documentRef = firebaseRef.child(window.location.href.replace('.', '').replace('#', ''));
		// Append the firepad editor to the document
		$('form .file-commit-form').before('<div id="firepad-editor"></div>');
		// Configure the editor to work with the div we just created
		var editor = ace.edit('firepad-editor');
		// TODO configure editor to be prettier
		// Get text content from the existing ace
		var content = $('#blob_contents').val();
		var firepad = Firepad.fromACE(documentRef, editor, {
			defaultText: content
		});
	} else {
		console.log('Editing mode is disabled for this page.');
	}
})();