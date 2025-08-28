import React, { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
// If you prefer TS, rename file to .tsx and add types. Keeping JS for drop-in use.

/**
 * MeshBuilder — a small, deterministic, parametric 3D generator for Merchant of Misery.
 *
 * Goals:
 * - Deterministic via seed
 * - Supports categories: weapon | armor | trinket | consumable
 * - Parameter schema intentionally small; an LLM can fill this JSON safely
 * - Renders game-ready low-poly meshes with PBR materials keyed by enchantments
 *
 * Integrations:
 * - Add to your item doc as `meshConfig` (produced by /forge/mesh-config LLM route)
 * - For special items, you can export screenshots or feed the same params to a text-to-3D service later
 */

/***********************
 * Utility: Seeded RNG  *
 ***********************/
function mulberry32(a) {
  return function() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/***********************************
 * Materials keyed by enchantments  *
 ***********************************/
const materialPresets = {
  steel_brushed: { color: 0xb0b6bf, metalness: 0.85, roughness: 0.4 },
  iron_rusty: { color: 0x8a7a63, metalness: 0.5, roughness: 0.9 },
  leather_dark: { color: 0x2b1f14, metalness: 0.0, roughness: 0.95 },
  wood_oak: { color: 0x6d4d2e, metalness: 0.1, roughness: 0.85 },
  gem_cyan: { color: 0x66e0ff, metalness: 0.4, roughness: 0.2, emissive: 0x226688, emissiveIntensity: 0.35 },
};
const materialCache = new Map();

function materialFromConfig(materialCfg = {}, enchantment = "none") {
  const preset = materialCfg.preset || "steel_brushed";
  const ench = (enchantment || "none").toLowerCase();
  const key = JSON.stringify({
    p: preset,
    t: materialCfg.tint || null,
    e: ench,
    eo: materialCfg.emissive?.color || null,
    ei: materialCfg.emissive?.intensity ?? null,
  });
  if (materialCache.has(key)) return materialCache.get(key);

  const params = { ...(materialPresets[preset] || materialPresets.steel_brushed) };
  const mat = new THREE.MeshStandardMaterial(params);

  if (materialCfg.tint) mat.color = new THREE.Color(materialCfg.tint);

  const enchMap = {
    lightning: { emissive: 0x7ec8ff, intensity: 1.2 },
    fire: { emissive: 0xff6b3d, intensity: 0.9 },
    frost: { emissive: 0xaad7ff, intensity: 0.7 },
    poison: { emissive: 0x5ac85a, intensity: 0.6 },
    holy: { emissive: 0xffffaa, intensity: 1.0 },
    cursed: { emissive: 0x6b2d6e, intensity: 0.8 },
  };
  if (enchMap[ench]) {
    mat.emissive = new THREE.Color(enchMap[ench].emissive);
    mat.emissiveIntensity = Math.max(mat.emissiveIntensity || 0, enchMap[ench].intensity);
  }

  if (materialCfg.emissive?.color) mat.emissive = new THREE.Color(materialCfg.emissive.color);
  if (materialCfg.emissive?.intensity != null) mat.emissiveIntensity = materialCfg.emissive.intensity;

  materialCache.set(key, mat);
  return mat;
}

/*****************************
 * Primitive builder helpers  *
 *****************************/
function extrudeBlade({ length = 1.1, width = 0.12, spineCurve = 0.05, tip = "needle", thickness = 0.06 }) {
  // 2D blade profile (in X/Y), extruded in Z to a thin, flat blade
  const halfW = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-halfW, 0);
  shape.lineTo(-halfW * 0.9, length * 0.15);
  shape.bezierCurveTo(-halfW, length * 0.55, -halfW * 0.3, length * 0.9, 0, length); // tip
  shape.bezierCurveTo(halfW * 0.3, length * 0.9, halfW, length * 0.55, halfW * 0.9, length * 0.15);
  shape.lineTo(halfW, 0);
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    steps: 1,
    bevelEnabled: false,
  });
  // center the thickness around Z=0 (otherwise it sits on Z=[0,depth])
  geom.translate(0, 0, -thickness / 2);

  // subtle spine curvature across X based on Y position
  const pos = geom.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const t = Math.min(Math.max(v.y / Math.max(length, 1e-6), 0), 1);
    const offset = Math.sin(t * Math.PI) * spineCurve;
    v.x += offset;
    // tip variants
    if (t > 0.9 && tip === "broad") v.x *= 1.15;
    if (t > 0.9 && tip === "needle") v.x *= 0.85;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geom.computeVertexNormals();
  return geom;
}

