<?php
//TO RUN THE UPLOADER COMPONENT YOU NEED TO VIEW THE EXAMPLE FROM A PHP-ENABLED WEBSERVER!!!
session_start();
?>

<html>
<body>
<style type="text/css">
BODY, FORM {
	margin: 0;
	padding: 0;
	border: 0;
	font: 10px Arial; 
}
INPUT {
	margin: 0;
	padding: 0 0 0 1px;
	vertical-align: middle;
	font-size: 95%;
}
</style>

<?php

$basedir   = 'example1_files/';
$targetdir = 'temp/';

if ($_POST['btn_add']) {
	//volt filefeltoltes
	if ($_FILES['file_src']['error'] > 0) $warning = "Upload error {$_FILES['file_src']['error']}.";
	if ($_FILES['file_src']['size'] > 2000000) $warning = "File too big (limit: 2M).";
	if ($warning == '') {
		$targetfile = session_id();
		@move_uploaded_file($_FILES['file_src']['tmp_name'], $targetdir.$targetfile);
		echo "Uploaded <span id='src' rel='{$basedir}{$targetdir}{$targetfile}'>{$_FILES['file_src']['name']}</span>
			- <a href='javascript:history.go(-1)'>upload another</a>";
	}
	else {
		echo "$warning <a href='javascript:history.go(-1)'>Try again</a>";
	}
}
else {
	echo <<<HHH
	<form accept="image/*" enctype="multipart/form-data" method="post">
	<input type="file" name="file_src" size="13"/>
	<input type="submit" name="btn_add" value="Upload" />
	</form>
HHH;
}

?>

</body>
</html>
