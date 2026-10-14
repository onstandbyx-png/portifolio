/*
 * Small rigid-body solver for the hanging badges.
 *
 * Extended Position Based Dynamics with substeps and one iteration per substep
 * (Macklin et al. 2019, "Small Steps in Physics Simulation"; Müller et al. 2020,
 * "Detailed Rigid Body Simulation with Extended Position Based Dynamics").
 * It only knows what the badge needs: point and rigid bodies, ball joints,
 * rope limits, a soft drag handle and a contact that keeps one card in front of
 * the other. No allocations happen inside the step.
 *
 * Pure TypeScript with no browser APIs, so the same code runs in the page and in
 * the calibration script that fits it to the reference clip.
 */

export type V3 = { x: number; y: number; z: number };
export type Quat = { x: number; y: number; z: number; w: number };

export const v3 = (x = 0, y = 0, z = 0): V3 => ({ x, y, z });
export const quat = (x = 0, y = 0, z = 0, w = 1): Quat => ({ x, y, z, w });

export function copy(out: V3, a: V3) {
  out.x = a.x;
  out.y = a.y;
  out.z = a.z;
  return out;
}
export function copyQuat(out: Quat, a: Quat) {
  out.x = a.x;
  out.y = a.y;
  out.z = a.z;
  out.w = a.w;
  return out;
}

/** out = q · v · q⁻¹ (out may alias v). */
export function rotate(q: Quat, v: V3, out: V3): V3 {
  const vx = v.x,
    vy = v.y,
    vz = v.z;
  const tx = 2 * (q.y * vz - q.z * vy);
  const ty = 2 * (q.z * vx - q.x * vz);
  const tz = 2 * (q.x * vy - q.y * vx);
  out.x = vx + q.w * tx + (q.y * tz - q.z * ty);
  out.y = vy + q.w * ty + (q.z * tx - q.x * tz);
  out.z = vz + q.w * tz + (q.x * ty - q.y * tx);
  return out;
}
/** out = q⁻¹ · v · q (out may alias v). */
export function rotateInv(q: Quat, v: V3, out: V3): V3 {
  const vx = v.x,
    vy = v.y,
    vz = v.z;
  const qx = -q.x,
    qy = -q.y,
    qz = -q.z;
  const tx = 2 * (qy * vz - qz * vy);
  const ty = 2 * (qz * vx - qx * vz);
  const tz = 2 * (qx * vy - qy * vx);
  out.x = vx + q.w * tx + (qy * tz - qz * ty);
  out.y = vy + q.w * ty + (qz * tx - qx * tz);
  out.z = vz + q.w * tz + (qx * ty - qy * tx);
  return out;
}
export function normalizeQuat(q: Quat) {
  const l = Math.hypot(q.x, q.y, q.z, q.w) || 1;
  q.x /= l;
  q.y /= l;
  q.z /= l;
  q.w /= l;
  return q;
}
/** q ← normalize(q + ½·[u, 0]·q): applies a small rotation vector u. */
export function addRotation(q: Quat, ux: number, uy: number, uz: number) {
  const x = q.x,
    y = q.y,
    z = q.z,
    w = q.w;
  q.x += 0.5 * (ux * w + uy * z - uz * y);
  q.y += 0.5 * (uy * w + uz * x - ux * z);
  q.z += 0.5 * (uz * w + ux * y - uy * x);
  q.w += 0.5 * (-ux * x - uy * y - uz * z);
  normalizeQuat(q);
}
/** Quaternion from an axis (unit) and an angle. */
export function axisAngle(ax: number, ay: number, az: number, angle: number, out = quat()): Quat {
  const s = Math.sin(angle / 2);
  out.x = ax * s;
  out.y = ay * s;
  out.z = az * s;
  out.w = Math.cos(angle / 2);
  return out;
}
/** out = a · b */
export function multiplyQuat(a: Quat, b: Quat, out: Quat): Quat {
  const x = a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y;
  const y = a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x;
  const z = a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w;
  const w = a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z;
  out.x = x;
  out.y = y;
  out.z = z;
  out.w = w;
  return out;
}