function simpleHandle({ length = 0.5, radius = 0.08, ringCount = 3, rng }) {
  const rand = rng || (() => 0.5);
  const geom = new THREE.CylinderGeometry(radius * 0.9, radius * 1.05, length, 12, 1, false);
  const group = new THREE.Group();
  const grip = new THREE.Mesh(geom);
  group.add(grip);
  for (let i = 0; i < ringCount; i++) {
    const t = (i + 1) / (ringCount + 1);
    const jitterY = (rand() - 0.5) * 0.02 * length;
    const ringRadius = radius * (1.04 + (rand() - 0.5) * 0.06);
    const tubeRadius = radius * (0.07 + (rand() - 0.5) * 0.02);
    const torus = new THREE.Mesh(new THREE.TorusGeometry(ringRadius, tubeRadius, 8, 16));
    torus.rotation.x = Math.PI / 2;
    torus.position.y = -length / 2 + t * length + jitterY;
    group.add(torus);
  }
  return group;
}

function crossGuard({ width = 0.35, thickness = 0.06, style = "straight" }) {
  const group = new THREE.Group();
  const bar = new THREE.Mesh(new THREE.BoxGeometry(width, thickness, thickness));
  group.add(bar);
  if (style === "forked") {
    const prong = new THREE.Mesh(new THREE.BoxGeometry(thickness * 0.6, thickness * 0.6, thickness * 2));
    prong.position.set(width / 2 + thickness * 0.3, 0, 0);
    group.add(prong);
    const prong2 = prong.clone();
    prong2.position.x = -width / 2 - thickness * 0.3;
    group.add(prong2);
  }
  return group;
}

function gemPommel({ radius = 0.09, shape = "octa" }) {
  if (shape === "octa") {
    const geom = new THREE.OctahedronGeometry(radius, 0);
    return new THREE.Mesh(geom);
  }
  if (shape === "icosa") {
    const geom = new THREE.IcosahedronGeometry(radius, 0);
    return new THREE.Mesh(geom);
  }
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 12));
}

function roundShield({ radius = 0.6, bossRadius = 0.12, thickness = 0.08 }) {
  const group = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, thickness, 24));
  group.add(disc);
  const boss = new THREE.Mesh(new THREE.SphereGeometry(bossRadius, 12, 12));
  boss.position.y = thickness / 2 + bossRadius * 0.6;
  group.add(boss);
  return group;
}

function breastplate({ width = 0.9, height = 1.1, depth = 0.35, corner = 0.12, neckWidth = 0.55, neckDepth = 0.18, armInset = 0.22, bulge = 0, addPauldrons = true, addFauld = true }, metalMat) {
  // Stylized breastplate: clean silhouette extrude + separate decorative elements (trim, ridge, rivets).
  const group = new THREE.Group();
  const hw = width / 2, hh = height / 2;
  const r = Math.min(corner, Math.min(hw, hh) * 0.45);
  const rTop = r;

  // Clamp params
  neckWidth = THREE.MathUtils.clamp(neckWidth, 0.3, 0.9);
  neckDepth = THREE.MathUtils.clamp(neckDepth, 0.08, 0.35);
  armInset = THREE.MathUtils.clamp(armInset, 0.08, 0.35) * hw; // absolute inset amount

  // Key Y positions
  const armBottomY = hh - height * 0.45; // start of shoulder scoop
  const armTopY    = hh - height * 0.12; // near top

  // Neck scoop extents
  const neckHalf = neckWidth * hw * 0.5;
  const neckDipY = hh - neckDepth * height;

  // --- Base silhouette (no holes) ---
  const shape = new THREE.Shape();
  // Bottom edge (left→right)
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  // Right side up to shoulder scoop start
  shape.lineTo(hw, armBottomY);
  // Right shoulder concave scoop → top-right corner
  shape.bezierCurveTo(
    hw, armTopY,               // cp1: go straight up
    hw - armInset, hh - rTop,  // cp2: pull inward toward center near top
    hw - rTop, hh              // end: top-right corner inner of radius
  );
  // Top edge with neck scoop (right→left)
  shape.lineTo(neckHalf, hh);
  shape.quadraticCurveTo(0, neckDipY, -neckHalf, hh);
  shape.lineTo(-hw + rTop, hh);
  // Left shoulder concave scoop (mirror)
  shape.bezierCurveTo(
    -hw + armInset, hh - rTop, // cp1 inward
    -hw, armTopY,              // cp2 up along side
    -hw, armBottomY            // end: where scoop meets straight side
  );
  // Left side down to bottom-left corner
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  shape.closePath();

  const curveSegments = 64;
  const baseGeom = new THREE.ExtrudeGeometry(shape, { depth, steps: 1, bevelEnabled: false, curveSegments });
  baseGeom.translate(0, 0, -depth / 2);

  // Subtle convex chest bulge on the front cap only (safe; no cap topology changes)
  if (bulge > 0) {
    const pos = baseGeom.attributes.position; const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      if (v.z > depth * 0.49) { // front cap
        const yN = (v.y + hh) / (height || 1e-6); // 0..1
        const xN = Math.abs(v.x) / (hw || 1e-6);  // 0..1 from center
        const gain = 0.25 + 0.75 * yN;            // more bulge higher up
        v.z += bulge * (1 - xN * xN) * gain;
        pos.setXYZ(i, v.x, v.y, v.z);
      }
    }
    baseGeom.computeVertexNormals();
  }

  const base = new THREE.Mesh(baseGeom, metalMat || new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.45 }));
  group.add(base);

  // --- Accent material for trim/ridge/rivets ---
  const accent = (metalMat?.clone?.() || new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.3 }));
  if (accent.color?.isColor) accent.color.multiplyScalar(0.9);
  if (accent.roughness != null) accent.roughness = Math.max(0, accent.roughness - 0.2);
  if (accent.metalness != null) accent.metalness = Math.min(1, accent.metalness + 0.1);
  // Prevent z-fighting for overlays (trim/ridge/rivets)
  accent.polygonOffset = true;
  accent.polygonOffsetFactor = -1;
  accent.polygonOffsetUnits = -1;

  // --- Raised border frame (separate geometry) ---
  const outerPts = shape.getPoints(96);
  const frameShape = new THREE.Shape(outerPts);
  const innerScale = 0.85;
  const innerPts = outerPts.map(p => new THREE.Vector2(p.x * innerScale, p.y * innerScale)).reverse();
  const innerPath = new THREE.Path(innerPts);
  frameShape.holes.push(innerPath);
  const frameDepth = 0.02;
  const frameGeom = new THREE.ExtrudeGeometry(frameShape, { depth: frameDepth, steps: 1, bevelEnabled: false, curveSegments });
  frameGeom.translate(0, 0, depth / 2 + 0.01);
  const frame = new THREE.Mesh(frameGeom, accent);
  frame.renderOrder = 1;
  if (frame.material) frame.material.side = THREE.FrontSide;
  group.add(frame);

  // --- Center ridge strip ---
  const ridgeW = Math.min(width * 0.08, 0.12);
  const ridgeH = height * 0.62;
  const ridgeD = 0.02;
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(ridgeW, ridgeH, ridgeD), accent);
  ridge.position.set(0, -height * 0.05, depth / 2 + 0.02 + ridgeD / 2 + 0.004);
  ridge.renderOrder = 2;
  group.add(ridge);

  // --- Rivets (left/right columns) ---
  const rivR = Math.min(width, height) * 0.016;
  const rivGeom = new THREE.SphereGeometry(rivR, 12, 12);
  const ys = [-hh * 0.40, -hh * 0.15, hh * 0.10, hh * 0.35];
  const xR = hw * 0.85 * 0.98; // near inner frame edge
  for (const y of ys) {
    const r1 = new THREE.Mesh(rivGeom, accent); r1.position.set(-xR, y, depth / 2 + frameDepth + rivR + 0.005); r1.renderOrder = 2; group.add(r1);
    const r2 = r1.clone(); r2.position.x = xR; group.add(r2);
  }

  return group;
}

