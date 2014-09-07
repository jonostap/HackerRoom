(function() {
	var FIREBASE_URL = 'https://sweltering-torch-2863.firebaseio.com/';
	var EDIT_CHECK_REGEX = /https?:\/\/github\.com\/([a-zA-Z0-9_-]+\/)+edit(\/[a-zA-Z0-9\._-]+)+/;
	// Check to see if we're in editing mode
	if (window.location.href.match(EDIT_CHECK_REGEX)) {
		console.log('Now entering editing mode.');
		// We're in editing mode
		var firebaseRef = new Firebase(FIREBASE_URL);
		// Develop a ref specifically for this file using the url
		var documentRef = firebaseRef.child(window.location.href.replace(/\./g, '').replace(/#/g, ''));
        // Messages ref
		var messagesRef = documentRef.child('messages');
        // Create the chat DOM elements
        $('body').append(
            '<div class="message-dialog">' +
                '<div id="example-message">' +
                '</div>' +
                '<div id="messageInput">' +
                '</div>' +
            '</div>'
        );
        // REGISTER DOM ELEMENTS
        var messageField = $('#messageInput');
        var nameField = $('a.header-nav-link.name span.css-truncate-target');
        var messageList = $('#example-messages');
        // LISTEN FOR KEYPRESS EVENT
        messageField.keypress(function (e) {
            if (e.keyCode == 13) {
                //FIELD VALUES
                var username = nameField.val();
                var message = messageField.val();
                //SAVE DATA TO FIREBASE AND EMPTY FIELD
                messagesRef.push({name:username, text:message});
                messageField.val('');
            }
        });
        // Add a callback that is triggered for each chat message.
        messagesRef.limit(10).on('child_added', function (snapshot) {
            //GET DATA
            var data = snapshot.val();
            var username = data.name || "anonymous";
            var message = data.text;
            //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
            var messageElement = $("<li>");
            var nameElement = $("<strong class='example-chat-username'></strong>")
            nameElement.text(username);
            messageElement.text(message).prepend(nameElement);
            //ADD MESSAGE
            messageList.append(messageElement)
            //SCROLL TO BOTTOM OF MESSAGE LIST
            messageList[0].scrollTop = messageList[0].scrollHeight;
        });
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

