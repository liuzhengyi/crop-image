window.onload=function() {
debug   = 0;
	function paste_img(e) {
		if ( e.clipboardData.items ) {
		// google-chrome 
            if (debug) {
                alert('support clipboardData.items(may be chrome ...)');
            }
			ele = e.clipboardData.items
            if (debug) {
                alert(ele.length);
            }
			for (var i = 0; i < ele.length; ++i) {
                if (debug) {
                    alert(ele[i].type);
                }
				if ( ele[i].kind == 'file' && ele[i].type.indexOf('image/') !== -1 ) {
					var blob = ele[i].getAsFile();
                    if (debug) {
                        alert(ele[i].type);
                    }
					window.URL = window.URL || window.webkitURL;
					var blobUrl = window.URL.createObjectURL(blob);
					console.log(blobUrl);

                    // upload the blob image
                    if ( !window.FormData ) {
                        if (debug) {
                            alert('not support window.FormData may not upload file');
                        }
                    } else {
                        if (debug) {
                            alert('support window.FormData');
                        }
                        var formData = new FormData();
                        formData.append('file', blob);

                        var xhr = new XMLHttpRequest();
                        xhr.open('POST', './receive_img.php', true);

                        xhr.onload = function() {
                            if (xhr.status === 200) {
                            if (debug) {
                                alert(this.responseText);
                            }
                                console.log('upload success');
                                var server_img = document.createElement('img');
                                server_img.setAttribute('src', this.responseText);
                                server_img.setAttribute('id', 'image_to_crop');
                                document.getElementById('editable').appendChild(server_img);
                                console.log(this.responseText);

                            } else {
                                console.log('upload failed');
                            }
                        }

                        xhr.send(formData);
                    }

				}

			}
		} else {
			alert('non-chrome');
		}
	}
	document.getElementById('editable').onpaste=function(){paste_img(event);return false;};
}
