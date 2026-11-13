// "Unwrap the Future": the 3D gift box that opens the game.
import * as THREE from "three";

function snowflakeTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, "#1565c0");
  grad.addColorStop(1, "#0b2f6b");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  const flake = (x, y, r, a) => {
    g.save();
    g.translate(x, y);
    g.strokeStyle = `rgba(255,255,255,${a})`;
    g.lineWidth = r / 7;
    g.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      g.rotate(Math.PI / 3);
      g.beginPath();
      g.moveTo(0, 0); g.lineTo(0, -r);
      g.moveTo(0, -r * 0.55); g.lineTo(-r * 0.22, -r * 0.75);
      g.moveTo(0, -r * 0.55); g.lineTo(r * 0.22, -r * 0.75);
      g.stroke();
    }
    g.restore();
  };
  for (let i = 0; i < 26; i++) flake(((i * 97) % 512) + 20, ((i * 181) % 512) + 10, 14 + (i % 4) * 7, 0.35 + (i % 3) * 0.2);
  for (let i = 0; i < 90; i++) {
    g.fillStyle = i % 3 ? "rgba(255,255,255,.45)" : "rgba(79,195,247,.8)";
    g.beginPath();
    g.arc((i * 53) % 512, (i * 131) % 512, 2 + (i % 3), 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function glowTexture(color = "255,236,170") {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, `rgba(${color},1)`);
  r.addColorStop(0.25, `rgba(${color},.6)`);
  r.addColorStop(1, `rgba(${color},0)`);
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createGift(host, { onOpened, sfx } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const camHome = new THREE.Vector3(0, 2.6, 8.2);
  camera.position.copy(camHome);
  const look = new THREE.Vector3(0, 1.0, 0);

  scene.add(new THREE.HemisphereLight(0xdff4ff, 0x0b2f6b, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 6, 5);
  scene.add(key);
  const rim = new THREE.PointLight(0x4fc3f7, 30, 20);
  rim.position.set(-4, 3, -3);
  scene.add(rim);
  const inner = new THREE.PointLight(0xffd889, 0, 12);
  inner.position.set(0, 1.4, 0);
  scene.add(inner);

  // Snowy ground disc with a soft shadow.
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.6, 0.3, 64), new THREE.MeshStandardMaterial({ color: 0xeaf7ff, roughness: 0.9 }));
  ground.position.y = -0.15;
  scene.add(ground);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ map: glowTexture("6,26,58"), transparent: true, opacity: 0.45, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  scene.add(shadow);

  const gift = new THREE.Group();
  scene.add(gift);
  const wrap = new THREE.MeshStandardMaterial({ map: snowflakeTexture(), roughness: 0.55, metalness: 0.05 });
  const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.15, emissive: 0x4fc3f7, emissiveIntensity: 0.08 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf6c453, roughness: 0.25, metalness: 0.75, emissive: 0x7a4b00, emissiveIntensity: 0.25 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.7, 2.2), wrap);
  body.position.y = 0.85;
  gift.add(body);
  const bandA = new THREE.Mesh(new THREE.BoxGeometry(0.36, 1.71, 2.22), ribbonMat);
  const bandB = new THREE.Mesh(new THREE.BoxGeometry(2.22, 1.71, 0.36), ribbonMat);
  bandA.position.y = bandB.position.y = 0.85;
  gift.add(bandA, bandB);

  const lid = new THREE.Group();
  lid.position.y = 1.9;
  gift.add(lid);
  const lidBox = new THREE.Mesh(new THREE.BoxGeometry(2.38, 0.42, 2.38), wrap);
  lid.add(lidBox);
  const lidBandA = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.43, 2.4), ribbonMat);
  const lidBandB = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.43, 0.38), ribbonMat);
  lid.add(lidBandA, lidBandB);
  const bow = new THREE.Group();
  bow.position.y = 0.32;
  lid.add(bow);
  for (const s of [-1, 1]) {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.13, 18, 48), goldMat);
    loop.position.x = s * 0.4;
    loop.rotation.set(Math.PI / 2.4, s * 0.5, 0);
    loop.scale.set(1, 0.7, 1);
    bow.add(loop);
  }
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), goldMat);
  bow.add(knot);

  // Glow that bursts from inside.
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.position.set(0, 1.8, 0);
  glow.scale.set(1, 1, 1);
  scene.add(glow);

  // Floating sparkles.
  const N = 160;
  const pos = new Float32Array(N * 3);
  const vel = [];
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2, r = 1.8 + Math.random() * 2.2;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.random() * 4;
    pos[i * 3 + 2] = Math.sin(a) * r;
    vel.push(new THREE.Vector3(0, 0.003 + Math.random() * 0.006, 0));
  }
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const sparkMat = new THREE.PointsMaterial({ size: 0.12, map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xfff1c2 });
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  scene.add(sparks);

  let opened = false, opening = false, running = true, t0 = performance.now();
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = w + "px";
    renderer.domElement.style.height = h + "px";
    camera.aspect = w / h;
    // Pull back on narrow (portrait) screens so the gift always fits.
    camera.position.z = camHome.z * (w / h < 0.8 ? 1.45 : w / h < 1.2 ? 1.15 : 1);
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  const render = () => {
    if (!running) return;
    const t = (performance.now() - t0) / 1000;
    if (!opening) {
      gift.rotation.y = Math.sin(t * 0.6) * 0.35 + 0.6;
      gift.position.y = Math.sin(t * 1.6) * 0.06;
      // Little "open me" wiggle every few seconds.
      const w = t % 3.2;
      gift.rotation.z = w < 0.5 ? Math.sin(w * 25) * 0.05 * (1 - w / 0.5) : 0;
    }
    const p = sparkGeo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      p[i * 3] += vel[i].x; p[i * 3 + 1] += vel[i].y; p[i * 3 + 2] += vel[i].z;
      if (!opened && p[i * 3 + 1] > 4.5) p[i * 3 + 1] = 0;
      if (opened) { vel[i].multiplyScalar(0.985); vel[i].y -= 0.0004; }
    }
    sparkGeo.attributes.position.needsUpdate = true;
    camera.lookAt(look);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);

  function open() {
    if (opening) return;
    opening = true;
    const g = window.gsap;
    const tl = g.timeline({ defaults: { ease: "power2.out" } });
    tl.to(gift.rotation, { y: 0.6, z: 0, duration: 0.3 })
      .to(gift.scale, { x: 1.06, y: 0.92, z: 1.06, duration: 0.18, yoyo: true, repeat: 3, ease: "sine.inOut", onStart: () => sfx?.bells() })
      .add("pop")
      .to([bandA.scale, bandB.scale, lidBandA.scale, lidBandB.scale], { y: 0.01, duration: 0.35, ease: "back.in(2)" }, "pop")
      .to(bow.position, { y: 3.5, duration: 0.8, ease: "power2.out" }, "pop")
      .to(bow.rotation, { y: Math.PI * 4, z: 1.2, duration: 0.9 }, "pop")
      .to(bow.scale, { x: 0, y: 0, z: 0, duration: 0.4, ease: "back.in(2)" }, "pop+=0.5")
      .add("lid", "pop+=0.25")
      .call(() => sfx?.whoosh(), null, "lid")
      .to(lid.position, { y: 6, x: 1.6, duration: 1.0, ease: "power2.out" }, "lid")
      .to(lid.rotation, { x: -1.4, z: -0.9, duration: 1.0 }, "lid")
      .to(inner, { intensity: 60, duration: 0.5 }, "lid+=0.1")
      .to(glow.material, { opacity: 1, duration: 0.4 }, "lid+=0.1")
      .to(glow.scale, { x: 9, y: 9, duration: 1.1, ease: "power3.out" }, "lid+=0.1")
      .call(() => {
        opened = true;
        sfx?.sparkle();
        const p = sparkGeo.attributes.position.array;
        for (let i = 0; i < N; i++) {
          p[i * 3] = (Math.random() - 0.5) * 0.8; p[i * 3 + 1] = 1.8; p[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
          const a = Math.random() * Math.PI * 2;
          const s = 0.04 + Math.random() * 0.09;
          vel[i].set(Math.cos(a) * s, 0.06 + Math.random() * 0.1, Math.sin(a) * s);
        }
        sparkMat.size = 0.18;
      }, null, "lid+=0.15")
      .to(camera.position, { y: 4.2, z: camera.position.z * 0.82, duration: 1.4, ease: "power2.inOut" }, "lid")
      .to(look, { y: 1.6, duration: 1.4, ease: "power2.inOut" }, "lid")
      .to(host, { opacity: 0.35, duration: 0.8 }, "lid+=1.0")
      .call(() => onOpened?.(), null, "lid+=0.9");
  }

  renderer.domElement.addEventListener("pointerdown", open);
  return {
    open,
    destroy() {
      running = false;
      window.removeEventListener("resize", resize);
      renderer.dispose();
      host.innerHTML = "";
    },
  };
}