export class Body {
  p: V3;
  q: Quat;
  v = v3();
  w = v3();
  prevP = v3();
  prevQ = quat();
  invMass: number;
  inertia: V3;
  invInertia: V3;
  rotates: boolean;
  kinematic = false;
  linearDamping = 0;
  angularDamping = 0;
  /** External force and torque in world space, applied every substep. */
  force = v3();
  torque = v3();
  /** Pose of a kinematic body at time t. */
  drive: ((t: number, p: V3, q: Quat) => void) | null = null;

  /** `inertia` null makes a point mass; mass 0 makes the body kinematic. */
  private mass: number;
  private hasInertia: boolean;

  constructor(mass: number, inertia: V3 | null, p: V3, q: Quat = quat()) {
    this.p = copy(v3(), p);
    this.q = copyQuat(quat(), q);
    this.mass = mass;
    this.hasInertia = !!inertia;
    this.inertia = inertia ? copy(v3(), inertia) : v3();
    this.invMass = 0;
    this.invInertia = v3();
    this.rotates = false;
    this.setKinematic(mass <= 0);
    copy(this.prevP, this.p);
    copyQuat(this.prevQ, this.q);
  }

  /** Kinematic bodies follow `drive` and are not pushed by joints. */
  setKinematic(on: boolean) {
    this.kinematic = on || this.mass <= 0;
    const free = !this.kinematic;
    this.invMass = free ? 1 / this.mass : 0;
    this.rotates = free && this.hasInertia;
    const I = this.inertia;
    this.invInertia = this.rotates ? v3(1 / I.x, 1 / I.y, 1 / I.z) : v3();
  }
}

/** Box inertia diagonal for a solid of the given size. */
export const boxInertia = (mass: number, sx: number, sy: number, sz: number): V3 =>
  v3((mass * (sy * sy + sz * sz)) / 12, (mass * (sx * sx + sz * sz)) / 12, (mass * (sx * sx + sy * sy)) / 12);

/** Ball joint (length 0), distance or rope limit between two body points. */
export class Joint {
  a: Body;
  b: Body | null;
  /** Local point on a. */
  la: V3;
  /** Local point on b, or a world point when b is null. */
  lb: V3;
  length: number;
  rope: boolean;
  compliance: number;
  enabled = true;
  constructor(a: Body, la: V3, b: Body | null, lb: V3, options: { length?: number; rope?: boolean; compliance?: number } = {}) {
    this.a = a;
    this.b = b;
    this.la = copy(v3(), la);
    this.lb = copy(v3(), lb);
    this.length = options.length ?? 0;
    this.rope = options.rope ?? false;
    this.compliance = options.compliance ?? 0;
  }
}

/**
 * Keeps `front` in front of `back` where the two thin plates overlap. Each plate
 * is a box of half extents (hx, hy, hz) in its own frame; samples are points on
 * the facing side of each plate.
 */
export class PlateOrder {
  front: Body;
  back: Body;
  hx: number;
  hy: number;
  hz: number;
  samples: V3[];
  constructor(front: Body, back: Body, hx: number, hy: number, hz: number, grid = 3) {
    this.front = front;
    this.back = back;
    this.hx = hx;
    this.hy = hy;
    this.hz = hz;
    this.samples = [];
    for (let i = 0; i < grid; i++)
      for (let j = 0; j < grid; j++) {
        const x = -hx + (2 * hx * i) / (grid - 1);
        const y = -hy + (2 * hy * j) / (grid - 1);
        this.samples.push(v3(x, y, 0));
      }
  }
}

// Scratch values: the solver never allocates while stepping.
const sA = v3(),
  sB = v3(),
  sC = v3(),
  sD = v3(),
  sN = v3(),
  rnA = v3(),
  rnB = v3(),
  sQ = quat();

function cross(a: V3, b: V3, out: V3) {
  const x = a.y * b.z - a.z * b.y;
  const y = a.z * b.x - a.x * b.z;
  const z = a.x * b.y - a.y * b.x;
  out.x = x;
  out.y = y;
  out.z = z;
  return out;
}

/**
 * Moves two bodies so that C → 0 along n, where C is the signed gap between
 * the world points pA = A.p + rA and pB = B.p + rB measured along n.
 */