function potionFlask({ bodyRadius = 0.18, neckRadius = 0.06, height = 0.35 }) {
  const group = new THREE.Group();
  // Body
  const body = new THREE.Mesh(new THREE.SphereGeometry(bodyRadius, 16, 16));
  group.add(body);
  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(neckRadius, neckRadius, height * 0.35, 12));
  neck.position.y = bodyRadius + (height * 0.35) / 2;
  group.add(neck);
  // Cork
  const cork = new THREE.Mesh(new THREE.CylinderGeometry(neckRadius * 0.8, neckRadius * 1.2, height * 0.12, 10));
  cork.position.y = neck.position.y + (height * 0.35) / 2 + (height * 0.12) / 2;
  group.add(cork);
  return group;
}

/************************
 * Category sub-builders *
 ************************/
function buildWeapon(cfg, rng) {
  const group = new THREE.Group();
  const matGuard = materialFromConfig({ ...(cfg.material || { preset: "steel_brushed" }), tint: (cfg.guardTint ?? cfg.material?.tint) }, cfg.enchantment);
  const matBlade = materialFromConfig({ preset: (cfg.material?.preset ?? "steel_brushed"), tint: (cfg.bladeTint ?? cfg.material?.tint) }, cfg.enchantment);
  const matGrip = materialFromConfig({ preset: "leather_dark" }, cfg.enchantment);
  const matGem = materialFromConfig({ preset: "gem_cyan", tint: cfg.gemTint }, cfg.enchantment);

  // Blade
  const bladeGeom = extrudeBlade({
    length: cfg.base?.length ?? 1.2,
    width: cfg.base?.width ?? 0.12,
    spineCurve: cfg.base?.spineCurve ?? 0.07,
    tip: cfg.base?.tip ?? "needle",
    thickness: cfg.base?.thickness ?? 0.06,
  });
  const blade = new THREE.Mesh(bladeGeom, matBlade);
  // Blade runs along +Y from the guard
  blade.position.y = 0.02;
  group.add(blade);

  // Guard
  const guard = crossGuard({ width: cfg.guard?.width ?? 0.35, thickness: cfg.guard?.thickness ?? (cfg.base?.thickness ?? 0.06), style: cfg.guard?.style ?? "straight" });
  guard.traverse((o) => { if (o.isMesh) o.material = matGuard; });
  guard.position.y = 0;
  group.add(guard);

  // Handle
  const handleLen = cfg.handle?.length ?? 0.5;
  const handle = simpleHandle({ length: handleLen, radius: cfg.handle?.radius ?? 0.08, ringCount: cfg.handle?.ringCount ?? 3, rng });
  handle.traverse((o) => { if (o.isMesh) o.material = matGrip; });
  // Centered by default; drop it so its top meets the guard
  handle.position.y = -(handleLen / 2) - 0.02;
  group.add(handle);

  // Pommel
  const pommelRadius = cfg.pommel?.radius ?? 0.09;
  const pommel = gemPommel({ radius: pommelRadius, shape: cfg.pommel?.shape ?? "octa" });
  pommel.material = matGem;
  pommel.position.y = -handleLen - pommelRadius;
  group.add(pommel);
  return group;
}

