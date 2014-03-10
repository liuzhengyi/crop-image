<?php
/** 
 * crop_img.php
 * 接收截图参数，在服务器端进行截图
 * gipsaliu@gmail.com
 * 2014-02-26
 *
 * todo:
 *  check POST variables
 *  error handle
 */

// configs
$_cfg_tmp_dir       = '../tmp/';        // 临时截图存储目录
$_cfg_store_dir     = '../final/';      // 最终截图存储目录
$_cfg_file_prefix   = '';               // 'test_';          // 截图文件名前缀

$src_file_path  = $_POST['imageSource'];
if ( !file_exists($src_file_path ) ) {
    exit('source file not exists.'+$src_file_path);
}

$ext        = end(explode(".",$src_file_path));
$src_file_basename  = basename($src_file_path, '.'.$ext);
$function   = returnCorrectFunction($ext);
$image      = $function($src_file_path);

$selectorX  = $_POST['selectorX'] - $_POST['imageX'];
$selectorY  = $_POST['selectorY'] - $_POST['imageY'];
$selectorW  = $_POST['selectorW'];
$selectorH  = $_POST['selectorH'];


$selector   = imagecreatetruecolor($selectorW, $selectorH);
imagecopy($selector, $image, 0, 0, $selectorX, $selectorY,$selectorW,$selectorH);

// file_name    = origion image's sha1 + uniqid(when upload the origion image) + size
$dst_file_path  =   $_cfg_tmp_dir. $_cfg_file_prefix.
                    $src_file_basename.
                    '_'. $selectorW. '_'. $selectorH.
                    '.'. $ext;

parseImage($ext,$selector,$dst_file_path);

//Return new image source
echo $dst_file_path;


/* Base Functions */
function returnCorrectFunction($ext){
	$function = "";
	switch($ext){
		case "png":
			$function = "imagecreatefrompng";
			break;
		case "jpeg":
		case "jpg":
			$function = "imagecreatefromjpeg";
			break;
		case "gif":
			$function = "imagecreatefromgif";
			break;
	}
	return $function;
}

function parseImage($ext,$img,$file = null){
	switch($ext){
		case "png":
			imagepng($img,($file != null ? $file : ''));
			break;
		case "jpeg":
			imagejpeg($img,($file ? $file : ''),90);
			break;
		case "jpg":
			imagejpeg($img,($file ? $file : ''),90);
			break;
		case "gif":
			imagegif($img,($file ? $file : ''));
			break;
	}
}

?>
