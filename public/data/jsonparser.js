

function parsefacebook(data) {
	var ret = [];
	data.forEach(function(v,i) {
		//console.log(v);
		var ve = v.venue;
		if (ve && ve.latitude) {

			var pos = {
				lat:ve.latitude,
				lon:ve.longitude
			};
			ret.push(pos);
		}
		
	});
	return ret;
}


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

var ed = parsefacebook(fbdata.data)
console.log(ed);
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
			if (v.lat>=latbound.min && v.lat<=latbound.max) {
				//console.log('in lat',v);
				if (v.lon>=lonbound.min && v.lon<=lonbound.max) {
					var pixel = convItem(v);
					/*console.log('in bounds, pixel',pixel);
					var base = (pixel.y*imgsize.x+pixel.x)*4;
					id[base] = 255;
					id[base+1] = 0;
					id[base+2] = 0;
					id[base+3] = 255;*/
					ctx.drawImage(image,pixel.x,pixel.y,16,16);
					
				}
			}
		});
		//ctx.putImageData(imageData, 0, 0);
	}

	plotEvents(ed,imageData);
}