function buildArmor(cfg, rng) {
  const group = new THREE.Group();
  const matMetal = materialFromConfig(cfg.material || { preset: "iron_rusty" }, cfg.enchantment);
  const matLeather = materialFromConfig({ preset: "leather_dark" }, cfg.enchantment);

  const chest = breastplate({ width: cfg.base?.width ?? 0.9, height: cfg.base?.height ?? 1.1, depth: cfg.base?.depth ?? 0.35, neckRadius: cfg.base?.neckRadius ?? 0.22, armRadius: cfg.base?.armRadius ?? 0.22 }, matMetal);
  group.add(chest);

  // Shoulder straps across the top (reduce "backpack" vibe)
  const h = cfg.base?.height ?? 1.1;
  const d = cfg.base?.depth ?? 0.35;
  const w = cfg.base?.width ?? 0.9;
  const strapY = h / 2 - 0.015;
  // Smaller, shorter shoulder straps (tunable via cfg.straps)
  const strapCross = cfg.straps?.thickness ?? Math.max(0.02, w * 0.03);
  const strapLen = cfg.straps?.length ?? (d + 0.06);
  const strapInsetX = cfg.straps?.insetX ?? 0.14; // distance from side edge
  const strapGeom = new THREE.BoxGeometry(strapCross, strapCross, strapLen);
  const strapL = new THREE.Mesh(strapGeom, matLeather);
  strapL.position.set(-w / 2 + strapInsetX, strapY, 0);
  const strapR = new THREE.Mesh(strapGeom, matLeather);
  strapR.position.set(w / 2 - strapInsetX, strapY, 0);
  strapL.rotation.x = -0.05; strapR.rotation.x = -0.05;
  group.add(strapL, strapR);
  
  // Buckles / rings at strap ends (front & back)
  const buckleMat = matMetal;
  const ringScale = cfg.buckles?.ringScale ?? 0.55;   // relative to strap thickness
  const tubeScale = cfg.buckles?.tubeScale ?? 0.18;   // relative to strap thickness
  const ringR = strapCross * ringScale;
  const ringT = strapCross * tubeScale;
  const ringSeg = 16, tubeSeg = 10;
  function addRingsForStrap(x, y) {
    const frontRing = new THREE.Mesh(new THREE.TorusGeometry(ringR, ringT, tubeSeg, ringSeg), buckleMat);
    frontRing.rotation.x = Math.PI / 2; // face forward
    frontRing.position.set(x, y, +strapLen / 2 + ringT * 1.1);
    group.add(frontRing);

    const backRing = frontRing.clone();
    backRing.position.z = -strapLen / 2 - ringT * 1.1;
    group.add(backRing);
  }
  addRingsForStrap(-w / 2 + strapInsetX, strapY);
  addRingsForStrap(w / 2 - strapInsetX, strapY);
  return group;
}

function buildTrinket(cfg, rng) {
  const group = new THREE.Group();
  const matMetal = materialFromConfig(cfg.material || { preset: "steel_brushed" }, cfg.enchantment);
  const matGem = materialFromConfig({ preset: "gem_cyan", tint: cfg.gemTint }, cfg.enchantment);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(cfg.base?.radius ?? 0.22, (cfg.base?.thickness ?? 0.05) * 0.5, 10, 24), matMetal);
  ring.rotation.x = Math.PI / 2;
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(cfg.gem?.radius ?? 0.09, 0), matGem);
  gem.position.set(0, 0.02, 0.2);
  group.add(ring, gem);
  return group;
}

