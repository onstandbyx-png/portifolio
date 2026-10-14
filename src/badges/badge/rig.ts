/*
 * The badge rig: two straps in a V, a metal crimp, a swivel snap hook and two
 * cards hanging from the same pin. Units are card widths of 1.6, y up, the
 * resting front card centred near the origin and the camera on +z.
 *
 * The entrance is a performance: the front card follows the pose tracked from
 * the reference clip (track.ts) while everything else, the back card included,
 * is simulated hanging from it. When the track ends, or as soon as someone grabs
 * a card, the front card joins the simulation and the badge is fully physical.
 * Numbers marked "fitted" come from scripts/badge/fit-back.mjs.
 */
import {
  Body,
  Joint,
  PlateOrder,
  World,
  axisAngle,
  boxInertia,
  copy,
  copyQuat,
  multiplyQuat,
  quat,
  rotate,
  v3,
  type Quat,
  type V3,
} from "./physics";
import { TRACK } from "./track";

export const CARD = { w: 1.6, h: 2.077, d: 0.025 };
/** Slot centre, measured from the card centre. */
export const SLOT_Y = 0.93;
/** Metal crimp holding both strap ends; the strap loops out below it at `loop`. */
export const CRIMP = { w: 0.285, h: 0.34, d: 0.08, y: 1.835, loop: -0.31 };
/** Swivel snap hook: eye bar joined to the crimp loop at `top`, bar through the slots at `pin`. */
export const HOOK = { y: 1.345, top: 0.18, pin: -0.415 };
/** Straps enter the crimp almost on top of each other, one slightly in front. */
export const STRAP = { anchorX: 0.71, anchorY: 4.6, attachX: 0.035, attachZ: 0.015, points: 7, width: 0.25, thickness: 0.014 };

export type RigParams = {
  /** Gravity once the badge hangs; fitted with the back card's motion. */
  gravity: number;
  cardMass: number;
  backMass: number;
  hookMass: number;
  crimpMass: number;
  strapMass: number;
  cardAngularDamping: number;
  cardLinearDamping: number;
  backAngularDamping: number;
  backLinearDamping: number;
  hookAngularDamping: number;
  hookLinearDamping: number;
  strapLinearDamping: number;
  /** Strap length beyond the resting distance, as a fraction. */
  strapSlack: number;
  /** Lateral offset of the back card's slot and of its place along the hook. */
  backPinX: number;
  backHookX: number;
  /** Back card at the start of the entrance, relative to the front card. */
  backRoll: number;
  backSpin: number;
};

/** Fitted against the reference clip; see the header. */
export const RIG: RigParams = {
  gravity: 6, // fitted
  cardMass: 1,
  backMass: 1.1712, // fitted
  hookMass: 0.2,
  crimpMass: 0.15,
  strapMass: 0.08,
  cardAngularDamping: 0.65,
  cardLinearDamping: 0.25,
  backAngularDamping: 3.6452, // fitted
  backLinearDamping: 0, // fitted
  hookAngularDamping: 2.3048, // fitted
  hookLinearDamping: 0.2585, // fitted
  strapLinearDamping: 1.6,
  strapSlack: 0.003,
  backPinX: 0.0099, // fitted
  backHookX: -0.0034, // fitted
  backRoll: 0.3628, // fitted
  backSpin: -2.1099, // fitted
};

/** Yaw of the lanyard's hidden top while it drops in: the V turns edge-on and opens again. */
const YAW = { t: [0.1333, 0.6667, 1.0, 1.25, 1.55], v: [1.0, 1.15, 1.45, 0.8, 0] };

export const STEP = 1 / 120;
const SUBSTEPS = 5;
const DEG = Math.PI / 180;
const T0 = TRACK.t[0]!;
/** Clip time where the track ends. */
export const TRACK_END = TRACK.t[TRACK.t.length - 1]!;

type Sample = { x: number; y: number; z: number; roll: number; yaw: number };
const sample = (): Sample => ({ x: 0, y: 0, z: 0, roll: 0, yaw: 0 });

/** Cubic Hermite (Catmull–Rom tangents) sample of a keyed series at time t. */
function sampleKeys(keys: readonly number[], values: readonly number[], t: number) {
  const n = keys.length;
  if (t <= keys[0]!) return values[0]!;
  if (t >= keys[n - 1]!) return values[n - 1]!;
  let lo = 0,
    hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (keys[mid]! <= t) lo = mid;
    else hi = mid;
  }
  const i = lo;
  const t1 = keys[i]!,
    t2 = keys[i + 1]!;
  const s = (t - t1) / (t2 - t1);
  const i0 = Math.max(0, i - 1),
    i3 = Math.min(n - 1, i + 2);
  const p0 = values[i0]!,
    p1 = values[i]!,
    p2 = values[i + 1]!,
    p3 = values[i3]!;
  const d1 = (p2 - p0) / (keys[i + 1]! - keys[i0]! || 1);
  const d2 = (p3 - p1) / (keys[i3]! - keys[i]! || 1);
  const h = t2 - t1;
  const s2 = s * s,
    s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * p1 + (s3 - 2 * s2 + s) * h * d1 + (-2 * s3 + 3 * s2) * p2 + (s3 - s2) * h * d2;
}

