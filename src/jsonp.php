<?php
/**
 * this php program is design for webex frame for auto crossdomain
 * jsonp cross domain service，Session ID get prior from Cookie，or from Get param sid，submit parammeters like this;
 * jpback: callback funtion name，it will back with script scheme like jpback('{status:1,data:"data"}');
 * url: query url to crossdomain.
 * pdata: post data if exists.
 * sid: session id for default.
 * the HTTP request will return json format like:
 * array(status,data) : status enum 1 for success or 0 for failed，data is the response data.
 */
//配置参数
$sessionname = 'PHPSESSIONID'; //TODO: change your session name here

$jsonp = $_REQUEST['jpback'];
$sid = isset($_REQUEST[$sessionname]) ? $_REQUEST[$sessionname] : $_REQUEST['sid'];
$refer = $_SERVER['HTTP_REFERER'];
$ch = curl_init();
$url = str_replace('&&','&',$_REQUEST['url']);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_AUTOREFERER, true);
curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
curl_setopt($ch, CURLOPT_COOKIE, $sessionname.'='.$sid);
curl_setopt($ch, CURLOPT_REFERER, $refer);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION,1);  //whether or not to auto redirect
if (isset($_REQUEST['pdata'])) {
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $_REQUEST['pdata']);
}
$data = curl_exec($ch);
if ($data!==false) {
	echo $jsonp.'('.json_encode(array('status'=>true,'data'=>$data)).')';
} else {
	echo $jsonp.'('.json_encode(array('status'=>false,'data'=>'')).')';
}
curl_close($ch);

?>