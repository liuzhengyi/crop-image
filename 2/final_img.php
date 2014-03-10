<?php
/**
 * final_img.php
 * base functions of crop image module
 * gipsaliu@gmail.com
 * 2014-02-26
 * todo:
 *  error handle
 *  optimize function arguments
 *  optimize logic
 */


// var_dump($_POST);
// analyse post data
if ( 0 >= count($_POST) ) {
    output_json_error(-20001, 0, '未收到截图！');
}

// move final iamges to a proper place
// todo: config dirs
$count = 0;
foreach ( $_POST as $id => $src ) {
    $src_file   = '../tmp/'. basename($src);
    $dst_file   = '../final/'. basename($src);
    copy($src_file, $dst_file);
    $count++;
}
// todo: write DB

// response to the request.
output_json_ok($count);


/* base functions */
function output_json_ok($Count) {
    $return_data = array(
        'status'    => 0,
        'count'     => $Count,
        'msg'       => 'ok',
    );
    echo json_encode($return_data);
    exit();
}

function output_json_error($Status, $Count, $Msg) {
    $return_data = array(
        'status'    => $Status,
        'count'     => $Count,
        'msg'       => $Msg,
    );
    echo json_encode($return_data);
    exit();
}

?>
