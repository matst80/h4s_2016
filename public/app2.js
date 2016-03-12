



// javascript!
window.addEventListener('DOMContentLoaded', function() {
	var canvas = document.getElementById('renderCanvas');
	var engine = new BABYLON.Engine(canvas, true);
	var amigaMaterial;

	function createScene() {
		var scene = new BABYLON.Scene(engine);

		// Setup environment
		var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 90, BABYLON.Vector3.Zero(), scene);
	//	camera.lowerBetaLimit = 0.1;
	//	camera.upperBetaLimit = (Math.PI / 2) * 0.9;
	//	camera.lowerRadiusLimit = 30;
	//	camera.upperRadiusLimit = 150;
		camera.attachControl(canvas, true);

		// light1
		var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -1, -1), scene);
		light.position = new BABYLON.Vector3(60, 80, 20);
		light.intensity = 1.0;

		var lightSphere = BABYLON.Mesh.CreateSphere("sphere", 10, 2, scene);
		lightSphere.position = light.position;
		lightSphere.material = new BABYLON.StandardMaterial("light", scene);
		lightSphere.material.emissiveColor = new BABYLON.Color3(1, 1, 0);

		/*
		// light2
		var light2 = new BABYLON.SpotLight("spot02", new BABYLON.Vector3(30, 40, 20),
													new BABYLON.Vector3(-1, -2, -1), 1.1, 16, scene);
		light2.intensity = 0.5;

		var lightSphere2 = BABYLON.Mesh.CreateSphere("sphere", 10, 2, scene);
		lightSphere2.position = light2.position;
		lightSphere2.material = new BABYLON.StandardMaterial("light", scene);
		lightSphere2.material.emissiveColor = new BABYLON.Color3(1, 1, 0);
		*/

		// Ground
		var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "res/emptyheightmap.png", 100, 100, 200, 0, 30, scene, false);

		amigaMaterial = new BABYLON.ShaderMaterial("amiga", scene, {
            vertexElement: "vertexShaderCode",
            fragmentElement: "fragmentShaderCode",
        },
        {
            attributes: ["position", "uv", "light"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "time", "diffuseTexture"]
        });

		amigaMaterial.setTexture('diffuseTexture', new BABYLON.Texture("res/karta.jpg", scene));

		/*
		var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
		groundMaterial.diffuseTexture = new BABYLON.Texture("textures/ground.jpg", scene);
		groundMaterial.diffuseTexture.uScale = 6;
		groundMaterial.diffuseTexture.vScale = 6;
		groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
		*/

		ground.position.y = -2.05;
		ground.material = amigaMaterial;// groundMaterial;

		// Torus
		var torus = BABYLON.Mesh.CreateTorus("torus", 10, 5, 30, scene, false);

		// Shadows
		var shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
		shadowGenerator.getShadowMap().renderList.push(torus);
		shadowGenerator.getShadowMap().renderList.push(ground);
		shadowGenerator.useVarianceShadowMap = true;

	//	var shadowGenerator2 = new BABYLON.ShadowGenerator(1024, light2);
	//	shadowGenerator2.getShadowMap().renderList.push(torus);
	//	shadowGenerator2.getShadowMap().renderList.push(ground);
		shadowGenerator.usePoissonSampling = true;

			ground.receiveShadows = true;
			torus.receiveShadows = true;

		// Animations
		var alpha = 0;
		scene.registerBeforeRender(function () {
			torus.rotation.x += 0.01;
			torus.rotation.z += 0.02;
			torus.position = new BABYLON.Vector3(Math.cos(alpha) * 30, 20, Math.sin(alpha) * 30);
			amigaMaterial.setVector3('light0position', lightSphere.position);
			amigaMaterial.setFloat('time', T);
			alpha += 0.01;
			T += 1.0 / 60.0;
		});

		scene.debugLayer.show(true);

		return scene;
	}

	var scene = createScene();

	var T = 0.0;

	engine.runRenderLoop(function() {
		scene.render();
	});

	window.addEventListener('resize', function() {
		engine.resize();
	});
});


