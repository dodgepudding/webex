/*!
* webex framework
* version: v1.0.1
* author: dodge<dodgepudding[at]gmail.com>
* Date: 2012-07-21
* requirement:
* jQuery 1.4+
* artDialog 4.0+ refer: https://github.com/aui/artDialog
* This is licensed under the GNU LGPL, version 2.1 or later.
* For details, see: http://creativecommons.org/licenses/LGPL/2.1/
*/

(function($){
$.extend(true,{webex:{}});
$.extend(true,$.webex,{
	setting:{},
	_setting:{
		autocompile:true,
		LastDialogHandle:null,
		ajaxparam:'isAjax',
		sessionname:'PHPSESSID',
		crossdomainserver:'/jsonp.php',
		swfinstallpath:'expressInstall.swf'
	},
	init:function(){
		$.webex.setting = $.extend({},$.webex._setting,$.webex.setting);
		if ($.webex.setting.autocompile) {
			$('body').compile();
			if ($.webex.util.isIOS()) {
				window.addEventListener("orientationchange", $.webex.util.fixOrientZoom, false); 
			}
		}
	},
	alert: function(msg,etime,callback)
	{
		try{
			var $$ = window.top.jQuery;
		}catch(e) {
			var $$ = $;
		}
		if (typeof $$.dialog=="undefined" && typeof artDialog!="undefined") {
			$$.dialog=artDialog;
		}
		if (typeof $.dialog=="undefined"){
			alert(msg);
			if (callback) callback();
		} else
			$.webex.setting.LastDialogHandle = $.dialog({title:'TIPS',content:msg,lock:true,time:etime,beforeunload:callback,button: [{value: 'OK',callback:callback}]});
	},
	cookie: function(name, value, options) {
	    if (typeof value != 'undefined') { // name and value given, set cookie
	        options = options || {};
	        if (value === null) {
	            value = '';
	            options.expires = -1;
	        }
	        var expires = '';
	        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
	            var date;
	            if (typeof options.expires == 'number') {
	                date = new Date();
	                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
	            } else {
	                date = options.expires;
	            }
	            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
	        }
	        var path = options.path ? '; path=' + (options.path) : '';
	        var domain = options.domain ? '; domain=' + (options.domain) : '';
	        var secure = options.secure ? '; secure' : '';
	        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
	    } else { 
	        var cookieValue = null;
	        if (document.cookie && document.cookie != '') {
	            var cookies = document.cookie.split(';');
	            for (var i = 0; i < cookies.length; i++) {
	                var cookie = jQuery.trim(cookies[i]);
	                if (cookie.substring(0, name.length + 1) == (name + '=')) {
	                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
	                    break;
	                }
	            }
	        }
	        return cookieValue;
	    }
	},
	CloseDialog:function(handle){
		if (handle)
			handle.close();
		else{
			try{
				var $$ = window.top.jQuery;
			}catch(e) {
				var $$ = $;
			}
			$$.webex.setting.LastDialogHandle.close();
		}
		return;
	},
	CreateDialog:function(type,param,title,width,height,multi,resizable,buttonok,buttoncancel){
		if (multi==null) multi = false;
		if (resizable==null) resizable = false;
		var dialoghandle = null;
		var dialogid = multi?'dialogform'+$.webex.util.crc32(title):'dialogform';
		var button = [];
		if (buttonok) button.push({
			value: 'OK',
			callback: buttonok,
			focus: true
		});
		if (buttoncancel) button.push({
			value: 'Cancel',
			callback: buttoncancel
		});
		try{
			var $$ = window.top.$;
		}catch(e) {
			var $$ = $;
		}
		if (typeof $$.dialog=="undefined") {
			if (typeof artDialog!="undefined")
				$$.dialog=artDialog;
			else
				return false;
		}
		dialoghandle = $$.webex.setting.LastDialogHandle = $$.dialog({
				id:dialogid,
				lock:!multi,
				drag:multi,
				resize:resizable,
				title: title,
				width: width?width:'auto',
				height: height?height:'auto',
				padding:'',
				button: button
			});
		if (type=='url')
			$$.webex.ajax(param,'get',null,10000,function(data){
				dialoghandle.content(data).position();
				dialoghandle.dom.content.compile();
			}); 
		else if (type=='iframe') {
			try{
				var iframe = window.top.document.createElement('iframe');
			}catch(e){
				var iframe = window.document.createElement('iframe');
			}
			
			if (width && width!='auto')	iframe.setAttribute('width', width);
			if (height && height!='auto')	iframe.setAttribute('height', height);
			iframe.id = iframe.name = 'i' + dialogid;
			iframe.setAttribute('frameborder', 0, 0);
			iframe.setAttribute('allowTransparency', true);
			iframe.setAttribute('marginheight', 0);
			iframe.setAttribute('marginwidth', 0);
			iframe.setAttribute('border', 0);
			var odiv = $('<div class="d-loading" style="display:none" />');
			odiv.append(iframe);
			dialoghandle.content(odiv[0]);
			iframe.src = param;
			$$(iframe).bind('load', function(){
				odiv.show().removeClass('d-loading');
				$(this).show();
				if ((!width || width=='auto') && (!height || height=='auto')) {
					try {
						var framedocument = this.contentWindow.document;
						var framewidth = ((!width || width=='auto') && framedocument.body.scrollWidth)?framedocument.body.scrollWidth:width;
						var frameheight = ((!height || height=='auto') && framedocument.body.scrollHeight)?framedocument.body.scrollHeight:height;
						this.setAttribute('width', framewidth);
						this.setAttribute('height', frameheight);
					} catch(e){
						this.setAttribute('width', width);
						this.setAttribute('height', height);
					}
				}
				dialoghandle.size(framewidth,frameheight).position();
			});
		} else {
			dialoghandle.content(param);
		}
		return dialoghandle;
	},
	action:{
		script:function(e){
			if (e.status && typeof e.data!='undefined' && typeof e.data.script!='undefined'){$.globalEval(e.data.script);}
		},
		redirect:function(e){
			delay= e.data.delay ? e.delay : 0;
			redirecturl=e.data.jumpUrl;
			if (typeof e.info!='undefined' && e.info) $.webex.alert(e.info);
			setTimeout(function(){location.href=redirecturl;},e.delay*1000);
		},
		success:function(e){
			if (typeof e.data!='undefined' && typeof e.data.jumpUrl!='undefined' && e.data.jumpUrl!='') {
				$.webex.alert(e.info,null,function(){location.href=e.data.jumpUrl});
			} else 
				$.webex.alert(e.info);
		},
		error:function(e){
			if (typeof e.data!='undefined' && typeof e.data.jumpUrl!='undefined' && e.data.jumpUrl!='') {
				$.webex.alert(e.info,null,function(){location.href=e.data.jumpUrl});
			} else 
				$.webex.alert(e.info);
		},
		reload:function(e){
			if (e.status && typeof e.info!='undefined' && e.info) 
				{alert(e.info,5000,function(){location.reload()});}
			else
				location.reload();
		}
	},
	util:{
		toJSON: function(value){var f=function(n){return n<10?'0'+n:n};if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+f(this.getUTCMonth()+1)+'-'+f(this.getUTCDate())+'T'+f(this.getUTCHours())+':'+f(this.getUTCMinutes())+':'+f(this.getUTCSeconds())+'Z':null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;var quote=function(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'};var str=function(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key)}if(typeof rep==='function'){value=rep.call(holder,key,value)}switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null'}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null'}v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v}if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==='string'){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v)}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v)}}}}v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v}};return str('',{'':value})},
		isIE6: function() {
			return $.browser.msie && "6.0" == $.browser.version ? !0 : !1
		},
		isIOS: function() {
			return /\((iPhone|iPad|iPod)/i.test(navigator.userAgent)
		},
		fixOrientZoom:function(){
			var objmeta = document.getElementsByTagName("meta");
			for(var j=0;j<objmeta.length;j++){
				if(objmeta[j].name=="viewport") {
				var ort = window.orientation;
				  if (ort==0 || ort==180) {
				  	objmeta[j].setAttribute('content','width=device-width, initial-scale=1.0,maximum-scale=1,user-scalable=no');
				  } else {
				  	objmeta[j].setAttribute('content','width=device-width, initial-scale=1.0,maximum-scale=10,user-scalable=yes');
				  }
				  break;
				}
			}
		},
		getStrLength: function(b) {
			var b = $.webex.util.trim(b),
				c = 0,
				b = b.replace(/[^\x00-\xff]/g, "**").length;
			return c = parseInt(b / 2) == b / 2 ? b / 2 : parseInt(b / 2) + 0.5
		},
		substring4ChAndEn: function(b, c) {
			for (var d = b.substring(0, 2 * c); $.webex.util.getStrLength(d) > c;) d = d.substring(0, d.length - 1);
			return d;
		},
		ellipse: function(b, c) {
			var d = 2 * $.webex.util.getStrLength(b) > c;
			return b && d ? b.replace(RegExp("([\\s\\S]{" + c + "})[\\s\\S]*"), "$1\u2026") : b;
		},
		isEmpty: function(b) {
			return "" == $.trim(b) ? !1 : !0;
		},
		isEmail: function(a) {
			return /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(a)
		},
		isNick: function(a) {
			return /^[a-zA-Z\d\u4e00-\u9fa5_-]*$/.test(a)
		},
		noLink: function(a) {
			return null == $.match(/(http[s]?:\/\/)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9]+)+/) ? !0 : !1
		},
		getPosition: function(b) {
			var c = b.offset().top,
				d = b.offset().left,
				e = c + b.outerHeight(),
				f = d + b.outerWidth(),
				g = d + b.outerWidth() / 2,
				h = c + b.outerHeight() / 2;
			/iPad/i.test(navigator.userAgent) && (c -= a(window).scrollTop(), e -= a(window).scrollTop(), h -= a(window).scrollTop());
			return {
				leftTop: function() {
					return {
						x: d,
						y: c
					}
				},
				leftMid: function() {
					return {
						x: d,
						y: h
					}
				},
				leftBottom: function() {
					return {
						x: d,
						y: e
					}
				},
				topMid: function() {
					return {
						x: g,
						y: c
					}
				},
				rightTop: function() {
					return {
						x: f,
						y: c
					}
				},
				rightMid: function() {
					return {
						x: f,
						y: h
					}
				},
				rightBottom: function() {
					return {
						x: f,
						y: e
					}
				},
				MidBottom: function() {
					return {
						x: g,
						y: e
					}
				},
				middle: function() {
					return {
						x: g,
						y: h
					}
				}
			}
		},
		getDomain: function(a) {
			var c = "null",
				a = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/.exec(a);
			"undefined" != typeof a && null != a && (c = a[0]);
			return c
		},
		goTop:function()
			{
				try{
				moving=setInterval(function(){
					window.scrollBy(0,-30);
					sy=document.documentElement.scrollTop|| document.body.scrollTop;
					if (sy <= 1){
						clearInterval(moving);
					}
				},10);
				} catch(e){}
				return false;
		},
		selectall:function(name,chkboxid) {
			if ($(chkboxid).attr("checked")==false) {
				$("input[name='"+name+"']").each(function() {
					this.checked=false;
				});
			} else {
				$("input[name='"+name+"']").each(function() {
					this.checked=true;
				});
			}
		},
		submitByEnter: function(a, c) {
			a = a || window.event;
			13 == (a ? a.charCode || a.keyCode : 0) && c()
		},
		JsonAction:function(data)
			{
				var json = {};
				if (data){
					try{
						json=$.parseJSON(data);
					} catch(e) {
						return data;
					}
					if (typeof json.data !="undefined" && typeof json.data.action!="undefined" && $.webex.action.hasOwnProperty(json.data.action))
					{
						try{
						eval('($.webex.action.'+json.data.action+'(json)'+')');
						}catch(e){
							return json;
						}
					}
				} else 
				{
					json.status=0;
					json.info='Network error！';
				}
				return json;
			},
		getAbsUrl:function(url){
			url = $.trim(url);
			if (url.indexOf("://")>0) return url;
			if (url.indexOf("/")==0) return 'http://'+location.host+url;
			var dt = location.href.split("?")[0].split("/");
			  dt.length--;
			  while(url.indexOf("../")==0)
			  {
				url = url.slice(3);
				dt.length--;
			  }
			return unescape(dt.join("/")+"/"+url);
		},
		crc32:function(str) {
			//str = this.utf8_encode(str);
			var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
			var crc = 0;
			var x = 0;
			var y = 0;
			crc = crc ^ (-1);
			for (var i = 0, iTop = str.length; i < iTop; i++) {
				y = (crc ^ str.charCodeAt(i)) & 0xFF;
				x = "0x" + table.substr(y * 9, 8);
				crc = (crc >>> 8) ^ x;
			}
			return crc ^ (-1);
		},
		base64_encode:function(input) {
		  var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		  var output = "";
		  var chr1, chr2, chr3 = "";
		  var enc1, enc2, enc3, enc4 = "";
		  var i = 0;
		  do {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			 if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			 } else if (isNaN(chr3)) {
				enc4 = 64;
			 }

			 output = output + 
				keyStr.charAt(enc1) + 
				keyStr.charAt(enc2) + 
				keyStr.charAt(enc3) + 
				keyStr.charAt(enc4);
			 chr1 = chr2 = chr3 = "";
			 enc1 = enc2 = enc3 = enc4 = "";
		  } while (i < input.length);
		  return output;
		},
		base64_decode:function(input) {
			var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
			var output = "";
			var chr1, chr2, chr3 = "";
			var enc1, enc2, enc3, enc4 = "";
			var i = 0;
			if(typeof input.length=='undefined') return '';
			if(input.length%4!=0){
				return "";
			}
			var base64test = /[^A-Za-z0-9\+\/\=]/g;
			
			if(base64test.exec(input)){
				return "";
			}
			do {
				enc1 = keyStr.indexOf(input.charAt(i++));
				enc2 = keyStr.indexOf(input.charAt(i++));
				enc3 = keyStr.indexOf(input.charAt(i++));
				enc4 = keyStr.indexOf(input.charAt(i++));
				
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
				
				output = output + String.fromCharCode(chr1);
				
				if (enc3 != 64) {
					output+=String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output+=String.fromCharCode(chr3);
				}
				
				chr1 = chr2 = chr3 = "";
				enc1 = enc2 = enc3 = enc4 = "";
			
			} while (i < input.length);
			return output;
		},
		regularTimestamp:function(timestamp, nowtime, isNormal, showtime){
			timestamp=new Date(parseInt(timestamp,10)*1000);
			if (nowtime) 
			{
				nowtime=new Date(parseInt(nowtime,10)*1000);
			} else
			{
				nowtmp=new Date();
				nowtime=nowtmp.getTime();
			}
			var outputdate=timestamp.getFullYear()+'-'+(timestamp.getMonth()+1)+'-'+timestamp.getDate()+' ';
			var outputtime=timestamp.getHours()+':'+timestamp.getMinutes()+':'+timestamp.getSeconds();
			if (isNormal)
			{
				if (showtime)
				  return outputdate+' '+outputtime;
				else
				  return outputdate;
			} else
			{
				delta=Math.ceil((nowtime-timestamp)/1000);
				if (delta<=0)
					return 'now';
				if (delta<=60)
					return (delta-1)+'secs';
				if (delta<=3600)
					return (Math.ceil(delta/60)-1)+'mins';
				if (delta<=86400)
					return (Math.ceil(delta/3600)-1)+'hrs';
				if (delta<=86400*15)
					return (Math.ceil(delta/86400)-1)+'days';
				else
					return outputdate; 
			}
		},
		setHomePage:function(obj,url){
			try{
				obj.style.behavior='url(#default#homepage)';obj.setHomePage(url);
			}catch(e){
				if(window.netscape){
					try{
						netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");  
					}catch (e){ 
						return false;  
					}
					var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
					prefs.setCharPref('browser.startup.homepage',url);
				}
			}
		},
		addBookmark:function(title,url) 
		{
			if($.browser.webkit){ 
				alert("press CTRL+D to bookmark！");
				return true;
			}
		    if (window.sidebar){ 
		        window.sidebar.addPanel(title, url,""); 
		    } 
		    else if( document.all ){
		        window.external.AddFavorite( url, title);
		    } 
		    else if( window.opera && window.print ){
		        return true;
		    }
		},
		copyToClipboard:function(txt) {
			 if(window.clipboardData) {
					 window.clipboardData.clearData();
					 window.clipboardData.setData("Text", txt);
			 } else if(navigator.userAgent.indexOf("Opera") != -1) {
				  window.location = txt;
			 } else if (window.netscape) {
				  try {
					   netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				  } catch (e) {
					   $.webex.alert("Your browser security refused to copy，please copy manually!",5000);
					   return;
				  }
				  var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
				  if (!clip)
					   return;
				  var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
				  if (!trans)
					   return;
				  trans.addDataFlavor('text/unicode');
				  var str = new Object();
				  var len = new Object();
				  var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
				  var copytext = txt;
				  str.data = copytext;
				  trans.setTransferData("text/unicode",str,copytext.length*2);
				  var clipid = Components.interfaces.nsIClipboard;
				  if (!clip)
					   return false;
				  clip.setData(trans,null,clipid.kGlobalClipboard);
			 }
			 $.webex.alert("URL has copied to clipboard!",5000);
		}  
	},
	ajax:function(url,type,data,atimeout,callback)
	{
		var postdata=$.webex.setting.ajaxparam+"=1";
		if (!url) return false;
		url = $.webex.util.getAbsUrl(url);
		if ( $.isPlainObject(data) )
			postdata = $.param(data)+"&"+$.webex.setting.ajaxparam+"=1";
		else if (data!=null && data!='') {
			if (data.charAt(data.length-1)=="&") 
				postdata = data+$.webex.setting.ajaxparam+"=1";
			else
				postdata = data+"&"+$.webex.setting.ajaxparam+"=1";
		}
		var jphost;
		if ($.isFunction(atimeout)) {
			callback = atimeout;
			atimeout = 5000;
		}
		if (typeof usersession=="undefined") usersession=$.webex.cookie($.webex.setting.sessionname);
		if (url.indexOf(location.hostname)>0 || location.hostname==''){
			return $.ajax({
				url:url,
				type:type.toUpperCase(),
				dataType:"text",
				data:postdata,
				timeout: atimeout ? atimeout : 5000,
				success:function(data){
					if ($.isFunction(callback)){ 
						var json=$.webex.util.JsonAction(data);
						callback(json);
					}
					else
					{
						try{
							eval(callback);
						}catch(e){}
					}
				},
				error:function(e){
					//$.webex.alert('Server busy');
				}
			});
		} else {
			var jsonpdata={};
			if (type.toUpperCase()=='GET') {
				if (url.indexOf('?')>1) {
					if (url.charAt(url.length-1)=="&")
						url += postdata;
					else
						url += '&'+postdata;
				} else {
					url += '?'+postdata;
				}
				jsonpdata = {sid:usersession,url:url};
			} else {
				jsonpdata = {sid:usersession,url:url,pdata:postdata};
			}
			return $.ajax({
				url:$.webex.setting.crossdomainserver,
				dataType:"jsonp",
				data:jsonpdata,
				jsonp:"jpback",
				timeout: atimeout ? atimeout : 5000,
				success:function(json){
					if (json.status){
						if ($.isFunction(callback)) 
						{
							var json=$.webex.util.JsonAction(json.data);
							callback(json);
						}
						else
						{
							var json=$.webex.util.JsonAction(json.data);
							try{
								eval(callback);
							}catch(e){}
						}
					} 
				},
				error:function(e){
					//$.webex.alert('Server busy');
				}
			});
		}
	}
});

