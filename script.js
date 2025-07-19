let currentScale = 1; // default scale

let scene, camera, renderer;
let sun;
let solarSystemGroup; // NEW: group to hold sun and planets
const planets = [];
const planetData = [
  { name: 'Mercury', size: 0.38, texture: '2k_mercury.jpg', distance: 10 },
  { name: 'Venus', size: 0.95, texture: '2k_venus.jpg', distance: 15 },
  { name: 'Earth', size: 1, texture: '2k_earth.jpg', distance: 20 },
  { name: 'Mars', size: 0.53, texture: '2k_mars.jpg', distance: 25 },
  { name: 'Jupiter', size: 11.2, texture: '2k_jupiter.jpg', distance: 32 },
  { name: 'Saturn', size: 9.4, texture: '2k_saturn.jpg', distance: 40 },
  { name: 'Uranus', size: 4, texture: '2k_uranus.jpg', distance: 48 },
  { name: 'Neptune', size: 3.8, texture: '2k_neptune.jpg', distance: 55 },
];
const initialScaleFactor = 4;
planetData.forEach(data => {
  data.size *= initialScaleFactor;
  data.distance *= initialScaleFactor;
});

const planetSpeeds = {};
let isPaused = false;

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    60, window.innerWidth / window.innerHeight, 0.1, 2000
  );
  camera.position.set(0, 75, 400);
  camera.lookAt(scene.position);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('scene-container').appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 1);
  scene.add(pointLight);

  // NEW: create group and add to scene
  solarSystemGroup = new THREE.Group();
  scene.add(solarSystemGroup);

  addBackgroundStars();
  createSun();
  createPlanets();
  createSpeedControls();

  // slider event to scale the whole solar system
  document.getElementById('sizeSlider').oninput = (e) => {
    currentScale = parseFloat(e.target.value);
    solarSystemGroup.scale.set(currentScale, currentScale, currentScale);
  };

  document.getElementById('pauseResumeBtn').onclick = togglePause;
  document.getElementById('toggleThemeBtn').onclick = toggleTheme;

  animate();
}

function createSun() {
  const loader = new THREE.TextureLoader();
  const sunTexture = loader.load('assets/textures/2k_sun.jpg');
  const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
  const sunGeometry = new THREE.SphereGeometry(5*initialScaleFactor, 32, 32);
  sun = new THREE.Mesh(sunGeometry, sunMaterial);
  solarSystemGroup.add(sun); // add to group instead of scene
}

function createPlanets() {
  const loader = new THREE.TextureLoader();
  planetData.forEach(data => {
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const texture = loader.load(`assets/textures/${data.texture}`);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = {
      angle: Math.random() * Math.PI * 2,
      distance: data.distance,
      name: data.name
    };
    solarSystemGroup.add(mesh); // add to group
    planets.push(mesh);
    planetSpeeds[data.name] = 0.01;

    // Add Saturn's ring
    if (data.name === 'Saturn') {
      const ringGeometry = new THREE.RingGeometry(data.size * 1.2, data.size * 2, 32);
      const ringTexture = loader.load('assets/textures/2k_saturn_ring.png');
      const ringMaterial = new THREE.MeshBasicMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      mesh.add(ring);
    }
  });
}

function addBackgroundStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 1000;
  const positions = [];
  for (let i = 0; i < starCount; i++) {
    positions.push(
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000
    );
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
  const starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);
}

function createSpeedControls() {
  const controlsDiv = document.getElementById('controls');
  planetData.forEach(data => {
    const label = document.createElement('label');
    label.textContent = data.name;
    const input = document.createElement('input');
    input.type = 'range';
    input.min = '0';
    input.max = '0.1';
    input.step = '0.001';
    input.value = planetSpeeds[data.name];
    input.oninput = (e) => {
      planetSpeeds[data.name] = parseFloat(e.target.value);
    };
    label.appendChild(input);
    controlsDiv.appendChild(label);
  });
}

function togglePause() {
  isPaused = !isPaused;
  document.getElementById('pauseResumeBtn').textContent = isPaused ? 'Resume' : 'Pause';
}

function toggleTheme() {
  document.body.classList.toggle('light');
}

function animate() {
  requestAnimationFrame(animate);
  if (!isPaused) {
    planets.forEach(planet => {
      const speed = planetSpeeds[planet.userData.name];
      planet.userData.angle += speed;
      planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
      planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
      planet.rotation.y += 0.005; // self-rotation
    });
  }
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
