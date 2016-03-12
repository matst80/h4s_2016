// javascript!
window.addEventListener('DOMContentLoaded', function() {
	var canvas = document.getElementById('renderCanvas');
	var engine = new BABYLON.Engine(canvas, true);

	var createScene = function() {
		// create a basic BJS Scene object
		var scene = new BABYLON.Scene(engine);

		// create a FreeCamera, and set its position to (x:0, y:5, z:-10)
		//var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5,-10), scene);
		var camera = new BABYLON.ArcRotateCamera('camera1', 3.1415/4, 3.1415/4, 8, new BABYLON.Vector3(0, 0, 0), scene);

		// target the camera to scene origin
		camera.setTarget(BABYLON.Vector3.Zero());

		// attach the camera to the canvas
		camera.attachControl(canvas, false);

		camera.minZ = 1.0;

		// create a basic light, aiming 0,1,0 - meaning, to the sky
		var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

		// create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
		//var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene);
		var ground = BABYLON.Mesh.CreateGroundFromHeightMap("mesh", "res/heightMap.png", 6, 6, 100, 0, 3, scene, false)

		// Compile
		var shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
			vertexElement: "vertexShaderCode",
			fragmentElement: "fragmentShaderCode",
		},
			{
				attributes: ["position", "normal", "uv"],
				uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
			});



		//var refTexture = new BABYLON.Texture("res/karta.jpg", scene);
		//refTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
		//refTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;

		var mainTexture = new BABYLON.Texture("res/karta.jpg", scene);

		shaderMaterial.setTexture("textureSampler", mainTexture);
		//shaderMaterial.setTexture("refSampler", refTexture);
		shaderMaterial.setFloat("time", 0);
		shaderMaterial.setVector3("cameraPosition", BABYLON.Vector3.Zero());
		shaderMaterial.backFaceCulling = false;
		
		//scene.shadowsEnabled = true;

		// Shadows
		//var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
		//shadowGenerator.getShadowMap().renderList.push(meshes[0]);
		//shadowGenerator.useVarianceShadowMap = true;
		//shadowGenerator.usePoissonSampling = true;

		//shaderMaterial.setTexture("shadowSampler", shadowGenerator.getShadowMap());

		//scene.receiveShadows = true;

		// var material = new BABYLON.StandardMaterial("texture1", scene);

		// material.diffuseTexture = new BABYLON.Texture("res/karta.jpg", scene);

		ground.material = shaderMaterial;



		// return the created scene
		return scene;
	}

	var scene = createScene();

	engine.runRenderLoop(function() {
		scene.render();
	});

	window.addEventListener('resize', function() {
		engine.resize();
	});
});