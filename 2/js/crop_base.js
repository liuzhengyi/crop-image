/**
 * js/crop_base.js
 * base functions of crop image module
 * gipsaliu@gmail.com
 * 2014-02-26
 * todo:
 *  error handle
 *  optimize function arguments
 *  optimize logic
 */

// get element positions
function getElementLeft(element){
    var actualLeft = element.offsetLeft;
    var current = element.offsetParent;
    while (current !== null){
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
    }
    return actualLeft;
}
function getElementTop(element){
    var actualTop = element.offsetTop;
    var current = element.offsetParent;
    while (current !== null){
        actualTop += current.offsetTop;
        current = current.offsetParent;
    }
    return actualTop;
}

//Send the Data to the Server
// todo: too many arguments
function crop_send(url,type,custom, imgsrc, imgw, imgh, slctw, slcth,onSuccess){
     
     var response = "";
     $.ajax({
         url : url,
         type: type,
         data: (getParameters(custom, imgsrc, imgw, imgh, slctw, slcth)),
         success:function(r){ 
            if(onSuccess !== undefined && onSuccess != null)
                onSuccess(r);
         }
     });
}

// get parameters to send
function getParameters(custom, imgsrc, imgw, imgh, slctw, slcth){
    var viewPortW   = imgw;
    var viewPortH   = imgh;
    var imageX;
    var imageY;
    var imageW      = imgw;
    var imageH      = imgh;
    var imageSource = imgsrc;
    var selectorX;
    var selectorY;
    var selectorW   =  slctw;
    var selectorH   =  slcth;

    // 底图位置
    var image_to_crop   = document.getElementById('image_to_crop');
    imageX         = getElementLeft(image_to_crop);
    imageY         = getElementTop(image_to_crop);

    // 选择框位置
    var crop_selector   = document.getElementById('crop_selector');
    var selectorX      = getElementLeft(crop_selector);
    var selectorY      = getElementTop(crop_selector);

    var fixed_data = {
         'viewPortW': viewPortW,
         'viewPortH': viewPortH,

         'imageX':imageX,
         'imageY': imageY,
         'imageW': imageW,
         'imageH': imageH,

         'imageSource': imageSource,
         'selectorX': selectorX,
         'selectorY': selectorY,
         'selectorW': selectorW,
         'selectorH': selectorH
    };
    return $.extend(fixed_data,custom);
}

// send preview data
function pre_commit() {
    // get attrs of image
    var current_image = $("#generated");
    var src = current_image.attr('src');
    var h = current_image.width();
    var w = current_image.height();
    // todo: error handle
    if (!src || !h || !w) {
        alert('no image');
        return;
    }

    // generate preview elements
    var preview_id = "final_generated_" + w + '_' + h;
    var preview_txt     = h + 'x' + w;
    var preview_p       = $("<p></p>");
    preview_p.append(preview_txt);

    var preview_img = $( "#" + preview_id );
    if ( preview_img.length === 0 ) {
        var preview_div   = $("<div class='final_preview'></div>")
        preview_img = $("<img />");
        preview_img.attr('id', preview_id);
        preview_img.attr('class', 'final_preview');
        preview_img.attr('height', 200);

        var preview_all = $("#preview_all");
        preview_all.append(preview_div);
        preview_div.append(preview_img);
        preview_div.append(preview_p);
    }
    preview_img.attr("src", src);
//    $("#generated").attr('src', '');
}

// commit the final data
function commit_all(Url, Type) {
    // get all preview images' src
    var final_images    = $("IMG.final_preview");
    var srcs            = {};
    for ( var i = 0; i < final_images.length; i++ ) {
        var image   = final_images[i];
        var id      = image.id;
        srcs[id]    = image.src;
    }

    $.ajax({
        url : Url,
        type: Type,
        data: srcs,
        //data: { name: "John", time: "2pm" },
        success:function(r){
            var return_data = eval('(' + r + ')' );
            if ( return_data.status != 0 ) {
                alert('commit failed:'+return_data.msg);
                return;
            }
            alert("提交成功！\n 服务器共收到图片" + return_data.count + "张，已妥存。");
        }
    });
}
