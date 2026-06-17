/* ============================================================
   PARTICLES.JS — 3D Morphing Canvas Background Effect
   3D projection rendering engine with scene morphing, 
   active scroll tracking, and specific wireframe grids.
   ============================================================ */

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.speed = 1.0;
    this.particleCount = 600; // Dense enough for detailed 3D structures
    this.animationId = null;
    this.centerX = 0;
    this.centerY = 0;
    this.time = 0;
    
    // 3D Projection Constants
    this.cameraDistance = 450;
    this.focalLength = 350;

    // Active section index (0-4: Home subsections, 5: Work, 6: About, 7: Contact)
    this.currentSectionIndex = 0;

    // Rotations for each scene
    this.rotations = [
      { x: -0.2, y: 0, z: -0.3, speedX: 0.0005, speedY: 0.004 },  // Scene 0: Tilted Ring
      { x: 0.1,  y: 0, z: 0,    speedX: 0.001,  speedY: 0.008 },  // Scene 1: Double Helix
      { x: 0,    y: 0, z: 0,    speedX: 0.001,  speedY: 0.003 },  // Scene 2: Globe
      { x: 0.3,  y: 0, z: 0.2,  speedX: 0.002,  speedY: 0.005 },  // Scene 3: Torus
      { x: 0.5,  y: 0, z: 0,    speedX: 0.000,  speedY: 0.004 },  // Scene 4: Funnel + Helix
      { x: 0.1,  y: 0, z: 0,    speedX: 0.0005, speedY: 0.001 },  // Scene 5: Work (Ambient)
      { x: 0.1,  y: 0, z: 0,    speedX: 0.0005, speedY: 0.001 },  // Scene 6: About (Ambient)
      { x: 0.1,  y: 0, z: 0,    speedX: 0.0005, speedY: 0.001 }   // Scene 7: Contact (Ambient)
    ];

    // Orbiting Orb variables for Scene 4
    this.orbProgress = 0;
    this.orbX3d = 0;
    this.orbY3d = 0;
    this.orbZ3d = 0;
    this.orbX = 0;
    this.orbY = 0;
    this.orbScale = 1;
    this.orbHistory = [];

    // Pre-generate ambient background star coordinates
    this.ambientStars = [];
    for (let i = 0; i < this.particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 250 + Math.random() * 350;
      this.ambientStars.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta) * 0.6, // Slightly flattened
        z: r * Math.cos(phi)
      });
    }

    this.resize();
    this.init();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;

    // Dynamically adjust focal length to fit 3D objects on mobile/tablet viewports
    if (window.innerWidth < 768) {
      this.focalLength = 230;
    } else if (window.innerWidth < 1024) {
      this.focalLength = 290;
    } else {
      this.focalLength = 350;
    }
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      // Start particles at random 3D points
      this.particles.push({
        x3d: (Math.random() - 0.5) * 800,
        y3d: (Math.random() - 0.5) * 800,
        z3d: (Math.random() - 0.5) * 800,
        x: 0,
        y: 0,
        scale: 1,
        zDepth: 0,
        opacity: Math.random() * 0.6 + 0.2,
        size: Math.random() * 1.5 + 0.5,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.85 ? (Math.random() * 50 + 175) : 0 // Subtle cyan tones
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
  }

  setSpeed(val) {
    this.speed = val;
  }

  setSection(index) {
    if (index < 0 || index > 7) return;
    this.currentSectionIndex = index;
  }

  // 3D to 2D projection
  project(x, y, z) {
    const scale = this.focalLength / (this.cameraDistance + z);
    const projX = this.centerX + x * scale;
    const projY = this.centerY + y * scale;
    return { x: projX, y: projY, scale, zDepth: z };
  }

  // Get raw local 3D coordinates for a particle in the specified scene
  getSceneCoords(scene, index) {
    // Scene 5, 6, 7 are ambient stars
    if (scene >= 5) {
      return { x: this.ambientStars[index].x, y: this.ambientStars[index].y, z: this.ambientStars[index].z, isAmbient: true };
    }

    switch (scene) {
      case 0: {
        // Scene 0: Tilted Particle Ring around SVG cubes
        if (index < 480) {
          const theta = (index / 480) * Math.PI * 2;
          const r = 190 + Math.sin(index * 8) * 6; // textured ring
          const x0 = r * Math.cos(theta);
          const y0 = Math.sin(index * 3) * 8;
          const z0 = r * Math.sin(theta);
          
          // Apply slant (rotation around Z axis)
          const tilt = -0.3;
          const tx = x0 * Math.cos(tilt) - y0 * Math.sin(tilt);
          const ty = x0 * Math.sin(tilt) + y0 * Math.cos(tilt);
          return { x: tx, y: ty, z: z0, isAmbient: false };
        }
        break;
      }

      case 1: {
        // Scene 1: Double Helix
        if (index < 250) {
          // Strand A
          const t = (index / 250) * Math.PI * 4.5 - Math.PI * 2.25;
          return { x: 90 * Math.cos(t), y: t * 45, z: 90 * Math.sin(t), isAmbient: false };
        } else if (index < 500) {
          // Strand B (offset by PI)
          const j = index - 250;
          const t = (j / 250) * Math.PI * 4.5 - Math.PI * 2.25;
          return { x: 90 * Math.cos(t + Math.PI), y: t * 45, z: 90 * Math.sin(t + Math.PI), isAmbient: false };
        }
        break;
      }

      case 2: {
        // Scene 2: Sphere connections globe (using Golden Spiral distribution)
        if (index < 500) {
          const y = 1 - (index / 499) * 2;
          const radius = Math.sqrt(1 - y * y);
          const theta = index * 2.39996; // Golden angle in radians
          return {
            x: 160 * radius * Math.cos(theta),
            y: 160 * y,
            z: 160 * radius * Math.sin(theta),
            isAmbient: false
          };
        }
        break;
      }

      case 3: {
        // Scene 3: Torus (Doughnut wireframe)
        if (index < 500) {
          const u = (index % 25) * (Math.PI * 2 / 25); // Ring angle
          const v = Math.floor(index / 25) * (Math.PI * 2 / 20); // Tube angle
          const R = 135; // Major radius
          const r = 40;  // Minor radius
          return {
            x: (R + r * Math.cos(v)) * Math.cos(u),
            y: r * Math.sin(v),
            z: (R + r * Math.cos(v)) * Math.sin(u),
            isAmbient: false
          };
        }
        break;
      }

      case 4: {
        // Scene 4: Vortex Funnel + Helical Spiral
        if (index < 250) {
          // Funnel structure at the bottom
          const ringIdx = Math.floor(index / 25);
          const ptIdx = index % 25;
          const f = ringIdx / 9;
          const Y = 130 - f * 110;
          const R = 12 + f * f * 80;
          const theta = ptIdx * (Math.PI * 2 / 25);
          return { x: R * Math.cos(theta), y: Y, z: R * Math.sin(theta), isAmbient: false };
        } else if (index < 500) {
          // Spiral structure wrapping upward
          const j = index - 250;
          const f = j / 249;
          const t = f * Math.PI * 4.5;
          const Y = 40 - f * 210;
          const R = 75 - f * 20;
          return { x: R * Math.cos(t), y: Y, z: R * Math.sin(t), isAmbient: false };
        }
        break;
      }
    }

    // Default fallback: scattered star field for index >= max scene particles
    return { x: this.ambientStars[index].x, y: this.ambientStars[index].y, z: this.ambientStars[index].z, isAmbient: true };
  }

  updateOrb() {
    // Move along the spiral path (which is between indices 250 and 500 in Scene 4)
    const t = this.orbProgress * Math.PI * 4.5;
    const Y = 40 - this.orbProgress * 210;
    const R = 75 - this.orbProgress * 20;
    
    // Rotate coordinates same as the spiral scene
    const rot = this.rotations[4];
    const rawX = R * Math.cos(t);
    const rawY = Y;
    const rawZ = R * Math.sin(t);

    const cosY = Math.cos(rot.y);
    const sinY = Math.sin(rot.y);
    const x1 = rawX * cosY - rawZ * sinY;
    const z1 = rawX * sinY + rawZ * cosY;

    const cosX = Math.cos(rot.x);
    const sinX = Math.sin(rot.x);
    this.orbX3d = x1;
    this.orbY3d = rawY * cosX - z1 * sinX;
    this.orbZ3d = rawY * sinX + z1 * cosX;

    // Project orb coordinates
    const proj = this.project(this.orbX3d, this.orbY3d, this.orbZ3d);
    this.orbX = proj.x;
    this.orbY = proj.y;
    this.orbScale = proj.scale;

    // Trail history
    this.orbHistory.push({ x: this.orbX, y: this.orbY, scale: this.orbScale });
    if (this.orbHistory.length > 18) {
      this.orbHistory.shift();
    }
  }

  update() {
    this.time += 0.016 * this.speed;
    const scene = this.currentSectionIndex;
    const ease = 0.065; // Easing speed for morphing

    // Update rotations
    this.rotations.forEach((rot, idx) => {
      rot.y += rot.speedY * this.speed;
      rot.x += rot.speedX * this.speed;
    });

    for (let i = 0; i < this.particleCount; i++) {
      const p = this.particles[i];

      // Get target coordinate for current active scene
      const target = this.getSceneCoords(scene, i);

      let rx = target.x;
      let ry = target.y;
      let rz = target.z;

      // Rotate shape coordinates if not ambient background star
      if (!target.isAmbient) {
        const rot = this.rotations[scene];
        const cosY = Math.cos(rot.y);
        const sinY = Math.sin(rot.y);
        const x1 = rx * cosY - rz * sinY;
        const z1 = rx * sinY + rz * cosY;

        const cosX = Math.cos(rot.x);
        const sinX = Math.sin(rot.x);
        rx = x1;
        ry = ry * cosX - z1 * sinX;
        rz = ry * sinX + z1 * cosX;
      }

      // Morph: Interpolate 3D position
      p.x3d += (rx - p.x3d) * ease * this.speed;
      p.y3d += (ry - p.y3d) * ease * this.speed;
      p.z3d += (rz - p.z3d) * ease * this.speed;

      // Project 3D to 2D screen coordinates
      const proj = this.project(p.x3d, p.y3d, p.z3d);
      p.x = proj.x;
      p.y = proj.y;
      p.scale = proj.scale;
      p.zDepth = proj.zDepth;

      // Twinkle opacity
      p.opacity = (Math.sin(this.time * p.twinkleSpeed * 60 + p.twinkleOffset) + 1) / 2 * 0.6 + 0.2;
    }

    // Update Orb in Scene 4
    if (scene === 4) {
      this.orbProgress = (this.orbProgress + 0.0035 * this.speed) % 1.0;
      this.updateOrb();
    } else {
      this.orbHistory = [];
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const scene = this.currentSectionIndex;

    // Sort particles by Z-depth (painters algorithm for 3D sorting)
    const sortedParticles = [...this.particles]
      .map((p, idx) => ({ ...p, originalIdx: idx }))
      .sort((a, b) => b.zDepth - a.zDepth);

    // Draw connecting lines (wireframes) based on the current scene
    this.drawConnections(scene);

    // Draw the 3D spiral orb in Scene 4
    if (scene === 4 && this.orbHistory.length > 0) {
      this.drawOrb();
    }

    // Draw particles
    sortedParticles.forEach(p => {
      // Don't draw points that are behind the camera viewport
      if (this.cameraDistance + p.zDepth <= 20) return;

      const size = Math.max(0.1, p.size * p.scale);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);

      // Cyan accent highlight or soft white
      if (p.hue > 0 && scene < 5) {
        this.ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity * p.scale})`;
      } else {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * p.scale * 0.85})`;
      }
      this.ctx.fill();

      // Soft glow aura for large points close to camera
      if (size > 1.8) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, size * 2.2, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * p.scale * 0.08})`;
        this.ctx.fill();
      }
    });

    // Draw central blackhole gravity glow (subtle cyan/purple)
    if (scene < 5) {
      const gradient = this.ctx.createRadialGradient(
        this.centerX, this.centerY, 0,
        this.centerX, this.centerY, 120
      );
      gradient.addColorStop(0, 'rgba(0, 212, 255, 0.04)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.02)');
      gradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(this.centerX - 120, this.centerY - 120, 240, 240);
    }
  }

  drawConnections(scene) {
    this.ctx.lineWidth = 0.55;

    // Ambient sections: draw faint on-screen connecting spiderwebs
    if (scene >= 5) {
      for (let i = 0; i < this.particles.length; i += 2) {
        for (let j = i + 1; j < this.particles.length; j += 6) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 7000) {
            const dist = Math.sqrt(distSq);
            this.ctx.beginPath();
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / 85) * 0.035})`;
            this.ctx.stroke();
          }
        }
      }
      return;
    }

    switch (scene) {
      case 1: {
        // DNA Double Helix connections
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        
        // Draw strands
        this.ctx.beginPath();
        for (let i = 0; i < 249; i++) {
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[i + 1].x, this.particles[i + 1].y);
        }
        for (let i = 250; i < 499; i++) {
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[i + 1].x, this.particles[i + 1].y);
        }
        this.ctx.stroke();

        // Draw connecting ladder rungs
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.12)';
        this.ctx.beginPath();
        for (let i = 0; i < 250; i += 10) {
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[i + 250].x, this.particles[i + 250].y);
        }
        this.ctx.stroke();
        break;
      }

      case 2: {
        // AI Connection Globe - connect nearest vertices in 3D space
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
        for (let i = 0; i < 500; i += 2) {
          let connections = 0;
          for (let j = i + 1; j < 500; j++) {
            const dx = this.particles[i].x3d - this.particles[j].x3d;
            const dy = this.particles[i].y3d - this.particles[j].y3d;
            const dz = this.particles[i].z3d - this.particles[j].z3d;
            const d3dSq = dx * dx + dy * dy + dz * dz;
            if (d3dSq < 1300) { // Near points in 3D
              this.ctx.beginPath();
              this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
              this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
              this.ctx.stroke();
              connections++;
              if (connections >= 3) break;
            }
          }
        }
        break;
      }

      case 3: {
        // Torus wireframe grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        this.ctx.beginPath();
        for (let i = 0; i < 500; i++) {
          // Connect tube rings (minor circle)
          const nextInTube = i + 1;
          if (i % 25 !== 24) {
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[nextInTube].x, this.particles[nextInTube].y);
          } else {
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[i - 24].x, this.particles[i - 24].y);
          }

          // Connect around Major Ring
          const nextInMajor = (i + 25) % 500;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[nextInMajor].x, this.particles[nextInMajor].y);
        }
        this.ctx.stroke();
        break;
      }

      case 4: {
        // Funnel + Helical spiral connections
        // 1. Draw Funnel Latitudes (horizontal rings)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        this.ctx.beginPath();
        for (let i = 0; i < 250; i++) {
          const nextPt = i + 1;
          if (i % 25 !== 24) {
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[nextPt].x, this.particles[nextPt].y);
          } else {
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[i - 24].x, this.particles[i - 24].y);
          }
        }
        this.ctx.stroke();

        // 2. Draw Funnel Longitudes (vertical grid ribs)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        this.ctx.beginPath();
        for (let i = 0; i < 225; i++) {
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[i + 25].x, this.particles[i + 25].y);
        }
        this.ctx.stroke();

        // 3. Draw Helix Spiral line
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.16)';
        this.ctx.beginPath();
        for (let i = 250; i < 499; i++) {
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[i + 1].x, this.particles[i + 1].y);
        }
        this.ctx.stroke();
        break;
      }
    }
  }

  drawOrb() {
    const head = this.orbHistory[this.orbHistory.length - 1];

    // Draw orb trail
    this.ctx.save();
    for (let i = 0; i < this.orbHistory.length - 1; i++) {
      const pt = this.orbHistory[i];
      const opacity = (i / this.orbHistory.length) * 0.35;
      const size = Math.max(0.5, 9 * pt.scale * (i / this.orbHistory.length));
      
      this.ctx.beginPath();
      this.ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(0, 212, 255, ${opacity})`;
      this.ctx.fill();
    }

    // Draw orb glowing core
    const size = Math.max(2, 11 * head.scale);
    
    // Core radial glow
    const grad = this.ctx.createRadialGradient(
      head.x, head.y, 0,
      head.x, head.y, size * 2.5
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, '#00d4ff');
    grad.addColorStop(0.5, 'rgba(0, 212, 255, 0.25)');
    grad.addColorStop(1, 'transparent');
    
    this.ctx.beginPath();
    this.ctx.arc(head.x, head.y, size * 2.5, 0, Math.PI * 2);
    this.ctx.fillStyle = grad;
    this.ctx.fill();
    
    this.ctx.restore();
  }

  animate() {
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Export for global access
window.ParticleSystem = ParticleSystem;