/** Tracked front-card pose at clip time t (offsets from rest, radians). */
export function trackAt(t: number, out: Sample = sample()) {
  const k = TRACK.t;
  out.x = sampleKeys(k, TRACK.x, t);
  out.y = sampleKeys(k, TRACK.y, t);
  out.z = sampleKeys(k, TRACK.z, t);
  out.roll = sampleKeys(k, TRACK.roll, t) * DEG;
  out.yaw = sampleKeys(k, TRACK.yaw, t) * DEG;
  return out;
}

const tmpQ = quat();

export class BadgeRig {
  readonly params: RigParams;
  readonly world = new World();
  readonly anchors: [Body, Body];
  readonly straps: [Body[], Body[]];
  readonly crimp: Body;
  readonly hook: Body;
  /** Front (white) and back (black) cards. */
  readonly cards: [Body, Body];
  /** True while the front card follows the tracked entrance. */
  performing = false;
  private grabJoint: Joint | null = null;
  private accumulator = 0;
  private readonly rest: { front: V3; frontQ: Quat; anchors: [V3, V3] };
  private readonly scratch = sample();
  private readonly catchPose: Sample;

  constructor(params: RigParams = RIG, options: { enter?: boolean } = {}) {
    const P = (this.params = params);
    const w = this.world;
    w.substeps = SUBSTEPS;
    w.gravity = v3(0, -P.gravity, 0);

    const aL = w.add(new Body(0, null, v3(-STRAP.anchorX, STRAP.anchorY, 0)));
    const aR = w.add(new Body(0, null, v3(STRAP.anchorX, STRAP.anchorY, 0)));
    this.anchors = [aL, aR];

    const crimp = (this.crimp = w.add(
      new Body(P.crimpMass, boxInertia(P.crimpMass, CRIMP.w, CRIMP.h, CRIMP.d), v3(0, CRIMP.y, 0)),
    ));
    crimp.linearDamping = P.hookLinearDamping;
    crimp.angularDamping = P.hookAngularDamping;

    const strap = (anchor: Body, attachX: number, attachZ: number) => {
      const from = anchor.p;
      const to = v3(attachX, CRIMP.y + CRIMP.h / 2, attachZ);
      const n = STRAP.points;
      const list: Body[] = [];
      for (let i = 1; i <= n; i++) {
        const s = i / (n + 1);
        const body = w.add(
          new Body(P.strapMass / n, null, v3(from.x + (to.x - from.x) * s, from.y + (to.y - from.y) * s, to.z * s)),
        );
        body.linearDamping = P.strapLinearDamping;
        list.push(body);
      }
      const segment = (Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z) / (n + 1)) * (1 + P.strapSlack);
      const options = { length: segment, rope: true };
      w.join(new Joint(list[0]!, v3(), anchor, v3(), options));
      for (let i = 1; i < n; i++) w.join(new Joint(list[i]!, v3(), list[i - 1]!, v3(), options));
      w.join(new Joint(list[n - 1]!, v3(), crimp, v3(attachX, CRIMP.h / 2, attachZ), options));
      return list;
    };
    this.straps = [strap(aL, -STRAP.attachX, STRAP.attachZ), strap(aR, STRAP.attachX, -STRAP.attachZ)];

    const hook = (this.hook = w.add(new Body(P.hookMass, boxInertia(P.hookMass, 0.3, 0.7, 0.05), v3(0, HOOK.y, 0))));
    hook.linearDamping = P.hookLinearDamping;
    hook.angularDamping = P.hookAngularDamping;
    w.join(new Joint(hook, v3(0, HOOK.top, 0), crimp, v3(0, CRIMP.loop, 0)));

