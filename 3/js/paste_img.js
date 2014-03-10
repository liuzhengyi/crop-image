/** 
 * js/paste_img.js [dev version]
 * upload image when onpaste via xhr from e.clipboarddata
 * gipsaliu@gmail.com
 * 2014-02-26
 *
 * todo:
 *  check POST variables
 *  error handle
 *  @大图上传不了 对于大图来说 blobUrl is OK 
 * see http://stackoverflow.com/questions/7431365/filereader-readasbinarystring-to-upload-files
 */

window.onload=function() {

/*
ele = e.clipboardData.items
ele.length: 2
ele[0].type             : 'text/html'
ele[0].kind             : 'string'
ele[0].getAsString      : function getAsString() { [native code] }
ele[0].getAsFile        : function getAsFile() { [native code] }
ele[0].webkitGetAsEntry : function webkitGetAsEntry() { [native code] }

ele[1].type             : 'image/png'
ele[1].kind             : 'file'
ele[1].getAsString      : function getAsString() { [native code] }
ele[1].getAsFile        : function getAsFile() { [native code] }
ele[1].webkitGetAsEntry : function webkitGetAsEntry() { [native code] }
*/

/*
e:
e[clipboardData]        :[object Clipboard]
e[cancelBubble]         :false
e[returnValue]          :true
e[srcElement]           :[object HTMLParagraphElement]
e[defaultPrevented]     : false
e[timeStamp]            :1393470038818
e[cancelable]                 :true
e[bubbles]                 :true
...
*/

/*
e.clipboardData:
key:items; value:[object DataTransferItemList]
key:items; value:[object DataTransferItemList]
key:files; value:[object FileList]
key:types; value:text/html,Files
key:effectAllowed; value:uninitialized
key:dropEffect; value:none
key:clearData; value:function clearData() { [native code] }
key:getData; value:function getData() { [native code] }
key:setData; value:function setData() { [native code] }
key:setDragImage; value:function setDragImage() { [native code] }

key:files; value:[object FileList]
key:types; value:
key:effectAllowed; value:uninitialized
key:dropEffect; value:none
key:clearData; value:function clearData() { [native code] }
key:getData; value:function getData() { [native code] }
key:setData; value:function setData() { [native code] }
key:setDragImage; value:function setDragImage() { [native code] }
*/

debug   = 0;
	function paste_img(e) {
		if ( e.clipboardData.items ) {
                    //elec = e.clipboardData.files
                    //for (var key in elec) {
                    //    alert('key:'+key + '; value:'+elec[key]);
                    //}
		// google-chrome 
            if (debug) {
                alert('support clipboardData.items(may be chrome ...)');
            }
			ele = e.clipboardData.items
            if (debug) {
                alert('ele.length:'+ele.length);
            }
			for (var i = 0; i < ele.length; ++i) {
                if (debug) {
                    alert('i='+i+'; ele[i].type:'+ele[i].type);
                    //for (var key in ele[i]) {
                    //    alert('key:'+key + '; value:'+ele[i][key]);
                    //}
                }
				if ( ele[i].kind == 'file' && ele[i].type.indexOf('image/') !== -1 ) {


					var blob_src = ele[i].getAsFile();
                    var reader   = new FileReader();
                    reader.readAsBinaryString(blob_src);
                    //reader.readAsDataURL(blob_src);   // reader.onload = function(e){img.src = e.target.result; document.body.appendChild(img)}
                    reader.onload = function(e) {

                        var xmlHttpRequest = new XMLHttpRequest();
                        //Some AJAX-y stuff - callbacks, handlers etc.
                        xmlHttpRequest.open("POST", 'receive_img.php', true);
                        var dashes = '--';
                        var boundary = 'aperturephotoupload';
                        var crlf = "\r\n";

                        //Post with the correct MIME type (If the OS can identify one)
                        if ( blob_src.type == '' ){
                            filetype = 'application/octet-stream';
                        } else {
                            filetype = blob_src.type;
                        }

                        //Build a HTTP request to post the file
                        var data = dashes + boundary + crlf + "Content-Disposition: form-data;" + "name=\"file\";" + crlf + "Content-Type: " + filetype + crlf + crlf + e.target.result + crlf + dashes + boundary + dashes;
                        alert(data);

                        xmlHttpRequest.setRequestHeader("Content-Type", "multipart/form-data;boundary=" + boundary);
                        xmlHttpRequest.onload = function() {
                            if (xmlHttpRequest.status === 200) {
                                alert(this.responseText);
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

                        //Send the binary data
                        xmlHttpRequest.send(data);



                    }
                    //for (var key in reader ) {
                    //    alert('[reader] key:'+key + '; value:'+reader[key]);
                    //}


                    // 稳定版 大图传不了
                    var blob = blob_src;
                    if (debug ) {
                        alert(blob);
                        for (var key in blob ) {
                            alert('[blob] key:'+key + '; value:'+blob[key]);
                        }
                    }
                    if (debug) {
                        alert(ele[i].type);
                    }
					window.URL = window.URL || window.webkitURL;
					var blobUrl = window.URL.createObjectURL(blob);
					console.log('blobUrl:');
					console.log(blobUrl);
                    // 对于大图来说 blobUrl is OK 

                    // upload the blob image
                    if ( !window.FormData ) {
                        if (debug) {
                            alert('not support window.FormData may not upload file');
                        }
                    } else {
                        if (debug) {
                            alert('support window.FormData');
                        }
//                        blob = dataURItoBlob(blobUrl);
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
                                //server_img.setAttribute('src', this.responseText);
                                server_img.setAttribute('src', blobUrl);
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

/*
function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs
    // var byteString = atob(dataURI.split(',')[1]);

    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    var bb = new BlobBuilder();
    bb.append(ab);
    return bb.getBlob(mimeString);
}
*/

function dataURItoBlob(dataURI) {
    var binary;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        binary = atob(dataURI.split(',')[1]);
    else
        binary = unescape(dataURI.split(',')[1]);


    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/png'});
}
