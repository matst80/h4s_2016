(function(w,dd,doc) {


dd.push(
	{
		imgData:'res/densitet_bitmap.png',
		points:[],
		title:'Befolkningstäthet',
	});
dd.push(
	{
		imgData:'res/avatar.png',
		points:[],
		title:'Lefitäthet',
	});


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
	console.log('do merge',img);

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
				this.points = 1;
				this.layers = totallayers;
			};
			this.getResult = function() {
				return this.total/this.points;
			};
			this.pixelDeligate = function(val) {
				this.total+=val;//this.layers;
				//this.points++;
			};
		}/*,
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
	}*/
};

var dal = {
	useBackgroundData:true,
	'getLayers':function(cb) {
		var ret = [];
		dd.forEach(function(v,i) {
			ret.push({title:v.title,idx:i});
		});
		/*imageLayers.forEach(function(v,i) {
			ret.push({title:v.title,idx:i+dd.length,isImage:true});
		});*/
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
		if (layerData.length<1) {
			console.log('calc nada!');
			resultData.points = [];
			cb();
			return;
		}
		var totlen = layerData[0].layerdata.data.data.length;
		var points = [];



		for(var i=0;i<totlen;i+=4) {

/*
			if (layerData.length == 1) {
				layerData.forEach(function(currentLayer) {
					var pixelPos = i;
					if (pixelPos > 0 && pixelPos < totlen) {
						currentLayer.hdl.pixelDeligate(currentLayer.layerdata.data.data[pixelPos]);
					}
				});

			} else {

*/
			layerData.forEach(function(currentLayer) {
				currentLayer.hdl.init();
			});
			//currentLayer.hdl.init(layerData.length);
			layerData.forEach(function(currentLayer) {


				layerData.forEach(function(calcLayer) {
					if (currentLayer.idx!=calcLayer.idx || layerData.length==1) {
						//pos.forEach(function(offsetNumber) {
							var pixelPos = i;// + (offsetNumber * 4);
							//if (pixelPos > 0 && pixelPos < totlen) {
								currentLayer.hdl.pixelDeligate(calcLayer.layerdata.data.data[pixelPos]);
							//}
						//});
					}
				});

			});

			//}

			var tot = 0;
			layerData.forEach(function(currentLayer) {

				tot += currentLayer.hdl.getResult();
			});
/*
			if (dal.useBackgroundData) {
				if (bgimage && bgimage.loaded) {
					var bgdata = getData(bgimage);
					tot+=bgdata.data.data[i];
				}
			}*/
			//var tv = Math.round((s/(j)));//Math.max(0,Math.round((s))); //-(255/arr.length)

// tot = 0.0;
			tot -= Math.random() * 2.0;

			/*if (tot<1)
				console.log('sklep');*/
			resultData.data[i] = Math.floor(tot);
			resultData.data[i+3] = 255;
		}
		layerData.forEach(function(currentLayer) {
			currentLayer.points.forEach(function(v) {
				points.push({x:v.x,y:v.y,idx:currentLayer.idx});
			});

			console.log('hittat punkter i beräkning',currentLayer.points.length);
			tot += currentLayer.hdl.getResult();
		});
		resultData.points = points;
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
		if (layers.length>0) {
			layers.forEach(function(v) {
				v.hdl = new calcFunc[v.type||'+']();
				dal.getImageData(v.idx,function(layerdata) {
					idata++;
					v.points = dd[v.idx].points;
					v.layerdata = layerdata;
					if (idata == layers.length) {
						afterLoad();
					}
				},divx);
			});
		}
		else {
			console.log('calc nada getdiv!');
			afterLoad();
		}
	}
};

w.dal = dal;
var bcnt = doc.getElementById('buttoncnt');
var cogs = doc.getElementById('cogs');
var bouncyBoobs;
dal.getLayers(function(d) {
	d.forEach(function(v) {
		var li = doc.createElement('li');
		//var sel = doc.createElement('select');
		var inp = doc.createElement('input');
		var span = doc.createElement('span');
		span.innerHTML = v.title;
		inp.value = v.idx;
		inp.type = 'checkbox';
		function updateSelectedLayers(ev) {
			//console.log('vill ha ny data');
			if (ev)
				ev.stopPropagation();
			if (bouncyBoobs)
				clearTimeout(bouncyBoobs);
			var empty = [].filter.call( document.querySelectorAll('input[type=checkbox]'), function( el ) {
					el.parentNode.classList.toggle('selected',el.checked);
				   	return el.checked;
			});
			bouncyBoobs = setTimeout(function() {
				cogs.classList.add('fa-spin');
				//console.log('NU GEGERERAR VIU');

				var vals = [];
				empty.forEach(function(elm) {
					//console.log(elm);
					//if (elm.value>0) {
						var type = '+';//v.nextSibling.value;
						vals.push({idx:d[elm.value].idx,type:type});
					//}
				});
				//console.log('recalc',vals);
				dal.getDiversity(vals,function(d) {
					updateHeightmap(d);
					cogs.classList.remove('fa-spin');
				});
			},700);
		}
		inp.addEventListener('change',updateSelectedLayers,false);
		li.addEventListener('click',function() {
			inp.checked = !inp.checked;
			updateSelectedLayers();
		});
		/*sel.addEventListener('change',updateSelectedLayers,false);
		for(var i in calcFunc) {
			var v = calcFunc[i];
			var opt = doc.createElement('option');
			opt.value = i;
			opt.innerHTML = i;
			sel.appendChild(opt);
		}
*/
		li.appendChild(span);
		li.appendChild(inp);
		//li.appendChild(sel);
		bcnt.appendChild(li);
	});
});
//bgimage.onload = function() {
//	loaded:true;
setTimeout(function() {
	dal.getDiversity([],function(d) {
		updateHeightmap(d);
		cogs.classList.remove('fa-spin');
	});
},500);
//}


})(window,compileddata,document);
