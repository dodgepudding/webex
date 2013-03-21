Webex is a HTML interface jQuery  plugin
======
This framework depends on jQuery 1.4+, only need to run `$('body').compile()` to take effects. DOM elements includes class attribution like `.ajax` or `.load` or `.dialog`  and so on will auto trig to do ajax post, ajax load(auto cross-domain) or show dialog... That's a comfort way to make one webpage ajaxable.

compile.js
------
The core js is compile.js, all funtions is in the `$.webex` scope.

If you need float dialog, the frame invoked a third party dialog for default
https://github.com/aui/artDialog (version 4.0+)

If you need to use you own dialog, please overload the funtions `$.webex.CreateDialog` and `$.webex.CloseDialog`

If you need ajax crossdomain, you can replace the jqeury ajax $.ajax with $.webex.ajax and replace $.load with $.ajaxload, and put jsonp.php on your server(only for php server nowaday, or you can write an jsonp server yourself). $.webex.ajax will auto detect your request domain whether cross or not.

$.webex scope structure
-------
`$.webex.setting` basic global settings
`$.webex.action` json back action scope
`$.webex.util` common utilities

$.webex functions and consts
-------
###$.bigpu.  
> alert('message',expired=5000)  
> CreateDialog('html'|'url'|'iframe',{'<html>'}|{'url'},title,width='auto',height='auto',multi=false,resizable=false,buttonok,buttoncancel)  
> ajax(url,'POST'|'GET',data="string"|{object},expired,callback="string"|function(json))  
> cookie(name, [value], [options])  
> 
> setting.  
> > autocompile:false #whether to auto $('body').compile() or not  
> > crossdomainserver:'http://www.yourdomain.com/jsonp.php' #jsonp cross domain server  
> > LastDialogHandle:handle #pop dialog handle,iframe use the parent to close  
> 
> action.  
> > script(json) #on json.status==1 trigger json.script  
> > redirect(json) #show prompt json.info redirect to json.jumpUrl delay by json.delay*1000  
> > success(json) #show prompt json.info then redirect to json.jumpUrl if url exists  
> > error(json) //show prompt json.info then redirect to json.jumpUrl if url exists.
> > reload(json)  //show prompt json.info for 5s if exists then reload.
> 
> util.  
> > toJSON(json_string) #return json object  
> > isIE6()  
> > isIOS()  
> > fixOrientZoom()  
> > substring4ChAndEn(str,length)  
> > ellipse(str,length)  
> > isEmpty(str)  
> > isEmail(str)  
> > isNick(str)  
> > noLink(str)  
> > getPosition(Element)  
> > getDomain(urlstr)  
> > selectall(input[name],'#checkbox_id')  
> > submitByEnter(e,callback)  
> > goTop()  
> > JsonAction(data) #json back to call $.webex.action,the callback name declare in json.data.action  
> > getAbsUrl(url)  
> > crc32(string)  
> > base64_encode(str)  
> > base64_decode(str)  
> > regularTimestamp(timestamp, nowtime=Date(), isNormal=false, showtime=false)
> > setHomePage(obj,url)  
> > addBookmark(title,url)  
> > copyToClipboard(txt)  

for scope to take effects:  
   `$('#selector').compile()` 
to turn off effects:
   `$('#selector').uncompile()`  
all the server back ajax format must like:  
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

> `form.ajax` use ajax to post instead of redirect  
> > prepare:function, #for validate,submit will break if return false  
> > valid:'false', #submit will break if val(false)  
> > callback:function, #for callback(json)  
> > ajaxmsg:'.class|#id' #the target div will show the submiting tips  
> > inner form: `<input:submit>`  
> > > sync:'message',#on submiting the button title will be changed and submit button disabled, after success will restore  
> 
> `div.load`  load url content after document is loaded, support different domain  
> > *url:url  
> > callback:function, #ex: `<div class="load" url="http://domain.com" callback="cb(data)"></div>`  
> 
> `div.loadswf` #embed flash into div 
> > *url:url  
> > *width:width  
> > *height:height  
> > flashvars:flashvars&..  
> > params:params&..  
> 
> `a.dialog` #click to show dialog  
> > *target:id, #target div id  
> > *type:'url'|'iframe'|'div' #load from url or div? default:url  
> > *href:url, #if type is url  
> > title:'title' #dialog title, default <a>text  
> > dwidth:width #default is auto  
> > dheight:height #default is auto  
> > resizable:true  
> > multi:false #if allow multi dialogs  
> > prepare:"preparefunction()"  
> > buttonok:"btnfunc()"  
> > buttoncancel:"btncancel()"  
> 
> `a.ajax`  #click to trigger ajax post/get, prepare pointing to prepare function, callback pointing to callback function, callback function first input param is json  
> > *href:url  
> > target:"#id" #if target id is not null,will write back the json.info result  
> > method:'POST'|'GET' #default is 'POST'  
> > data:data, //post data  
> > prepare:"preparefunction()"  
> > callback:"callbackfunction(json)"  
> 
> `a.iframe` #click to load iframe into DIV  
> > *target:"#id"  
> > *href:url  
> 
> `a.div` #click to load URL content into DIV  
> > *href:url  
> > *target:"#id"  
> > append:false  # true:append to the end;false: empty the div  
> > ask:'tips'  # if div is not empty, it will alert a tips  
> > prepare:"preparefunction()"  
> > callback:"callbackfunction(json)"  
> 
> `a.popmenu` #click to show pop menu  
> > target:"#id"|".class"  #default .tooltips in the same div level  
> > onclass:'clicked', //add the class if a is clicked  
> 
> `:text.fot` #type words limited  
> > target:id  
> > limit:200  