/* ============================================================
   APP.JS — Main application: navigation, scroll, cursor, tilt,
   speed sidebar, hero entrance, back-to-top
   ============================================================ */

class PortfolioApp {
  constructor() {
    this.nav = document.getElementById('main-nav');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.navIndicator = document.querySelector('.nav-indicator');
    this.scrollContainer = document.querySelector('.scroll-container');
    this.sidebar = document.getElementById('speed-sidebar');
    this.scrollProgress = document.getElementById('scroll-progress');
    this.backToTop = document.getElementById('back-to-top');
    this.cursorDot = document.getElementById('cursor-dot');
    this.cursorOutline = document.getElementById('cursor-outline');

    this.sections = [];
    this.currentSection = 'home';
    this.currentSectionIdx = 0;
    this.particleSystem = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.outlineX = 0;
    this.outlineY = 0;

    // UI Sound Synthesis states
    this.soundSynth = null;
    this.preloaderComplete = false;

    this.init();
  }

  init() {
    // Initialize Three.js WebGL particle system
    this.particleSystem = new ThreeParticleSystem('particle-canvas');

    // Setup preloader
    const preloader = new Preloader();
    preloader.start(() => {
      this.onPreloaderComplete();
    });

    // Setup navigation
    this.setupNavigation();

    // Setup speed sidebar
    this.setupSpeedSidebar();

    // Setup scroll observer for pages
    this.setupPageObserver();

    // Setup smooth scroll for nav links
    this.setupSmoothScroll();

    // Initialize animations
    this.animationEngine = new AnimationEngine();

    // Initialize chatbot
    this.chatbot = new AIChatbot();

    // Setup contact form
    this.setupContactForm();

    // Setup custom cursor
    this.setupCustomCursor();

    // Setup scroll progress
    this.setupScrollProgress();

    // Setup back to top
    this.setupBackToTop();

    // Setup card tilt effects
    this.setupCardTilt();

    // Setup magnetic buttons
    this.setupMagneticButtons();

    // Setup typed subtitle
    this.setupTypedSubtitle();

    // Setup About section 3D canvas animation
    this.setupAbout3DCanvas();

    // Setup UI sound synthesis
    this.setupSoundSynth();

    // Setup control panel settings
    this.setupSettingsPanel();

    // Setup dynamic text glitch hover effects
    this.setupGlitchEffects();

    // Setup 3D Orbiting Skills cloud
    this.setupSkills3DCloud();
  }

  onPreloaderComplete() {
    this.preloaderComplete = true;

    // Show navigation
    this.nav.classList.add('visible');

    // Show speed sidebar
    if (this.sidebar) {
      setTimeout(() => {
        this.sidebar.classList.add('visible');
      }, 500);
    }

    // Trigger hero entrance animations
    setTimeout(() => {
      const heroName = document.querySelector('.hero-name');
      const heroSpacer = document.querySelector('.hero-3d-spacer');
      const heroBottom = document.querySelector('#home .section-text-bottom');
      const heroCtas = document.querySelector('.hero-ctas');

      if (heroName) heroName.classList.add('entrance');
      if (heroSpacer) heroSpacer.classList.add('entrance');
      if (heroBottom) heroBottom.classList.add('entrance');
      if (heroCtas) heroCtas.classList.add('entrance');
    }, 200);

    // Update nav indicator position
    this.updateNavIndicator();

    // Set initial particle section
    this.updateParticleSection();
  }

  /* ──────────────── CUSTOM CURSOR ──────────────── */