function buildConsumable(cfg, rng) {
  const group = potionFlask({
    bodyRadius: cfg.base?.bodyRadius ?? 0.18,
    neckRadius: cfg.base?.neckRadius ?? 0.06,
    height: cfg.base?.height ?? 0.35,
  });

  // --- Glass material (tint + opacity) ---
  const glassTint = cfg.glassTint || cfg.material?.tint || 0xaaddff;
  const glassOpacity = cfg.glassOpacity ?? 0.35;
  const glass = new THREE.MeshStandardMaterial({
    color: new THREE.Color(glassTint),
    metalness: 0.0,
    roughness: 0.1,
    transparent: true,
    opacity: glassOpacity,
  });
  // draw glass first and don't write depth so liquid behind is visible
  glass.depthWrite = false;
  glass.side = THREE.DoubleSide;
  group.traverse((o) => { if (o.isMesh) { o.material = glass; o.renderOrder = 0; } });

  // --- Liquid body: spherical segment (matches bulb), plus flat top cap ---
  const bodyR = cfg.base?.bodyRadius ?? 0.18;
  const liqR = bodyR * 0.92; // slightly inset from glass
  const fill = THREE.MathUtils.clamp(cfg.fill ?? cfg.liquidFill ?? 0.75, 0.05, 0.95);
  // plane height for the liquid surface within the sphere
  const yLevel = -liqR + (2 * liqR) * fill * 0.96; // keep under the neck

  // Profile for spherical segment, revolved around Y
  const samplesY = 24;
  const pts = [];
  for (let i = 0; i <= samplesY; i++) {
    const t = i / samplesY;
    const y = THREE.MathUtils.lerp(-liqR, yLevel, t);
    const rad = Math.sqrt(Math.max(0, liqR * liqR - y * y));
    pts.push(new THREE.Vector2(rad, y));
  }
  const liqGeom = new THREE.LatheGeometry(pts, 48);
  const liqMat = materialFromConfig({ preset: "gem_cyan", tint: cfg.liquidTint || 0x55aaff }, cfg.enchantment);
  liqMat.transparent = true;
  liqMat.opacity = cfg.liquidOpacity ?? 0.7;
  liqMat.metalness = 0;
  liqMat.roughness = 0.2;
  const liquid = new THREE.Mesh(liqGeom, liqMat);
  liquid.renderOrder = 1;
  group.add(liquid);

  // Flat top cap (liquid surface)
  const rTop = Math.sqrt(Math.max(0, liqR * liqR - yLevel * yLevel));
  if (rTop > 1e-4) {
    const cap = new THREE.Mesh(new THREE.CircleGeometry(rTop, 48), liqMat);
    cap.rotation.x = Math.PI / 2; // face +Y
    cap.position.y = yLevel + 1e-4; // nudge to avoid z-fight
    cap.material = liqMat.clone();
    cap.material.side = THREE.DoubleSide;
    cap.renderOrder = 2;
    group.add(cap);
  }

  // Meniscus: subtle upward curve at rim (capillary effect)
  const meniscus = Math.max(0, cfg.meniscus ?? 0);
  if (meniscus > 0 && rTop > 1e-4) {
    const rInner = Math.max(0, rTop * 0.9);
    const rOuter = Math.min(liqR * 0.99, rTop + Math.max(meniscus * 6, rTop * 0.08));
    const prof = [];
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const s = i / steps; // 0..1 inner→outer
      const rad = THREE.MathUtils.lerp(rInner, rOuter, s);
      // curve: slightly below at inner edge, above at rim
      const y = yLevel + THREE.MathUtils.lerp(-meniscus * 0.25, meniscus, Math.pow(s, 0.8));
      prof.push(new THREE.Vector2(rad, y));
    }
    const menGeom = new THREE.LatheGeometry(prof, 48);
    const menMesh = new THREE.Mesh(menGeom, liqMat.clone());
    menMesh.material.transparent = true;
    menMesh.material.opacity = liqMat.opacity;
    menMesh.material.side = THREE.DoubleSide;
    menMesh.renderOrder = 2;
    // help avoid z-fighting with the cap/body
    menMesh.material.polygonOffset = true;
    menMesh.material.polygonOffsetFactor = -1;
    menMesh.material.polygonOffsetUnits = -1;
    group.add(menMesh);
  }

  // --- Optional bubbles (cosmetic) ---
  const bubbleCount = Math.max(0, Math.floor(cfg.bubbles ?? 0));
  if (bubbleCount > 0) {
    const bubbleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0, transparent: true, opacity: 0.5 });
    bubbleMat.depthWrite = false;
    for (let i = 0; i < bubbleCount; i++) {
      const y = THREE.MathUtils.lerp(-liqR * 0.98, yLevel * 0.98, Math.random());
      const radAtY = Math.sqrt(Math.max(0, liqR * liqR - y * y));
      const br = Math.min(0.06, radAtY * (0.03 + Math.random() * 0.06));
      const a = Math.random() * Math.PI * 2;
      const r = radAtY * 0.85 * Math.sqrt(Math.random());
      const b = new THREE.Mesh(new THREE.SphereGeometry(br, 8, 8), bubbleMat);
      b.renderOrder = 2;
      b.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      group.add(b);
    }
  }

  return group;
}

/**********************
 * MeshBuilder core    *
 **********************/
export function MeshBuilder({ config }) {
  const seed = (config?.seed ?? 123456) >>> 0;
  const rng = useMemo(() => mulberry32(seed), [seed]);
  const groupRef = useRef();

  const group = useMemo(() => {
    const type = (config?.type || "weapon").toLowerCase();
    if (type === "weapon") return buildWeapon(config, rng);
    if (type === "armor") return buildArmor(config, rng);
    if (type === "trinket") return buildTrinket(config, rng);
    if (type === "consumable") return buildConsumable(config, rng);
    return new THREE.Group();
  }, [config, rng]);

  // Attach materials after build if any overrides are present
  useEffect(() => {
    if (!group) return;
    // Future hook: apply decals/runes based on config.ornaments
  }, [group, config]);

  // Optional idle animation
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.35;
  });

  return <primitive ref={groupRef} object={group} />;
}

