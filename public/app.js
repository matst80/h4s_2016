// javascript!
window.addEventListener('DOMContentLoaded', function() {

	var updateHeightmap;

	var canvas = document.getElementById('renderCanvas');
	var engine = new BABYLON.Engine(canvas, true);

	var createScene = function() {
		// create a basic BJS Scene object
		var scene = new BABYLON.Scene(engine);

		scene.clearColor = new BABYLON.Color3(1.0, 1.0, 1.0);

		// create a FreeCamera, and set its position to (x:0, y:5, z:-10)
		//var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5,-10), scene);
		var camera = new BABYLON.ArcRotateCamera('camera1', 3.1415/4, 3.1415/4, 14, new BABYLON.Vector3(0, 0, 0), scene);

		// target the camera to scene origin
		camera.setTarget(BABYLON.Vector3.Zero());

		// attach the camera to the canvas
		camera.attachControl(canvas, false);

		camera.minZ = 1.0;

		// create a basic light, aiming 0,1,0 - meaning, to the sky
		var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

		// create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
		//var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene);
		var ground = BABYLON.Mesh.CreateGroundFromHeightMap("mesh", "res/emptyheightmap.png", 10, 10, 500, 0, 10, scene, false)

		// Compile
		var shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
			vertexElement: "vertexShaderCode",
			fragmentElement: "fragmentShaderCode",
		}, {
			attributes: ["position", "normal", "uv"],
			uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "amt1", "amt2", "img1", "img2"],
			// needAlphaBlending: true,
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

		// Animations
		var T = 0;
		scene.registerBeforeRender(function () {
			// torus.rotation.x += 0.01;
			// torus.rotation.z += 0.02;
			// torus.position = new BABYLON.Vector3(Math.cos(alpha) * 30, 20, Math.sin(alpha) * 30);
			// amigaMaterial.setVector3('light0position', lightSphere.position);
			shaderMaterial.setFloat('amt1', amt1 / 100.0);
			shaderMaterial.setFloat('amt2', amt2 / 100.0);
			shaderMaterial.setFloat('debugamt', debugging ? 1.0 : 0.0);
			//	alpha += 0.01;

			updateFadeState();

			T += 1.0 / 60.0;
		});












		var fadestate = 'a-visible';
		var fadetimer = 0.0;

		function updateFadeState() {
			// console.log('updateFadeState', fadestate, fadetimer);

			function easeInOutQuad(t, b, c, d) {
				if ((t/=d/2) < 1) return c/2*t*t + b;
				return -c/2 * ((--t)*(t-2) - 1) + b;
			}

			if (fadestate == 'a-visible') {

				amt1 = 0;
				amt2 = 100;

				amt1_el.value = amt1;
				amt2_el.value = amt2;

				if (queuedHeightmap != null) {
					// we have something queued.
					console.log('Fadestate: Got queued image...');

					currentHeightmap = queuedHeightmap;
					shaderMaterial.setTexture('img1', currentHeightmap);

					queuedHeightmap = null;

					fadestate = 'b-fading-in';
					fadetimer = 0.0;
				}

			} else if (fadestate == 'b-fading-in') {

				amt1 = Math.max(0.0, Math.min(100.0, easeInOutQuad(fadetimer, 0, 100.0, 1.0)));
				amt2 = 100.0 - amt1;

				amt1_el.value = amt1;
				amt2_el.value = amt2;

				fadetimer += 0.01;

				if (fadetimer >= 1.0) {

					console.log('Fadestate: Faded in, swap images...');

					fadestate = 'b-visible';
					fadetimer = 0.0;

					amt1 = 100;
					amt2 = 0;

					amt1_el.value = amt1;
					amt2_el.value = amt2;

					shaderMaterial.setTexture('img2', currentHeightmap);
					lastHeightmap = currentHeightmap;

				}

			} else if (fadestate == 'b-visible') {

				fadetimer += 0.1;
				if (fadetimer >= 1.0) {

					console.log('Fadestate: Idle delay, restart.');

					fadestate = 'a-visible';
					fadetimer = 0.0;

					amt1 = 0;
					amt2 = 100;

					amt1_el.value = amt1;
					amt2_el.value = amt2;


				}
			}









		}












		var queuedHeightmap = null;
		var currentHeightmap = null;
		var lastHeightmap = null;

		updateHeightmap = function(source) {
			console.log('updateHeightmap', source);
			queuedHeightmap = new BABYLON.Texture(source, scene);
		}
		window.updateHeightmap = function(img) {
			queuedHeightmap = new BABYLON.DynamicTexture("dynamic texture", {
			 width: 1024,
			 height: 1024
			}, scene, true);
			var textureContext = queuedHeightmap.getContext();
			textureContext.drawImage(img.img,0,0,1024,1024);
			queuedHeightmap.update();
		};

		shaderMaterial.setTexture('img1', null);
		shaderMaterial.setTexture('img2', null);

		var amt1 = 50;
		var amt2 = 50;

		var amt1_el = document.getElementById('amt1');
		amt1_el.value = 50;
		amt1_el.addEventListener('mousemove', function(e) {
			amt1 = amt1_el.value;
		});

		var amt2_el = document.getElementById('amt2');
		amt2_el.value = 50;
		amt2_el.addEventListener('mousemove', function(e) {
			amt2 = amt2_el.value;
		});

		var debugging = false;
		var debugging_el = document.getElementById('däbüg');
		debugging_el.addEventListener('click', function(e) {
			debugging  = debugging_el.checked;
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

	/* jquery.js */
	/* jquery.velocity.js
	var buttons = [false, false, false, false, false, false];

	// Animate two separate transform properties: rotateZ and translateX.
	$(".buttons div").on("mouseover",function(e){
		if($(this).parent().hasClass("right")){
		   	$(this).velocity({
				scale: 1.05,
				translateX: -20,
				height: 100
		    }, 100);
		}
		else{
			$(this).velocity({
				scale: 1.05,
				translateX: 20,
				height: 100
		    }, 100);
		}
	});

	$(".buttons div").on("mouseleave",function(e){
		$(this).velocity({
			scale: 1,
			translateX: 0,
			height: 100
	    }, 100);
	});

	$(".buttons div").on("click",function(e){
		var index = $(this).index();
		console.log($(this).parent().hasClass("right"));
		if($(this).parent().hasClass("right")){
			index+= 3;
		}
		buttons[index] = !buttons[index];
		console.log(buttons);
		if(buttons[index]){
			$(this).velocity({
				backgroundColorGreen: "100%",
				opacity: 1.0
	    	}, 100);
		}
		else{
			$(this).velocity({
				backgroundColorGreen: "93%",
				opacity: 0.5
	    	}, 100);
		}
	});
	 */
});