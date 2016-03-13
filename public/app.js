// javascript!
window.addEventListener('DOMContentLoaded', function() {

	var updateHeightmap;

	var canvas = document.getElementById('renderCanvas');
	var engine = new BABYLON.Engine(canvas, true);

	var createScene = function() {
		// create a basic BJS Scene object
		var scene = new BABYLON.Scene(engine);

		scene.clearColor = new BABYLON.Color3(0.0, 0.0, 0.0);

		// create a FreeCamera, and set its position to (x:0, y:5, z:-10)
		//var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5,-10), scene);
		var camera = new BABYLON.ArcRotateCamera('camera1', 3.1415/4, 3.1415/4, 14, new BABYLON.Vector3(0, 0, 0), scene);

		// target the camera to scene origin
		camera.setTarget(BABYLON.Vector3.Zero());

		// attach the camera to the canvas
		camera.attachControl(canvas, false);

		//camera.minZ = 1.0;
		//camera.lowerBetaLimit = 0.001;
		//camera.lowerBetaLimit = 0.001;
		//camera.upperBetaLimit = 2.0;
   // Then attach the activeCamera to the canvas.



		var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(5, -4, 0), scene);
		//light.position = new BABYLON.Vector3(-5, 4, 0);
		light.intensity = 0.4;

		//light.direction = BABYLON.Vector3.Zero().subtract(light.position).normalize();

		// create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
		// var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene);
		var ground = BABYLON.Mesh.CreateGroundFromHeightMap("mesh", "res/emptyheightmap.png", 10, 10, 500, 0, 10, scene, false)

		// Compile
		var shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
			vertexElement: "vertexShaderCode",
			fragmentElement: "fragmentShaderCode",
		}, {
			attributes: [ "position", "normal", "uv" ],
			uniforms: [
				"world",
				"worldView",
				"worldViewProjection",
				"view", "projection",
				"amt1", "amt2", "img1",
				"img2", "lightMatrix0","light0","cameraPosition","lightPosition"
			],
			// needAlphaBlending: true,
		});


		//var refTexture = new BABYLON.Texture("res/karta.jpg", scene);
		//refTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
		//refTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;

		var mainTexture = new BABYLON.Texture("res/karta.jpg", scene);

		shaderMaterial.setTexture("textureSampler", mainTexture);
		//shaderMaterial.setTexture("refSampler", refTexture);
		shaderMaterial.setFloat("time", 0);
		// shaderMaterial.setVector3("cameraPosition", BABYLON.Vector3.Zero());
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
		//ground.material = new BABYLON.StandardMaterial("light2", scene);

		// shaderMaterial.setMatrix('world', new BABYLON.Matrix.Identity());
		// shaderMaterial.setMatrix('worldView', new BABYLON.Matrix.Identity());
		//shaderMaterial.setMatrix('worldViewProjection', new BABYLON.Matrix.Identity());

		// Animations
		var T = 0;
		scene.registerBeforeRender(function () {
			// torus.rotation.x += 0.01;
			camera.alpha += 0.0003;
			//ground.rotation.y += 0.003;
			//scene.activeCamera.alpha += .01;

			// torus.position = new BABYLON.Vector3(Math.cos(alpha) * 30, 20, Math.sin(alpha) * 30);
			//shaderMaterial.setVector3('light0', lightSphere.position);
			shaderMaterial.setVector3('lightPosition', light.position);
			shaderMaterial.setVector3('cameraPosition', camera.position);
			shaderMaterial.setFloat('amt1', amt1 / 100.0);
			shaderMaterial.setFloat('amt2', amt2 / 100.0);
			shaderMaterial.setFloat('debugamt', debugging ? 1.0 : 0.0);
			shaderMaterial.setFloat('time', T);

			// var world = ;
			// shaderMaterial.setMatrix('worldViewProjection', world.multiply(scene.getTransformMatrix()));
			// shaderMaterial.setMatrix('worldView', world.multiply(scene.getTransformMatrix()));
			// alpha += 0.01;

			updateFadeState();

			T += 1.0 / 60.0;
		});

    // Create a particle system
    var particleSystem = new BABYLON.ParticleSystem("particles", 1000, scene);

    //Texture of each particle
    particleSystem.particleTexture = new BABYLON.Texture("res/flaaaaar.png", scene);

    // Where the particles come from
    particleSystem.emitter = ground; // the starting object, the emitter
    particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
    particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0); // To...

    // Colors of all particles
    particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

    // Size of each particle (random between...
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;

    // Life time of each particle (random between...
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 1.5;

    // Emission rate
    particleSystem.emitRate = 0;

    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    // Set the gravity of all particles
    particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);

    // Direction of each particle after it has been emitted
    particleSystem.direction1 = new BABYLON.Vector3(-7, 8, 3);
    particleSystem.direction2 = new BABYLON.Vector3(7, 8, -3);

    // Angular speed, in radians
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;


    // Speed
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.005;

    // Start the particle system
    particleSystem.start();
    particleSystem.stop();

     var randomNumber = function (min, max) {
        if (min === max) {
            return (min);
        }
        var random = Math.random();
        return ((random * (max - min)) + min);
    };

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

				var colormap = [
					new BABYLON.Color4(1.0, 0.1, 0.2, 1.0),
					new BABYLON.Color4(0.2, 1.0, 0.1, 1.0),
					new BABYLON.Color4(0.1, 0.2, 1.0, 1.0),
					new BABYLON.Color4(1.0, 0.9, 1.1, 1.0),
					new BABYLON.Color4(0.1, 1.0, 0.9, 1.0),
					new BABYLON.Color4(0.9, 0.1, 1.0, 1.0),
				];

				if (queuedPoints) {




					particleSystem.particles = [];

					queuedPoints.forEach(function(p) {
						// console.log(Math.round(p.x), Math.round(p.y));
						var worldMatrix = BABYLON.Matrix.Translation(
							-5.0 + 10.0 * p.x / 1024.0,
							0,
							5.0 - 10.0 * p.y / 1024.0);

						var particle = new BABYLON.Particle();
						particleSystem.particles.push(particle);

						var emitPower = 0.0;// randomNumber(particleSystem.minEmitPower, particleSystem.maxEmitPower);

						particleSystem.startDirectionFunction(emitPower, worldMatrix, particle.direction, particle);

						particle.lifeTime = 99999.0; // randomNumber(particleSystem.minLifeTime, particleSystem.maxLifeTime);
						particle.size = 3.2;// randomNumber(particleSystem.minSize, particleSystem.maxSize);
						particle.angularSpeed = 0.0;//  randomNumber(particleSystem.minAngularSpeed, particleSystem.maxAngularSpeed);
						particleSystem.startPositionFunction(worldMatrix, particle.position, particle);

						particle.color = colormap[ p.idx % colormap.length ]; // new BABYLON.Color4(1, 0.0, 1.0, 1.0);

						particleSystem.colorDead.subtractToRef(particle.color, particleSystem._colorDiff);
						particleSystem._colorDiff.scaleToRef(1.0 / particle.lifeTime, particle.colorStep);





					});
					queuedPoints = null;

					// skaapa
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
		var queuedPoints = null;
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

			queuedPoints = img.data.points;
			console.log('Updated queuedPoints',queuedPoints.length);
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






































/*

    // Create a sprite manager to optimize GPU ressources
    // Parameters : name, imgUrl, capacity, cellSize, scene
    var spriteManagerTrees = new BABYLON.SpriteManager("treesManager", "data/dutt.png", 2000, 256, scene);

    //We create 2000 trees at random positions
    for (var i = 0; i < 2000; i++) {
        var tree = new BABYLON.Sprite("tree", spriteManagerTrees);
        tree.position.x = Math.random() * 100 - 50;
        tree.position.z = Math.random() * 100 - 50;
        tree.color = new BABYLON.Color4(Math.random() * 255, Math.random() * 255, Math.random() * 255, 255);
        tree.isPickable = true;

        //Some "dead" trees
        if (Math.round(Math.random() * 5) === 0) {
            tree.angle = Math.PI * 90 / 180;
            tree.position.y = -0.3;
        }
    }

	spriteManagerTrees.needAlphaBlending = true;
	spriteManagerTrees.needAlphaTesting = true;
    spriteManagerTrees.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    spriteManagerTrees.isPickable = true;
*/

/*
    //Create a manager for the player's sprite animation
    var spriteManagerPlayer = new BABYLON.SpriteManager("playerManager", "res/avatar.png", 2, 64, scene);

    // First animated player
    var player = new BABYLON.Sprite("player", spriteManagerPlayer);
    player.playAnimation(0, 40, true, 100);
    player.position.y = -0.3;
    player.size = 0.3;
    player.isPickable = true;

    // Second standing player
    var player2 = new BABYLON.Sprite("player2", spriteManagerPlayer);
    player2.stopAnimation(); // Not animated
    player2.cellIndex = 2; // Going to frame number 2
    player2.position.y = -0.3;
    player2.position.x = 1;
    player2.size = 0.3;
    player2.invertU = -1; //Change orientation
    player2.isPickable = true;

*/
    // Picking
/*
	)    spriteManagerPlayer.isPickable = true;

    scene.onPointerDown = function (evt) {
        var pickResult = scene.pickSprite(this.pointerX, this.pointerY);
        if (pickResult.hit) {
            pickResult.pickedSprite.angle += 0.5;
        }
    };
*/

























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