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
		// Append the firepad toolbar to the document
		// Append the firepad editor to the document
		$('form .file-commit-form').before('<button id="refresh-editor" style="float: right; margin-bottom: 15px; margin-left: 15px;">Refresh the Editor</button><button id="clear-editor" style="float: right; margin-bottom: 15px;">Clear the Editor</button><div id="firepad-editor"></div>');
		// Create the chat DOM elements
		$('form .file-commit-form').before(
			'<div class="message-dialog">' +
			'<h2 style="margin-top: 0px; margin-bottom: 10px;">Conversation</h2>' +
			'<div id="message-list"></div>' +
			'<div id="message-input"><input type="text" name="fname" placeholder="Type a message here, and hit enter to send it." /></div>' +
			'</div>'
		);
		// REGISTER DOM ELEMENTS
		var messageField = $('#message-input input');
		var nameField = $('a.header-nav-link.name span.css-truncate-target');
		var pictureField = $('img.commit-form-avatar');
		var messageList = $('#message-list');
		var userName = 'unknown';
		var picture;
		if (nameField.length > 0) userName = nameField.get(0).innerText;
		if (pictureField.length > 0) picture = pictureField.get(0).src;
		// LISTEN FOR KEYPRESS EVENT
		messageField.keypress(function(e) {
			if (e.keyCode == 13) {
				//FIELD VALUES
				var message = messageField.val();
				//SAVE DATA TO FIREBASE AND EMPTY FIELD
				messagesRef.push({
					name: userName,
					text: message,
					picture: picture
				});
				messageField.val('');
			}
		});
		// Add a callback that is triggered for each chat message.
		messagesRef.limit(10).on('child_added', function(snapshot) {
			//GET DATA
			var data = snapshot.val();
			var username = data.name || "unknown";
			var message = data.text;
			//CREATE ELEMENTS MESSAGE & SANITIZE TEXT
			var messageElement = $(
				"<div class='line'>" +
				"<div class='picture' style='background-size: cover; width: 30px; height: 30px; border-radius: 15px; float: left; margin: 0 15px;'></div>" +
				"<div class='text' style=''>" +
				"<div class='user'>" + username + "</div>" +
				"<div class='message'>" + message + "</div>" +
				"</div>" +
				"</div>");
			var nameElement = $("<strong class='chat-username'></strong><br>")
			nameElement.text(username);
			messageElement.text(message).prepend(nameElement);
			//ADD MESSAGE
			messageList.append(messageElement)
			//SCROLL TO BOTTOM OF MESSAGE LIST
			messageList[0].scrollTop = messageList[0].scrollHeight;
		});
		// Configure the editor to work with the div we just created
		var editor = ace.edit('firepad-editor');
		// TODO configure editor to be prettier
		// Get text content from the existing ace
		var content = $('#blob_contents').val();
		var firepad = Firepad.fromACE(documentRef, editor, {
			defaultText: content
		});
		$('#refresh-editor').click(function(event) {
			event.preventDefault();
			firepad.setText(content);
		});
		$('#clear-editor').click(function(event) {
			event.preventDefault();
			firepad.setText('');
		});
		// Show the things after a delay
		setTimeout(function() {
			$('div.firepad').addClass('ready');
		}, 250);
		setTimeout(function() {
			$('div.message-dialog').addClass('ready');
		}, 1750)
		// Submit new changes
		var submitData = function() {
			// Mark the changed boolean to true
			$('form#blob_new .js-code-editor input[name="content_changed"]').attr('value', 'true');
			// Swap over changed text into textarea
			$('form#blob_new .js-code-editor textarea#blob_contents').val(editor.getSession().getValue());
			// Submit the form
			$('form#blob_new button#submit-file').removeAttr('disabled').click();
		};
		// Listen for ctrl + s
		$(document).keypress(function(event) {
			if (event.which == 115 && (event.ctrlKey || event.metaKey) || (event.which == 19)) {
				event.preventDefault();
				// do stuff
				submitData();
				return false;
			}
			return true;
		});
	} else {
		console.log('Editing mode is disabled for this page.');
	}
})();