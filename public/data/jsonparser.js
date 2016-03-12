

var latbound = {
	min:59.305966,
	max:59.351460,
}
var lonbound = {
	min:18.016329,
	max:18.104552
}

var imgsize = {
	x:1024,
	y:1024
}
var factor = {
	lat: (latbound.max-latbound.min),
	lon: (lonbound.max-lonbound.min),
}

var parsers = {
	'trafik': {
		getarray:function(data) {
			//console.log(data);
			return data;
		},
		rowdelegate:function(v,rowid) {
			//var ve = v.venue;
			if (v.ySweref && v.ySweref>0) {
				var co = grid_to_geodetic(v.xSweref,v.ySweref);
				//console.log(co,v.geometry.coordinates);
				return {
					lat:co[0],
					lon:co[1]
				};
			}
		}
	},
	'facebook': {
		getarray:function(data) {
			//console.log(data);
			return data.data;
		},
		rowdelegate:function(v,rowid) {
			var ve = v.venue;
			if (ve && ve.latitude) {
				return {
					lat:ve.latitude,
					lon:ve.longitude
				};
			}
		}
	},
	'foursquare': {
		getarray:function(data) {
			return data.response.groups[0].items;
		},
		rowdelegate:function(v,rowid) {
			var ve = v.venue;
			if (ve && ve.location) {
				return {
					lat:ve.location.lat,
					lon:ve.location.lng
				};
			}
		}
	},
	'libraries': {
		getarray:function(data) {
			return data.libraries;
		},
		rowdelegate:function(v,rowid) {
			if (v.latitude) {
				return {
						lat:v.latitude,
						lon:v.longitude
				};
			}
		}
	},
	'geojson': {
		getarray:function(data) {
			return data.features;
		},
		rowdelegate:function(v,rowid) {
			if (v.geometry) {
				var co = grid_to_geodetic.apply(this,v.geometry.coordinates.reverse());
				//console.log(co,v.geometry.coordinates);
				return {
					lat:co[0],
					lon:co[1]
				};
			}
		}
	}
};
/*
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
/*ctx.globalCompositeOperation = "lighter";*/


function convItem(e) {
	var dlat = ((e.lat-latbound.min)/factor.lat);
	var dlon = ((e.lon-lonbound.min)/factor.lon);
	return {
		y:imgsize.y-Math.round(dlat*imgsize.y+Math.random()*10),
		x:Math.round(dlon*imgsize.x+Math.random()*10),
	};
}

function getFile(file,cb) {
	var xmlhttp = new XMLHttpRequest();


	xmlhttp.onreadystatechange = function() {
	    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	        cb(eval('('+xmlhttp.responseText+')'));
	    }
	};
	xmlhttp.open("GET", file, true);
	xmlhttp.send();
}


var parseQueue = [
	{
		file:'foursquare_new2.js',
		image:'dutt.png',
		parser:'foursquare'
	},
	{
		file:'olyckor.js',
		parser:'trafik'
	},
	{
		file:'facebookevents.js',
		parser:'facebook'
	},
	{	file:'bilbiotek.js',
		parser:'libraries'
	},
	{
		file:'dagligvarubutiker.js',
		parser:'geojson'
	},
	{
		file:'drivmedel.js',
		parser:'geojson'
	}
];




function parse(data,parser,ictx,image) {
	//console.log(data,parser,parsers);
	var p = parsers[parser];
	var baseArray = p.getarray(data);
	var ret = { points: []};
	//
	
	ictx.fillStyle = "#000";
	ictx.fillRect(0,0,imgsize.x,imgsize.y);
	
	
	//ictx.drawImage(bgmap,0,0,imgsize.x,imgsize.y);
	
	ictx.globalCompositeOperation = "lighter";
	baseArray.forEach(function(v,i) {
		var nd = p.rowdelegate(v,i);
		if (nd && nd.lat) {
			if (nd.lat>=latbound.min && nd.lat<=latbound.max && nd.lon>=lonbound.min && nd.lon<=lonbound.max) {
				ret.points.push(nd);
				var pixel = convItem(nd);
				
				if (pixel.x>=0 && pixel.x<=imgsize.x && pixel.y>=0 && pixel.y<=imgsize.y)
					ictx.drawImage(image,pixel.x,pixel.y,64,64);
				}
			else
				console.log('out of bounds');
		}
	});
	ictx.globalCompositeOperation = "source-over";
	//var id = ictx.getImageData(0,0,imgsize.x,imgsize.y);

	
	return ret;
}

Object.prototype.extend = function(obj) {
   for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
         this[i] = obj[i];
      }
   }
};

var divfactor = 10;
var divy = Math.round(imgsize.y/divfactor);
var divx = Math.round(imgsize.x/divfactor);

var pos = [
	-(divx+1), 	//top left
	-(divx),	//top middle
	-(divx-1),	//top right
	-1, 		//middle left
	1,			//middle right
	(divx+1), 	//top left
	(divx),		//top middle
	(divx-1),	//top right
]

