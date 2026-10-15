/*
 * Two independent, short badge suspensions. Each printed card keeps its
 * punched slot, woven strap, brushed crimp and metal swivel. Wide canvases
 * show both pieces side by side; narrow canvases show one full-size selection.
 */
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NoToneMapping,
  PCFShadowMap,
  Path,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  Raycaster,
  RepeatWrapping,
  Scene,
  ShadowMaterial,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  SRGBColorSpace,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
  type Object3D,
  type Texture,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { BadgeRig, CARD, CRIMP, HOOK, RIG, SHORT_STRAP, SLOT_Y, STRAP } from "./rig";
import { brushed, weave, type CardArt } from "./art";
import { editorialCard as maestroCard, digitalCard as lumeCard } from "./portfolioArt";
import type { Body } from "./physics";

export type BadgeCopy = { name: string; label: string; line: string };
export type BadgeSceneOptions = {
  /** Play the tracked entrance (false shows the badge already hanging). */
  enter: boolean;
  front: BadgeCopy;
  back: BadgeCopy;
  /** Called when the badge comes to rest after moving. */
  onRest?: () => void;
  /** Called the first time someone moves the badge. */
  onTouch?: () => void;
  /** A deliberate card turn, shared by pointer and accessible DOM controls. */
  onCardFlip?: (index: 0 | 1, flipped: boolean) => void;
  onCardSelect?: (index: 0 | 1) => void;
  onContextLost?: () => void;
  onContextRestored?: () => void;
  onError?: (error: unknown) => void;
};

/** Both layouts contain the same short suspension and a fully readable card. */
const VIEW = { height: 2.86, singleAspect: .82, pairAspect: 1.45, y: .30, z: 10.4 };
const WALL_Z = -0.42;

function roundedRect(w: number, h: number, r: number) {
  const s = new Shape();
  const x = -w / 2,
    y = -h / 2;
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
function slot(cx: number, cy: number, w: number, h: number) {
  const p = new Path();
  const r = h / 2;
  p.moveTo(cx - w / 2 + r, cy - r);
  p.lineTo(cx + w / 2 - r, cy - r);
  p.absarc(cx + w / 2 - r, cy, r, -Math.PI / 2, Math.PI / 2, false);
  p.lineTo(cx - w / 2 + r, cy + r);
  p.absarc(cx - w / 2 + r, cy, r, Math.PI / 2, (3 * Math.PI) / 2, false);
  return p;
}

function texture(canvas: HTMLCanvasElement, renderer: WebGLRenderer) {
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return t;
}

/** Card body with a slot, plus printed front and back faces. */
function cardMesh(art: CardArt, edge: string, renderer: WebGLRenderer) {
  const shape = roundedRect(CARD.w, CARD.h, 0.075);
  shape.holes.push(slot(0, SLOT_Y, 0.2, 0.052));
  const group = new Group();
  const bodyGeometry = new ExtrudeGeometry(shape, { depth: CARD.d, bevelEnabled: false, curveSegments: 10 });
  bodyGeometry.translate(0, 0, -CARD.d / 2);
  const edgeMaterial = new MeshStandardMaterial({ color: edge, roughness: 0.6 });
  const body = new Mesh(bodyGeometry, edgeMaterial);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);
  const face = (canvas: HTMLCanvasElement, back: boolean) => {
    const geometry = new ShapeGeometry(shape, 12);
    if (back) geometry.rotateY(Math.PI);
    const position = geometry.getAttribute("position");
    const uv = new Float32Array(position.count * 2);
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i),
        y = position.getY(i);
      uv[i * 2] = back ? (CARD.w / 2 - x) / CARD.w : (x + CARD.w / 2) / CARD.w;
      uv[i * 2 + 1] = (y + CARD.h / 2) / CARD.h;
    }
    geometry.setAttribute("uv", new BufferAttribute(uv, 2));
    geometry.translate(0, 0, back ? -CARD.d / 2 - 0.0005 : CARD.d / 2 + 0.0005);
    const mesh = new Mesh(geometry, new MeshPhysicalMaterial({
      map: texture(canvas, renderer), roughness: 0.72,
      clearcoat: 0.22, clearcoatRoughness: 0.52,
    }));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };
  group.add(face(art.front, false), face(art.back, true));
  return group;
}

