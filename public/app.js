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

		// create a basic light, aiming 0,1,0 - meaning, to the sky
		var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

		// create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
		var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene);
		var material = new BABYLON.StandardMaterial("texture1", scene);

		material.diffuseTexture = new BABYLON.Texture("res/karta.png", scene);

		ground.material = material;

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