function getDiversity(imageData) {
	var b = imageData.data;
	
	var nd = new Array(b.length);
	for(var y=1;y<divy-1;y++)
		for(var x=1;x<divx-1;x++)
		{
			var op = (y*divx+x);
			var o = b[op*4];
			var s = 0;
			pos.forEach(function(v) {
				s+=Math.abs(o-b[(op+v)*4]);	
			});
			//console.log(s);
			s= Math.round(s/2);
			op*=4;
			
			nd[op] = s;
			nd[op+1] = 0;
			nd[op+2] = 0;
			nd[op+3] = s;

		}
		//console.log(nd);
		for(var i=0;i<nd.length;i++)
		{
			b[i] = nd[i];
		}
}

function createContext(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function calcDivSums(arr,id) {
	//var ret = [];
	console.log(arr);
	var totlen = arr[0].length;
	var step = 255/arr.length;
	var crap = 0;
	for(var i=0;i<totlen;i++) {
		//ret.push(0);
		var j = 0;
		var s = 0;
		pos.forEach(function(v) {
			//console.log(typeof(i));
			arr.forEach(function(l) {
				var pp = i + (v * 4);
				if (pp>=0 && pp<totlen) {
					console.log('calc');
					var v = l[pp];
					s+=v/128.0;
					j++;
				}
				/*else {
					console.log('ass',pp,totlen);
					if (crap++>10000)
						return;
				}*/
			});
			
		});
		
			var tv = Math.round((s/j)*255);//Math.max(0,Math.round((s))); //-(255/arr.length)
			id.data[i] = tv;
			id.data[i+3] = tv;
	}
	
/*
	arr.forEach(function(v) {
		v.forEach(function(p,i) {
			var s = 0;
			pos.forEach(function(v) {
				s+=b[(op+v)*4];	
			});
			ret[i]+=p;
		});
		
	});
	ret.forEach(function(v,i) {
		id.data[i]=Math.round(ret[i]/(arr.length));
	});

	return ret;*/
}

function getImage(c,addbg) {
	
	var result = new Image();
	result.src = c.toDataURL();

	if (addbg) {
		var tc = createContext(imgsize.x,imgsize.y);
		var ctx = tc.getContext('2d');
		ctx.drawImage(bgmap,0,0,imgsize.x,imgsize.y);
		ctx.drawImage(result,0,0,imgsize.x,imgsize.y);
		result.src = tc.toDataURL();
	}

	return result;
}

function processQue(q) {
	var prt = document.getElementById('up');
	q.forEach(function(v,i) {
		
		getFile(v.file,function(data) {
			var img = new Image();
			img.onload = function() {
				//console.log('start parse',data,v.parser,ctx,img);
				var cvs = v.cvs = createContext(imgsize.x,imgsize.y);
				var ctx = v.ctx = cvs.getContext('2d');
				var res = parse(data,v.parser,ctx,img);
				
				v.extend(res);
				//console.log('res',v);
				var outimg = new Image();
				outimg.src = cvs.toDataURL();
				
				v.divCvx = createContext(divx,divy);
				v.divCtx = v.divCvx.getContext("2d");

				//ictx.globalCompositeOperation = "destination-over";

				v.divCtx.drawImage(outimg,0,0,divx,divy);
				v.calcData = v.divCtx.getImageData(0,0,divx,divy);
				//getDiversity(v.calcData);
				//v.divCtx.putImageData(v.calcData,0,0);
				var crap = new Image();
				crap.src = v.divCvx.toDataURL();
				ctx.drawImage(crap,0,0,imgsize.x,imgsize.y);
				
				outimg.src = cvs.toDataURL();


					


					//prt.appendChild(outimg);
				var span = document.createElement('label');
				span.innerHTML = v.file;
				var cb = document.createElement('input');
				cb.type = 'checkbox';
				cb.value = i;
				cb.addEventListener('change',function() {
					
					
					var empty = [].filter.call( document.querySelectorAll('input[type=checkbox]'), function( el ) {
					   return el.checked;
					});
					var vals = [];
					empty.forEach(function(v) {
						vals.push(q[v.value].calcData.data);
					});
					//console.log(vals);
					var cv = createContext(divx,divy);
					var tx = cv.getContext('2d');
					var idd = tx.getImageData(0,0,divx,divy);

					calcDivSums(vals,idd);
					
					tx.putImageData(idd,0,0);

					var result = getImage(cv,true);

					


					prt.appendChild(result);

				},false);
				prt.appendChild(span);
				prt.appendChild(cb);
				//prt.appendChild(outimg);
			}
			img.src = v.image||'dutt.png';
		});
	});
}
var bgmap = new Image();
bgmap.onload = function() {
	processQue(parseQueue);	
}
bgmap.src = "/res/karta.jpg";




/*
function plotEvents(arr) {
	
	ctx.fillStyle = "#000";
	ctx.fillRect(0,0,imgsize.x,imgsize.y);
	ctx.globalCompositeOperation = "lighter";
	arr.forEach(function(v,i) {	
		var pixel = convItem(v);
		if (pixel.x>0 && pixel.x<imgsize.x && pixel.y>0 && pixel.y<imgsize.y)
			ctx.drawImage(image,pixel.x,pixel.y,16,16);
	});
}*/