// cross domain load replace for $.load
$.fn.ajaxload=function(url,callback,compile){
	var callid='';
	$(this).addClass('loading');
	if ($(this).attr('id')) 
		callid=$(this).attr('id');
	else
	{
		callid='FL'+Math.floor(Math.random()*1000000);
		$(this).attr('id',callid);
	}

	callid='#'+callid;
	$.webex.ajax(url,'get',null,10000,function(data){
		if (!data || data=='undefined'){
			return false;
		}
		$(callid).removeClass('loading');
		$(callid).html(data);
		if (compile) {$(callid).removeAttr('compiled');$(callid).compile();}
		if ($.isFunction(callback)){
			$(callid).each(callback);
		}
	});					
};

$.fn.uncompile = function(){
	$(this).off(".webex");
	$(this).removeAttr('compiled');
};

$.fn.compile = function(options){
	var obj=$(this);
	if (obj.attr('compiled')) return false;
	
	var onevent = obj.parents('[compiled]').size() ? false : true;
	
	$('div.load,span.load',obj).each(function(){
		var $div = $(this);
		if ($div.attr('loadstate')=='loaded') return true;
		$div.attr('loadstate','loading');
		var divwidth=$div.width() ? $div.width()+'px' : '99%';
		var divheight=$div.height() ? $div.height()+'px' : '99%';
		$div.addClass('loading');
		var loadurl=$div.attr('url');
		var callback=$div.attr('callback');
		var callid='';
		if ($div.attr('id')) 
			callid=$div.attr('id');
		else
		{
			callid='DG'+Math.floor(Math.random()*1000000);
			$div.attr('id',callid);
		}
		$.webex.ajax(loadurl,'get',null,5000,function(data){
			var jsel = $('#'+callid);
			if (jsel.attr('loadstate')=='loaded') return;
			if (data){
				jsel.removeClass('loading');
				jsel.attr('loadstate','loaded');
				if (callback) {
					try{
						eval(callback);
					}catch(e){}
				} else {
					jsel.html(data);
					jsel.removeAttr('compiled');
					jsel.compile();	
				}
			}
		});		
	});
	
	$('div.loadswf',obj).each(function(){
		var $div = $(this);
		var thispath=$div.attr('url');
		var thiswidth=$div.attr('width') ? $div.attr('width'): 400;
		var thisheight=$div.attr('height') ? $div.attr('height'): 300;
		var flashvars={};
		try{
			eval('flashvars='+$div.attr('flashvars'));
		} catch(e){}
		try{
			eval('params='+$div.attr('params'));
		} catch(e){params={};}

		swfid=($div.attr('id')?$div.attr('id'):'swfobject')+Math.round(Math.round()*1000000);
		$div.empty().append('<div id="'+swfid+'"></div>');
		if (thispath !='')
			swfobject.embedSWF(thispath, swfid, thiswidth, thisheight, "9.0.0",$.webex.setting.swfinstallpath, flashvars,params);
	});
	
	if (onevent)
	obj.on('submit.webex','form.ajax',function(){
		var $form=$(this);
		if ($form.attr('prepare'))
		{
			try{
			var re=eval($form.attr('prepare'));
			if (!re) return false;
			}
			catch(e)
			{return false;}
		}			
		if ($form.attr('valid') && $form.attr('valid')!='true') return false;
		cback='';
		if ($form.attr('callback')) cback=$form.attr('callback');
		submitbtn=$form.find(':submit');
		if (submitbtn.attr('sync')) {
			var globaloldvalue=submitbtn.val();
			submitbtn.val(submitbtn.attr('sync'));
			submitbtn.attr('disabled','disabled');
		}
		if ($form.attr('ajaxmsg'))
		{
			if ($form.attr('sync'))
				$form.find($form.attr('ajaxmsg')).html($form.attr('sync')).show();
			else
				$form.find($form.attr('ajaxmsg')).addClass('loading').show();
		}
		$.webex.ajax(this.action,this.method,$form.serialize(),10000,function(json){
			if ($form.attr('valid')) $form.attr('valid','false');
			if (!json.status) 
			{
				if ($form.attr('ajaxmsg'))
					$form.find($form.attr('ajaxmsg')).html(json.info).show();
				else
				{
					$form.find('.ajaxerror').html(json.info).show();
				}
			}
			if (cback) try{ eval(cback);}catch(e){}
			try{
			if (submitbtn.attr('sync')) {
				submitbtn.val(globaloldvalue);
				if (!json.status) submitbtn.attr('disabled',null);
			}
			} catch(e){}
		});
		return false;
	});
	
	if (onevent)
	obj.on('click.webex','a.dialog',function(e){
		var $obj = $(this);
		var odialog=$obj.attr('target')? $obj.attr('target'):'#popdiv';
		var type=($obj.attr('type'))? $obj.attr('type'):'iframe';
		var settitle = $obj.attr('title');
		if (!settitle) settitle = $obj.text();
		if (!settitle) settitle = 'Message';
		var gohref = $obj.attr('href');
		var setwidth = ($obj.attr('dwidth')) ? $obj.attr('dwidth') : 'auto';
		var setheight = ($obj.attr('dheight')) ? $obj.attr('dheight'): 'auto';
		var setresizable = false;
		if  ($obj.attr('resizable')) setresizable = true;
		var ismulti = false;
		if ($obj.attr('multi')) ismulti = true;
		var buttonok='';
		if ($obj.attr('buttonok')) buttonok=new Function("return "+$obj.attr('buttonok'))();
		var buttoncancel='';
		if ($obj.attr('buttoncancel')) buttoncancel=new Function("return "+$obj.attr('buttoncancel'))();
		if ($obj.attr('prepare'))
		{
			try{
			var re=eval($obj.attr('prepare'));
			if (!re) return false;
			}
			catch(e)
			{}
		}
		if (type == 'url' || type == 'iframe')
			$.webex.CreateDialog(type,gohref, settitle, setwidth, setheight, ismulti, setresizable, buttonok, buttoncancel);
		else
			$.webex.CreateDialog('html',$(odialog)[0], settitle, setwidth, setheight, ismulti, setresizable, buttonok, buttoncancel);
		return false;
	});
	
	if (onevent)
	obj.on('click.webex','a.ajax',function(e){
		var $obj = $(this);
		var target=$obj.attr('target');
		if ($obj.attr('prepare'))
		{
			try{
			var re=eval($obj.attr('prepare'));
			if (!re) return false;
			}
			catch(e)
			{}
		}
		var cback='';
		if ($obj.attr('callback'))
		{
			cback = $obj.attr('callback');
		}
		var method='POST';
		method= $obj.attr('method') ? $obj.attr('method') : method;
		var data='';
		if ($obj.attr('data')) data=$obj.attr('data');
		aobj=$obj;
		var gohref=this.href;
		$.webex.ajax(gohref,method,data,30000,
				function(json){
					if (cback){
						try{
							eval(cback);
						}catch(e){}
					} else {
						if (!target) {
							if (typeof json.info!='undefined' && json.info!='') $.webex.alert(json.info);
						 }
						else $(target).html(json.info);
					}
				});

		return false;
	});
	
	if (onevent)
	obj.on('click.webex','a.iframe',function(e){
		var $obj = $(this);
		var divtarget=$obj.attr('target');
		var iframe = window.document.createElement('iframe');
		iframe.src = this.href;
		iframe.name = divtarget.substr(1);
		iframe.setAttribute('frameborder', 0, 0);
		iframe.setAttribute('allowTransparency', true);
		iframe.setAttribute('marginheight', 0);
		iframe.setAttribute('marginwidth', 0);
		iframe.setAttribute('border', 0);
		$(iframe).bind('load', function(){
			var framedocument = this.contentWindow.document;
			iframe.setAttribute('width', framedocument.body.scrollWidth);
			iframe.setAttribute('height', framedocument.body.scrollHeight);
		});
		$(divtarget).html(iframe);   
		return false;
	});	
	
	if (onevent)
	obj.on('click.webex','a.div',function(e){
		var $obj = $(this);
		var $divtarget=$($obj.attr('target'));
		if ($obj.attr('prepare'))
		{
			try{
			var re=eval($obj.attr('prepare'));
			if (!re) return false;
			}
			catch(e)
			{}
		}
		var callback = $divtarget.attr('callback');
		if ($obj.attr('append')!='true') $divtarget.empty();
		if ($obj.attr('ask') &&  $divtarget.children().length>0)
		{
			if (confirm($obj.attr('ask')))
				$divtarget.empty();
			else 
				return false;
		}
		$divtarget.addClass('loading');
		$divtarget.attr('loadstate','loading');
		$.webex.ajax(this.href,'get',null,10000,function(data){
			if ($divtarget.attr('loadstate')=='loaded') return;
			if (data){
				$divtarget.removeClass('loading');
				$divtarget.attr('loadstate','loaded');
				$divtarget.html(data);
				if (callback) {
					try{
						eval(callback);
					}catch(e){}
				} else {
					$divtarget.removeAttr('compiled');
					$divtarget.compile();
				}
			}
		});
		return false;
	});
	
	if (onevent)
	obj.on('click.webex','a.popmenu',function(){
	var $obj = $(this);
	var popclass=$obj.attr('target')?$obj.attr('target'):'.tooltips';
	var $pop = $obj.parent().find(popclass);
	var hoverclass = $obj.attr('onclass');
	if (hoverclass) $obj.addClass(hoverclass);
	if ($pop.length<=0) return false;
	$pop.show().css('z-index',99999).css('position','relative').find('a')
	.click(function(){
		$pop.hide();
	    $obj.parent().find('#popoverlap').remove();
	    if (hoverclass) $obj.removeClass(hoverclass);
	});
	$("<div id='popoverlap' />").css({position:'absolute', 
	        left:'0px', 
	        top:'0px', 
	        background:'#fff',
	    	opacity:'0.1',
	        width: $(document).width()+'px', 
	        height: $(document).height()+'px'})
	.css("z-index",99998)
	.appendTo($obj.parent())
	.click(function(){
		$pop.hide();
		$obj.parent().find('#popoverlap').remove();
		if (hoverclass) $obj.removeClass(hoverclass);
	});
	return false;
	});
	
	//init for the text limits
	if (obj.find("textarea.fot")) {
		$(function(){
			obj.find("textarea.fot").each(function(){
				var $fot = $(this); 
				var val=$fot.val();
				var limit = $fot.attr('limit')?$fot.attr('limit'):200;
				var targetid = $fot.attr('target');
				var len = val.length;
				var d = $(targetid);
				var xxx = limit - len;
				if(len<=limit){
					d.text(xxx);
				}else{
					$fot.val(val.substring(0,limit));
				}
			});
		});
	}
	
	if (onevent)
	obj.on('keyup.webex mouseup.webex change.webex',"textarea.fot",function(e){
		var $fot = $(this); 
		var val=$fot.val();
		var limit = $fot.attr('limit')?$fot.attr('limit'):200;
		var targetid = $fot.attr('target');
		var len = val.length;
		var d = $(targetid);
		var xxx = limit - len;
		if(len<=limit){
			d.text(xxx);
		}else{
			$fot.val(val.substring(0,limit));
			$.webex.alert('只能输入'+limit+'个字!');
		}
	});

	if (onevent)
	obj.on('click.webex','input.checkall',function(e){
		var checked = $(this).attr('checked');
		var target = $(this).attr('target');
		if( checked ) 
			$(target).attr('checked',checked);
		else 
			$(target).removeAttr('checked');
	});

	if (onevent)
	obj.on('click.webex','a.confirmdel', function(e){
		var title = $(this).attr('title');
		title = title ? title : 'confirm to delete？';
		var cback = $(this).attr('callback');		
		var id = $(this).data('id');
		var url = $(this).attr('href');
		if( !id ){
			var target = $(this).attr('target');
			var _ids = '';
			$(target).each(function(){
				if( $(this).attr('checked') ) _ids += ','+$(this).data('id');
			});
			if( !_ids ){
				$.webex.alert('please select items!');
				return false;
			}
			data = {'id':_ids};
		}else{
			data = {'id':id};
		}

		if( !confirm(title) ) return false;
		$.webex.ajax(url,'post',data,10000,function(json){
			if (cback){
				try{
					eval(cback);
				}catch(e){}
			} else {
				$.webex.alert(json.info);
			}
		});
		return false;
	});

	obj.attr('compiled','compiled');
	return true;
};// end compile
//init
$($.webex.init);
})(jQuery);