/** Gunmetal swivel snap hook in the hook body's frame (eye bar at HOOK.top, bar through slots at HOOK.pin). */
function hookMesh(metal: Material, bright: Material) {
  const group = new Group();
  const add = (mesh: Mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };
  // Eye: a rounded D ring the strap loops through.
  const eye = new Path();
  const ew = 0.36,
    eh = 0.17,
    er = 0.075,
    ey = HOOK.top - eh / 2;
  eye.moveTo(-ew / 2 + er, ey - eh / 2);
  eye.lineTo(ew / 2 - er, ey - eh / 2);
  eye.quadraticCurveTo(ew / 2, ey - eh / 2, ew / 2, ey - eh / 2 + er);
  eye.lineTo(ew / 2, ey + eh / 2 - er);
  eye.quadraticCurveTo(ew / 2, ey + eh / 2, ew / 2 - er, ey + eh / 2);
  eye.lineTo(-ew / 2 + er, ey + eh / 2);
  eye.quadraticCurveTo(-ew / 2, ey + eh / 2, -ew / 2, ey + eh / 2 - er);
  eye.lineTo(-ew / 2, ey - eh / 2 + er);
  eye.quadraticCurveTo(-ew / 2, ey - eh / 2, -ew / 2 + er, ey - eh / 2);
  const ring = new CatmullRomCurve3(
    eye.getSpacedPoints(48).map((p) => new Vector3(p.x, p.y, 0)),
    true,
  );
  add(new Mesh(new TubeGeometry(ring, 96, 0.019, 10, true), metal));
  // Swivel post, dome and collar.
  const post = add(new Mesh(new CylinderGeometry(0.026, 0.03, 0.07, 18), metal));
  post.position.y = ey - eh / 2 - 0.03;
  const dome = add(new Mesh(new SphereGeometry(0.034, 18, 12), metal));
  dome.position.y = ey - eh / 2 + 0.01;
  const collar = add(new Mesh(new CylinderGeometry(0.046, 0.046, 0.024, 22), metal));
  collar.position.y = ey - eh / 2 - 0.072;
  // Trigger body with its thumb lever.
  const outline = new Shape();
  const top = ey - eh / 2 - 0.085;
  outline.moveTo(-0.034, top);
  outline.lineTo(0.034, top);
  outline.lineTo(0.046, top - 0.05);
  outline.lineTo(0.13, top - 0.1);
  outline.quadraticCurveTo(0.15, top - 0.115, 0.128, top - 0.13);
  outline.lineTo(0.036, top - 0.115);
  outline.lineTo(0.012, top - 0.24);
  outline.lineTo(-0.036, top - 0.24);
  outline.lineTo(-0.058, top - 0.11);
  outline.lineTo(-0.044, top - 0.04);
  outline.closePath();
  const triggerGeometry = new ExtrudeGeometry(outline, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 2,
    curveSegments: 6,
  });
  triggerGeometry.translate(0, 0, -0.015);
  add(new Mesh(triggerGeometry, metal));
  const rivet = add(new Mesh(new CylinderGeometry(0.011, 0.011, 0.05, 12), bright));
  rivet.rotation.x = Math.PI / 2;
  rivet.position.set(0.004, top - 0.065, 0);
  // The hook: down the trigger, through both slots along the view axis, curling up in front.
  const p = HOOK.pin;
  const hookCurve = new CatmullRomCurve3(
    [
      new Vector3(0.0, top - 0.22, -0.01),
      new Vector3(0.018, p + 0.07, -0.04),
      new Vector3(0.016, p + 0.01, -0.035),
      new Vector3(0.0, p - 0.012, 0.0),
      new Vector3(-0.03, p - 0.01, 0.04),
      new Vector3(-0.062, p + 0.03, 0.058),
      new Vector3(-0.07, p + 0.075, 0.055),
    ],
    false,
    "catmullrom",
    0.5,
  );
  add(new Mesh(new TubeGeometry(hookCurve, 48, 0.021, 10, false), metal));
  const tip = add(new Mesh(new SphereGeometry(0.022, 14, 10), metal));
  tip.position.set(-0.07, p + 0.075, 0.055);
  // Spring gate from the trigger towards the tip.
  const gate = new CatmullRomCurve3([new Vector3(-0.05, top - 0.12, 0), new Vector3(-0.072, p + 0.09, 0.03)]);
  add(new Mesh(new TubeGeometry(gate, 8, 0.009, 8, false), metal));
  return group;
}

