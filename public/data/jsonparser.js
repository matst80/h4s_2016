

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
			return data;
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
				var co = v.geometry.coordinates;
				return {
					lat:co[0],
					lon:co[1]
				};
			}
		}
	}
};

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
];




function parse(data,parser) {
	console.log(data,parser,parsers);
	var p = parsers[parser];
	var baseArray = p.getarray(data);
	var ret = [];
	baseArray.forEach(function(v,i) {
		var nd = p.rowdelegate(v,i);
		if (nd && nd.lat) {
			if (nd.lat>=latbound.min && nd.lat<=latbound.max && nd.lon>=lonbound.min && nd.lon<=lonbound.max) 
				ret.push(nd);
			else
				console.log('out of bounds: '+parser,v );
		}
	});
	return ret;
}

function processQue(q) {
	q.forEach(function(v,i) {
		console.log(v);
		getFile(v.file,function(data) {
			var points = parse(data,v.parser);	
			v.points = points;
			console.log(v);

		});
	});
}

processQue(parseQueue);




//console.log(fq);
var image = new Image();
image.src = 'dutt.png';
image.onload = function() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var imageData = ctx.getImageData(0,0,imgsize.x, imgsize.y);


	function convItem(e) {
		var dlat = ((e.lat-latbound.min)/factor.lat);
		var dlon = ((e.lon-lonbound.min)/factor.lon);
		return {
			y:Math.round(dlat*imgsize.y+Math.random()*10),
			x:Math.round(dlon*imgsize.x+Math.random()*10),
		};
	}


	function plotEvents(arr,imageData) {
		var id = imageData.data;
		ctx.fillStyle = "#000";
		ctx.fillRect(0,0,imgsize.x,imgsize.y);
		ctx.globalCompositeOperation = "lighter";
		arr.forEach(function(v,i) {
			if (v.lat>=latbound.min && v.lat<=latbound.max && v.lon>=lonbound.min && v.lon<=lonbound.max) {
				//console.log('in lat',v);
				
					var pixel = convItem(v);
					/*console.log('in bounds, pixel',pixel);
					var base = (pixel.y*imgsize.x+pixel.x)*4;
					id[base] = 255;
					id[base+1] = 0;
					id[base+2] = 0;
					id[base+3] = 255;*/
					ctx.drawImage(image,pixel.x,pixel.y,16,16);
					
				
			}
			else console.log('out of bounds',v);
		});
		//ctx.putImageData(imageData, 0, 0);
	}
	//plotEvents(ed,imageData);
	//plotEvents(fq,imageData);
	//plotEvents(bib,imageData);
	//parsebibl()
}