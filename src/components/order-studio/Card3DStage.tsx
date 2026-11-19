'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  FlipHorizontal2,
  RectangleHorizontal,
  RectangleVertical,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  CARD_D,
  CardDesignState,
  CardSide,
  HH,
  HW,
  LoadedCardImages,
  MaterialOption,
  VH,
  VW,
  getEffectiveBg,
  resolveStageTint,
} from './types';
import { drawCardBack, drawCardFront } from './CardCanvasRenderer';

export interface Card3DStageProps {
  design: CardDesignState;
  material: MaterialOption;
  images: LoadedCardImages;
  step: number;
  activeSide: CardSide;
  sideFlipNonce: number;
  tintNonce: number;
  dir: 'rtl' | 'ltr';
  onSideChange: (side: CardSide, fromDrag?: boolean) => void;
  onToggleOrientation: () => void;
  onStageThemeVars?: (vars: { bg: string; accent: string }) => void;
}

const MIN_ZOOM_SCALE = 0.55;
const MAX_ZOOM_SCALE = 1.45;

function clampZoom(value: number): number {
  return Math.max(MIN_ZOOM_SCALE, Math.min(MAX_ZOOM_SCALE, value));
}

function makeRoundedShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function makeNormalizedFaceGeo(shape: THREE.Shape, w: number, h: number): THREE.ShapeGeometry {
  const geo = new THREE.ShapeGeometry(shape, 28);
  const pos = geo.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uvs[i * 2] = (pos.getX(i) + w / 2) / w;
    uvs[i * 2 + 1] = (pos.getY(i) + h / 2) / h;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  return geo;
}

function buildOrientationGeos(w: number, h: number) {
  const shape = makeRoundedShape(w, h, 0.14);
  const edgeGeo = new THREE.ExtrudeGeometry(shape, {
    depth: CARD_D,
    bevelEnabled: true,
    bevelThickness: 0.0045,
    bevelSize: 0.0045,
    bevelSegments: 3,
    curveSegments: 28,
  });
  edgeGeo.translate(0, 0, -CARD_D / 2);
  return { edgeGeo, faceGeo: makeNormalizedFaceGeo(shape, w, h) };
}

function shortestAngleTarget(current: number, desiredMod2Pi: number): number {
  const twoPi = Math.PI * 2;
  const diff = (((desiredMod2Pi - current) % twoPi) + twoPi + Math.PI) % twoPi - Math.PI;
  return current + diff;
}

