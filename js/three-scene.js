/**
 * ============================================================================
 * THREE.JS 3D ENGINE - PORTFOLIO INTERACTIVE CORE
 * Features:
 * - Interactive Central Holographic 3D Mesh (Quantum Core)
 * - Orbiting Tech Rings & Satellites
 * - Interactive Particle Galaxy (Starfield)
 * - Mouse Parallax & Drag-to-Rotate 3D Controls
 * - Dynamic Theme Color Synchronization
 * - Morphing Geometries (Icosahedron, Torus Knot, Crystal, Sphere)
 * ============================================================================
 */

(function () {
  'use strict';

  // --- STATE & GLOBAL VARIABLES ---
  let scene, camera, renderer, clock;
  let mainGroup, meshContainer, coreMesh, innerCore, ring1, ring2, satellites = [];
  let particleSystem, particleGeometry, particleMaterial;
  
  let targetRotationX = 0;
  let targetRotationY = 0;
  let currentRotationX = 0;
  let currentRotationY = 0;

  let mouseX = 0;
  let mouseY = 0;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let scrollY = 0;

  let rotationSpeedMultiplier = 1.0;
  let showWireframe = true;
  let showRings = true;
  let showParticles = true;
  let currentShape = 'icosahedron';

  // Color Palettes
  const themes = {
    violet: { primary: 0x8b5cf6, secondary: 0x06b6d4, ambient: 0x1e1035 },
    cyan: { primary: 0x06b6d4, secondary: 0x3b82f6, ambient: 0x082f49 },
    emerald: { primary: 0x10b981, secondary: 0x06b6d4, ambient: 0x064e3b },
    rose: { primary: 0xf59e0b, secondary: 0xef4444, ambient: 0x451a03 }
  };

  let activeTheme = themes.violet;
  let pointLight1, pointLight2, ambientLight;

  // --- INITIALIZATION ---
  function init() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas || typeof THREE === 'undefined') {
      console.warn('Three.js not loaded or canvas missing');
      return;
    }

    clock = new THREE.Clock();

    // 1. Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07080c, 0.015);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 18);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // 4. Lights
    ambientLight = new THREE.AmbientLight(activeTheme.ambient, 1.5);
    scene.add(ambientLight);

    pointLight1 = new THREE.PointLight(activeTheme.primary, 3.5, 50);
    pointLight1.position.set(12, 10, 15);
    scene.add(pointLight1);

    pointLight2 = new THREE.PointLight(activeTheme.secondary, 2.5, 45);
    pointLight2.position.set(-12, -10, 10);
    scene.add(pointLight2);

    // 5. Build 3D Entities
    buildMainGroup();
    buildParticleGalaxy(1800);

    // 6. Event Listeners
    setupEventListeners();

    // 7. Start Render Loop
    animate();
  }

  // --- BUILD CENTRAL QUANTUM CORE ---
  function buildMainGroup() {
    mainGroup = new THREE.Group();
    mainGroup.position.set(3.5, 0, 0); // Positioned slightly to the right for Hero view
    scene.add(mainGroup);

    meshContainer = new THREE.Group();
    mainGroup.add(meshContainer);

    createCenterpieceMesh(currentShape);

    // Orbit Ring 1 (Torus)
    const ringGeo1 = new THREE.TorusGeometry(5.2, 0.04, 16, 100);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: activeTheme.secondary,
      roughness: 0.1,
      metalness: 0.9,
      emissive: activeTheme.secondary,
      emissiveIntensity: 0.4
    });
    ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    // Orbit Ring 2 (Torus)
    const ringGeo2 = new THREE.TorusGeometry(6.2, 0.03, 16, 100);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: activeTheme.primary,
      roughness: 0.1,
      metalness: 0.8,
      emissive: activeTheme.primary,
      emissiveIntensity: 0.3
    });
    ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    mainGroup.add(ring2);

    // Satellites / Orbiting Tech Nodes
    const satelliteCount = 5;
    for (let i = 0; i < satelliteCount; i++) {
      const satGeo = new THREE.OctahedronGeometry(0.35, 0);
      const satMat = new THREE.MeshStandardMaterial({
        color: (i % 2 === 0) ? activeTheme.primary : activeTheme.secondary,
        wireframe: false,
        metalness: 0.9,
        roughness: 0.2
      });
      const sat = new THREE.Mesh(satGeo, satMat);
      sat.userData = {
        orbitRadius: 5.5 + i * 0.4,
        orbitSpeed: 0.4 + i * 0.15,
        angle: (i / satelliteCount) * Math.PI * 2,
        tilt: (i * Math.PI) / 3
      };
      satellites.push(sat);
      mainGroup.add(sat);
    }
  }

  // --- GEOMETRY FACTORY ---
  function createCenterpieceMesh(shapeType) {
    // Clean old mesh
    while (meshContainer.children.length > 0) {
      const obj = meshContainer.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
      meshContainer.remove(obj);
    }

    let geometry;
    switch (shapeType) {
      case 'torus':
        geometry = new THREE.TorusKnotGeometry(2.2, 0.7, 120, 24);
        break;
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(3.2, 1);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(3.0, 32, 32);
        break;
      case 'icosahedron':
      default:
        geometry = new THREE.IcosahedronGeometry(3.2, 1);
        break;
    }

    // Outer Faceted / Cyber Shell Material
    const material = new THREE.MeshStandardMaterial({
      color: activeTheme.primary,
      metalness: 0.85,
      roughness: 0.15,
      wireframe: showWireframe,
      transparent: true,
      opacity: 0.9,
      emissive: activeTheme.primary,
      emissiveIntensity: 0.25
    });

    coreMesh = new THREE.Mesh(geometry, material);
    meshContainer.add(coreMesh);

    // Inner Glowing Core (Wireframe Octahedron)
    const innerGeo = new THREE.OctahedronGeometry(1.8, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: activeTheme.secondary,
      wireframe: true,
      emissive: activeTheme.secondary,
      emissiveIntensity: 0.6
    });
    innerCore = new THREE.Mesh(innerGeo, innerMat);
    meshContainer.add(innerCore);
  }

  // --- PARTICLE GALAXY ---
  function buildParticleGalaxy(count) {
    if (particleSystem) {
      scene.remove(particleSystem);
      if (particleGeometry) particleGeometry.dispose();
      if (particleMaterial) particleMaterial.dispose();
    }

    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    const radius = 45;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Uniform spherical random distribution
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * radius + 5;

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);

      scales[i] = Math.random() * 2.5 + 0.5;
    }

    particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    particleMaterial = new THREE.PointsMaterial({
      size: 0.14,
      color: activeTheme.secondary,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);

    // Mouse Move for Parallax
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        targetRotationY += deltaX * 0.007;
        targetRotationX += deltaY * 0.007;

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    // Drag to rotate 3D canvas
    const canvas = document.getElementById('webgl-canvas');
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Scroll handling for camera framing
    window.addEventListener('scroll', () => {
      scrollY = window.scrollY || window.pageYOffset;
    });
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Responsive position adaptation
    if (window.innerWidth <= 768) {
      if (mainGroup) mainGroup.position.set(0, 1.5, 0);
    } else {
      if (mainGroup) mainGroup.position.set(3.5, 0, 0);
    }
  }

  // --- ANIMATION & RENDER LOOP ---
  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // 1. Smooth Rotation Interpolation (Damping)
    currentRotationX += (targetRotationX - currentRotationX) * 0.05;
    currentRotationY += (targetRotationY - currentRotationY) * 0.05;

    if (mainGroup) {
      // Base idle spin
      mainGroup.rotation.y = currentRotationY + elapsedTime * 0.25 * rotationSpeedMultiplier;
      mainGroup.rotation.x = currentRotationX + Math.sin(elapsedTime * 0.3) * 0.1;
      mainGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.35; // gentle floating bob

      // Inner core reverse spin
      if (innerCore) {
        innerCore.rotation.x = -elapsedTime * 0.4 * rotationSpeedMultiplier;
        innerCore.rotation.y = elapsedTime * 0.5 * rotationSpeedMultiplier;
      }

      // Orbit rings spin
      if (ring1 && showRings) {
        ring1.rotation.z = elapsedTime * 0.35 * rotationSpeedMultiplier;
        ring1.visible = true;
      } else if (ring1) {
        ring1.visible = false;
      }

      if (ring2 && showRings) {
        ring2.rotation.z = -elapsedTime * 0.25 * rotationSpeedMultiplier;
        ring2.visible = true;
      } else if (ring2) {
        ring2.visible = false;
      }

      // Satellites orbiting
      satellites.forEach(sat => {
        sat.visible = showRings;
        if (showRings) {
          const u = sat.userData;
          const currentAngle = u.angle + elapsedTime * u.orbitSpeed * rotationSpeedMultiplier;
          sat.position.x = Math.cos(currentAngle) * u.orbitRadius;
          sat.position.z = Math.sin(currentAngle) * u.orbitRadius;
          sat.position.y = Math.sin(currentAngle * 2 + u.tilt) * 1.5;
          sat.rotation.x += 0.02;
          sat.rotation.y += 0.03;
        }
      });
    }

    // 2. Particle System Drift
    if (particleSystem && showParticles) {
      particleSystem.visible = true;
      particleSystem.rotation.y = -elapsedTime * 0.04;
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05;
    } else if (particleSystem) {
      particleSystem.visible = false;
    }

    // 3. Camera Parallax & Scroll Framing
    const targetCamX = mouseX * 1.2;
    const targetCamY = mouseY * 1.0;
    camera.position.x += (targetCamX - camera.position.x) * 0.05;
    camera.position.y += (targetCamY - camera.position.y) * 0.05;

    // Adapt layout based on scroll depth
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0;

    if (window.innerWidth > 768) {
      // In hero (scrollProgress ~ 0), place to the right (x = 3.5)
      // When scrolling down, gently glide towards center or subtle offset
      const targetGroupX = 3.5 - scrollProgress * 3.0;
      mainGroup.position.x += (targetGroupX - mainGroup.position.x) * 0.05;
    }

    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  // --- PUBLIC API EXPORTS FOR 3D LAB & THEME CONTROLLER ---
  window.ThreeApp = {
    init: init,

    setShape: function (shapeName) {
      currentShape = shapeName;
      createCenterpieceMesh(shapeName);
    },

    toggleWireframe: function () {
      showWireframe = !showWireframe;
      if (coreMesh && coreMesh.material) {
        coreMesh.material.wireframe = showWireframe;
      }
      return showWireframe;
    },

    toggleRings: function () {
      showRings = !showRings;
      return showRings;
    },

    toggleParticles: function () {
      showParticles = !showParticles;
      return showParticles;
    },

    setSpeed: function (speed) {
      rotationSpeedMultiplier = parseFloat(speed);
    },

    setParticleCount: function (count) {
      buildParticleGalaxy(parseInt(count, 10));
    },

    resetCamera: function () {
      targetRotationX = 0;
      targetRotationY = 0;
      currentRotationX = 0;
      currentRotationY = 0;
      if (camera) camera.position.set(0, 0, 18);
    },

    setTheme: function (themeKey) {
      if (!themes[themeKey]) return;
      activeTheme = themes[themeKey];

      // Update Lights
      if (ambientLight) ambientLight.color.setHex(activeTheme.ambient);
      if (pointLight1) pointLight1.color.setHex(activeTheme.primary);
      if (pointLight2) pointLight2.color.setHex(activeTheme.secondary);

      // Update Meshes
      if (coreMesh && coreMesh.material) {
        coreMesh.material.color.setHex(activeTheme.primary);
        coreMesh.material.emissive.setHex(activeTheme.primary);
      }
      if (innerCore && innerCore.material) {
        innerCore.material.color.setHex(activeTheme.secondary);
        innerCore.material.emissive.setHex(activeTheme.secondary);
      }
      if (ring1 && ring1.material) {
        ring1.material.color.setHex(activeTheme.secondary);
        ring1.material.emissive.setHex(activeTheme.secondary);
      }
      if (ring2 && ring2.material) {
        ring2.material.color.setHex(activeTheme.primary);
        ring2.material.emissive.setHex(activeTheme.primary);
      }
      if (particleMaterial) {
        particleMaterial.color.setHex(activeTheme.secondary);
      }
      satellites.forEach((sat, idx) => {
        if (sat.material) {
          sat.material.color.setHex(idx % 2 === 0 ? activeTheme.primary : activeTheme.secondary);
        }
      });
    }
  };

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