/********************************************
 * Demo scene + a few example configurations *
 ********************************************/
const EXAMPLES = {
  weapon_lightning_rapier: {
    seed: 4127,
    type: "weapon",
    enchantment: "lightning",
    base: { length: 1.25, spineCurve: 0.05, tip: "needle", width: 0.11 },
    guard: { style: "forked", width: 0.38 },
    handle: { length: 0.55, radius: 0.075, ringCount: 3 },
    pommel: { shape: "octa", radius: 0.09 },
    material: { preset: "steel_brushed", tint: "#9fd7ff" },
  },
  armor_rusty_breastplate: {
    seed: 9031,
    type: "armor",
    enchantment: "cursed",
    base: { width: 0.9, height: 1.1, depth: 0.28, neckWidth: 0.6, neckDepth: 0.22, armInset: 0.28 },
    material: { preset: "iron_rusty" },
  },
  trinket_gemring: {
    seed: 777,
    type: "trinket",
    enchantment: "holy",
    base: { radius: 0.22, thickness: 0.06 },
    gem: { radius: 0.09 },
  },
  consumable_potion: {
    seed: 2222,
    type: "consumable",
    enchantment: "frost",
    base: { bodyRadius: 0.18, neckRadius: 0.06, height: 0.36 },
    material: { tint: "#aaddff" },
  },
};

function ExamplePicker({ current, setCurrent }) {
  return (
    <div className="absolute top-3 z-[999] left-3 bg-black/60 text-white rounded-xl px-3 py-2 flex gap-2 items-center">
      <span className="text-xs opacity-80">Examples</span>
      {Object.keys(EXAMPLES).map((k) => (
        <button key={k} onClick={() => setCurrent(k)} className={`text-xs px-2 py-1 rounded-md border ${current===k?"bg-white text-black":"border-white/30 hover:bg-white/10"}`}>
          {k.split("_")[0]}
        </button>
      ))}
    </div>
  );
}

