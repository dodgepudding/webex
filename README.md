Webex is a high interactive extentions depending on jQuery 
======
This framework depends on jQuery 1.4+, only need to run `$('body').compile()` to take effects, then some of DOM element class attribution having `.ajax` or `.load` or `.dialog`  and so on will bind interactive triggers to do ajax post or ajax load(auto cross-domain) or show dialog...  That's so fast way to make one webpage ajaxable.

compile.js
------
The core js is compile.js, all funtions is in the `$.webex` scope.

If you need js dialog, the frame invoked a third party dialog:
https://github.com/aui/artDialog (version 4.0+)
If you need to use you own dialog, please overload the funtions `$.webex.CreateDialog` and `$.webex.CloseDialog`

If you need your ajax crossdomain, you can replace the jqeury ajax $.ajax with $.webex.ajax, and put jsonp.php on your server(only for php server now,or you can write an jsonp server yourself). $.webex.ajax will auto detect your request domain whether cross or not.

$.webex scope structs
-------
`$.webex.setting` basic global settings.
`$.webex.action` json back action scope.
`$.webex.util` common utilities

$.webex functions and const
-------
$.bigpu.
	alert('message',expired=5000);
	CreateDialog('html'|'url'|'iframe',{html}|{url},title,width='auto',height='auto',multi=false,resizable=false,buttonok,buttoncancel);
	ajax(url,'POST'|'GET',data(string|object),expired,callback(string|function(json))) //support different domain
	cookie(name, [value], [options]);
	setting.
		*autocompile:false
		*crossdomainserver:'http://www.yourdomain.com/jsonp.php' //jsonp cross domain server
		LastDialogHandle:artDialog, //pop dialog handle,iframe use the parent to close
	action.
		script(json) //on json.status==true trigger json.script
		redirect(json) //show prompt json.info redirect to json.jumpUrl delay by json.delay*1000
		success(json) //show prompt json.info then redirect to json.jumpUrl if url exists. 
		error(json) //show prompt json.info then redirect to json.jumpUrl if url exists.
		reload(json)  //show prompt json.info for 5s if exists then reload.
		
	util.
		toJSON(json_string)
		isIE6()
		isIOS()
		fixOrientZoom()
		substring4ChAndEn(str,length)
		ellipse(str,length)
		isEmpty(str)
		isEmail(str)
		isNick(str)
		noLink(str)
		getPosition(Element)
		getDomain(urlstr)
		selectall(input[name],'#checkbox_id')
		submitByEnter(e,callback)
		goTop()
		JsonAction(data) //json back to call $.webex.action.
		getAbsUrl(url)
		crc32(string)
		regularTimestamp(timestamp, nowtime=Date(), isNormal=false, showtime=false)
		setHomePage(obj,url)
		addBookmark(title,url)
		copyToClipboard(txt)

for scope to take effect:
	`$('#selector').compile();`
to off effect:
	`$('#selector').uncompile();`

ajax format must like:
```
{
	status: 1,
	info: 'back tips',
	data: 'back data'
}
```

HTML Element usage:
------- 
the form below `form.ajax` is the jquery selector, means `<form class="ajax">`, the param tagged '*' is required DOM attribution in the same Element. 
Example:
```html
<div class="load" url="http://www.domain.com/a.html"></div>
```
This will auto load into the DIV with the url content after $().compile.

`form.ajax` use ajax to post instead of redirect
	prepare:function, //for validate,submit will break if return false; 
	valid:'false', //submit will break if val(false);
	callback:function, //for callback(json)
	ajaxmsg:'.class|#id' //the target div will show the submiting tips 
	inner form: <input:submit>
		sync:'message',//on submiting the button title will be changed and submit button disabled, after success will restore.
`div.load`  load url content after document is loaded, support different domain
	*url:url,
	callback:function, //ex: <div class="load" url="http://domain.com" callback="cb(data)"></div>
`div.loadswf` embed flash into div.
	*url:url,
	*width:width,
	*height:height,
	flashvars:flashvars&..,
	params:params&..
`a.dialog` click to show dialog
	*target:id, //target div id
	*type:'url'|'iframe'|'div', //load from url or div? default:url
	title:'title', //dialog title, default <a>text
	*href:url, // if type is url
	dwidth:width, //default is auto
	dheight:height, //default is auto
	resizable:true,
	multi:false, //if allow multi windows
	prepare:function,
	buttonok:function, 
	buttoncancel:function,
`a.ajax` : click to trigger ajax post/get, prepare pointing to prepare function, callback pointing to callback function, callback function first input param is json.
	*href:url,
	target:id, //if target id is not null,will write back the json.info result
	method:'POST'|'GET',//default 'POST'
	data:data, //post data
	prepare:function,
	callback:function,
`a.iframe` click to load iframe into DIV
	*target:id,
	*href:url,
`a.div`	click to load URL content into DIV
	*href:url,
	*target:id,
	append:false, //true:append to the end;false: empty the div.
	ask:'tips', //if div is not empty, it will alert a tips.
	prepare:function,
	callback:function,
`a.popmenu` click to show pop menu
	target:id|class, //default .tooltips in the same div level
	onclass:'clicked', //add the class if a is clicked
`:text.fot` //type words limited
	target:id,
	limit:200