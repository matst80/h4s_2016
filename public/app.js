// javascript!
window.addEventListener('DOMContentLoaded', function() {
	var canvas = document.getElementById('renderCanvas');
	var engine = new BABYLON.Engine(canvas, true);

	var createScene = function() {
		// create a basic BJS Scene object
		var scene = new BABYLON.Scene(engine);

		// create a FreeCamera, and set its position to (x:0, y:5, z:-10)
		var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5,-10), scene);

		// target the camera to scene origin
		camera.setTarget(BABYLON.Vector3.Zero());

		// attach the camera to the canvas
		camera.attachControl(canvas, false);

		// light1
		var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -1, -1), scene);
		light.position = new BABYLON.Vector3(3, 2, 1);
		light.intensity = 1.0;

		var lightSphere = BABYLON.Mesh.CreateSphere("sphere", 5, 2, scene);
		lightSphere.position = light.position;
		lightSphere.material = new BABYLON.StandardMaterial("light", scene);
		lightSphere.material.emissiveColor = new BABYLON.Color3(1, 1, 0);

		// create a built-in "sphere" shape; its constructor takes 5 params: name, width, depth, subdivisions, scene
		var sphere = BABYLON.Mesh.CreateTorusKnot("mesh", 0.5, 0.1, 128, 64, 2, 3, scene);

		// move the sphere upward 1/2 of its height
		sphere.position.y = 1;

		// create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
		var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene);

		// Shadows
		var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
		shadowGenerator.getShadowMap().renderList.push(sphere, ground);
		shadowGenerator.useVarianceShadowMap = true;
		shadowGenerator.usePoissonSampling = true;



		var groundmaterial = new BABYLON.TestMaterial("texture1", scene);
		//	groundmaterial.diffuseTexture = new BABYLON.Texture("res/karta.jpg", scene);
		/* var groundmaterial = new BABYLON.ShaderMaterial("amiga", scene, {
            vertex: "./ground",
            fragment: "./ground",
        },
        {
            attributes: ["position", "uv", "normal"],
            uniforms: ["worldViewProjection", "diffuseTexture", "lightMatrix0", "shadowSampler0"]
	    });
*/
        groundmaterial.diffuseTexture = new BABYLON.Texture("res/karta.jpg", scene);
/*        groundmaterial.setTexture("shadowSampler0", shadowGenerator.getShadowMap());
*/
		ground.material = groundmaterial;

		// var spherematerial = new BABYLON.StandardMaterial("texture1", scene);
		// spherematerial.diffuseTexture = new BABYLON.Texture("res/karta.jpg", scene);
		var spherematerial = new BABYLON.StandardMaterial("texture2", scene);
        spherematerial.diffuseTexture = new BABYLON.Texture("res/karta.jpg", scene);
		/* var spherematerial = new BABYLON.ShaderMaterial("amiga", scene, {
            vertexElement: "vertexShaderCode",
            fragmentElement: "fragmentShaderCode",
        },
        {
            attributes: ["position", "uv", "normal"],
            uniforms: ["worldViewProjection", "diffuseTexture", "lightMatrix0"]
        });
        spherematerial.setTexture("textureSampler", new BABYLON.Texture("amiga.jpg", scene));
        spherematerial.setTexture("shadowSampler0", shadowGenerator.getShadowMap()); */
 		sphere.material = spherematerial;

		ground.receiveShadows = true;
		sphere.receiveShadows = true;

		var T = 0.0;
		scene.registerBeforeRender(function () {
			sphere.rotation.x = 1.2 * T;
			sphere.rotation.y = 0.2 * T;
			// sphere.position = new BABYLON.Vector3(Math.cos(T) * 0.4, 2, Math.sin(T) * 0.32);
			// groundmaterial.setFloat('time', T);
			// spherematerial.setFloat('time', T);
			// groundmaterial.setFloat('time', T);
			T += 1.0 / 60.0;
		});

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