function solvePositional(A: Body | null, rA: V3, B: Body | null, rB: V3, n: V3, C: number, compliance: number, h: number) {
  let wA = 0,
    wB = 0;
  const dynA = !!A && !A.kinematic;
  const dynB = !!B && !B.kinematic;
  if (dynA) {
    wA = A!.invMass;
    if (A!.rotates) {
      rotateInv(A!.q, cross(rA, n, rnA), rnA);
      const ii = A!.invInertia;
      wA += ii.x * rnA.x * rnA.x + ii.y * rnA.y * rnA.y + ii.z * rnA.z * rnA.z;
    }
  }
  if (dynB) {
    wB = B!.invMass;
    if (B!.rotates) {
      rotateInv(B!.q, cross(rB, n, rnB), rnB);
      const ii = B!.invInertia;
      wB += ii.x * rnB.x * rnB.x + ii.y * rnB.y * rnB.y + ii.z * rnB.z * rnB.z;
    }
  }
  const denom = wA + wB + compliance / (h * h);
  if (denom <= 0) return;
  const dl = -C / denom;
  if (dynA) {
    const k = dl * A!.invMass;
    A!.p.x += n.x * k;
    A!.p.y += n.y * k;
    A!.p.z += n.z * k;
    if (A!.rotates) {
      const ii = A!.invInertia;
      sD.x = ii.x * rnA.x * dl;
      sD.y = ii.y * rnA.y * dl;
      sD.z = ii.z * rnA.z * dl;
      rotate(A!.q, sD, sD);
      addRotation(A!.q, sD.x, sD.y, sD.z);
    }
  }
  if (dynB) {
    const k = dl * B!.invMass;
    B!.p.x -= n.x * k;
    B!.p.y -= n.y * k;
    B!.p.z -= n.z * k;
    if (B!.rotates) {
      const ii = B!.invInertia;
      sD.x = ii.x * rnB.x * dl;
      sD.y = ii.y * rnB.y * dl;
      sD.z = ii.z * rnB.z * dl;
      rotate(B!.q, sD, sD);
      addRotation(B!.q, -sD.x, -sD.y, -sD.z);
    }
  }
}

function solveJoint(j: Joint, h: number) {
  const A = j.a,
    B = j.b;
  const rA = rotate(A.q, j.la, sA);
  let pbx: number, pby: number, pbz: number;
  if (B) {
    rotate(B.q, j.lb, sB);
    pbx = B.p.x + sB.x;
    pby = B.p.y + sB.y;
    pbz = B.p.z + sB.z;
  } else {
    sB.x = sB.y = sB.z = 0;
    pbx = j.lb.x;
    pby = j.lb.y;
    pbz = j.lb.z;
  }
  const dx = A.p.x + rA.x - pbx,
    dy = A.p.y + rA.y - pby,
    dz = A.p.z + rA.z - pbz;
  const len = Math.hypot(dx, dy, dz);
  if (len < 1e-9) return;
  const C = len - j.length;
  if (j.rope && C <= 0) return;
  sN.x = dx / len;
  sN.y = dy / len;
  sN.z = dz / len;
  solvePositional(A, rA, B, sB, sN, C, j.compliance, h);
}

function solvePlates(c: PlateOrder, h: number) {
  // Facing points of the front plate stay in front of the back plate…
  for (const s of c.samples) {
    sC.x = s.x;
    sC.y = s.y;
    sC.z = -c.hz;
    rotate(c.front.q, sC, sA);
    sC.x = c.front.p.x + sA.x - c.back.p.x;
    sC.y = c.front.p.y + sA.y - c.back.p.y;
    sC.z = c.front.p.z + sA.z - c.back.p.z;
    rotateInv(c.back.q, sC, sC);
    if (Math.abs(sC.x) > c.hx || Math.abs(sC.y) > c.hy) continue;
    const d = sC.z - c.hz;
    if (d >= 0) continue;
    sN.x = 0;
    sN.y = 0;
    sN.z = 1;
    rotate(c.back.q, sN, sN);
    sC.z = c.hz;
    rotate(c.back.q, sC, sB);
    solvePositional(c.front, sA, c.back, sB, sN, d, 0, h);
  }
  // …and facing points of the back plate stay behind the front plate.
  for (const s of c.samples) {
    sC.x = s.x;
    sC.y = s.y;
    sC.z = c.hz;
    rotate(c.back.q, sC, sA);
    sC.x = c.back.p.x + sA.x - c.front.p.x;
    sC.y = c.back.p.y + sA.y - c.front.p.y;
    sC.z = c.back.p.z + sA.z - c.front.p.z;
    rotateInv(c.front.q, sC, sC);
    if (Math.abs(sC.x) > c.hx || Math.abs(sC.y) > c.hy) continue;
    const d = -sC.z - c.hz;
    if (d >= 0) continue;
    sN.x = 0;
    sN.y = 0;
    sN.z = -1;
    rotate(c.front.q, sN, sN);
    sC.z = -c.hz;
    rotate(c.front.q, sC, sB);
    solvePositional(c.back, sA, c.front, sB, sN, d, 0, h);
  }
}

