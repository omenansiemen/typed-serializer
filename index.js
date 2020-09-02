"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.setTextHandler=exports.unpack=exports.pack=exports.Types=void 0;var t,e=require("tslib"),n=function(t){return"boolean"==typeof t},r=function(t){return null!==t&&"object"==typeof t},i=function(t){return"object"==typeof t&&Array.isArray(t)},f=function(t){return"number"==typeof t};!function(t){t.int8="int8",t.uint8="uint8",t.int16="int16",t.uint16="uint16",t.int32="int32",t.uint32="uint32",t.float32="float32",t.float64="float64",t.boolean="boolean",t.string8="string8",t.string16="string16",t.string="string"}(t=exports.Types||(exports.Types={}));var o=function(t){return"string"==typeof t.type},a={arrayMaxLength:t.uint32};var s=function(t,e,o,a){if(void 0===a&&(a=0),i(t)&&i(e)){var y={type:o.arrayMaxLength};a+=u(y,t.length);for(var l=0,c=t;l<c.length;l++){var v=c[l];r(v)?a+=s(v,e[0],o)*t.length:a+=s(v,e,o)*t.length;break}}else Object.keys(e).forEach((function(i){var y,l=null!==(y=t[i])&&void 0!==y?y:t,c=e[i];if(r(l))a+=s(l,c,o);else if(f(l)||n(l))a+=u(c,l);else if("string"==typeof l){var v=O(l),g=p(c.type);a+=u({type:g},v.byteLength),a+=v.byteLength}}));return a},p=function(e){return e===t.string8?t.uint8:e===t.string16?t.uint16:t.uint32};function y(t,e,n){l({metaValue:e,refObject:t,value:n})}var l=function(e){var n=e.metaValue,r=e.refObject,i=e.value,o=u(n,i),a=new DataView(r.buffer,r.byteOffset,o);return f(n.multiplier)&&f(i)&&(i*=n.multiplier),n.type===t.uint8?(n.preventOverflow&&(i=i<0?0:i>255?255:i),a.setUint8(0,i)):n.type===t.int8?(n.preventOverflow&&(i=i<-128?-128:i>127?127:i),a.setInt8(0,i)):n.type===t.boolean?a.setInt8(0,!1===i?0:1):n.type===t.uint16?(n.preventOverflow&&(i=i<0?0:i>65535?65535:i),a.setUint16(0,i)):n.type===t.int16?(n.preventOverflow&&(i=i<-32768?-32768:i>32767?32767:i),a.setInt16(0,i)):n.type===t.uint32?(n.preventOverflow&&(i=i<0?0:i>4294967295?4294967295:i),a.setUint32(0,i)):n.type===t.int32?(n.preventOverflow&&(i=i<-2147483648?-2147483648:i>2147483647?2147483647:i),a.setInt32(0,i)):n.type===t.float32?a.setFloat32(0,i):n.type===t.float64?a.setFloat64(0,i):n.type!==t.string8&&n.type!==t.string16&&n.type!==t.string||i instanceof Uint8Array&&i.forEach((function(t,e){return a.setUint8(e,t)})),o};function u(e,n){var r;if(e.type===t.int8||e.type===t.uint8||e.type===t.boolean)r=1;else if(e.type===t.int16||e.type===t.uint16)r=2;else if(e.type===t.int32||e.type===t.uint32||e.type===t.float32)r=4;else if(e.type===t.string8||e.type===t.string16||e.type===t.string)r=n instanceof Uint8Array?n.byteLength:e.type===t.string8?1:e.type===t.string16?2:4;else{if(e.type!==t.float64)throw Error("Unknown type: "+e.type);r=8}return r}function c(e,n,r){var i,o=u(n),a=new DataView(e,r,o);if(n.type===t.uint8)i=a.getUint8(0);else if(n.type===t.int8)i=a.getInt8(0);else if(n.type===t.uint16)i=a.getUint16(0);else if(n.type===t.int16)i=a.getInt16(0);else if(n.type===t.uint32)i=a.getUint32(0);else if(n.type===t.int32)i=a.getInt32(0);else if(n.type===t.float32)i=a.getFloat32(0);else if(n.type===t.float64)i=a.getFloat64(0);else if(n.type===t.boolean)i=0!==a.getInt8(0);else{if(n.type!==t.string8&&n.type!==t.string16&&n.type!==t.string)throw Error("Unknown metaValue.type "+n);var s=void 0,p=void 0;n.type===t.string8?(o+=s=a.getUint8(0),p=r+1):n.type===t.string16?(o+=s=a.getUint16(0),p=r+2):(o+=s=a.getUint32(0),p=r+4);var y=p+s;i=v(e.slice(p,y))}return f(n.multiplier)&&f(i)&&(i/=n.multiplier),{value:i,byteOffset:r+o}}exports.pack=function(t,o,l){void 0===l&&(l={});var c=l.sharedBuffer,v=l.returnCopy,g=void 0!==v&&v,b=l.freeBytes,d=void 0===b?0:b,x=a;"object"==typeof o._netSerializer_&&(x=e.__assign(e.__assign({},x),o._netSerializer_.options),o=o._netSerializer_.template);var h,_=s(t,o,x);return function t(e,o,a){if(i(e)&&i(o)){var s={type:a.templateOptions.arrayMaxLength};y(a,s,e.length),a.byteOffset+=u(s,e.length),e.forEach((function(e){r(e)?t(e,o[0],a):t(e,o,a)}))}else Object.keys(o).forEach((function(i){var s,l=null!==(s=e[i])&&void 0!==s?s:e,c=o[i];if(r(l))t(l,c,a);else if(f(l)||n(l))y(a,c,l),a.byteOffset+=u(c,l);else if("string"==typeof l){var v=O(l),g={type:p(c.type)};y(a,g,v.byteLength),a.byteOffset+=u(g,v.byteLength),y(a,c,v),a.byteOffset+=v.byteLength}else l}))}(t,o,{byteOffset:0,buffer:h=void 0!==c?c:new ArrayBuffer(_+d),templateOptions:x}),void 0!==c&&g?h.slice(0,_):h},exports.unpack=function(t,n){var r=a;return"object"==typeof n._netSerializer_&&(r=e.__assign(e.__assign({},r),n._netSerializer_.options),n=n._netSerializer_.template),function t(e,n,r,f){var a;if(void 0===f&&(f=!1),i(n)){a=[];var s=c(e,{type:r.templateOptions.arrayMaxLength},r.byteOffset),p=s.value,y=s.byteOffset;r.byteOffset=y;for(var l=0;l<p;l++){var u=t(e,n[0],r);f&&"function"==typeof r.templateOptions.arrayCallback&&r.templateOptions.arrayCallback(u),a.push(u)}}else if(a={},o(n)){var v=c(e,n,r.byteOffset),g=v.value;y=v.byteOffset;r.byteOffset=y,a=g}else Object.keys(n).forEach((function(i){if(o(n[i])){var f=c(e,n[i],r.byteOffset),s=f.value,p=f.byteOffset;r.byteOffset=p,a[i]=s}else{var y=t(e,n[i],r);a[i]=y}}));return a}(t,n,{byteOffset:0,templateOptions:r},!0)};var v,g,b=function(t){return function(e){return t.decode(e)}};"function"==typeof TextDecoder&&(g=new TextDecoder,v=b(g));var O,d,x=function(t){return function(e){return t.encode(e)}};"function"==typeof TextEncoder&&(d=new TextEncoder,O=x(d)),exports.setTextHandler=function(t){O=x(t),v=b(t)};var h={pack:exports.pack,unpack:exports.unpack,setTextHandler:exports.setTextHandler,Types:t};exports.default=h;
