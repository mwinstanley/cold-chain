//Read a page's GET URL variables and return them as an associative array.
function getUrlVars(){var a=[],b,c=window.location.href.slice(window.location.href.indexOf("?")+1).split("&");for(var d=0;d<c.length;d++)b=c[d].split("="),a.push(b[0]),a[b[0]]=b[1];return a}function getCookie(a){var b,c,d,e=document.cookie.split(";");for(b=0;b<e.length;b++){c=e[b].substr(0,e[b].indexOf("=")),d=e[b].substr(e[b].indexOf("=")+1),c=c.replace(/^\s+|\s+$/g,"");if(c==a)return unescape(d)}}function log(a,b){a&&console.log("ERROR"),console.log(b)}function DegToRad(a){return a/180*pi}function RadToDeg(a){return a/pi*180}function ArcLengthOfMeridian(a){var b,c,d,e,f,g,h;return g=(sm_a-sm_b)/(sm_a+sm_b),b=(sm_a+sm_b)/2*(1+Math.pow(g,2)/4+Math.pow(g,4)/64),c=-3*g/2+9*Math.pow(g,3)/16+ -3*Math.pow(g,5)/32,d=15*Math.pow(g,2)/16+ -15*Math.pow(g,4)/32,e=-35*Math.pow(g,3)/48+105*Math.pow(g,5)/256,f=315*Math.pow(g,4)/512,h=b*(a+c*Math.sin(2*a)+d*Math.sin(4*a)+e*Math.sin(6*a)+f*Math.sin(8*a)),h}function UTMCentralMeridian(a){var b;return b=DegToRad(-183+a*6),b}function FootpointLatitude(a){var b,c,d,e,f,g,h,i;return h=(sm_a-sm_b)/(sm_a+sm_b),c=(sm_a+sm_b)/2*(1+Math.pow(h,2)/4+Math.pow(h,4)/64),b=a/c,d=3*h/2+ -27*Math.pow(h,3)/32+269*Math.pow(h,5)/512,e=21*Math.pow(h,2)/16+ -55*Math.pow(h,4)/32,f=151*Math.pow(h,3)/96+ -417*Math.pow(h,5)/128,g=1097*Math.pow(h,4)/512,i=b+d*Math.sin(2*b)+e*Math.sin(4*b)+f*Math.sin(6*b)+g*Math.sin(8*b),i}function MapXYToLatLon(a,b,c,d){var e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B;e=FootpointLatitude(b),i=(Math.pow(sm_a,2)-Math.pow(sm_b,2))/Math.pow(sm_b,2),m=Math.cos(e),h=i*Math.pow(m,2),f=Math.pow(sm_a,2)/(sm_b*Math.sqrt(1+h)),g=f,j=Math.tan(e),k=j*j,l=k*k,n=1/(g*m),g*=f,o=j/(2*g),g*=f,p=1/(6*g*m),g*=f,q=j/(24*g),g*=f,r=1/(120*g*m),g*=f,s=j/(720*g),g*=f,t=1/(5040*g*m),g*=f,u=j/(40320*g),v=-1-h,w=-1-2*k-h,x=5+3*k+6*h-6*k*h-3*h*h-9*k*h*h,y=5+28*k+24*l+6*h+8*k*h,z=-61-90*k-45*l-107*h+162*k*h,A=-61-662*k-1320*l-720*l*k,B=1385+3633*k+4095*l+1575*l*k,d[0]=e+o*v*a*a+q*x*Math.pow(a,4)+s*z*Math.pow(a,6)+u*B*Math.pow(a,8),d[1]=c+n*a+p*w*Math.pow(a,3)+r*y*Math.pow(a,5)+t*A*Math.pow(a,7);return}function UTMXYToLatLon(a,b,c,d,e){var f;a-=5e5,a/=UTMScaleFactor,d&&(b-=1e7),b/=UTMScaleFactor,f=UTMCentralMeridian(c),MapXYToLatLon(a,b,f,e);return}function parseUTM(a,b,c,d){return latlon=new Array(2),UTMXYToLatLon(a,b,c,d,latlon),new google.maps.LatLng(RadToDeg(latlon[0]),RadToDeg(latlon[1]))}function FieldVar(a){a=a.substring(1,a.length-1),a=a.replace(/--/g," ");var b=a.split("::");b.length<1||(b.length<2?(this.type="facility",this.field=b[0]):(this.type=b[0],this.field=b[1])),this.isScheduleDependent=this.type=="schedule",this.getValue=function(a,b){var c;return this.type=="facility"?c=a[fieldIndices.facility[this.field]]:this.type=="schedule"?c=a.schedules[selections.schedule][fieldIndices.schedule[this.field]]:this.type=="fridge"&&b!=null?c=a.fridges[b][fieldIndices.fridge[this.field]]:c=null,c.substring&&(c='"'+c+'"'),c}}function Func(a,b,c){this.numElements=b.indexOf(")",c)-c+1,this.fn=a,this.expression=new Expression(b.slice(c,c+this.numElements).join(" ")),this.isScheduleDependent=this.expression.isScheduleDependent,this.evaluate=function(a){var b=[];if(!a.fridges)return this.fn(b);for(var c=0;c<a.fridges.length;c++)b.push(this.expression.evaluate(a,c));return this.fn(b)}}function Expression(str){this.components=[],this.isScheduleDependent=!1;var expr=str.split(/\s+/),i=0;while(i<expr.length){var val=expr[i].toLowerCase(),simple=parseSimple(val,expr[i]);if(simple!=null)this.components.push(simple);else if(isFieldVar(val)){var field=new FieldVar(expr[i]);this.components.push(field),field.isScheduleDependent&&(this.isScheduleDependent=!0)}else if(val=="count"||val=="ct"){var func=new Func(getCount,expr,i+1);this.components.push(func),i+=func.numElements,func.isScheduleDependent&&(this.isScheduleDependent=!0)}else if(val=="average"||val=="avg"){var func=new Func(getAverage,expr,i+1);this.components.push(func),i+=func.numElements,func.isScheduleDependent&&(this.isScheduleDependent=!0)}else if(val=="sum"){var func=new Func(getSum,expr,i+1);this.components.push(func),i+=func.numElements,func.isScheduleDependent&&(this.isScheduleDependent=!0)}else alert("Invalid expression: "+this.components+", tried to add "+expr[i]);i++}this.evaluate=function(data,index){var toEval="";for(var j=0;j<this.components.length;j++){var comp=this.components[j];comp instanceof Func?toEval+=comp.evaluate(data):comp instanceof FieldVar?toEval+=comp.getValue(data,index):toEval+=comp}return eval(toEval)}}function parseCondition(a){var b=a[0].split(/\s+/),c="";for(var d=0;d<b.length;d++){var e=b[d].toLowerCase();if(isOp(e)||e=="x")c+=translation[e];else if(e.length>2&&e[0]=='"'&&e[e.length-1]=='"')c+=b[d];else{var f=parseFloat(b[d]);isNaN(f)?alert("Invalid expression: "+c+", tried to add "+b[d]):c+=f}}return c}function parsePieCondition(a){var b=a[0].split(/\s+/),c="";for(var d=0;d<b.length;d++){var e=b[d].toLowerCase();if(isOp(e))c+=translation[e];else if(e.length>2&&e[0]=='"'&&e[e.length-1]=='"')c+=b[d];else{var f=parseFloat(b[d]);isNaN(f)?c+=b[d]:c+=f}}return c}function parsePieConditions(a){var b={};for(var c=0;c<a.length;c++){var d=parsePieCondition(a[c]);b[a[c][2]]=d}return b}function parseFilterConditions(a){var b={};for(var c=2;c<a.length;c++){var d=parseCondition(a[c]);b[a[c][1]]=d}return b}function parseMapConditions(a){var b={};for(var c=2;c<a.length;c++){var d=parseCondition(a[c]);b[a[c][2]]=d}return b}function isOp(a){return a=="lt"||a=="gt"||a=="gte"||a=="lte"||a=="("||a==")"||a=="or"||a=="and"||a=="not"||a=="<"||a==">"||a==">="||a=="<="||a=="="||a=="=="||a=="+"||a=="-"||a=="*"||a=="/"||a=="?"||a==":"||a=="!="}function isFieldVar(a){return a.length>2&&a[0]=="{"&&a[a.length-1]=="}"}function parseSimple(a,b){if(isOp(a))return translation[a];if(a.length>2&&a[0]=='"'&&a[a.length-1]=='"')return b;var c=parseFloat(b);return isNaN(c)?null:c}function getCount(a){var b=0;for(var c in a)a[c]&&b++;return b}function getAverage(a){var b=getSum(a);return b/a.length}function getSum(a){var b=0;for(var c in a)isNaN(a[c])||(b+=parseInt(a[c]));return b}var pi=3.14159265358979,sm_a=6378137,sm_b=6356752.314,sm_EccSquared=.00669437999013,UTMScaleFactor=.9996,translation={lt:"<",gt:">",lte:"<=",gte:">=","(":"(",")":")",or:"||",and:"&&",not:"!",x:"x","<":"<",">":">","<=":"<=",">=":">=","=":"==","==":"==","+":"+","-":"-","*":"*","/":"/","?":"?",":":":","!=":"!="};