export default function Card3DStage({
  design,
  material,
  images,
  step,
  activeSide,
  sideFlipNonce,
  tintNonce,
  dir,
  onSideChange,
  onToggleOrientation,
  onStageThemeVars,
}: Card3DStageProps) {
  const { t } = useLanguage();

  const stageRef = useRef<HTMLElement | null>(null);
  const revealRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Interactive zoom multiplier (0.55 = closest zoom in, 1 = default, 1.45 = zoomed out)
  const zoomScaleRef = useRef<number>(1);

  // Latest prop refs for zero-recreation RAF loop
  const designRef = useRef(design);
  const materialRef = useRef(material);
  const imagesRef = useRef(images);
  const stepRef = useRef(step);
  const dirRef = useRef(dir);
  const onSideChangeRef = useRef(onSideChange);
  const onStageThemeVarsRef = useRef(onStageThemeVars);

  designRef.current = design;
  materialRef.current = material;
  imagesRef.current = images;
  stepRef.current = step;
  dirRef.current = dir;
  onSideChangeRef.current = onSideChange;
  onStageThemeVarsRef.current = onStageThemeVars;

  // Imperative handles into the running Three.js engine
  const engineRef = useRef<{
    dirtyFront: boolean;
    dirtyBack: boolean;
    curRotY: number;
    spinAngle: number;
    goalLockY: number;
    dragOffsetY: number;
    prevStep: number;
    applyOrientation: (orient: 'vertical' | 'horizontal') => void;
    applyMaterial: (mat: MaterialOption) => void;
    flipToSide: (side: CardSide) => void;
    triggerStepTransition: (nextStep: number) => void;
  } | null>(null);

  const revealAnimRef = useRef<number | null>(null);

  const runStageThemeSync = (animateBg: boolean, targetSide: CardSide) => {
    const bg = getEffectiveBg(designRef.current, targetSide);
    const tint = resolveStageTint(bg);
    const accent = designRef.current.colors.tipShape;
    const stageEl = stageRef.current;
    const revealEl = revealRef.current;

    if (stageEl) {
      stageEl.style.setProperty('--stage-accent', accent);
    }

    if (!animateBg || !revealEl) {
      if (stageEl) stageEl.style.setProperty('--stage-bg', tint);
      onStageThemeVarsRef.current?.({ bg: tint, accent });
      return;
    }

    if (revealAnimRef.current !== null) {
      cancelAnimationFrame(revealAnimRef.current);
      revealAnimRef.current = null;
    }

    revealEl.style.background = tint;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 480);
      const pct = (1 - Math.pow(1 - progress, 3)) * 130;
      const mask = `radial-gradient(circle at 50% 50%, #000 ${Math.max(0, pct - 24)}%, transparent ${pct}%)`;
      revealEl.style.maskImage = mask;
      (revealEl.style as CSSStyleDeclaration & { webkitMaskImage?: string }).webkitMaskImage = mask;
      if (progress < 1) {
        revealAnimRef.current = requestAnimationFrame(tick);
      } else {
        revealAnimRef.current = null;
        if (stageEl) stageEl.style.setProperty('--stage-bg', tint);
        onStageThemeVarsRef.current?.({ bg: tint, accent });
        revealEl.style.background = 'transparent';
        revealEl.style.maskImage = '';
        (revealEl.style as CSSStyleDeclaration & { webkitMaskImage?: string }).webkitMaskImage = '';
      }
    };

    revealAnimRef.current = requestAnimationFrame(tick);
  };

  // Mount Three.js engine once
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.88;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 8.6);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmrem.dispose();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.65);
    keyLight.position.set(3.2, 4.5, 5.2);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.45);
    rimLight.position.set(-4.5, -2.5, -3.5);
    scene.add(rimLight);

    // Offscreen 2D canvases for Horizontal & Vertical faces
    const frontCanvasH = Object.assign(document.createElement('canvas'), { width: HW, height: HH });
    const backCanvasH = Object.assign(document.createElement('canvas'), { width: HW, height: HH });
    const frontCanvasV = Object.assign(document.createElement('canvas'), { width: VW, height: VH });
    const backCanvasV = Object.assign(document.createElement('canvas'), { width: VW, height: VH });

    const makeTex = (cnv: HTMLCanvasElement) => {
      const tex = new THREE.CanvasTexture(cnv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      return tex;
    };

    const texFH = makeTex(frontCanvasH);
    const texBH = makeTex(backCanvasH);
    const texFV = makeTex(frontCanvasV);
    const texBV = makeTex(backCanvasV);

    const geosH = buildOrientationGeos(3.55, 2.24);
    const geosV = buildOrientationGeos(2.24, 3.55);

    const initIsV = designRef.current.orientation === 'vertical';
    const initMat = materialRef.current;

    const resolveEnvIntensity = (mat: MaterialOption) => {
      if (typeof mat.envMapIntensity === 'number' && Number.isFinite(mat.envMapIntensity)) {
        return mat.envMapIntensity;
      }
      if (mat.id === 'metal' || mat.brushed) return 0.55;
      if (mat.id === 'pvc-gloss') return 0.35;
      return 0.15;
    };

    // Pure white constant edge (CARD_D = 0.024)
    const edgeMat = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      metalness: 0.08,
      roughness: 0.32,
      clearcoat: 0.35,
      envMapIntensity: 0.25,
    });
    const frontMat = new THREE.MeshPhysicalMaterial({
      map: initIsV ? texFV : texFH,
      metalness: initMat.metalness,
      roughness: initMat.roughness,
      clearcoat: initMat.clearcoat,
      envMapIntensity: resolveEnvIntensity(initMat),
    });
    const backMat = new THREE.MeshPhysicalMaterial({
      map: initIsV ? texBV : texBH,
      metalness: initMat.metalness,
      roughness: initMat.roughness,
      clearcoat: initMat.clearcoat,
      envMapIntensity: resolveEnvIntensity(initMat),
    });

    const cardGroup = new THREE.Group();
    const initGeos = initIsV ? geosV : geosH;
    const bodyMesh = new THREE.Mesh(initGeos.edgeGeo, edgeMat);
    const frontMesh = new THREE.Mesh(initGeos.faceGeo, frontMat);
    frontMesh.position.z = CARD_D / 2 + 0.0055;
    const backMesh = new THREE.Mesh(initGeos.faceGeo, backMat);
    backMesh.position.z = -(CARD_D / 2 + 0.0055);
    backMesh.rotation.y = Math.PI;
    cardGroup.add(bodyMesh, frontMesh, backMesh);
    scene.add(cardGroup);

    // Soft radial floor shadow
    const shCanvas = Object.assign(document.createElement('canvas'), { width: 256, height: 256 });
    const sCtx = shCanvas.getContext('2d');
    if (sCtx) {
      const sg = sCtx.createRadialGradient(128, 128, 10, 128, 128, 124);
      sg.addColorStop(0, 'rgba(0,0,0,0.52)');
      sg.addColorStop(0.5, 'rgba(0,0,0,0.2)');
      sg.addColorStop(1, 'rgba(0,0,0,0)');
      sCtx.fillStyle = sg;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(shCanvas);
    const shadowGeo = new THREE.PlaneGeometry(3.8, 1.15);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(0, initIsV ? -2.08 : -1.52, -0.5);
    scene.add(shadowMesh);

    let baseCamZ = 8.4;
    const updateCameraTarget = () => {
      const w = Math.max(1, stage.clientWidth || 600);
      const h = Math.max(1, stage.clientHeight || 400);
      const aspect = Math.max(0.5, w / h);
      const isV = designRef.current.orientation === 'vertical';
      const isMobile = w < 640;

      const cardW = isV ? 2.24 : 3.55;
      const cardH = isV ? 3.55 : 2.24;
      const tanHalfV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);

      // Keep balanced top/bottom breathing room AND clear separation from the floating side controls even at 360px
      const maxFillH = isMobile ? 0.72 : 0.72;
      const maxFillW = isMobile ? 0.6 : 0.74;
      const neededZForH = cardH / (2 * tanHalfV * maxFillH);
      const neededZForW = cardW / (2 * tanHalfV * aspect * maxFillW);

      const defaultZ = isV ? (w < 520 ? 8.6 : 8.4) : (w < 520 ? 9.4 : 7.5);
      baseCamZ = Math.max(defaultZ, neededZForH, neededZForW);
      shadowMesh.position.y = isV ? -2.08 : -1.52;
    };

    const resizeStage = () => {
      const w = Math.max(1, stage.clientWidth);
      const h = Math.max(1, stage.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      updateCameraTarget();
      camera.updateProjectionMatrix();
    };

    // Multi-pointer, pinch-to-zoom, wheel zoom, and single-finger rotation state machine
    let curRotX = 0.05;
    let dragOffsetX = 0;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let downX = 0;
    let downY = 0;
    let movedDuringPointer = false;
    let lastDragDir = 0;
    let prevTime = 0;
    let swayStart = 0;

    const activePointers = new Map<number, { x: number; y: number }>();
    let prevPinchDist: number | null = null;
    let wasPinching = false;

    // Mobile double-tap zoom reset tracking
    let lastTapTime = 0;
    let lastTapX = 0;
    let lastTapY = 0;

    const engineState = {
      dirtyFront: true,
      dirtyBack: true,
      curRotY: 0,
      spinAngle: 0,
      goalLockY: 0,
      dragOffsetY: 0,
      prevStep: stepRef.current,
      applyOrientation: (orient: 'vertical' | 'horizontal') => {
        const isV = orient === 'vertical';
        const g = isV ? geosV : geosH;
        bodyMesh.geometry = g.edgeGeo;
        frontMesh.geometry = g.faceGeo;
        backMesh.geometry = g.faceGeo;
        frontMat.map = isV ? texFV : texFH;
        backMat.map = isV ? texBV : texBH;
        frontMat.needsUpdate = true;
        backMat.needsUpdate = true;
        updateCameraTarget();
        engineState.dirtyFront = true;
        engineState.dirtyBack = true;
      },
      applyMaterial: (mat: MaterialOption) => {
        const nextEnv = resolveEnvIntensity(mat);
        [frontMat, backMat].forEach((m) => {
          m.metalness = mat.metalness;
          m.roughness = mat.roughness;
          m.clearcoat = mat.clearcoat;
          m.envMapIntensity = nextEnv;
          m.needsUpdate = true;
        });
        engineState.dirtyFront = true;
        engineState.dirtyBack = true;
      },
      flipToSide: (side: CardSide) => {
        const desired = side === 'back' ? Math.PI : 0;
        engineState.dragOffsetY = 0;
        if (stepRef.current === 3) {
          engineState.spinAngle = shortestAngleTarget(engineState.curRotY, desired);
        } else {
          engineState.goalLockY = shortestAngleTarget(engineState.curRotY, desired);
        }
      },
      triggerStepTransition: (nextStep: number) => {
        const wasSpinning = engineState.prevStep === 3;
        const nowSpinning = nextStep === 3;
        engineState.prevStep = nextStep;
        if (nowSpinning && !wasSpinning) {
          // Continue smooth 360° spin from exact current angle without jump
          engineState.spinAngle = engineState.curRotY;
          engineState.dragOffsetY = 0;
        } else if (nextStep === 0 || nextStep === 1) {
          engineState.flipToSide('front');
        } else if (nextStep === 2) {
          engineState.flipToSide('back');
        }
      },
    };
    engineRef.current = engineState;

    const isContinuousSpinStep = () => stepRef.current === 3;

    const getTwoPointerDistance = () => {
      const pts = Array.from(activePointers.values());
      if (pts.length < 2) return null;
      return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomScaleRef.current = clampZoom(zoomScaleRef.current + e.deltaY * 0.001);
    };

    const onDoubleClick = () => {
      zoomScaleRef.current = 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Ignore capture failure on synthetic events
      }

      if (activePointers.size === 1) {
        isDragging = true;
        wasPinching = false;
        prevPinchDist = null;
        lastX = e.clientX;
        lastY = e.clientY;
        downX = e.clientX;
        downY = e.clientY;
        movedDuringPointer = false;
        lastDragDir = 0;
      } else if (activePointers.size >= 2) {
        // Suspend single-finger rotation while pinching with 2 fingers
        isDragging = false;
        wasPinching = true;
        movedDuringPointer = true;
        prevPinchDist = getTwoPointerDistance();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!activePointers.has(e.pointerId)) return;
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // 2-Finger Pinch-to-Zoom
      if (activePointers.size >= 2) {
        const dist = getTwoPointerDistance();
        if (dist !== null && prevPinchDist !== null && prevPinchDist > 4 && dist > 4) {
          const ratio = prevPinchDist / dist;
          zoomScaleRef.current = clampZoom(zoomScaleRef.current * ratio);
        }
        prevPinchDist = dist;
        return;
      }

      // 1-Finger Drag Rotation
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 10) {
        movedDuringPointer = true;
      }
      if (Math.abs(dx) > 1) lastDragDir = Math.sign(dx);

      if (isContinuousSpinStep()) {
        engineState.spinAngle += dx * 0.011;
      } else {
        engineState.dragOffsetY += dx * 0.011;
      }
      dragOffsetX = Math.max(-0.55, Math.min(0.55, dragOffsetX + dy * 0.008));
    };

    const onPointerEnd = (e: PointerEvent) => {
      activePointers.delete(e.pointerId);
      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore release errors
      }

      // Transition from 2 fingers -> 1 finger: re-sync coordinates & reset pinch to prevent jumps
      if (activePointers.size === 1) {
        const remaining = Array.from(activePointers.values())[0];
        lastX = remaining.x;
        lastY = remaining.y;
        lastDragDir = 0;
        prevPinchDist = null;
        isDragging = true;
        return;
      }

      if (activePointers.size >= 2) {
        prevPinchDist = getTwoPointerDistance();
        return;
      }

      // All fingers lifted (0 active pointers)
      prevPinchDist = null;

      // Mobile / Touch Double-Tap resets zoom cleanly back to 1
      if (e.type === 'pointerup' && !wasPinching && !movedDuringPointer && e.pointerType !== 'mouse') {
        const now = performance.now();
        if (now - lastTapTime < 320 && Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY) < 36) {
          zoomScaleRef.current = 1;
          lastTapTime = 0;
        } else {
          lastTapTime = now;
          lastTapX = e.clientX;
          lastTapY = e.clientY;
        }
      }

      if (isDragging || wasPinching) {
        isDragging = false;
        if (stepRef.current === 0) {
          const totalY = engineState.goalLockY + engineState.dragOffsetY;
          const dirBias = !wasPinching && movedDuringPointer ? lastDragDir * 0.5 : 0;
          // Smart snap to front or back along user's drag direction (prevents stopping on thin edge)
          const snappedSteps = Math.round((totalY + dirBias) / Math.PI);
          engineState.goalLockY = snappedSteps * Math.PI;
          engineState.dragOffsetY = 0;
          const isBack = Math.abs(snappedSteps % 2) === 1;
          const nextSide: CardSide = isBack ? 'back' : 'front';
          onSideChangeRef.current(nextSide, true);
          runStageThemeSync(true, nextSide);
        }
        wasPinching = false;
      }
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('dblclick', onDoubleClick);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerEnd);
    canvas.addEventListener('pointercancel', onPointerEnd);

    const resizeObserver = new ResizeObserver(resizeStage);
    resizeObserver.observe(stage);
    window.addEventListener('resize', resizeStage);
    resizeStage();

    // Redraw textures cleanly once webfonts finish loading
    let unmounted = false;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!unmounted && engineRef.current) {
          engineRef.current.dirtyFront = true;
          engineRef.current.dirtyBack = true;
        }
      });
    }

    runStageThemeSync(false, activeSide);

    let rafId = 0;
    const animate = (t: number) => {
      rafId = requestAnimationFrame(animate);
      const dt = prevTime ? Math.min(50, t - prevTime) : 16;
      prevTime = t;

      const curDesign = designRef.current;
      const curMaterial = materialRef.current;
      const curImages = imagesRef.current;
      const curDir = dirRef.current;
      const isV = curDesign.orientation === 'vertical';

      if (engineState.dirtyFront) {
        if (isV) {
          const ctx = frontCanvasV.getContext('2d');
          if (ctx) drawCardFront(ctx, VW, VH, true, curDesign, curMaterial, curImages, curDir);
          texFV.needsUpdate = true;
        } else {
          const ctx = frontCanvasH.getContext('2d');
          if (ctx) drawCardFront(ctx, HW, HH, false, curDesign, curMaterial, curImages, curDir);
          texFH.needsUpdate = true;
        }
        engineState.dirtyFront = false;
      }

      if (engineState.dirtyBack) {
        if (isV) {
          const ctx = backCanvasV.getContext('2d');
          if (ctx) drawCardBack(ctx, VW, VH, true, curDesign, curMaterial, curImages, curDir);
          texBV.needsUpdate = true;
        } else {
          const ctx = backCanvasH.getContext('2d');
          if (ctx) drawCardBack(ctx, HW, HH, false, curDesign, curMaterial, curImages, curDir);
          texBH.needsUpdate = true;
        }
        engineState.dirtyBack = false;
      }

      let targetY: number;
      let targetX: number;

      if (isContinuousSpinStep()) {
        // Step 4 (Checkout): smooth continuous 360° rotation
        if (!isDragging && activePointers.size === 0) {
          engineState.spinAngle += dt * 0.0006;
          dragOffsetX *= 0.94;
        }
        targetY = engineState.spinAngle;
        targetX = 0.06 + Math.cos(t * 0.001) * 0.03 + dragOffsetX;
      } else {
        // Step 1: smart snap + gentle sway | Steps 2 & 3: return to active side + gentle sway
        if (isDragging || activePointers.size >= 2) {
          swayStart = t;
        } else {
          if (stepRef.current !== 0) engineState.dragOffsetY *= 0.93;
          dragOffsetX *= 0.93;
        }
        const gentleSway =
          isDragging || activePointers.size >= 2
            ? 0
            : Math.sin((t - swayStart) * 0.0012) * 0.28;
        targetY = engineState.goalLockY + gentleSway + engineState.dragOffsetY;
        targetX = 0.04 + Math.cos(t * 0.001) * 0.025 + dragOffsetX;
      }

      engineState.curRotY += (targetY - engineState.curRotY) * 0.1;
      curRotX += (targetX - curRotX) * 0.1;

      // Smoothly interpolate camera Z with interactive zoom scale (compatible with orientation switches)
      const desiredCamZ = baseCamZ * zoomScaleRef.current;
      camera.position.z += (desiredCamZ - camera.position.z) * 0.12;

      cardGroup.rotation.y = engineState.curRotY;
      cardGroup.rotation.x = curRotX;
      cardGroup.position.y = Math.sin(t * 0.0018) * 0.055;
      shadowMesh.scale.set(
        (isV ? 0.72 : 1.05) * Math.max(0.32, Math.abs(Math.cos(engineState.curRotY))),
        1,
        1
      );

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      unmounted = true;
      cancelAnimationFrame(rafId);
      if (revealAnimRef.current !== null) {
        cancelAnimationFrame(revealAnimRef.current);
        revealAnimRef.current = null;
      }

      resizeObserver.disconnect();
      window.removeEventListener('resize', resizeStage);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('dblclick', onDoubleClick);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerEnd);
      canvas.removeEventListener('pointercancel', onPointerEnd);
      activePointers.clear();

      geosH.edgeGeo.dispose();
      geosH.faceGeo.dispose();
      geosV.edgeGeo.dispose();
      geosV.faceGeo.dispose();
      shadowGeo.dispose();

      edgeMat.dispose();
      frontMat.dispose();
      backMat.dispose();
      shadowMat.dispose();

      texFH.dispose();
      texBH.dispose();
      texFV.dispose();
      texBV.dispose();
      shadowTex.dispose();
      envRT.dispose();

      renderer.dispose();
      engineRef.current = null;
    };
  }, []);

  // Mark canvases dirty on any design / image / direction change
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.dirtyFront = true;
    engineRef.current.dirtyBack = true;
  }, [design, images, dir]);

  // Orientation switch
  useEffect(() => {
    engineRef.current?.applyOrientation(design.orientation);
  }, [design.orientation]);

  // Material physics update
  useEffect(() => {
    engineRef.current?.applyMaterial(material);
  }, [material]);

  // Step transition rotation behavior
  useEffect(() => {
    engineRef.current?.triggerStepTransition(step);
  }, [step]);

  // Explicit side flip trigger
  useEffect(() => {
    if (sideFlipNonce === 0) return;
    engineRef.current?.flipToSide(activeSide);
    runStageThemeSync(true, activeSide);
  }, [sideFlipNonce]);

  // Stage background reveal tint sync
  useEffect(() => {
    if (tintNonce === 0) return;
    runStageThemeSync(true, activeSide);
  }, [tintNonce, design.colors.tipShape]);

  const stepDisplay = `0${step + 1}`;
  const isVertical = design.orientation === 'vertical';
  const isBackActive = activeSide === 'back';

  const flipTooltip = isBackActive
    ? t('orderStudio.flipToFront', 'چرخاندن به روی کارت')
    : t('orderStudio.flipToBack', 'چرخاندن به پشت کارت');

  const orientTooltip = isVertical
    ? t('orderStudio.toHoriz', 'تغییر به افقی')
    : t('orderStudio.toVert', 'تغییر به عمودی');

  return (
    <section
      ref={stageRef}
      className="stage"
      dir={dir}
      aria-label={t('orderStudio.stageAria', 'پیش‌نمایش سه‌بعدی کارت هوشمند NFC')}
    >
      <div ref={revealRef} className="stage-reveal" aria-hidden="true" />
      <div className="rings" aria-hidden="true" />
      <div className="stage-glow" aria-hidden="true" />
      <div className="big-step-num" aria-hidden="true">
        {stepDisplay}
      </div>

      <canvas ref={canvasRef} className="card-canvas touch-none" />

      {/* Floating vertical 2-button icon-only toolbar positioned logically at inline-end (left in RTL, right in LTR) */}
      <div
        className="absolute top-1/2 -translate-y-1/2 end-3 sm:end-5 z-20 flex flex-col gap-2 p-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/15 shadow-xl"
        role="toolbar"
        aria-orientation="vertical"
        aria-label={t('orderStudio.stageControls', 'کنترل پیش‌نمایش کارت')}
      >
        {/* Button 1: Flip Front / Back */}
        <button
          type="button"
          onClick={() => onSideChange(isBackActive ? 'front' : 'back', false)}
          aria-label={flipTooltip}
          aria-pressed={isBackActive}
          title={flipTooltip}
          className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
            isBackActive
              ? 'bg-sky-400/25 text-sky-300 ring-1 ring-sky-400/60 shadow-md shadow-sky-500/20'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <FlipHorizontal2
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${
              isBackActive ? 'scale-x-[-1]' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {/* Button 2: Toggle Vertical / Horizontal Orientation */}
        <button
          type="button"
          onClick={onToggleOrientation}
          aria-label={orientTooltip}
          aria-pressed={!isVertical}
          title={orientTooltip}
          className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
            !isVertical
              ? 'bg-white/20 text-sky-200 ring-1 ring-white/30'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {isVertical ? (
            <RectangleHorizontal className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          ) : (
            <RectangleVertical className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          )}
        </button>
      </div>
    </section>
  );
}