    // The hook's bar runs through both slots along the view axis, so each card
    // hangs on a hinge: two points along the bar. Cards swing about it and turn
    // with the hook, which swivels under the crimp.
    const gap = CARD.d / 2 + 0.004;
    const bar = 0.04;
    const card = (mass: number, z: number, pinX: number, hookX: number, compliance: number) => {
      const body = w.add(new Body(mass, boxInertia(mass, CARD.w, CARD.h, CARD.d), v3(hookX - pinX, 0, z)));
      for (const side of [-1, 1])
        w.join(new Joint(body, v3(pinX, SLOT_Y, -z + side * bar), hook, v3(hookX, HOOK.pin, side * bar), { compliance }));
      return body;
    };
    const front = card(P.cardMass, gap, 0, 0, 0.00005);
    front.angularDamping = P.cardAngularDamping;
    front.linearDamping = P.cardLinearDamping;
    const back = card(P.backMass, -gap, P.backPinX, P.backHookX, 0);
    back.angularDamping = P.backAngularDamping;
    back.linearDamping = P.backLinearDamping;
    this.cards = [front, back];
    w.plates.push(new PlateOrder(front, back, CARD.w / 2, CARD.h / 2, CARD.d / 2));

    this.relax(1.5);
    this.rest = {
      front: copy(v3(), front.p),
      frontQ: copyQuat(quat(), front.q),
      anchors: [copy(v3(), aL.p), copy(v3(), aR.p)],
    };
    this.catchPose = trackAt(TRACK.catch);
    if (options.enter ?? true) this.startPerformance();
    w.time = 0;
  }

  /** Clip time of the current frame. */
  get clipTime() {
    return this.world.time + T0;
  }

  private startPerformance() {
    this.performing = true;
    const w = this.world;
    const [front, back] = this.cards;
    // Back card pose relative to the front card at rest.
    const inv = quat(-front.q.x, -front.q.y, -front.q.z, front.q.w);
    const relQ = multiplyQuat(inv, back.q, quat());
    const relP = rotate(inv, v3(back.p.x - front.p.x, back.p.y - front.p.y, back.p.z - front.p.z), v3());
    const start = trackAt(T0);
    const yaw0 = sampleKeys(YAW.t, YAW.v, T0);
    // Carry the whole resting rig to the start pose: above the frame, turned away.
    const turn = axisAngle(0, 1, 0, yaw0);
    const c = Math.cos(yaw0),
      s = Math.sin(yaw0);
    for (const body of w.bodies) {
      const p = body.p;
      const x = p.x * c + p.z * s,
        z = -p.x * s + p.z * c;
      p.x = x + start.x;
      p.y += start.y;
      p.z = z + start.z;
      multiplyQuat(turn, body.q, body.q);
    }
    front.setKinematic(true);
    front.drive = (t, p, q) => this.frontPose(t + T0, p, q);
    this.anchors.forEach((anchor, i) => {
      const rest = this.rest.anchors[i]!;
      anchor.drive = (t, p, q) => this.anchorPose(rest, t + T0, p, q);
    });
    front.drive(0, front.p, front.q);
    for (const anchor of this.anchors) anchor.drive!(0, anchor.p, anchor.q);
    // The back card keeps its resting place behind the front card…
    multiplyQuat(front.q, relQ, back.q);
    rotate(front.q, relP, back.p);
    back.p.x += front.p.x;
    back.p.y += front.p.y;
    back.p.z += front.p.z;
    // …turned by its own small offset so the two fan apart.
    const pin = v3(this.params.backPinX, SLOT_Y, CARD.d / 2 + 0.004);
    const before = rotate(back.q, pin, v3());
    multiplyQuat(axisAngle(0, 0, 1, this.params.backRoll), back.q, back.q);
    const after = rotate(back.q, pin, v3());
    back.p.x += before.x - after.x;
    back.p.y += before.y - after.y;
    back.p.z += before.z - after.z;
    // Settle the joints in place while still above the frame, then fall with the track.
    w.gravity.y = 0;
    const damp = w.bodies.map((b) => [b.linearDamping, b.angularDamping] as const);
    for (const b of w.bodies) {
      b.linearDamping = 30;
      b.angularDamping = 30;
    }
    for (let i = 0; i < 40; i++) {
      w.time = 0;
      w.step(STEP);
    }
    w.time = 0;
    w.bodies.forEach((b, i) => {
      b.linearDamping = damp[i]![0];
      b.angularDamping = damp[i]![1];
    });
    const ahead = trackAt(T0 + 0.01);
    const vx = (ahead.x - start.x) / 0.01,
      vy = (ahead.y - start.y) / 0.01,
      vz = (ahead.z - start.z) / 0.01;
    for (const b of w.bodies) {
      if (b.kinematic) continue;
      b.v.x = vx;
      b.v.y = vy;
      b.v.z = vz;
      b.w.x = b.w.y = b.w.z = 0;
    }
    back.w.z = this.params.backSpin;
  }

  private frontPose(clip: number, p: V3, q: Quat) {
    const s = trackAt(Math.min(clip, TRACK_END), this.scratch);
    p.x = this.rest.front.x + s.x;
    p.y = this.rest.front.y + s.y;
    p.z = this.rest.front.z + s.z;
    axisAngle(0, 0, 1, s.roll, q);
    multiplyQuat(q, this.rest.frontQ, q);
    multiplyQuat(axisAngle(0, 1, 0, s.yaw, tmpQ), q, q);
  }

  private anchorPose(rest: V3, clip: number, p: V3, q: Quat) {
    let ox = 0,
      oy = 0,
      oz = 0;
    if (clip < TRACK.catch) {
      const s = trackAt(clip, this.scratch);
      ox = s.x - this.catchPose.x;
      oy = s.y - this.catchPose.y;
      oz = s.z - this.catchPose.z;
    }
    const yaw = sampleKeys(YAW.t, YAW.v, clip);
    const c = Math.cos(yaw),
      sn = Math.sin(yaw);
    p.x = rest.x * c + rest.z * sn + ox;
    p.y = rest.y + oy;
    p.z = -rest.x * sn + rest.z * c + oz;
    q.x = q.y = q.z = 0;
    q.w = 1;
  }

  /** Lets the front card join the simulation, keeping its current motion. */
  endPerformance() {
    if (!this.performing) return;
    this.performing = false;
    const [front] = this.cards;
    const clip = Math.min(this.clipTime, TRACK_END);
    const a = trackAt(clip - 0.02),
      b = trackAt(clip);
    front.drive = null;
    front.setKinematic(false);
    front.v.x = (b.x - a.x) / 0.02;
    front.v.y = (b.y - a.y) / 0.02;
    front.v.z = (b.z - a.z) / 0.02;
    front.w.x = 0;
    front.w.y = (b.yaw - a.yaw) / 0.02;
    front.w.z = (b.roll - a.roll) / 0.02;
    this.anchors.forEach((anchor, i) => {
      const rest = this.rest.anchors[i]!;
      anchor.drive = (_t, p, q) => {
        copy(p, rest);
        q.x = q.y = q.z = 0;
        q.w = 1;
      };
    });
    this.world.gravity.y = -this.params.gravity;
  }

  /** Runs the resting rig with heavy damping until it hangs still. */
  private relax(seconds: number) {
    const w = this.world;
    const damp = w.bodies.map((b) => [b.linearDamping, b.angularDamping] as const);
    for (const b of w.bodies) {
      b.linearDamping = 20;
      b.angularDamping = 20;
    }
    for (let t = 0; t < seconds; t += STEP) w.step(STEP);
    w.bodies.forEach((b, i) => {
      b.linearDamping = damp[i]![0];
      b.angularDamping = damp[i]![1];
      b.v.x = b.v.y = b.v.z = 0;
      b.w.x = b.w.y = b.w.z = 0;
    });
  }

  /** Advances by real elapsed time in fixed steps, so every visit plays the same motion. */
  advance(dt: number) {
    this.accumulator = Math.min(this.accumulator + dt, 0.1);
    let steps = 0;
    while (this.accumulator >= STEP) {
      this.tick();
      this.accumulator -= STEP;
      steps++;
    }
    return steps;
  }

  tick() {
    if (this.performing) {
      const clip = this.clipTime;
      if (clip >= TRACK_END) this.endPerformance();
      else this.world.gravity.y = clip < TRACK.catch ? -TRACK.fall : -this.params.gravity;
    }
    this.world.step(STEP);
  }

  /** True while anything still moves visibly. */
  get moving() {
    if (this.performing || this.grabJoint) return true;
    for (const b of this.world.bodies) {
      if (b.kinematic) continue;
      if (Math.hypot(b.v.x, b.v.y, b.v.z) > 0.003 || Math.hypot(b.w.x, b.w.y, b.w.z) > 0.003) return true;
    }
    return false;
  }

  /** Starts dragging card `index` by a local point, toward world point `target`. */
  grab(index: 0 | 1, local: V3, target: V3) {
    this.endPerformance();
    this.release();
    this.grabJoint = this.world.join(new Joint(this.cards[index], local, null, target, { compliance: 0.002 }));
  }
  drag(target: V3) {
    if (this.grabJoint) copy(this.grabJoint.lb, target);
  }
  release() {
    if (!this.grabJoint) return;
    const list = this.world.joints;
    list.splice(list.indexOf(this.grabJoint), 1);
    this.grabJoint = null;
  }
  get grabbing() {
    return !!this.grabJoint;
  }

  /** A sideways push, for the keyboard and the swing button. */
  swing(direction: 1 | -1 = 1) {
    this.endPerformance();
    const [front, back] = this.cards;
    front.w.z += 0.9 * direction;
    back.w.z += 0.6 * direction;
    this.hook.w.z += 0.3 * direction;
  }
}
