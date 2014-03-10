// change crop selector's size
// 令选择框 change size
function choose_crop_size(w, h, id ) {
    var crop_selector = $("#crop_selector");
    if ( 0 == crop_selector.length ) {
        crop_selector = document.createElement('DIV');
        crop_selector.setAttribute('id', 'crop_selector');
        document.body.appendChild(crop_selector);
    }

    // 令选择框 draggable
    $('#crop_selector').drags();

    // 令选择框 重置属性，尤其宽高。位置以$('#preview_one')为参照
    var ref_pos         = document.getElementById('preview_one');
    var selector_left   = getElementLeft(ref_pos);
    var selector_top    = getElementTop(ref_pos);
    crop_selector.css('border', '1px dotted blue');
    crop_selector.css('position', 'absolute');
    crop_selector.css('left', selector_left+200);
    crop_selector.css('top', selector_top);
    crop_selector.css('width', w);
    crop_selector.css('height', h);

    // 令选择框 可以选择截图区域
    $("#crop_selector").dblclick(function(){
        var imgsrc  = $('#image_to_crop').attr('src');
        var slctw   = $(this).width();
        var slcth   = $(this).height();
        $("#image_to_crop").each(function(){
            imgw    = $(this).width();
            imgh    = $(this).height();
        });

        crop_send(  'crop_img.php',
                    'POST',
                    {},
                    imgsrc,
                    imgw,
                    imgh,
                    slctw,
                    slcth,
                    function(imgRet) {
                        $("#generated").attr("src", imgRet);
                    }
        );
    });
}