  setupCustomCursor() {
    if (!this.cursorDot || !this.cursorOutline) return;
    if (window.innerWidth <= 768) return; // Disable on mobile

    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.cursorDot.style.left = e.clientX + 'px';
      this.cursorDot.style.top = e.clientY + 'px';
    });

    // Smooth outline follow
    const animateOutline = () => {
      this.outlineX += (this.mouseX - this.outlineX) * 0.15;
      this.outlineY += (this.mouseY - this.outlineY) * 0.15;
      this.cursorOutline.style.left = this.outlineX + 'px';
      this.cursorOutline.style.top = this.outlineY + 'px';
      requestAnimationFrame(animateOutline);
    };
    animateOutline();

    // Hover effect on interactive elements
    const interactives = document.querySelectorAll('a, button, .project-card, .skill-item, .tech-tag, .chat-suggestion, input, textarea');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.cursorOutline.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        this.cursorOutline.classList.remove('hover');
      });
    });

    // Hide default cursor on desktop
    document.body.style.cursor = 'none';
    document.querySelectorAll('a, button').forEach(el => {
      el.style.cursor = 'none';
    });
  }

  /* ──────────────── SCROLL PROGRESS ──────────────── */

  setupScrollProgress() {
    if (!this.scrollContainer || !this.scrollProgress) return;

    this.scrollContainer.addEventListener('scroll', () => {
      const scrollTop = this.scrollContainer.scrollTop;
      const scrollHeight = this.scrollContainer.scrollHeight - this.scrollContainer.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      this.scrollProgress.style.width = progress + '%';

      // Hide scroll indicator after first scroll
      const scrollIndicator = document.getElementById('scroll-indicator');
      if (scrollIndicator && scrollTop > 50) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.transition = 'opacity 0.5s ease';
      }

      this.updateParticleSection();
    });
  }

  updateParticleSection() {
    if (!this.scrollContainer || !this.particleSystem) return;
    const scrollTop = this.scrollContainer.scrollTop;
    const sections = Array.from(this.scrollContainer.children).filter(el => el.tagName === 'SECTION');
    let closestIdx = 0;
    let minDiff = Infinity;
    sections.forEach((sec, idx) => {
      const diff = Math.abs(sec.offsetTop - scrollTop);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    if (this.currentSectionIdx !== closestIdx) {
      this.currentSectionIdx = closestIdx;
      if (this.soundSynth && this.preloaderComplete) {
        this.soundSynth.playSweep();
      }
    }

    this.particleSystem.setSection(closestIdx);
  }

  /* ──────────────── BACK TO TOP ──────────────── */

  setupBackToTop() {
    if (!this.scrollContainer || !this.backToTop) return;

    this.scrollContainer.addEventListener('scroll', () => {
      const scrollTop = this.scrollContainer.scrollTop;
      if (scrollTop > window.innerHeight) {
        this.backToTop.classList.add('visible');
      } else {
        this.backToTop.classList.remove('visible');
      }
    });

    this.backToTop.addEventListener('click', () => {
      this.scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ──────────────── CARD TILT ──────────────── */

  setupCardTilt() {
    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

        // Update shine position
        const shine = card.querySelector('.tilt-shine');
        if (shine) {
          const shineX = (x / rect.width) * 100;
          const shineY = (y / rect.height) * 100;
          shine.style.setProperty('--shine-x', shineX + '%');
          shine.style.setProperty('--shine-y', shineY + '%');
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ──────────────── MAGNETIC BUTTONS ──────────────── */

  setupMagneticButtons() {
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    if (window.innerWidth <= 768) return; // Disable on mobile viewports

    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const btnX = rect.left + rect.width / 2;
        const btnY = rect.top + rect.height / 2;

        const distanceX = e.clientX - btnX;
        const distanceY = e.clientY - btnY;

        // Pull toward mouse cursor with dampening multiplier (0.32)
        const moveX = distanceX * 0.32;
        const moveY = distanceY * 0.32;

        btn.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.02)`;
        btn.style.transition = 'transform 0.08s ease-out';
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
        btn.style.transition = 'transform 0.35s cubic-bezier(0.23, 1, 0.32, 1)';
      });
    });
  }

  /* ──────────────── TYPED SUBTITLE ──────────────── */

  setupTypedSubtitle() {
    const subtitle = document.querySelector('.hero-name .subtitle');
    if (!subtitle) return;

    const originalText = subtitle.textContent;
    subtitle.textContent = '';

    // Create cursor element
    const cursor = document.createElement('span');
    cursor.className = 'typed-cursor';
    subtitle.appendChild(cursor);

    // Wait for hero entrance, then type
    setTimeout(() => {
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < originalText.length) {
          subtitle.insertBefore(document.createTextNode(originalText.charAt(i)), cursor);
          i++;
        } else {
          clearInterval(typeInterval);
          // Remove cursor after a delay
          setTimeout(() => {
            cursor.style.opacity = '0';
            cursor.style.transition = 'opacity 1s ease';
          }, 3000);
        }
      }, 60);
    }, 1800); // Starts after hero entrance animation
  }

  /* ──────────────── NAVIGATION ──────────────── */

  setupNavigation() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href) return;
        e.preventDefault();
        const targetId = href.substring(1);
        this.scrollToSection(targetId);
      });

      // Measure for indicator
      link.addEventListener('mouseenter', () => {
        if (link.getAttribute('href')) {
          this.updateNavIndicator(link);
        }
      });
    });

    // Reset indicator on mouse leave
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
      navContainer.addEventListener('mouseleave', () => {
        this.updateNavIndicator();
      });
    }
  }

  updateNavIndicator(targetLink) {
    if (!this.navIndicator) return;

    const activeLink = targetLink || document.querySelector('.nav-link.active') || this.navLinks[0];
    if (!activeLink) return;

    const container = activeLink.parentElement;
    const containerRect = container.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    this.navIndicator.style.left = (linkRect.left - containerRect.left) + 'px';
    this.navIndicator.style.width = linkRect.width + 'px';
  }

  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    section.scrollIntoView({ behavior: 'smooth' });
  }

  setupPageObserver() {
    const pages = document.querySelectorAll('[data-page]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const page = entry.target.dataset.page;
          this.setActiveNav(page);
        }
      });
    }, {
      threshold: 0.4,
      root: this.scrollContainer
    });

    pages.forEach(page => observer.observe(page));
  }

  setActiveNav(pageId) {
    this.currentSection = pageId;

    this.navLinks.forEach(link => {
      const hrefAttr = link.getAttribute('href');
      if (!hrefAttr) return;
      const href = hrefAttr.substring(1);
      if (href === pageId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    this.updateNavIndicator();
  }

  /* ──────────────── SPEED SIDEBAR ──────────────── */

  setupSpeedSidebar() {
    const track = document.querySelector('.speed-slider-track');
    const thumb = document.querySelector('.speed-slider-thumb');
    const fill = document.querySelector('.speed-slider-fill');
    const valueDisplay = document.querySelector('.speed-value');

    if (!track || !thumb) return;

    let isDragging = false;

    const updateSlider = (clientY) => {
      const rect = track.getBoundingClientRect();
      let percent = 1 - (clientY - rect.top) / rect.height;
      percent = Math.max(0, Math.min(1, percent));

      const speed = 0.2 + percent * 1.8; // Range: 0.2 to 2.0

      thumb.style.bottom = `calc(${percent * 100}% - 0.875rem)`;
      fill.style.height = `${percent * 100}%`;
      valueDisplay.textContent = speed.toFixed(1);

      if (this.particleSystem) {
        this.particleSystem.setSpeed(speed);
      }
    };

    track.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSlider(e.clientY);
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        updateSlider(e.clientY);
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch support
    track.addEventListener('touchstart', (e) => {
      isDragging = true;
      updateSlider(e.touches[0].clientY);
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (isDragging) {
        updateSlider(e.touches[0].clientY);
      }
    });

    document.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  /* ──────────────── SMOOTH SCROLL ──────────────── */

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href').substring(1);
        this.scrollToSection(targetId);
      });
    });
  }

  /* ──────────────── CONTACT FORM ──────────────── */

  setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const name = formData.get('name');
      const email = formData.get('email');
      const message = formData.get('message');

      if (!name || !email || !message) {
        this.showFormMessage('Please fill in all fields.', 'error');
        return;
      }

      // Simulate form submission
      const submitBtn = form.querySelector('.submit-btn');
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        this.showFormMessage('Thank you! Your message has been sent. 🎉', 'success');
        form.reset();
        submitBtn.textContent = 'Send Message →';
        submitBtn.disabled = false;
      }, 1500);
    });
  }

  showFormMessage(text, type) {
    let msgEl = document.getElementById('form-message');
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.id = 'form-message';
      const form = document.getElementById('contact-form');
      form.appendChild(msgEl);
    }

    msgEl.textContent = text;
    msgEl.style.cssText = `
      padding: 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      margin-top: 0.75rem;
      text-align: center;
      animation: messageIn 0.3s ease;
      ${type === 'success'
        ? 'background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);'
        : 'background: rgba(244, 63, 94, 0.1); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.3);'
      }
    `;

    setTimeout(() => {
      msgEl.remove();
    }, 4000);
  }

  /* ──────────────── ABOUT SECTION 3D CANVAS ──────────────── */

  setupAbout3DCanvas() {
    console.log("3D Canvas: Initializing setup...");
    try {
      const canvas = document.getElementById('about-3d-canvas');
      if (!canvas) {
        console.warn("3D Canvas: canvas element not found");
        return;
      }

      const container = document.getElementById('about-canvas-container');
      if (!container) {
        console.warn("3D Canvas: container element not found");
        return;
      }

      if (typeof THREE === 'undefined') {
        console.error("3D Canvas: Three.js library is not loaded! Please check your internet connection or console errors.");
        // Add a visual fallback warning inside the container
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.color = 'var(--text-secondary)';
        container.innerHTML = '<div style="text-align: center; padding: 2rem;">Offline fallback: Three.js failed to load. 🌐</div>';
        return;
      }

      // Create scene, camera, renderer
      const scene = new THREE.Scene();

      const rect = container.getBoundingClientRect();
      const width = rect.width || 350;
      const height = rect.height || 466;
      const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
      camera.position.z = 150;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00d4ff, 5, 200);
    pointLight1.position.set(50, 50, 50);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 5, 200);
    pointLight2.position.set(-50, -50, 50);
    scene.add(pointLight2);

    // Geometry: A beautiful rotating Torus Knot
    const geometry = new THREE.TorusKnotGeometry(25, 6, 120, 16, 2, 3);

    // Material: Glowing standard material with emissive properties (fully compatible)
    const material = new THREE.MeshStandardMaterial({
      color: 0x070720,
      emissive: 0x8b5cf6, // Glowing purple base
      roughness: 0.2,
      metalness: 0.8,
      flatShading: true,
      transparent: true,
      opacity: 0.8
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Glowing wireframe overlay
    const wireframeGeo = new THREE.WireframeGeometry(geometry);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
    mesh.add(wireframe);

    // Orbiting particles inside the canvas
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = [];

    for (let i = 0; i < particleCount; i++) {
      // Scatter in a sphere around the torus knot
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 35 + Math.random() * 20;

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);

      particleSpeeds.push({
        rSpeed: (Math.random() - 0.5) * 0.02,
        thetaSpeed: Math.random() * 0.01 + 0.005,
        phiSpeed: Math.random() * 0.01 + 0.005,
        r: r,
        theta: theta,
        phi: phi
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const canvasDot = document.createElement('canvas');
    canvasDot.width = 16;
    canvasDot.height = 16;
    const ctxDot = canvasDot.getContext('2d');
    const grad = ctxDot.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(0, 212, 255, 1)');
    grad.addColorStop(0.5, 'rgba(139, 92, 246, 0.5)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctxDot.fillStyle = grad;
    ctxDot.fillRect(0, 0, 16, 16);
    const particleTexture = new THREE.CanvasTexture(canvasDot);
    particleTexture.needsUpdate = true;

    const particleMat = new THREE.PointsMaterial({
      size: 2.5,
      map: particleTexture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Resize Handler
    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // Mouse interactive movement
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) - rect.width / 2;
      const y = (e.clientY - rect.top) - rect.height / 2;
      targetX = x * 0.05;
      targetY = y * 0.05;
    });

    container.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });

    // Animation Loop
    let animationFrameId;
    let time = 0;
    let frameCount = 0;

    const animateAbout = () => {
      animationFrameId = requestAnimationFrame(animateAbout);
      time += 0.01;
      frameCount++;
      if (frameCount % 100 === 0) {
        console.log("3D Canvas: Rendering frame", frameCount);
      }

      // Rotate geometry
      mesh.rotation.y += 0.006;
      mesh.rotation.x += 0.003;

      // Mouse influence interpolation
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      mesh.rotation.z = currentX * 0.1;
      mesh.rotation.x += currentY * 0.05;

      // Float effect
      mesh.position.y = Math.sin(time) * 4;

      // Orbit particles
      const positions = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const speed = particleSpeeds[i];
        speed.theta += speed.thetaSpeed;
        speed.phi += speed.phiSpeed;

        // update position
        positions[i * 3] = speed.r * Math.sin(speed.phi) * Math.cos(speed.theta);
        positions[i * 3 + 1] = speed.r * Math.sin(speed.phi) * Math.sin(speed.theta);
        positions[i * 3 + 2] = speed.r * Math.cos(speed.phi);
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Orbiting lights color animation or positions
      pointLight1.position.x = Math.sin(time) * 60;
      pointLight1.position.y = Math.cos(time) * 60;
      pointLight2.position.x = -Math.sin(time) * 60;
      pointLight2.position.y = -Math.cos(time) * 60;

      renderer.render(scene, camera);
    };

    animateAbout();

    // Store references to destroy if needed
    this.about3D = {
      scene,
      camera,
      renderer,
      geometry,
      material,
      mesh,
      wireframeGeo,
      wireframeMat,
      wireframe,
      particleGeo,
      particleMat,
      particles,
      resizeObserver,
      animationFrameId
    };
    } catch (e) {
      console.error("3D Canvas error inside setupAbout3DCanvas:", e);
      const container = document.getElementById('about-canvas-container');
      if (container) {
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.color = '#f43f5e';
        container.style.padding = '1rem';
        container.innerHTML = `<div style="text-align: center; font-size: 11px; font-family: monospace;">3D Error: ${e.message}</div>`;
      }
    }
  }

  setupSoundSynth() {
    this.soundSynth = new CyberSoundSynth();
    
    // Event delegation: Play high frequency tick on hovering interactive items
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, button, .project-card, .skill-item, .tech-tag, .theme-opt, .chat-suggestion');
      if (target && this.soundSynth) {
        this.soundSynth.playTick();
      }
    });
  }

  setupSettingsPanel() {
    const soundBtn = document.getElementById('sound-nav-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        if (this.soundSynth) {
          const isMuted = this.soundSynth.toggleMute();
          if (isMuted) {
            soundBtn.classList.add('muted');
            soundBtn.textContent = '🔇 Mute';
          } else {
            soundBtn.classList.remove('muted');
            soundBtn.textContent = '🔊 Sound';
          }
        }
      });
    }

    const settingsToggle = document.getElementById('settings-toggle');
    const settingsClose = document.getElementById('settings-close');
    const settingsPanel = document.getElementById('settings-panel');

    if (settingsToggle && settingsPanel) {
      settingsToggle.addEventListener('click', () => {
        settingsPanel.classList.toggle('open');
      });
    }

    if (settingsClose && settingsPanel) {
      settingsClose.addEventListener('click', () => {
        settingsPanel.classList.remove('open');
      });
    }

    const themeOpts = document.querySelectorAll('.theme-opt');
    themeOpts.forEach(opt => {
      opt.addEventListener('click', () => {
        themeOpts.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');

        const theme = opt.dataset.theme;
        document.body.classList.remove('theme-rose', 'theme-emerald', 'theme-amber');
        if (theme !== 'default') {
          document.body.classList.add('theme-' + theme);
        }

        if (this.particleSystem) {
          this.particleSystem.updateTheme(theme);
        }

        if (this.soundSynth) {
          this.soundSynth.playTick();
        }
      });
    });

    const speedSlider = document.getElementById('particle-speed-slider');
    const speedVal = document.getElementById('particle-speed-val');
    if (speedSlider && speedVal) {
      speedSlider.addEventListener('input', (e) => {
        const speed = parseFloat(e.target.value);
        speedVal.textContent = speed.toFixed(1) + 'x';
        if (this.particleSystem) {
          this.particleSystem.setSpeed(speed);
        }

        const sidebarVal = document.querySelector('.speed-value');
        if (sidebarVal) {
          sidebarVal.textContent = speed.toFixed(1);
        }
      });
    }

    const sizeSlider = document.getElementById('particle-size-slider');
    const sizeVal = document.getElementById('particle-size-val');
    if (sizeSlider && sizeVal) {
      sizeSlider.addEventListener('input', (e) => {
        const size = parseFloat(e.target.value);
        sizeVal.textContent = size.toFixed(1) + 'px';
        if (this.particleSystem) {
          this.particleSystem.updateParticleSize(size);
        }
      });
    }
  }

  setupGlitchEffects() {
    const titles = document.querySelectorAll('.section-title');
    titles.forEach(title => {
      title.classList.add('cyber-glitch');
      title.setAttribute('data-text', title.textContent.trim());
    });
  }

  setupSkills3DCloud() {
    const canvas = document.getElementById('skills-3d-canvas');
    if (!canvas) return;

    const container = document.getElementById('skills-canvas-container');
    if (!container) return;

    const ctx = canvas.getContext('2d');
    const tags = [
      'React.js', 'Vite', 'Tailwind CSS', 'Node.js', 'Express.js', 'FastAPI',
      'MongoDB', 'PostgreSQL', 'Docker', 'Claude API', 'JWT', 'Stripe',
      'Socket.io', 'Three.js', 'Python', 'JavaScript', 'Git & GitHub',
      'Railway', 'Render', 'Vercel', 'Recharts', 'Tesseract.js', 'OAuth 2.0',
      'Mongoose', 'SQLite', 'Deep Learning', 'Computer Vision', 'Machine Learning'
    ];

    let items = [];
    const radius = 140;
    const fl = 220; // focal length

    // Map tags to sphere points
    const count = tags.length;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      items.push({
        text: tags[i],
        x: x,
        y: y,
        z: z,
        x2d: 0,
        y2d: 0,
        scale: 1,
        alpha: 1
      });
    }

    let angleX = 0.005;
    let angleY = 0.005;
    let targetAngleX = 0.003;
    let targetAngleY = 0.003;

    // Track mouse
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left - rect.width / 2;
      const my = e.clientY - rect.top - rect.height / 2;
      
      // Speed up rotation based on distance from center
      targetAngleY = mx * 0.00003;
      targetAngleX = -my * 0.00003;
    });

    container.addEventListener('mouseleave', () => {
      targetAngleX = 0.003;
      targetAngleY = 0.003;
    });

    // Handle canvas resizing
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // 3D rotation math
    const rotateX = (item, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const y1 = item.y * cos - item.z * sin;
      const z1 = item.z * cos + item.y * sin;
      item.y = y1;
      item.z = z1;
    };

    const rotateY = (item, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x1 = item.x * cos - item.z * sin;
      const z1 = item.z * cos + item.x * sin;
      item.x = x1;
      item.z = z1;
    };

    // Render loop
    const render = () => {
      requestAnimationFrame(render);

      // Interpolate angles
      angleX += (targetAngleX - angleX) * 0.08;
      angleY += (targetAngleY - angleY) * 0.08;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Rotate and project
      items.forEach(item => {
        rotateX(item, angleX);
        rotateY(item, angleY);

        const dist = fl + item.z;
        item.scale = fl / dist;
        item.alpha = (item.z + radius) / (2 * radius) * 0.7 + 0.3; // depth opacity

        item.x2d = cx + item.x * item.scale;
        item.y2d = cy + item.y * item.scale;
      });

      // Sort by depth (z-index sorting)
      items.sort((a, b) => b.z - a.z);

      // Draw
      items.forEach(item => {
        const size = Math.round(11 * item.scale + 6);
        ctx.font = `600 ${size}px var(--font-heading)`;

        // Select colors based on body theme
        let color = 'rgba(0, 212, 255, '; // default cyan
        if (document.body.classList.contains('theme-rose')) {
          color = 'rgba(255, 0, 127, ';
        } else if (document.body.classList.contains('theme-emerald')) {
          color = 'rgba(0, 245, 212, ';
        } else if (document.body.classList.contains('theme-amber')) {
          color = 'rgba(255, 183, 3, ';
        }

        ctx.fillStyle = color + item.alpha + ')';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Add subtle text shadow/glow for front tags
        if (item.z < 0) {
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 8 * item.scale;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillText(item.text, item.x2d, item.y2d);
      });
      ctx.shadowBlur = 0; // reset
    };

    render();
  }
}

/* ════════════════════════════════════════
   CYBERSOUNDSYNTH — Web Audio program synth
   ════════════════════════════════════════ */
class CyberSoundSynth {
  constructor() {
    this.ctx = null;
    this.muted = true; // start muted
  }

  initContext() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.ctx = new AudioContext();
    }
  }

  toggleMute() {
    this.initContext();
    this.muted = !this.muted;
    if (!this.muted && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.muted;
  }

  setMute(val) {
    this.initContext();
    this.muted = val;
    if (!this.muted && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTick() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn("Audio Context Error:", e);
    }
  }

  playSweep() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.25);

      filter.type = 'lowpass';
      filter.Q.setValueAtTime(3, now);
      filter.frequency.setValueAtTime(90, now);
      filter.frequency.exponentialRampToValueAtTime(750, now + 0.25);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.27);
    } catch (e) {
      console.warn("Audio Context Error:", e);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new PortfolioApp();
});
