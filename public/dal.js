(function(w,dd) {

var imgsize = {
	x:1024,
	y:1024
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

function createContext(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return {canvas:canvas,ctx:canvas.getContext('2d')};
}

function getData(img,size) {
	var c = createContext(size||img.width,size||img.height);
	c.ctx.drawImage(img,0,0,size||img.width,size||img.height);
	return {img:img,canvas:c.canvas,ctx:c.ctx,data: c.ctx.getImageData(0,0,size||img.width,size||img.height)};
}

function mergeImage(img,cb) {
	img.ctx.putImageData(img.data,0,0);
	var ret = (img.img)?img.img:new Image();
	console.log('do merge');
	
	ret.onload = function() {
		console.log('loaded');
		cb(img);
	}
	ret.src = img.canvas.toDataURL();
	//cb(img);
}

var dal = {
	'getLayers':function(cb) {
		var ret = [];
		dd.forEach(function(v,i) {
			ret.push({title:v.title,idx:i});
		});
		cb(ret);
	},
	'getLayer':function(idx,cb) {
		var ret = new Image();
		ret.onload = function() {
			cb(ret);
		}
		ret.src = dd[idx].imgData;
	},
	'getImageData':function(idx,cb,size) {
		dal.getLayer(idx,function(img) {
			var imgdata = getData(img,size);
			cb(imgdata);
		});
	}, 
	'calculateDiversity':function(layerData,resultData,cb) { 
		
		var totlen = layerData[0].data.data.length;

		for(var i=0;i<totlen;i+=4) {
			var j=0, s = 0;
			pos.forEach(function(offsetNumber) {
				
				layerData.forEach(function(currentLayer) {
					
					var pixelPos = i + (offsetNumber * 4);
					
					if (pixelPos > 0 && pixelPos < totlen) {
						
						var val = currentLayer.data.data[pixelPos];
					
						s+=val;
						j++;
					}
				});
				
			});
			
			var tv = Math.round((s/(j)));//Math.max(0,Math.round((s))); //-(255/arr.length)
			resultData.data[i] = 255;
			resultData.data[i+3] = tv;
		}
		cb();
	},
	'getDiversity':function(layers,cb) {
		var idata = [];

		function afterLoad() {
			var resultImage = new Image();
			var resultData = getData(resultImage,divx);
			dal.calculateDiversity(idata,resultData.data,function() {
				console.log(resultData.data);
				mergeImage(resultData,cb);	
			});
		}

		layers.forEach(function(v) {
			dal.getImageData(v,function(layerdata) {
				idata.push(layerdata);
				if (idata.length == layers.length) {
					afterLoad();
				}
			},divx);
		});
	}
};

w.dal = dal;

dal.getDiversity([0,1,2],function(d) {
	console.log(d);
	updateHeightmap(d);
	document.body.appendChild(d.img);
});
})(window,compileddata);
