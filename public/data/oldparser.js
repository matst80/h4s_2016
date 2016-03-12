
/*
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

function parsefour(adata) {
	var data = adata.response.groups[0].items;
	var ret = [];
	data.forEach(function(v,i) {
		//console.log(v);
		var ve = v.venue;
		if (ve && ve.location) {

			var pos = {
				lat:ve.location.lat,
				lon:ve.location.lng
			};
			//console.log('cooord');
			ret.push(pos);
		}
		
	});
	return ret;
}
*/
/*
function parsebibl(adata) {
	var data = adata.libraries;
	var ret = [];
	data.forEach(function(v,i) {
		console.log(v);
		if (v.latitude) {
		var pos = {
				lat:v.latitude,
				lon:v.longitude
			};
			ret.push(pos);
		}
		
	});
	return ret;
}
*/
/*
function parseGeo(adata) {
	var data = adata.features;
	var ret = [];
	data.forEach(function(v,i) {
		console.log(v);
		if (v.geometry) {
			
			var co = v.geometry.coordinates;
			var pos = {
				lat:co[0]v.latitude,
				lon:v.longitude
			};
			ret.push(pos);
		}
		
	});
	return ret;
}
*/