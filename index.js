// Simple AJAX method via https://gist.github.com/mythz/1334560, modified by Wes Johnson
    
var Ajax = {}, xhrs = [
       function () { return new XMLHttpRequest(); },
       function () { return new ActiveXObject("Microsoft.XMLHTTP"); },
       function () { return new ActiveXObject("MSXML2.XMLHTTP.3.0"); },
       function () { return new ActiveXObject("MSXML2.XMLHTTP"); }
    ],
    _xhrf = null;
var nativeForEach = Array.prototype.forEach,
    _each = require('./utils').each,
    _extend = require('./utils').extend;

Ajax.xhr = function () {
    if (_xhrf !== null) return _xhrf();
    for (var i = 0, l = xhrs.length; i < l; i++) {
        try {
            var f = xhrs[i], req = f();
            if (req !== null) {
                _xhrf = f;
                return req;
            }
        } catch (e) {
            continue;
        }
    }
    return function () { };
};
Ajax._xhrResp = function (xhr) {
    switch (xhr.getResponseHeader("Content-Type").split(";")[0]) {
        case "text/xml":
            return xhr.responseXML;
        case "text/json":
        case "application/json":
        case "text/javascript":
        case "application/javascript":
        case "application/x-javascript":
            return window.JSON ? JSON.parse(xhr.responseText) : eval(xhr.responseText);
        default:
            return xhr.responseText;
    }
};
Ajax._formData = function (o) {
    var kvps = [], regEx = /%20/g;
    for (var k in o) {
        if(o[k])
            kvps.push(encodeURIComponent(k).replace(regEx, "+") + "=" + encodeURIComponent(o[k].toString()).replace(regEx, "+"));
    }
    return kvps.join('&');
};
Ajax.ajax = function (o) {
    var xhr = Ajax.xhr(), timer, n = 0;
    if(typeof xhr.open !== 'function') return;
    o = _extend({ userAgent: "XMLHttpRequest", lang: "en", type: "GET", data: null, dataType: "application/json" }, o);
    if (o.timeout) timer = setTimeout(function () { xhr.abort(); if (o.timeoutFn) o.timeoutFn(o.url); }, o.timeout);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (timer) clearTimeout(timer);
            if (xhr.status < 400) {
                if (o.success) o.success(Ajax._xhrResp(xhr));
            }
            else if (o.error) o.error(xhr, xhr.status, xhr.statusText);
            if (o.complete) o.complete(Ajax._xhrResp(xhr), xhr, xhr.statusText);
        }
        else if (o.progress) o.progress(++n);
    };
    var url = o.url, data = null;
    o.type = (o.type||'GET').toUpperCase();
    var isPost = o.type == "POST" || o.type == "PUT";
    if (!isPost && o.data) url += "?" + Ajax._formData(o.data);
    xhr.open(o.type, url);

    if (isPost) {
        var isJson = o.dataType.indexOf("json") >= 0;
        data = isJson ? JSON.stringify(o.data) : Ajax._formData(o.data);
        xhr.setRequestHeader("Content-Type", isJson ? "application/json" : "application/x-www-form-urlencoded");
    }
    xhr.send(data);
};
// alias methods
['get','post','put','delete','patch'].forEach(function(method) {
    Ajax[method] = function(o) {
        var cfg = _extend(o, {type:method.toUppercase()});
        Ajax.ajax(cfg);
    };
});

module.exports = Ajax;