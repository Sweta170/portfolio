/* ============================================================
   THREE-PARTICLES.JS — Three.js WebGL 3D Landing Page Engine
   Contains GPU-accelerated particle morphing systems,
   glassmorphic 3D crystal hologram, interactive lights,
   and smooth scrolling/mouse interaction.
   ============================================================ */

class ThreeParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.speed = 1.0;
    this.particleCount = 1800; // Optimal density for WebGL performance & styling
    this.currentSectionIndex = 0;
    this.targetSectionIndex = 0;
    this.transitionProgress = 1.0; // 1.0 means fully transitioned
    this.time = 0;

    // Mouse interaction states
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.drag = { isDragging: false, x: 0, y: 0, startX: 0, startY: 0 };

    this.initThree();
    this.initLights();
    this.initHologram();
    this.initParticles();
    this.initConnections();
    
    this.resize();
    this.bindEvents();
    this.animate();
  }

  // Initialize Three.js Core Renderer, Scene and Camera
  initThree() {
    this.scene = new THREE.Scene();

    // Set up camera with perspective
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1500
    );
    this.camera.position.z = 450;

    // Set up WebGL renderer with anti-aliasing and shadow support
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  // Setup lighting: ambient + two colored point lights for realistic reflection
  initLights() {
    // Ambient light for general visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    this.scene.add(ambientLight);

    // Directional rim light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight.position.set(0, 100, 200);
    this.scene.add(dirLight);

    // Light A: Cyan light orbiting the crystal
    this.lightCyan = new THREE.PointLight(0x00d4ff, 8, 300);
    this.lightCyan.position.set(-120, 0, 50);
    this.scene.add(this.lightCyan);

    // Light B: Purple/Rose light orbiting the crystal
    this.lightPurple = new THREE.PointLight(0x8b5cf6, 8, 300);
    this.lightPurple.position.set(120, 0, 50);
    this.scene.add(this.lightPurple);
  }

  // Initialize the central 3D glass crystal hologram
  initHologram() {
    // Create an icosahedron geometry
    this.crystalGeometry = new THREE.IcosahedronGeometry(75, 1); // Faceted crystal structure

    // Create a physical material with glass properties (transmission, roughness, etc.)
    this.crystalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0x090518,
      roughness: 0.12,
      metalness: 0.08,
      transmission: 0.75,       // High glass transparency
      thickness: 1.8,          // Real refraction depth
      ior: 1.55,               // Refractive index
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      flatShading: true,       // Facet look
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide
    });

    this.crystalMesh = new THREE.Mesh(this.crystalGeometry, this.crystalMaterial);
    
    // Add glowing wireframe overlay to crystal for a holographic/digital vibe
    const wireframeGeo = new THREE.WireframeGeometry(this.crystalGeometry);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });
    this.crystalWireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
    this.crystalMesh.add(this.crystalWireframe);

    // Add to scene at origin (visible in Section 1)
    this.scene.add(this.crystalMesh);
  }

  // Initialize morphing particles
  initParticles() {
    this.particleGeometry = new THREE.BufferGeometry();
    
    // Position arrays: current positions + target positions for morphing
    this.currentPositions = new Float32Array(this.particleCount * 3);
    this.targetPositions = new Float32Array(this.particleCount * 3);
    this.ambientPositions = new Float32Array(this.particleCount * 3); // Predefined background starfield
    
    // Colors & opacities
    const colors = new Float32Array(this.particleCount * 3);
    const opacities = new Float32Array(this.particleCount);
    const twinkleSpeeds = new Float32Array(this.particleCount);
    const twinkleOffsets = new Float32Array(this.particleCount);

    // Predefine ambient stars (wide sphere/cylinder field)
    for (let i = 0; i < this.particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 350 + Math.random() * 450;
      
      const ax = r * Math.sin(phi) * Math.cos(theta);
      const ay = r * Math.sin(phi) * Math.sin(theta) * 0.7; // Slightly flattened
      const az = r * Math.cos(phi);

      this.ambientPositions[i * 3] = ax;
      this.ambientPositions[i * 3 + 1] = ay;
      this.ambientPositions[i * 3 + 2] = az;

      // Start current particles spread out
      this.currentPositions[i * 3] = ax;
      this.currentPositions[i * 3 + 1] = ay;
      this.currentPositions[i * 3 + 2] = az;

      // Setup colors: Cyan and White highlights
      const isCyan = Math.random() > 0.82;
      if (isCyan) {
        colors[i * 3] = 0.0;     // R
        colors[i * 3 + 1] = 0.83; // G
        colors[i * 3 + 2] = 1.0;  // B
      } else {
        colors[i * 3] = 1.0;     // R
        colors[i * 3 + 1] = 1.0; // G
        colors[i * 3 + 2] = 1.0; // B
      }

      opacities[i] = Math.random() * 0.6 + 0.25;
      twinkleSpeeds[i] = Math.random() * 2.0 + 0.5;
      twinkleOffsets[i] = Math.random() * Math.PI * 2;
    }

    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(this.currentPositions, 3));
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Store custom parameters for the animation loop
    this.particleOpacities = opacities;
    this.twinkleSpeeds = twinkleSpeeds;
    this.twinkleOffsets = twinkleOffsets;

    // Load a soft dot texture for the particles
    const canvasDot = document.createElement('canvas');
    canvasDot.width = 16;
    canvasDot.height = 16;
    const ctxDot = canvasDot.getContext('2d');
    const grad = ctxDot.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.7)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctxDot.fillStyle = grad;
    ctxDot.fillRect(0, 0, 16, 16);
    const texture = new THREE.CanvasTexture(canvasDot);

    // Particle material
    this.particleMaterial = new THREE.PointsMaterial({
      size: 4.5,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particlePoints = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particlePoints);

    // Set initial target positions (Scene 0 - Hero Tilted Ring)
    this.calculateScenePositions(0, this.targetPositions);
  }

  // Initialize connection lines for specific wireframe models
  initConnections() {
    this.connectionsGeometry = new THREE.BufferGeometry();
    // Maximum lines we will support: 300 lines (600 vertex points)
    this.maxLinePoints = 700;
    this.linePositions = new Float32Array(this.maxLinePoints * 3);
    this.lineColors = new Float32Array(this.maxLinePoints * 3);

    // Initialize with zeros
    for (let i = 0; i < this.maxLinePoints * 3; i++) {
      this.linePositions[i] = 0;
      this.lineColors[i] = 0;
    }

    this.connectionsGeometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
    this.connectionsGeometry.setAttribute('color', new THREE.BufferAttribute(this.lineColors, 3));

    this.connectionsMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending
    });

    this.connectionsLine = new THREE.LineSegments(this.connectionsGeometry, this.connectionsMaterial);
    this.scene.add(this.connectionsLine);
  }

  // Calculate 3D coordinates for the given scene and dump into a target array
  calculateScenePositions(sceneIndex, targetArray) {
    for (let i = 0; i < this.particleCount; i++) {
      let x = 0, y = 0, z = 0;

      // Scenes 5, 6, 7 are ambient star fields
      if (sceneIndex >= 5) {
        x = this.ambientPositions[i * 3];
        y = this.ambientPositions[i * 3 + 1];
        z = this.ambientPositions[i * 3 + 2];
      } else {
        switch (sceneIndex) {
          case 0: {
            // Scene 0: Hero Tilted Ring around Central Hologram
            if (i < 1300) {
              const theta = (i / 1300) * Math.PI * 2;
              const r = 185 + Math.sin(i * 12) * 5; // textured wavy ring
              const x0 = r * Math.cos(theta);
              const y0 = Math.sin(i * 3) * 6;
              const z0 = r * Math.sin(theta);
              
              // Apply slant (rotation around Z axis)
              const tilt = -0.3;
              x = x0 * Math.cos(tilt) - y0 * Math.sin(tilt);
              y = x0 * Math.sin(tilt) + y0 * Math.cos(tilt);
              z = z0;
            } else {
              // Outer scattering stars
              x = this.ambientPositions[i * 3] * 0.8;
              y = this.ambientPositions[i * 3 + 1] * 0.8;
              z = this.ambientPositions[i * 3 + 2] * 0.8;
            }
            break;
          }

          case 1: {
            // Scene 1: DNA Double Helix
            if (i < 800) {
              // Strand A
              const t = (i / 800) * Math.PI * 5.0 - Math.PI * 2.5;
              x = 85 * Math.cos(t);
              y = t * 50;
              z = 85 * Math.sin(t);
            } else if (i < 1600) {
              // Strand B (offset by PI)
              const j = i - 800;
              const t = (j / 800) * Math.PI * 5.0 - Math.PI * 2.5;
              x = 85 * Math.cos(t + Math.PI);
              y = t * 50;
              z = 85 * Math.sin(t + Math.PI);
            } else {
              // Scatter remaining particles
              x = this.ambientPositions[i * 3] * 0.7;
              y = this.ambientPositions[i * 3 + 1] * 0.7;
              z = this.ambientPositions[i * 3 + 2] * 0.7;
            }
            break;
          }

          case 2: {
            // Scene 2: Neural Net Fibonacci Globe
            if (i < 1200) {
              const r = 160;
              const yVal = 1 - (i / 1199) * 2;
              const radius = Math.sqrt(1 - yVal * yVal);
              const theta = i * 2.39996; // Golden angle
              x = r * radius * Math.cos(theta);
              y = r * yVal;
              z = r * radius * Math.sin(theta);
            } else {
              // Ambient orbiters
              x = this.ambientPositions[i * 3] * 0.9;
              y = this.ambientPositions[i * 3 + 1] * 0.9;
              z = this.ambientPositions[i * 3 + 2] * 0.9;
            }
            break;
          }

          case 3: {
            // Scene 3: Torus Mesh
            if (i < 1400) {
              const u = (i % 50) * (Math.PI * 2 / 50); // Ring segment
              const v = Math.floor(i / 50) * (Math.PI * 2 / 28); // Tube segment
              const R = 130; // Major radius
              const r = 38;  // Minor radius
              x = (R + r * Math.cos(v)) * Math.cos(u);
              y = r * Math.sin(v);
              z = (R + r * Math.cos(v)) * Math.sin(u);
            } else {
              x = this.ambientPositions[i * 3] * 0.8;
              y = this.ambientPositions[i * 3 + 1] * 0.8;
              z = this.ambientPositions[i * 3 + 2] * 0.8;
            }
            break;
          }

          case 4: {
            // Scene 4: Vortex Funnel + Helix Spiral
            if (i < 700) {
              // Funnel structure (bottom)
              const ringIdx = Math.floor(i / 35);
              const ptIdx = i % 35;
              const f = ringIdx / 19;
              const Y = 120 - f * 110;
              const R = 15 + f * f * 85;
              const theta = ptIdx * (Math.PI * 2 / 35);
              x = R * Math.cos(theta);
              y = Y;
              z = R * Math.sin(theta);
            } else if (i < 1400) {
              // Helical path climbing upward
              const j = i - 700;
              const f = j / 699;
              const t = f * Math.PI * 5.0;
              const Y = 30 - f * 220;
              const R = 70 - f * 22;
              x = R * Math.cos(t);
              y = Y;
              z = R * Math.sin(t);
            } else {
              x = this.ambientPositions[i * 3] * 0.65;
              y = this.ambientPositions[i * 3 + 1] * 0.65;
              z = this.ambientPositions[i * 3 + 2] * 0.65;
            }
            break;
          }
        }
      }

      targetArray[i * 3] = x;
      targetArray[i * 3 + 1] = y;
      targetArray[i * 3 + 2] = z;
    }
  }

  // Draw wireframe connecting lines for active scenes to look futuristic
  updateConnections() {
    const scene = this.currentSectionIndex;
    const positions = this.particleGeometry.attributes.position.array;
    const lineAttr = this.connectionsGeometry.attributes.position;
    const colorAttr = this.connectionsGeometry.attributes.color;
    
    let ptr = 0;

    // Reset lines
    for (let k = 0; k < this.maxLinePoints * 3; k++) {
      lineAttr.array[k] = 0;
      colorAttr.array[k] = 0;
    }

    if (scene === 1) {
      // DNA Ladder connecting rungs: Connect Strand A (0-200) to Strand B (800-1000) every few nodes
      const step = 20;
      for (let i = 0; i < 400 && ptr < this.maxLinePoints - 2; i += step) {
        const idxA = i;
        const idxB = i + 800;

        // Line Start
        lineAttr.array[ptr * 3] = positions[idxA * 3];
        lineAttr.array[ptr * 3 + 1] = positions[idxA * 3 + 1];
        lineAttr.array[ptr * 3 + 2] = positions[idxA * 3 + 2];
        
        colorAttr.array[ptr * 3] = 0.0;
        colorAttr.array[ptr * 3 + 1] = 0.83;
        colorAttr.array[ptr * 3 + 2] = 1.0;
        ptr++;

        // Line End
        lineAttr.array[ptr * 3] = positions[idxB * 3];
        lineAttr.array[ptr * 3 + 1] = positions[idxB * 3 + 1];
        lineAttr.array[ptr * 3 + 2] = positions[idxB * 3 + 2];
        
        colorAttr.array[ptr * 3] = 0.55;
        colorAttr.array[ptr * 3 + 1] = 0.36;
        colorAttr.array[ptr * 3 + 2] = 0.96; // Purple-cyan gradient rung
        ptr++;
      }
    } 
    else if (scene === 2) {
      // Connect close vertices on Fibonacci Globe
      let lineCount = 0;
      const step = 8;
      for (let i = 0; i < 600 && lineCount < 100 && ptr < this.maxLinePoints - 2; i += step) {
        for (let j = i + 1; j < i + 50 && j < 600; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < 1500) {
            lineAttr.array[ptr * 3] = positions[i * 3];
            lineAttr.array[ptr * 3 + 1] = positions[i * 3 + 1];
            lineAttr.array[ptr * 3 + 2] = positions[i * 3 + 2];
            colorAttr.array[ptr * 3] = 0.0;
            colorAttr.array[ptr * 3 + 1] = 0.83;
            colorAttr.array[ptr * 3 + 2] = 1.0;
            ptr++;

            lineAttr.array[ptr * 3] = positions[j * 3];
            lineAttr.array[ptr * 3 + 1] = positions[j * 3 + 1];
            lineAttr.array[ptr * 3 + 2] = positions[j * 3 + 2];
            colorAttr.array[ptr * 3] = 0.0;
            colorAttr.array[ptr * 3 + 1] = 0.83;
            colorAttr.array[ptr * 3 + 2] = 1.0;
            ptr++;

            lineCount++;
            break;
          }
        }
      }
    } 
    else if (scene === 3) {
      // Torus Grid Lines (longitude ribs)
      const step = 15;
      for (let i = 0; i < 1000 && ptr < this.maxLinePoints - 2; i += step) {
        const nextInMajor = (i + 50) % 1400;
        
        lineAttr.array[ptr * 3] = positions[i * 3];
        lineAttr.array[ptr * 3 + 1] = positions[i * 3 + 1];
        lineAttr.array[ptr * 3 + 2] = positions[i * 3 + 2];
        colorAttr.array[ptr * 3] = 0.4;
        colorAttr.array[ptr * 3 + 1] = 0.4;
        colorAttr.array[ptr * 3 + 2] = 0.7;
        ptr++;

        lineAttr.array[ptr * 3] = positions[nextInMajor * 3];
        lineAttr.array[ptr * 3 + 1] = positions[nextInMajor * 3 + 1];
        lineAttr.array[ptr * 3 + 2] = positions[nextInMajor * 3 + 2];
        colorAttr.array[ptr * 3] = 0.4;
        colorAttr.array[ptr * 3 + 1] = 0.4;
        colorAttr.array[ptr * 3 + 2] = 0.7;
        ptr++;
      }
    }

    lineAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  }

  // Trigger smooth scene morphing transition
  setSection(index) {
    if (index < 0 || index > 7) return;
    if (index !== this.currentSectionIndex) {
      this.targetSectionIndex = index;
      this.transitionProgress = 0.0; // Start morphing
      
      // Calculate target points for the next state
      this.calculateScenePositions(index, this.targetPositions);
    }
  }

  setSpeed(val) {
    this.speed = val;
  }

  updateParticleSize(val) {
    if (this.particleMaterial) {
      this.particleMaterial.size = val;
    }
  }

  updateTheme(themeName) {
    if (typeof THREE === 'undefined') return;
    
    let primaryColor, secondaryColor;
    switch (themeName) {
      case 'rose':
        primaryColor = new THREE.Color(0xff007f);
        secondaryColor = new THREE.Color(0x9d4edd);
        break;
      case 'emerald':
        primaryColor = new THREE.Color(0x00f5d4);
        secondaryColor = new THREE.Color(0x00bbf9);
        break;
      case 'amber':
        primaryColor = new THREE.Color(0xffb703);
        secondaryColor = new THREE.Color(0xfb8500);
        break;
      default:
        primaryColor = new THREE.Color(0x00d4ff);
        secondaryColor = new THREE.Color(0x8b5cf6);
        break;
    }

    const colors = this.particleGeometry.attributes.color.array;
    for (let i = 0; i < this.particleCount; i++) {
      const isPrimary = Math.random() > 0.6;
      const isWhite = Math.random() > 0.85;
      
      let c;
      if (isWhite) {
        c = new THREE.Color(0xffffff);
      } else if (isPrimary) {
        c = primaryColor;
      } else {
        c = secondaryColor;
      }

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    this.particleGeometry.attributes.color.needsUpdate = true;

    if (this.lightCyan && this.lightPurple) {
      this.lightCyan.color.copy(primaryColor);
      this.lightPurple.color.copy(secondaryColor);
    }
    
    if (this.crystalWireframe) {
      this.crystalWireframe.material.color.copy(primaryColor);
    }
  }

  // Bind interaction listeners
  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    // Mouse movement to create interactive displacement
    document.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      this.mouse.targetY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    });

    // Drag background to tilt camera in 3D
    this.canvas.addEventListener('mousedown', (e) => {
      this.drag.isDragging = true;
      this.drag.startX = e.clientX;
      this.drag.startY = e.clientY;
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.drag.isDragging) return;
      const dx = e.clientX - this.drag.startX;
      const dy = e.clientY - this.drag.startY;
      this.drag.x += dx * 0.005;
      this.drag.y += dy * 0.005;
      this.drag.startX = e.clientX;
      this.drag.startY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
      this.drag.isDragging = false;
    });
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Handle responsive layout focal length / sizes
    if (width < 768) {
      this.crystalMesh.scale.set(0.68, 0.68, 0.68);
      this.particleMaterial.size = 3.2;
    } else if (width < 1024) {
      this.crystalMesh.scale.set(0.85, 0.85, 0.85);
      this.particleMaterial.size = 4.0;
    } else {
      this.crystalMesh.scale.set(1.0, 1.0, 1.0);
      this.particleMaterial.size = 4.5;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.render();
  }

  render() {
    this.time += 0.012 * this.speed;

    // 1. Smoothly morph particles position
    const positions = this.particleGeometry.attributes.position.array;
    const ease = 0.07 * this.speed;

    if (this.transitionProgress < 1.0) {
      this.transitionProgress += 0.015 * this.speed;
      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
        this.currentSectionIndex = this.targetSectionIndex;
      }
    }

    // Process mouse follow interpolation
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

    for (let i = 0; i < this.particleCount; i++) {
      const xIdx = i * 3;
      const yIdx = i * 3 + 1;
      const zIdx = i * 3 + 2;

      // Current coordinates
      let cx = positions[xIdx];
      let cy = positions[yIdx];
      let cz = positions[zIdx];

      // Target scene coordinates
      let tx = this.targetPositions[xIdx];
      let ty = this.targetPositions[yIdx];
      let tz = this.targetPositions[zIdx];

      // Morph interpolation
      cx += (tx - cx) * ease;
      cy += (ty - cy) * ease;
      cz += (tz - cz) * ease;

      // Mouse interactive displacement (repelling force)
      // Project particle in 3D relative to camera projection
      const mouseInfluenceX = this.mouse.x * 35;
      const mouseInfluenceY = -this.mouse.y * 35;
      
      positions[xIdx] = cx + Math.sin(this.time + i) * 0.4 + (mouseInfluenceX * this.particleOpacities[i] * 0.12);
      positions[yIdx] = cy + Math.cos(this.time + i) * 0.4 + (mouseInfluenceY * this.particleOpacities[i] * 0.12);
      positions[zIdx] = cz;
    }
    this.particleGeometry.attributes.position.needsUpdate = true;

    // 2. Draw wireframe connections
    this.updateConnections();

    // 3. Central Glass Crystal Hologram animations & appearance states
    if (this.crystalMesh) {
      // Float crystal gently
      this.crystalMesh.position.y = Math.sin(this.time * 0.8) * 15;
      
      // Auto rotate crystal
      this.crystalMesh.rotation.y += 0.004 * this.speed;
      this.crystalMesh.rotation.x += 0.002 * this.speed;

      // Tilt crystal based on cursor
      this.crystalMesh.rotation.z = -this.mouse.x * 0.25;
      this.crystalMesh.rotation.x += this.mouse.y * 0.15;

      // Morph crystal vertices slightly to simulate organic liquid glass
      const crystalPositions = this.crystalGeometry.attributes.position;
      const timeScale = this.time * 0.5;
      for (let i = 0; i < crystalPositions.count; i++) {
        // Retrieve original vertex position by normalizing current values
        const vx = crystalPositions.getX(i);
        const vy = crystalPositions.getY(i);
        const vz = crystalPositions.getZ(i);
        const vertex = new THREE.Vector3(vx, vy, vz).normalize().multiplyScalar(75);

        // Deform using sine waves
        const wave = Math.sin(vertex.x * 0.02 + timeScale) * 
                     Math.cos(vertex.y * 0.02 + timeScale) * 
                     Math.sin(vertex.z * 0.02 + timeScale) * 4.5;
                     
        const deformedVertex = vertex.addScaledVector(new THREE.Vector3(vx, vy, vz).normalize(), wave);
        crystalPositions.setXYZ(i, deformedVertex.x, deformedVertex.y, deformedVertex.z);
      }
      crystalPositions.needsUpdate = true;
      this.crystalGeometry.computeVertexNormals();

      // Opacity and scale fading based on active section
      const activeSec = this.targetSectionIndex;
      let targetOpacity = 0.0;
      let targetScale = 0.001;

      if (activeSec === 0) {
        // Section 1: Hero - Full opacity and visible scale
        targetOpacity = 1.0;
        targetScale = 1.0;
      } 

      // Interpolate scales & opacity
      this.crystalMaterial.opacity += (targetOpacity - this.crystalMaterial.opacity) * 0.09;
      this.crystalWireframe.material.opacity += (targetOpacity * 0.25 - this.crystalWireframe.material.opacity) * 0.09;
      
      const currScale = this.crystalMesh.scale.x;
      const nextScale = currScale + (targetScale - currScale) * 0.09;
      
      // Set uniform scale
      if (window.innerWidth < 768) {
        const mobileScale = nextScale * 0.68;
        this.crystalMesh.scale.set(mobileScale, mobileScale, mobileScale);
      } else {
        this.crystalMesh.scale.set(nextScale, nextScale, nextScale);
      }

      // Hide mesh fully if opacity becomes negligible
      this.crystalMesh.visible = (this.crystalMaterial.opacity > 0.01);
    }

    // 4. Orbit point lights around center crystal
    if (this.lightCyan && this.lightPurple) {
      const radius = 200;
      const speed = 0.4;
      this.lightCyan.position.x = Math.cos(this.time * speed) * radius;
      this.lightCyan.position.z = Math.sin(this.time * speed) * radius;
      this.lightCyan.position.y = Math.sin(this.time * 0.5 * speed) * 50;

      this.lightPurple.position.x = Math.cos(this.time * speed + Math.PI) * radius;
      this.lightPurple.position.z = Math.sin(this.time * speed + Math.PI) * radius;
      this.lightPurple.position.y = Math.cos(this.time * 0.5 * speed) * 50;
    }

    // 5. Apply camera rotation based on user drag
    this.camera.position.x += (Math.sin(this.drag.x) * 350 - this.camera.position.x) * 0.05;
    this.camera.position.y += (Math.sin(this.drag.y) * 250 - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, 0, 0);

    // 6. Draw scene
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.renderer.dispose();
    this.crystalGeometry.dispose();
    this.crystalMaterial.dispose();
    this.particleGeometry.dispose();
    this.particleMaterial.dispose();
    this.connectionsGeometry.dispose();
    this.connectionsMaterial.dispose();
  }
}

// Bind to window context
window.ThreeParticleSystem = ThreeParticleSystem;
