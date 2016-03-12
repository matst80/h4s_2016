(function(w,dd,doc) {

var bgimage = new Image();
bgimage.onload = function() {
	loaded:true;
}
bgimage.src = "res/densitet_bitmap.png";

var imgsize = {
	x:1024,
	y:1024
};

var divfactor = 1;
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

var calcFunc = {
	'+':function() {
			this.init = function(totallayers) {
				this.total = 0;
				this.points = 0;
				this.layers = totallayers;
			};
			this.getResult = function() {
				return this.total/this.points;
			};
			this.pixelDeligate = function(val) {
				this.total+=val/this.layers;
				this.points++;
			};
		},
	'-':function() {
			this.init = function(totallayers) {
				this.total = 0;
				this.points = 0;
				this.layers = totallayers;
			};
			this.getResult = function() {
				return this.total/this.points;
			};
			this.pixelDeligate = function(val) {
				//var val = currentLayer.layerdata.data.data[pixelPos];
				this.total-=val/this.layers;
				this.points++;
				//return val;
			};
	},
	'*':function() {
			this.init = function(totallayers) {
				this.total = 0;
				this.points = 0;
				this.layers = totallayers;
			};
			this.getResult = function() {
				return this.total/this.points;
			};
			this.pixelDeligate = function(val) {
				//var val = currentLayer.layerdata.data.data[pixelPos];
				this.total*=val/this.layers;
				this.points+=10;
				//return val;
			};
	}
};

var dal = {
	useBackgroundData:true,
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
		var totlen = layerData[0].layerdata.data.data.length;


		for(var i=0;i<totlen;i+=4) {
			//var j=0, s = 0;
			layerData.forEach(function(currentLayer) {
				currentLayer.hdl.init(layerData.length);

				layerData.forEach(function(calcLayer) {
					if (currentLayer.idx!=calcLayer.idx) {
						//pos.forEach(function(offsetNumber) {
							var pixelPos = i;// + (offsetNumber * 4);
							//if (pixelPos > 0 && pixelPos < totlen) {
								currentLayer.hdl.pixelDeligate(calcLayer.layerdata.data.data[pixelPos]);
							//}
						//});
					}
				});

			});

			var tot = 0;
			layerData.forEach(function(currentLayer) {
				tot+=currentLayer.hdl.getResult();
			});

			if (dal.useBackgroundData) {
				if (bgimage && bgimage.loaded) {
					var bgdata = getData(bgimage);
					tot+=bgdata.data.data[i];
				}
			}
			//var tv = Math.round((s/(j)));//Math.max(0,Math.round((s))); //-(255/arr.length)
			resultData.data[i] = tot;
			resultData.data[i+3] = tot;
		}
		cb();
	},
	'getDiversity':function(layers,cb) {
		var idata = 0;

		function afterLoad() {
			var resultImage = new Image();
			var resultData = getData(resultImage,divx);
			dal.calculateDiversity(layers,resultData.data,function() {
				mergeImage(resultData,cb);
			});
		}

		layers.forEach(function(v) {
			v.hdl = new calcFunc[v.type||'+']();
			dal.getImageData(v.idx,function(layerdata) {
				idata++;
				v.layerdata = layerdata;
				if (idata == layers.length) {
					afterLoad();
				}
			},divx);
		});
	}
};

w.dal = dal;
var bcnt = doc.getElementById('buttoncnt');
var cogs = doc.getElementById('cogs');
var bouncyBoobs;
dal.getLayers(function(d) {
	d.forEach(function(v) {
		var li = doc.createElement('li');
		var sel = doc.createElement('select');
		var inp = doc.createElement('input');
		var span = doc.createElement('span');
		span.innerHTML = v.title;
		inp.value = v.idx;
		inp.type = 'checkbox';
		function updateSelectedLayers(ev) {
			console.log('vill ha ny data');
			if (bouncyBoobs)
				clearTimeout(bouncyBoobs);
			bouncyBoobs = setTimeout(function() {
				cogs.classList.add('fa-spin');
				console.log('NU GEGERERAR VIU');
				var empty = [].filter.call( document.querySelectorAll('input[type=checkbox]'), function( el ) {
				   return el.checked;
				});
				var vals = [];
				empty.forEach(function(v) {
					if (v.value>0) {
						var type = v.nextSibling.value;
						vals.push({idx:d[v.value].idx,type:type});
					}
				});
				dal.getDiversity(vals,function(d) {
					updateHeightmap(d);
					cogs.classList.remove('fa-spin');
				});
			},700);
		}
		inp.addEventListener('change',updateSelectedLayers,false);
		sel.addEventListener('change',updateSelectedLayers,false);
		for(var i in calcFunc) {
			var v = calcFunc[i];
			var opt = doc.createElement('option');
			opt.value = i;
			opt.innerHTML = i;
			sel.appendChild(opt);
		}

		li.appendChild(span);
		li.appendChild(inp);
		li.appendChild(sel);
		bcnt.appendChild(li);
	});
});

dal.getDiversity([{idx:0,type:'*'},{idx:0,type:'*'},{idx:0,type:''}],function(d) {
	console.log(d);
	updateHeightmap(d);
	document.body.appendChild(d.img);
});
})(window,compileddata,document);