// Lightweight control UI for armor tuning
function ControlPanel({ overrides, setOverrides, reset, baseDepth }) {
  const s = overrides.straps, b = overrides.buckles;
  const update = (path, value) => {
    setOverrides((o) => {
      const next = JSON.parse(JSON.stringify(o));
      const [a, k] = path.split(".");
      next[a][k] = value;
      return next;
    });
  };
  return (
    <div className="absolute top-3 right-3 z-[999] bg-black/60 text-white rounded-xl px-3 py-2 w-64 space-y-2">
      <div className="text-xs font-semibold opacity-90">Armor Controls</div>
      <label className="flex items-center justify-between text-xs">Enchantment
        <input type="checkbox" className="ml-2" checked={overrides.enchantmentEnabled} onChange={(e)=>setOverrides(o=>({...o,enchantmentEnabled:e.target.checked}))} />
      </label>
      <div className="h-px bg-white/20" />
      <div className="text-[10px] uppercase opacity-70">Straps</div>
      <label className="block text-xs">Thickness: {s.thickness.toFixed(3)}
        <input type="range" min={0.01} max={0.06} step={0.002} value={s.thickness}
          onChange={(e)=>update("straps.thickness", Number(e.target.value))} className="w-full" />
      </label>
      <label className="block text-xs">Length offset: {s.lengthOffset.toFixed(2)} (base {baseDepth.toFixed(2)} + offset)
        <input type="range" min={-0.10} max={0.30} step={0.01} value={s.lengthOffset}
          onChange={(e)=>update("straps.lengthOffset", Number(e.target.value))} className="w-full" />
      </label>
      <label className="block text-xs">Inset X: {s.insetX.toFixed(2)}
        <input type="range" min={0.08} max={0.30} step={0.01} value={s.insetX}
          onChange={(e)=>update("straps.insetX", Number(e.target.value))} className="w-full" />
      </label>
      <div className="text-[10px] uppercase opacity-70 mt-1">Buckles</div>
      <label className="block text-xs">Ring scale: {b.ringScale.toFixed(2)}
        <input type="range" min={0.30} max={0.90} step={0.02} value={b.ringScale}
          onChange={(e)=>update("buckles.ringScale", Number(e.target.value))} className="w-full" />
      </label>
      <label className="block text-xs">Tube scale: {b.tubeScale.toFixed(2)}
        <input type="range" min={0.10} max={0.40} step={0.02} value={b.tubeScale}
          onChange={(e)=>update("buckles.tubeScale", Number(e.target.value))} className="w-full" />
      </label>
      <div className="flex gap-2 pt-1">
        <button className="text-xs px-2 py-1 rounded-md bg-white text-black" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

// Weapon color controls
function WeaponPanel({ overrides, setOverrides }) {
  const w = overrides.weapon;
  const set = (k, v) => setOverrides(o => ({ ...o, weapon: { ...o.weapon, [k]: v } }));
  return (
    <div className="absolute top-3 right-3 z-[999] bg-black/60 text-white rounded-xl px-3 py-2 w-64 space-y-2">
      <div className="text-xs font-semibold opacity-90">Weapon Colors</div>
      <label className="flex items-center justify-between text-xs">Blade tint
        <input type="color" className="ml-2" value={w.bladeTint} onChange={(e)=>set("bladeTint", e.target.value)} />
      </label>
      <label className="flex items-center justify-between text-xs">Guard tint
        <input type="color" className="ml-2" value={w.guardTint} onChange={(e)=>set("guardTint", e.target.value)} />
      </label>
    </div>
  );
}

// Trinket gem color control
function TrinketPanel({ overrides, setOverrides }) {
  const t = overrides.trinket;
  const set = (v) => setOverrides(o => ({ ...o, trinket: { ...o.trinket, gemTint: v } }));
  return (
    <div className="absolute top-3 right-3 z-[999] bg-black/60 text-white rounded-xl px-3 py-2 w-48 space-y-2">
      <div className="text-xs font-semibold opacity-90">Trinket Gem</div>
      <label className="flex items-center justify-between text-xs">Gem tint
        <input type="color" className="ml-2" value={t.gemTint} onChange={(e)=>set(e.target.value)} />
      </label>
    </div>
  );
}

// Consumable controls (glass + liquid)
function ConsumablePanel({ overrides, setOverrides }) {
  const c = overrides.consumable;
  const set = (k, v) => setOverrides(o => ({ ...o, consumable: { ...o.consumable, [k]: v } }));
  return (
    <div className="absolute top-3 right-3 z-[999] bg-black/60 text-white rounded-xl px-3 py-2 w-72 space-y-2">
      <div className="text-xs font-semibold opacity-90">Potion / Consumable</div>
      <div className="text-[10px] uppercase opacity-70">Glass</div>
      <label className="flex items-center justify-between text-xs">Tint
        <input type="color" className="ml-2" value={c.glassTint} onChange={(e)=>set("glassTint", e.target.value)} />
      </label>
      <label className="block text-xs">Opacity: {c.glassOpacity.toFixed(2)}
        <input type="range" min={0.10} max={0.80} step={0.02} value={c.glassOpacity} onChange={(e)=>set("glassOpacity", Number(e.target.value))} className="w-full" />
      </label>
      <div className="text-[10px] uppercase opacity-70">Liquid</div>
      <label className="flex items-center justify-between text-xs">Tint
        <input type="color" className="ml-2" value={c.liquidTint} onChange={(e)=>set("liquidTint", e.target.value)} />
      </label>
      <label className="block text-xs">Opacity: {c.liquidOpacity.toFixed(2)}
        <input type="range" min={0.30} max={1.00} step={0.02} value={c.liquidOpacity} onChange={(e)=>set("liquidOpacity", Number(e.target.value))} className="w-full" />
      </label>
      <label className="block text-xs">Fill: {(c.fill*100).toFixed(0)}%
        <input type="range" min={0.05} max={0.95} step={0.01} value={c.fill} onChange={(e)=>set("fill", Number(e.target.value))} className="w-full" />
      </label>
      <label className="block text-xs">Meniscus: {c.meniscus.toFixed(3)}
        <input type="range" min={0} max={0.02} step={0.001} value={c.meniscus} onChange={(e)=>set("meniscus", Number(e.target.value))} className="w-full" />
      </label>
      <label className="block text-xs">Bubbles: {c.bubbles}
        <input type="range" min={0} max={30} step={1} value={c.bubbles} onChange={(e)=>set("bubbles", Number(e.target.value))} className="w-full" />
      </label>
    </div>
  );
}

export default function MeshBuilderDemo() {
  const [key, setKey] = React.useState("armor_rusty_breastplate");
  const baseConfig = EXAMPLES[key];

  const [overrides, setOverrides] = React.useState({
    straps: {
      thickness: baseConfig.straps?.thickness ?? Math.max(0.02, (baseConfig.base?.width ?? 0.9) * 0.03),
      lengthOffset: 0.04,
      insetX: 0.18,
    },
    buckles: { ringScale: 0.55, tubeScale: 0.18 },
    weapon: { bladeTint: baseConfig.bladeTint || baseConfig.material?.tint || "#b0b6bf", guardTint: baseConfig.material?.tint || "#b0b6bf" },
    trinket: { gemTint: baseConfig.gemTint || "#66e0ff" },
    consumable: { glassTint: baseConfig.material?.tint || "#aaddff", glassOpacity: 0.35, liquidTint: baseConfig.liquidTint || "#55aaff", liquidOpacity: 0.7, fill: 0.75, meniscus: 0.006, bubbles: 0 },
    enchantmentEnabled: baseConfig.enchantment !== "none",
  });

  const resetOverrides = React.useCallback(() => {
    setOverrides({
      straps: { thickness: Math.max(0.02, (baseConfig.base?.width ?? 0.9) * 0.03), lengthOffset: 0.04, insetX: 0.18 },
      buckles: { ringScale: 0.55, tubeScale: 0.18 },
      weapon: { bladeTint: baseConfig.bladeTint || baseConfig.material?.tint || "#b0b6bf", guardTint: baseConfig.material?.tint || "#b0b6bf" },
      trinket: { gemTint: baseConfig.gemTint || "#66e0ff" },
      consumable: { glassTint: baseConfig.material?.tint || "#aaddff", glassOpacity: 0.35, liquidTint: baseConfig.liquidTint || "#55aaff", liquidOpacity: 0.7, fill: 0.75, meniscus: 0.006, bubbles: 0 },
      // enchantmentEnabled: baseConfig.enchantment !== "none",
      enchantmentEnabled: false
    });
  }, [baseConfig]);

  React.useEffect(() => { resetOverrides(); }, [key]);

  const mergedConfig = React.useMemo(() => {
    const c = JSON.parse(JSON.stringify(baseConfig));
    // Armor knobs
    if (c.type === "armor") {
      c.straps = { thickness: overrides.straps.thickness, length: (c.base?.depth ?? 0.35) + overrides.straps.lengthOffset, insetX: overrides.straps.insetX };
      c.buckles = { ringScale: overrides.buckles.ringScale, tubeScale: overrides.buckles.tubeScale };
    }
    // Weapon knobs
    if (c.type === "weapon") {
      c.bladeTint = overrides.weapon.bladeTint;
      c.guardTint = overrides.weapon.guardTint;
    }
    // Trinket knobs
    if (c.type === "trinket") {
      c.gemTint = overrides.trinket.gemTint;
    }
    // Consumable knobs
    if (c.type === "consumable") {
      Object.assign(c, {
        glassTint: overrides.consumable.glassTint,
        glassOpacity: overrides.consumable.glassOpacity,
        liquidTint: overrides.consumable.liquidTint,
        liquidOpacity: overrides.consumable.liquidOpacity,
        fill: overrides.consumable.fill,
        meniscus: overrides.consumable.meniscus,
        bubbles: overrides.consumable.bubbles,
      });
    }
    if (!overrides.enchantmentEnabled) c.enchantment = "none";
    return c;
  }, [baseConfig, overrides]);

  return (
    <div className="w-full h-[80vh] bg-neutral-950 text-white relative">
      <ExamplePicker current={key} setCurrent={setKey} />
      {(mergedConfig.type === "armor") && (
        <ControlPanel overrides={overrides} setOverrides={setOverrides} reset={resetOverrides} baseDepth={baseConfig.base?.depth ?? 0.35} />
      )}
      {(mergedConfig.type === "weapon") && (
        <WeaponPanel overrides={overrides} setOverrides={setOverrides} />
      )}
      {(mergedConfig.type === "trinket") && (
        <TrinketPanel overrides={overrides} setOverrides={setOverrides} />
      )}
      {(mergedConfig.type === "consumable") && (
        <ConsumablePanel overrides={overrides} setOverrides={setOverrides} />
      )}
      <Canvas camera={{ position: [2.2, 1.4, 2.2], fov: 45 }} shadows style={{ position: 'relative', zIndex: 0 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 2]} intensity={1.2} castShadow />
        <group position={[0, 0, 0]}>
          <MeshBuilder config={mergedConfig} />
        </group>
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.8,0]} receiveShadow>
          <planeGeometry args={[8,8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <Environment preset="city" />
        <OrbitControls enableDamping makeDefault />
      </Canvas>
      <div className="absolute bottom-3 left-3 text-xs opacity-70">
        MeshBuilder: seed = {String(mergedConfig.seed)} | type = {mergedConfig.type}
      </div>
      <div className="absolute bottom-3 right-3 text-xs opacity-70">
        LLM → meshConfig JSON → parametric build (deterministic)
      </div>
    </div>
  );
}

/********************************************
 * Suggested JSON schema (for your server)   *
 * Keep this synced with your Zod schema.    *
 ********************************************/
/*
// Zod-ish (pseudo) to guide your /forge/mesh-config endpoint:
const MeshConfigSchema = z.object({
  seed: z.number().int().nonnegative(),
  type: z.enum(["weapon","armor","trinket","consumable"]),
  enchantment: z.string().optional(),
  material: z.object({
    preset: z.string().optional(),
    tint: z.string().optional(),
    emissive: z.object({ color: z.string().optional(), intensity: z.number().optional() }).optional()
  }).optional(),
  base: z.record(z.any()).optional(),
  guard: z.record(z.any()).optional(),
  handle: z.record(z.any()).optional(),
  pommel: z.record(z.any()).optional(),
  gem: z.record(z.any()).optional()
});
*/

/***************************************************
 * Notes & next steps                               *
 * - Add decal/edge-runed variants per enchantment  *
 * - Optional CSG for engraving/studs (three-stdlib)*
 * - Generate LOD levels (high in shop window, low  *
 *   in Hellmarch mode).                             *
 * - Bake AO/normal-lite postbuild for stability.   *
 ***************************************************/
