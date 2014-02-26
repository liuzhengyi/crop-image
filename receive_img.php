<?php
/** 
 * creceive_img.php
 * 接收用户粘贴到浏览器中的图片，存到服务器上，回显
 * gipsaliu@gmail.com
 * 2014-02-26
 *
 * todo:
 *  error handle
 */
$file = reset( $_FILES );

$uploaddir = '../final/';
// 从系统粘贴板上传的图像似乎都是png类型的 (?)
$ext        = trim( strrchr( $file['type'], '/' ), '/' );
$uploadfile = $uploaddir . sha1_file($file['tmp_name']). '_'. uniqid(). '.'. $ext;

if ( move_uploaded_file( $file['tmp_name'], $uploadfile) ) {
    echo $uploadfile;
}
?>