export class World {
  bodies: Body[] = [];
  joints: Joint[] = [];
  plates: PlateOrder[] = [];
  gravity = v3(0, -9.81, 0);
  substeps = 10;
  time = 0;

  add<T extends Body>(body: T): T {
    this.bodies.push(body);
    return body;
  }
  join(joint: Joint) {
    this.joints.push(joint);
    return joint;
  }

  step(dt: number) {
    const h = dt / this.substeps;
    for (let i = 0; i < this.substeps; i++) this.substep(h);
  }

  private substep(h: number) {
    const t1 = this.time + h;
    const g = this.gravity;
    for (const b of this.bodies) {
      copy(b.prevP, b.p);
      copyQuat(b.prevQ, b.q);
      if (b.kinematic) {
        b.drive?.(t1, b.p, b.q);
        continue;
      }
      b.v.x += h * (g.x + b.force.x * b.invMass);
      b.v.y += h * (g.y + b.force.y * b.invMass);
      b.v.z += h * (g.z + b.force.z * b.invMass);
      if (b.linearDamping > 0) {
        const k = Math.exp(-b.linearDamping * h);
        b.v.x *= k;
        b.v.y *= k;
        b.v.z *= k;
      }
      b.p.x += b.v.x * h;
      b.p.y += b.v.y * h;
      b.p.z += b.v.z * h;
      if (!b.rotates) continue;
      // Angular velocity in the body frame, with torque and the gyroscopic term.
      const wb = rotateInv(b.q, b.w, sA);
      const I = b.inertia,
        ii = b.invInertia;
      const tb = rotateInv(b.q, b.torque, sB);
      const gx = wb.y * I.z * wb.z - wb.z * I.y * wb.y;
      const gy = wb.z * I.x * wb.x - wb.x * I.z * wb.z;
      const gz = wb.x * I.y * wb.y - wb.y * I.x * wb.x;
      wb.x += h * ii.x * (tb.x - gx);
      wb.y += h * ii.y * (tb.y - gy);
      wb.z += h * ii.z * (tb.z - gz);
      rotate(b.q, wb, b.w);
      if (b.angularDamping > 0) {
        const k = Math.exp(-b.angularDamping * h);
        b.w.x *= k;
        b.w.y *= k;
        b.w.z *= k;
      }
      addRotation(b.q, b.w.x * h, b.w.y * h, b.w.z * h);
    }
    for (const j of this.joints) if (j.enabled) solveJoint(j, h);
    for (const c of this.plates) solvePlates(c, h);
    for (const b of this.bodies) {
      b.v.x = (b.p.x - b.prevP.x) / h;
      b.v.y = (b.p.y - b.prevP.y) / h;
      b.v.z = (b.p.z - b.prevP.z) / h;
      if (!b.rotates) continue;
      sQ.x = -b.prevQ.x;
      sQ.y = -b.prevQ.y;
      sQ.z = -b.prevQ.z;
      sQ.w = b.prevQ.w;
      multiplyQuat(b.q, sQ, sQ);
      const s = sQ.w >= 0 ? 2 / h : -2 / h;
      b.w.x = sQ.x * s;
      b.w.y = sQ.y * s;
      b.w.z = sQ.z * s;
    }
    this.time = t1;
  }
}