/** A strap: a thin woven band whose cross-section follows the twist between its ends. */
class StrapMesh {
  readonly mesh: Mesh;
  private readonly geometry = new BufferGeometry();
  private readonly samples = 44;
  private readonly position: Float32Array;
  private readonly normal: Float32Array;
  private readonly uv: Float32Array;
  constructor(material: Material, private readonly width = STRAP.width) {
    const n = this.samples;
    // 4 faces × 2 vertices per sample.
    this.position = new Float32Array(n * 8 * 3);
    this.normal = new Float32Array(n * 8 * 3);
    this.uv = new Float32Array(n * 8 * 2);
    const index: number[] = [];
    for (let face = 0; face < 4; face++)
      for (let k = 0; k < n - 1; k++) {
        const a = k * 8 + face * 2,
          b = a + 1,
          c = a + 8,
          d = b + 8;
        index.push(a, c, b, b, c, d);
      }
    this.geometry.setIndex(index);
    this.geometry.setAttribute("position", new BufferAttribute(this.position, 3));
    this.geometry.setAttribute("normal", new BufferAttribute(this.normal, 3));
    this.geometry.setAttribute("uv", new BufferAttribute(this.uv, 2));
    this.mesh = new Mesh(this.geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false;
  }

  /** Rebuilds the band through `points`, turning from `widthTop` to `widthBottom`. */
  update(points: Vector3[], widthTop: Vector3, widthBottom: Vector3) {
    const curve = new CatmullRomCurve3(points, false, "centripetal");
    const n = this.samples;
    const hw = this.width / 2,
      ht = STRAP.thickness / 2;
    const P = this.position,
      N = this.normal,
      U = this.uv;
    const p = new Vector3(),
      t = new Vector3(),
      w = new Vector3(),
      b = new Vector3(),
      c = new Vector3();
    let length = 0;
    const prev = new Vector3();
    for (let k = 0; k < n; k++) {
      const s = k / (n - 1);
      curve.getPointAt(s, p);
      curve.getTangentAt(s, t);
      if (k > 0) length += p.distanceTo(prev);
      prev.copy(p);
      const blend = s * s * (3 - 2 * s);
      w.copy(widthTop).lerp(widthBottom, blend);
      w.addScaledVector(t, -w.dot(t));
      if (w.lengthSq() < 1e-8) w.set(1, 0, 0);
      w.normalize();
      b.crossVectors(t, w).normalize();
      const corners = [
        [-hw, ht],
        [hw, ht],
        [hw, -ht],
        [-hw, -ht],
      ] as const;
      const normals = [b, w, b.clone().negate(), w.clone().negate()];
      for (let face = 0; face < 4; face++) {
        const [ax, ay] = corners[face]!,
          [bx, by] = corners[(face + 1) % 4]!;
        const normal = normals[face]!;
        for (let j = 0; j < 2; j++) {
          const [x, y] = j ? [bx, by] : [ax, ay];
          c.copy(p).addScaledVector(w, x).addScaledVector(b, y);
          const o = (k * 8 + face * 2 + j) * 3;
          P[o] = c.x;
          P[o + 1] = c.y;
          P[o + 2] = c.z;
          N[o] = normal.x;
          N[o + 1] = normal.y;
          N[o + 2] = normal.z;
          const q = (k * 8 + face * 2 + j) * 2;
          U[q] = face % 2 === 0 ? (x + hw) / (2 * hw) : 0.5;
          U[q + 1] = length / (STRAP.width * 2);
        }
      }
    }
    this.geometry.attributes.position!.needsUpdate = true;
    this.geometry.attributes.normal!.needsUpdate = true;
    this.geometry.attributes.uv!.needsUpdate = true;
    this.geometry.computeBoundingSphere();
  }
}

const v = new Vector3();
const q = new Quaternion();
const toThree = (body: Body, target: Object3D) => {
  target.position.set(body.p.x, body.p.y, body.p.z);
  target.quaternion.set(body.q.x, body.q.y, body.q.z, body.q.w);
};

export class BadgeScene {
  readonly canvas: HTMLCanvasElement;
  private readonly options: BadgeSceneOptions;
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly model = new Group();
  private readonly camera = new PerspectiveCamera(16, VIEW.singleAspect, 0.1, 60);
  private rigs: [BadgeRig, BadgeRig];
  private readonly rigRoots: [Group, Group] = [new Group(), new Group()];
  private layout: "single" | "pair" = "single";
  private cards: [Group, Group] | null = null;
  private cardArt: [Group, Group] | null = null;
  private crimps: [Group, Group] = [new Group(), new Group()];
  private hooks: [Group, Group] = [new Group(), new Group()];
  private straps: [[StrapMesh, StrapMesh], [StrapMesh, StrapMesh]] | null = null;
  private textures: Texture[] = [];
  private active = false;
  private running = false;
  private last = 0;
  private frame = 0;
  private dragging = -1;
  private dragPointer: number | null = null;
  private pendingPointer: { event: PointerEvent; index: 0 | 1; local: Vector3; x: number; y: number } | null = null;
  private readonly flipAngles = [0, 0];
  private readonly flipTargets = [0, 0];
  private readonly sheen = [0, 0];
  private readonly sheenTargets = [0, 0];
  private focusedCard: 0 | 1 = 0;
  private readonly dragLocal = new Vector3();
  private readonly dragPointerStart = new Vector3();
  private readonly dragPhysicalStart = new Vector3();
  private disposed = false;
  private contextLost = false;
  private initialized = false;
  private grabPlane = new Plane();
  private touched = false;
  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2();

