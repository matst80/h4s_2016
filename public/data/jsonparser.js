

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
		y:imgsize.y-Math.round(dlat*imgsize.y),
		x:Math.round(dlon*imgsize.x),
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
		title:'Näringsliv',
		file:'foursquare_new2.js',
		image:'dutt.png',
		parser:'foursquare',
		multiple:0.33,
	},
	{
		title:'Trafikolyckor',
		file:'olyckor.js',
		parser:'trafik',
		multiple:0.5,
	},
	{
		title:'Evenemang',
		file:'facebookevents.js',
		image:'tunadutt.png',
		parser:'facebook',
		multiple: 0.5,
	},
	{
		title:'Offentlig service',
		file:'bilbiotek.js',
		parser:'libraries',
		multiple: 0.5,
	},
	{
		title:'Dagligvarubutiken',
		file:'dagligvarubutiker.js',
		parser:'geojson',
		multiple:0.2,
	},
	{
		file:'drivmedel.js',
		title:'Drivmedel',
		parser:'geojson',
		multiple:1.0,
	}
];




function parse(data,parser,ictx,image,multiple) {
	//console.log(data,parser,parsers);
	var p = parsers[parser];
	var baseArray = p.getarray(data);
	var ret = { points: []};
	//
	
	ictx.globalAlpha = 1.0;
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

				pixel.x -= 5.0;
				pixel.y -= 5.0;
				pixel.x += 10.0 * Math.random();
				pixel.y += 10.0 * Math.random();
				
				if (pixel.x>=0 && pixel.x<=imgsize.x && pixel.y>=0 && pixel.y<=imgsize.y)
					ictx.globalAlpha = multiple;
					ictx.drawImage(image,pixel.x-128,pixel.y-128,256,256);
				}
			//else
			//	console.log('out of bounds');
		}
	});
	ictx.globalAlpha = 1.0;
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
	
	
	var totlen = arr[0].length;
	
	
	for(var i=0;i<totlen;i+=4) {
	
		var j=0, s = 0;
		pos.forEach(function(offsetNumber) {
			
			arr.forEach(function(currentLayer) {
				
					var pp = i + (offsetNumber * 4);
				
				
				if (pp > 0 && pp < totlen) {
					
					var v = currentLayer[pp];
				
					s+=v;//>100?1:((255/v)*0.3);
					j++;
				}
				
				//}
				/*else {
					console.log('ass',pp,totlen);
					if (crap++>10000)
						return;
				}*/
			});
			
		});
		
		var tv = Math.round((s/(j)));//Math.max(0,Math.round((s))); //-(255/arr.length)
		id.data[i] = 255;
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
				var cvs =  createContext(imgsize.x,imgsize.y);
				var ctx =  cvs.getContext('2d');
				var res = parse(data,v.parser,ctx,img,v.multiple);
				
				v.extend(res);

				//console.log('res',v);
				var outimg = new Image();
				outimg.src = cvs.toDataURL();
				
				var divCvx = createContext(divx,divy);
				var divCtx = divCvx.getContext("2d");

				//ictx.globalCompositeOperation = "destination-over";

				divCtx.drawImage(outimg,0,0,divx,divy);
				var calcData = divCtx.getImageData(0,0,divx,divy);
				// getDiversity(calcData);
				divCtx.putImageData(calcData,0,0);
				var crap = new Image();
				crap.src = divCvx.toDataURL();
				ctx.drawImage(crap,0,0,imgsize.x,imgsize.y);
				
				//outimg.src = cvs.toDataURL();
				v.imgData = cvs.toDataURL();




				//prt.appendChild(outimg);
				var span = document.createElement('h3');
				span.innerHTML = v.title;
				window.pq = parseQueue;

				document.getElementById('dummy').value = 'var compileddata = ' + JSON.stringify(parseQueue);

				prt.appendChild(span);
				prt.appendChild(outimg);
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
