

var latbound = {
	min:59.305966,
	max:59.351446,
}
var lonbound = {
	min:18.011570,
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

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.globalCompositeOperation = "lighter";


function convItem(e) {
	var dlat = ((e.lat-latbound.min)/factor.lat);
	var dlon = ((e.lon-lonbound.min)/factor.lon);
	console.log(e,latbound);
	return {
		y:Math.round(dlat*imgsize.y+Math.random()*10),
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

	ictx.fillStyle = "#000";
	ictx.fillRect(0,0,imgsize.x,imgsize.y);
	

	baseArray.forEach(function(v,i) {
		var nd = p.rowdelegate(v,i);
		if (nd && nd.lat) {
			if (nd.lat>=latbound.min && nd.lat<=latbound.max && nd.lon>=lonbound.min && nd.lon<=lonbound.max) {
				ret.points.push(nd);
				var pixel = convItem(nd);
				
				if (pixel.x>=0 && pixel.x<=imgsize.x && pixel.y>=0 && pixel.y<=imgsize.y)
					ictx.drawImage(image,pixel.x,pixel.y,16,16);
				}
			else
				console.log('out of bounds');
		}
	});
	
	return ret;
}

Object.prototype.extend = function(obj) {
   for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
         this[i] = obj[i];
      }
   }
};

function processQue(q) {
	var prt = document.getElementById('up');
	q.forEach(function(v,i) {
		
		getFile(v.file,function(data) {
			var img = new Image();
			img.onload = function() {
				//console.log('start parse',data,v.parser,ctx,img);
				var res = parse(data,v.parser,ctx,img);
				
				v.extend(res);
				console.log('res',v);
				var outimg = new Image();
				outimg.src = canvas.toDataURL();
				var span = document.createElement('span');
				span.innerHTML = v.file;
				prt.appendChild(span);
				prt.appendChild(outimg);
			}
			img.src = v.image||'dutt.png';
		});
	});
}


processQue(parseQueue);


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