  constructor(canvas: HTMLCanvasElement, options: BadgeSceneOptions) {
    this.canvas = canvas;
    this.options = options;
    const renderer = (this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    }));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, matchMedia("(max-width:760px)").matches ? 1.5 : 2));
    renderer.outputColorSpace = SRGBColorSpace;
    // Printed colours stay as drawn: no tone curve, light balanced to about 1 on a facing card.
    renderer.toneMapping = NoToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    renderer.setClearColor(0x000000, 0);
    this.rigs = [new BadgeRig(RIG, { enter: false, single: true }), new BadgeRig(RIG, { enter: false, single: true })];
    this.camera.position.set(0, VIEW.y, VIEW.z);
    this.camera.lookAt(0, VIEW.y, 0);
    this.scene.add(this.model);
    this.model.add(...this.rigRoots);
    this.canvas.addEventListener("webglcontextlost", this.onContextLost);
    this.canvas.addEventListener("webglcontextrestored", this.onContextRestored);
  }

  /** Builds materials, textures and meshes. Resolves when the first frame is drawn. */
  async init() {
    const { renderer, scene } = this;
    const pmrem = new PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    scene.environment = environment;
    scene.environmentIntensity = 0.38;
    this.textures.push(environment);

    scene.add(new HemisphereLight("#fffdf6", "#aebfb1", 0.62));
    const key = new DirectionalLight("#ffffff", 1.05);
    key.position.set(-3.2, 6.6, 7.6);
    key.target.position.set(0, 0.7, 0);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    const sc = key.shadow.camera;
    sc.left = -3.6;
    sc.right = 3.6;
    sc.top = 5.2;
    sc.bottom = -2.8;
    sc.near = 2;
    sc.far = 24;
    key.shadow.radius = 7;
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.02;
    scene.add(key, key.target);
    const fill = new DirectionalLight("#e5efe2", 0.22);
    fill.position.set(4, 2, 6);
    scene.add(fill);

    const wall = new Mesh(new PlaneGeometry(40, 40), new ShadowMaterial({ color: "#224232", opacity: 0.12 }));
    wall.position.z = WALL_Z;
    wall.receiveShadow = true;
    scene.add(wall);

    const [front, back] = await Promise.all([maestroCard(this.options.front), lumeCard(this.options.back)]);
    if (this.disposed) return;
    // Each physical parent belongs to its own suspension. A local art turn
    // never changes the solver's quaternion or the neighboring card.
    this.cardArt = [cardMesh(front, "#f1f2f5", renderer), cardMesh(back, "#1b1a1f", renderer)];
    this.cards = [new Group(), new Group()];
    this.cards.forEach((card, i) => card.add(this.cardArt![i]!));
    this.rigRoots.forEach((root, i) => root.add(this.cards![i]!));

    const metal = new MeshStandardMaterial({ color: "#9baba3", metalness: 0.72, roughness: 0.38, envMapIntensity: 1.5 });
    const bright = new MeshStandardMaterial({ color: "#e4e6ea", metalness: 1, roughness: 0.25, envMapIntensity: 1.6 });
    const brushedTexture = texture(brushed(), renderer);
    this.textures.push(brushedTexture);
    const steel = new MeshPhysicalMaterial({
      color: "#ffffff",
      map: brushedTexture,
      metalness: 0.55,
      roughness: 0.36,
      anisotropy: 0.6,
      anisotropyRotation: Math.PI / 2,
      envMapIntensity: 1.6,
    });
    const weaveTexture = texture(weave(), renderer);
    weaveTexture.wrapS = weaveTexture.wrapT = RepeatWrapping;
    this.textures.push(weaveTexture);
    const fabric = new MeshStandardMaterial({ map: weaveTexture, roughness: 0.94, metalness: 0 });

    const sleeve = new Mesh(new RoundedBoxGeometry(CRIMP.w, CRIMP.h, CRIMP.d, 4, 0.032), steel);
    sleeve.castShadow = sleeve.receiveShadow = true;
    // The strap loops out under the sleeve and around the eye bar.
    const loopLength = -CRIMP.loop - CRIMP.h / 2;
    const loop = new Mesh(new RoundedBoxGeometry(STRAP.width * 0.92, loopLength, 0.03, 2, 0.008), fabric);
    loop.position.y = -CRIMP.h / 2 - loopLength / 2 + 0.01;
    loop.castShadow = loop.receiveShadow = true;
    const wrap = new Mesh(new CylinderGeometry(0.03, 0.03, STRAP.width * 0.92, 16, 1, false, 0, Math.PI), fabric);
    wrap.rotation.z = Math.PI / 2;
    wrap.position.y = CRIMP.loop + 0.012;
    wrap.castShadow = true;
    this.crimps[0].add(sleeve, loop, wrap);
    this.hooks[0].add(hookMesh(metal, bright));
    this.crimps[1] = this.crimps[0].clone(true);
    this.hooks[1] = this.hooks[0].clone(true);
    this.straps = [
      [new StrapMesh(fabric, SHORT_STRAP.width * .58), new StrapMesh(fabric, SHORT_STRAP.width * .58)],
      [new StrapMesh(fabric, SHORT_STRAP.width * .58), new StrapMesh(fabric, SHORT_STRAP.width * .58)],
    ];
    this.rigRoots.forEach((root, i) => {
      const scale = this.rigs[i]!.suspensionScale;
      this.crimps[i]!.scale.set(scale * .76, scale, scale);
      this.hooks[i]!.scale.set(scale * .84, scale, scale);
      root.add(this.crimps[i]!, this.hooks[i]!, this.straps![i]![0].mesh, this.straps![i]![1].mesh);
    });

    this.canvas.addEventListener("pointerdown", this.onDown);
    this.canvas.addEventListener("pointermove", this.onMove);
    this.canvas.addEventListener("pointerup", this.onUp);
    this.canvas.addEventListener("pointercancel", this.onUp);
    this.canvas.addEventListener("lostpointercapture", this.onUp);
    this.canvas.addEventListener("pointerleave", this.onLeave);
    this.resize();
    this.sync();
    await renderer.compileAsync(scene, this.camera);
    if (this.disposed || this.contextLost) throw new Error("Cena interrompida antes do primeiro frame.");
    this.initialized = true;
    await this.present();
  }

  resize() {
    if (this.disposed || this.contextLost) return;
    const w = this.canvas.clientWidth || 1,
      h = this.canvas.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    const aspect = w / h;
    this.camera.aspect = aspect;
    const layout = w >= 540 ? "pair" : "single";
    if (layout !== this.layout) this.releasePointer();
    this.layout = layout;
    this.canvas.dataset.layout = layout;
    const referenceAspect = layout === "pair" ? VIEW.pairAspect : VIEW.singleAspect;
    const height = VIEW.height * Math.max(1, referenceAspect / aspect);
    this.camera.fov = 2 * Math.atan(height / (2 * VIEW.z)) * 180 / Math.PI;
    this.camera.updateProjectionMatrix();
    if (this.initialized && !this.running) this.draw();
  }

  /** Runs while the section is visible and the page is not paused. */
  setActive(active: boolean) {
    this.active = active;
    if (active) this.wake();
    else {
      this.releasePointer();
      this.sleep();
      this.sheen.fill(0);
      this.sheenTargets.fill(0);
      this.flipTargets.forEach((target, i) => { this.flipAngles[i] = target; });
      // A paused reading view rests frontally instead of freezing mid-drag.
      if (this.initialized) this.rest();
    }
  }

  /** A gentle push, for the keyboard and the swing button. */
  swing(direction: 1 | -1 = 1) {
    if (!this.active || this.disposed || this.contextLost) return;
    this.touch();
    this.rigs[this.focusedCard].swing(direction);
    this.wake();
  }

  /** Deliberate access to the printed roles on the reverse, including while paused. */
  setFlipped(flipped: boolean, animate = true) {
    this.setCardFlipped(0, flipped, animate);
    this.setCardFlipped(1, flipped, animate);
  }

  /** Inspect one card while its companion keeps its own face and motion. */
  setCardFlipped(index: 0 | 1, flipped: boolean, animate = true) {
    if (this.disposed || this.contextLost) return;
    this.rigs[index].inspect();
    this.flipTargets[index] = flipped ? Math.PI : 0;
    this.setSelectedCard(index, false);
    this.releasePointer();
    this.options.onCardFlip?.(index, flipped);
    if (!animate || !this.active) {
      this.flipAngles[index] = this.flipTargets[index]!;
      this.draw();
    } else this.wake();
  }

  /** Select one piece without changing either face or applying physical force. */
  setSelectedCard(index: 0 | 1, _animate = true) {
    if (this.disposed) return;
    const changed = this.focusedCard !== index;
    if (changed) this.releasePointer();
    this.focusedCard = index;
    this.canvas.dataset.selectedCard = String(index);
    if (changed) this.options.onCardSelect?.(index);
    if (this.initialized && !this.contextLost) this.draw();
  }

  /** PNG of the current frame (used to make the reduced-motion poster). */
  snapshot() {
    this.draw();
    return this.canvas.toDataURL("image/png");
  }

  /** Jumps straight to the resting badge without the entrance. */
  rest() {
    this.releasePointer();
    this.rigs = [new BadgeRig(RIG, { enter: false, single: true }), new BadgeRig(RIG, { enter: false, single: true })];
    this.draw();
  }

  /** Replays the entrance up to clip time `t` in fixed steps (for comparisons with the reference). */
  seek(t: number) {
    this.rest();
    // Seeking is deterministic; the readable scene has no falling entrance.
    this.rigs.forEach(rig => { while (rig.clipTime < t) rig.tick(); });
    this.draw();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.releasePointer();
    this.sleep();
    this.canvas.removeEventListener("pointerdown", this.onDown);
    this.canvas.removeEventListener("pointermove", this.onMove);
    this.canvas.removeEventListener("pointerup", this.onUp);
    this.canvas.removeEventListener("pointercancel", this.onUp);
    this.canvas.removeEventListener("lostpointercapture", this.onUp);
    this.canvas.removeEventListener("pointerleave", this.onLeave);
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.canvas.removeEventListener("webglcontextrestored", this.onContextRestored);
    this.scene.traverse((object) => {
      const mesh = object as Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = mesh.material as Material | Material[] | undefined;
      const materials = Array.isArray(material) ? material : material ? [material] : [];
      materials.forEach(m => {
        (m as MeshStandardMaterial).map?.dispose();
        m.dispose();
      });
    });
    for (const t of this.textures) t.dispose();
    this.renderer.dispose();
  }

  private wake() {
    if (this.running || !this.active || !this.initialized || this.disposed || this.contextLost) return;
    this.running = true;
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }
  private sleep() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  private tick = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.rigs.forEach(rig => rig.advance(dt));
    let turning = false;
    let highlighting = false;
    this.sheenTargets.forEach((target, index) => {
      const difference = target - this.sheen[index]!;
      this.sheen[index] = Math.abs(difference) < .005 ? target : this.sheen[index]! + difference * (1 - Math.exp(-dt * 12));
      highlighting ||= Math.abs(difference) >= .005;
    });
    // A grabbed card keeps its inspection pose until release. No animation
    // changes the grabbed point underneath an active pointer.
    if (this.dragging < 0 && !this.pendingPointer) this.flipTargets.forEach((target, i) => {
      const turn = target - this.flipAngles[i]!;
      const step = Math.min(Math.abs(turn) * (1 - Math.exp(-dt * 12)), dt * 7);
      this.flipAngles[i] = Math.abs(turn) < .001 ? target : this.flipAngles[i]! + Math.sign(turn) * step;
      turning ||= Math.abs(turn) >= .001;
    });
    this.draw();
    if (this.rigs.some(rig => rig.moving) || this.dragging >= 0 || turning || highlighting) this.frame = requestAnimationFrame(this.tick);
    else {
      this.running = false;
      this.options.onRest?.();
    }
  };

  private draw() {
    if (this.disposed || this.contextLost) return;
    this.sync();
    this.renderer.render(this.scene, this.camera);
  }

  /** Keep the HTML poster until shader compilation and a complete compositing turn. */
  private async present() {
    this.draw();
    await new Promise<void>(resolve => requestAnimationFrame(() => {
      this.draw();
      requestAnimationFrame(() => resolve());
    }));
  }

  private onContextLost = (event: Event) => {
    event.preventDefault();
    this.contextLost = true;
    this.releasePointer();
    this.sleep();
    this.options.onContextLost?.();
  };

  private onContextRestored = async () => {
    if (this.disposed || !this.initialized) return;
    this.contextLost = false;
    try {
      this.resize();
      await this.renderer.compileAsync(this.scene, this.camera);
      await this.present();
      if (this.disposed || this.contextLost) return;
      this.options.onContextRestored?.();
      this.wake();
    } catch (error) { this.options.onError?.(error); }
  };

  private sync() {
    if (!this.cards || !this.straps) return;
    this.rigs.forEach((rig, index) => {
      const root = this.rigRoots[index]!;
      root.visible = this.layout === "pair" || index === this.focusedCard;
      root.position.x = this.layout === "pair" ? (index === 0 ? -1.01 : 1.01) : 0;
      toThree(rig.cards[0], this.cards![index]!);
      const art = this.cardArt![index]!;
      art.children.forEach(child => {
        if (child instanceof Mesh && child.material instanceof MeshPhysicalMaterial) child.material.clearcoat = .22 + this.sheen[index]! * .22;
      });
      art.rotation.y = this.flipAngles[index]!;
      // Lift through the turn so the printed edge never crosses the shadow wall.
      art.position.z = Math.sin(this.flipAngles[index]!) * .46;
      toThree(rig.crimp, this.crimps[index]!);
      toThree(rig.hook, this.hooks[index]!);
      const scale = rig.suspensionScale;
      const crimpQ = q.set(rig.crimp.q.x, rig.crimp.q.y, rig.crimp.q.z, rig.crimp.q.w);
      const across = new Vector3(1, 0, 0).applyQuaternion(crimpQ);
      const [aL, aR] = rig.anchors;
      const top = new Vector3(aR.p.x - aL.p.x, aR.p.y - aL.p.y, aR.p.z - aL.p.z).normalize();
      rig.straps.forEach((list, i) => {
        const anchor = rig.anchors[i]!;
        const side = i === 0 ? -1 : 1;
        const points = [new Vector3(anchor.p.x, anchor.p.y + .05, anchor.p.z), new Vector3(anchor.p.x, anchor.p.y, anchor.p.z)];
        for (const b of list) points.push(new Vector3(b.p.x, b.p.y, b.p.z));
        for (const depth of [0, -.12]) {
          v.set(side * STRAP.attachX * scale, (CRIMP.h / 2 + depth) * scale, side * -STRAP.attachZ * scale).applyQuaternion(crimpQ);
          points.push(new Vector3(rig.crimp.p.x + v.x, rig.crimp.p.y + v.y, rig.crimp.p.z + v.z));
        }
        this.straps![index]![i]!.update(points, top, across);
      });
    });
  }

  private ray(event: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster;
  }
  private pick(event: PointerEvent) {
    if (!this.cards) return null;
    const visibleCards = this.cards.filter((_, i) => this.rigRoots[i]!.visible);
    const hits = this.ray(event).intersectObjects(visibleCards, true);
    const hit = hits[0];
    if (!hit) return null;
    let object: Object3D | null = hit.object;
    while (object && object !== this.cards[0] && object !== this.cards[1]) object = object.parent;
    const index = object === this.cards[0] ? 0 : 1;
    return { index: index as 0 | 1, point: hit.point };
  }
  private touch() {
    if (this.touched) return;
    this.touched = true;
    this.options.onTouch?.();
  }

  private beginDrag(pending: NonNullable<BadgeScene["pendingPointer"]>) {
    const { event, index } = pending;
    this.setSelectedCard(index, false);
    this.canvas.setPointerCapture(event.pointerId);
    this.dragPointer = event.pointerId;
    this.dragLocal.copy(pending.local);
    // Freeze the selected material point and pointer origin once. Recomputing
    // a rotating visual offset for every move creates a feedback loop at the
    // reverse face and can inject very large constraint impulses.
    const visualPoint = this.cardArt![index].localToWorld(this.dragLocal.clone());
    this.grabPlane.set(new Vector3(0, 0, 1), -visualPoint.z);
    if (!this.ray(event).ray.intersectPlane(this.grabPlane, this.dragPointerStart)) {
      this.releasePointer(); return;
    }
    this.dragPhysicalStart.copy(this.cards![index].localToWorld(this.dragLocal.clone()));
    const target = this.rigRoots[index].worldToLocal(this.dragPhysicalStart.clone());
    this.rigs[index].grab(0, this.dragLocal, { x: target.x, y: target.y, z: target.z });
    this.dragging = index;
    this.canvas.style.cursor = "grabbing";
    this.touch();
    this.wake();
  }
  private onDown = (event: PointerEvent) => {
    if (!this.active || !event.isPrimary || event.button !== 0 || this.dragPointer !== null) return;
    const hit = this.pick(event);
    // Defer capture until intent is known. A short click/tap turns a card;
    // touch pan-y remains the browser's gesture and never becomes a flip.
    if (hit) this.pendingPointer = {
      event, index: hit.index,
      local: this.cardArt![hit.index].worldToLocal(hit.point.clone()),
      x: event.clientX, y: event.clientY,
    };
  };
  private onMove = (event: PointerEvent) => {
    if (!this.active) return;
    if (this.pendingPointer && event.pointerId === this.pendingPointer.event.pointerId) {
      const pending = this.pendingPointer;
      const dx = event.clientX - pending.x;
      const dy = event.clientY - pending.y;
      if (event.pointerType === "touch" && Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) {
        this.pendingPointer = null;
      } else if (event.pointerType === "touch"
        ? Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.3
        : Math.hypot(dx, dy) > 8) {
        this.beginDrag(pending);
        this.pendingPointer = null;
      }
    }
    if (this.dragging >= 0 && event.pointerId === this.dragPointer) {
      const target = new Vector3();
      if (this.ray(event).ray.intersectPlane(this.grabPlane, target)) {
        target.sub(this.dragPointerStart).add(this.dragPhysicalStart);
        this.rigRoots[this.dragging]!.worldToLocal(target);
        this.rigs[this.dragging]!.drag({ x: target.x, y: target.y, z: target.z });
      }
      return;
    }
    if (event.pointerType === "mouse") {
      const hit = this.pick(event);
      this.canvas.style.cursor = hit ? "grab" : "";
      this.sheenTargets.forEach((_, index) => { this.sheenTargets[index] = hit?.index === index ? 1 : 0; });
      this.wake();
    }
  };
  private onUp = (event: PointerEvent) => {
    const pending = this.pendingPointer;
    if (pending?.event.pointerId === event.pointerId) this.pendingPointer = null;
    if (this.dragPointer === event.pointerId) {
      this.releasePointer();
      this.wake();
      return;
    }
    if (event.type !== "pointerup" || !pending || pending.event.pointerId !== event.pointerId) return;
    if (Math.hypot(event.clientX - pending.x, event.clientY - pending.y) > 10) return;
    this.touch();
    // Selection belongs to pointerdown, even if another face passes underneath
    // during the gesture. A tap never creates a drag joint or applies force.
    if (pending.index !== this.focusedCard) this.setSelectedCard(pending.index);
    this.setCardFlipped(pending.index, this.flipTargets[pending.index] === 0);
  };
  private releasePointer() {
    this.pendingPointer = null;
    this.dragging = -1;
    this.rigs.forEach(rig => rig.release());
    const pointer = this.dragPointer;
    this.dragPointer = null;
    if (pointer !== null && this.canvas.hasPointerCapture(pointer)) this.canvas.releasePointerCapture(pointer);
    this.canvas.style.cursor = "";
  }
  private onLeave = () => {
    if (this.dragging < 0) {
      this.pendingPointer = null;
      this.canvas.style.cursor = "";
      this.sheenTargets.fill(0);
      this.wake();
    }
  };
}
