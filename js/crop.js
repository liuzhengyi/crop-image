// 令选择框 draggable
$('#crop_selector').drags();

// 预览 todo modify id and keep click for crop
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
