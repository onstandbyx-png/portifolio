import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { Quaternion, Vector3 } from 'three';

const directory = await mkdtemp(join(tmpdir(), 'portfolio-badge-stability-'));
const bundled = join(directory, 'rig.mjs');
await build({ entryPoints: [new URL('../src/badges/badge/rig.ts', import.meta.url).pathname], outfile: bundled, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent' });
const { BadgeRig, STEP } = await import(pathToFileURL(bundled));
await rm(directory, { recursive: true, force: true });

const restingRig = () => new BadgeRig(undefined, { enter: false });
const poses = rig => rig.world.bodies.map(body => ({ p: { ...body.p }, q: { ...body.q } }));
function assertBounded(rig) {
  for (const body of rig.world.bodies) {
    for (const value of [...Object.values(body.p), ...Object.values(body.q), ...Object.values(body.v), ...Object.values(body.w)]) assert.ok(Number.isFinite(value));
    assert.ok(Math.hypot(body.v.x, body.v.y, body.v.z) <= 1.6 + 1e-9, 'constraint impulses respect linear limit');
    assert.ok(Math.hypot(body.w.x, body.w.y, body.w.z) <= 2.4 + 1e-9, 'constraint impulses respect angular limit');
    assert.ok(Math.abs(Math.hypot(body.q.x, body.q.y, body.q.z, body.q.w) - 1) < 1e-7, 'orientation stays normalized');
  }
  for (const body of rig.cards) {
    assert.ok(Math.abs(body.p.x) < .9, 'card stays within horizontal viewing envelope');
    assert.ok(body.p.y > -.45 && body.p.y < .45, 'card cannot be launched above the stage');
    assert.ok(Math.abs(body.p.z) < .3, 'card keeps a bounded depth');
  }
}

test('resting fan exposes both cards while keeping their slots on the hook', () => {
  const rig = restingRig();
  assert.ok(rig.cards[0].p.x - rig.cards[1].p.x > .6, 'two pieces retain a distinct resting silhouette');
  const worldPoint = (body, point) => new Vector3(point.x, point.y, point.z)
    .applyQuaternion(new Quaternion(body.q.x, body.q.y, body.q.z, body.q.w))
    .add(new Vector3(body.p.x, body.p.y, body.p.z));
  for (const joint of rig.world.joints.filter(joint => rig.cards.includes(joint.a))) {
    assert.ok(worldPoint(joint.a, joint.la).distanceTo(worldPoint(joint.b, joint.lb)) < .001, 'fanning rotates around the slot instead of detaching it');
  }
  assertBounded(rig);
});

test('repeated inspections inject no motion into a resting rig', () => {
  const rig = restingRig(), initial = poses(rig);
  for (let i = 0; i < 100; i++) { rig.inspect(); rig.advance(1 / 60); }
  assert.deepEqual(poses(rig), initial);
  assert.equal(rig.moving, false);
});

test('one hundred swing presses cannot accumulate impulse', () => {
  const one = restingRig(), many = restingRig();
  one.swing(1);
  for (let i = 0; i < 100; i++) many.swing(1);
  assert.deepEqual(many.cards.map(body => ({ v: body.v, w: body.w })), one.cards.map(body => ({ v: body.v, w: body.w })));
  for (let i = 0; i < 960; i++) { many.tick(); assertBounded(many); }
  assert.equal(many.moving, false);
});

test('sustained swing key repeats remain inside the viewing envelope', () => {
  const rig = restingRig();
  for (let press = 0; press < 100; press++) {
    rig.swing(1);
    for (let step = 0; step < 8; step++) { rig.tick(); assertBounded(rig); }
  }
  for (let i = 0; i < 960; i++) { rig.tick(); assertBounded(rig); }
  assert.equal(rig.moving, false);
});

test('extreme drag targets are rate limited and release settles both cards', () => {
  for (const index of [0, 1]) {
    const rig = restingRig(), initial = poses(rig), origin = { ...rig.cards[index].p };
    rig.grab(index, { x: 0, y: 0, z: 0 }, origin);
    let prior = { ...rig.grabJoint.lb };
    for (let i = 0; i < 240; i++) {
      const direction = i < 120 ? 1 : -1;
      rig.drag({ x: direction * 100, y: direction * 100, z: direction * 100 });
      rig.tick();
      const target = rig.grabJoint.lb;
      assert.ok(Math.hypot(target.x - prior.x, target.y - prior.y, target.z - prior.z) <= 1.4 * STEP + 1e-9, 'target changes at bounded speed');
      assert.ok(Math.abs(target.x - origin.x) <= .65 + 1e-9);
      assert.ok(Math.abs(target.y - origin.y) <= .28 + 1e-9);
      assert.ok(Math.abs(target.z - origin.z) <= .08 + 1e-9);
      prior = { ...target }; assertBounded(rig);
    }
    rig.drag({ x: NaN, y: Infinity, z: -Infinity });
    rig.release();
    for (let i = 0; i < 960; i++) { rig.tick(); assertBounded(rig); }
    assert.equal(rig.grabbing, false);
    assert.equal(rig.moving, false);
    assert.deepEqual(poses(rig), initial, 'settled pose eliminates residual numerical jitter');
  }
});

test('consecutive drags cannot move the viewing envelope farther each time', () => {
  const rig = restingRig();
  for (let gesture = 0; gesture < 20; gesture++) {
    const index = gesture % 2;
    rig.grab(index, { x: 0, y: 0, z: 0 }, { ...rig.cards[index].p });
    rig.drag({ x: 100, y: 100, z: 100 });
    for (let step = 0; step < 90; step++) { rig.tick(); assertBounded(rig); }
    rig.release();
    rig.tick();
  }
  for (let i = 0; i < 960; i++) { rig.tick(); assertBounded(rig); }
  assert.equal(rig.moving, false);
});

test('inspection ends the tracked entrance without replacing its current pose', () => {
  const rig = new BadgeRig(undefined, { enter: true });
  for (let i = 0; i < 75; i++) rig.tick();
  const current = poses(rig);
  rig.inspect();
  assert.equal(rig.performing, false);
  assert.deepEqual(poses(rig), current);
  assert.ok(rig.cards.every(body => body.maxLinearSpeed === 1.6 && body.maxAngularSpeed === 2.4));
});

test('both a completed and interrupted entrance can settle', () => {
  for (const interrupt of [false, true]) {
    const rig = new BadgeRig(undefined, { enter: true });
    for (let i = 0; i < 3600; i++) {
      if (interrupt && i === 75) {
        const anchors = rig.anchors.map(body => ({ ...body.p }));
        rig.inspect(); rig.tick();
        for (const [index, body] of rig.anchors.entries()) {
          const previous = anchors[index];
          assert.ok(Math.hypot(body.p.x - previous.x, body.p.y - previous.y, body.p.z - previous.z) < .02, 'suspension point does not teleport on interruption');
        }
      }
      rig.tick();
    }
    assert.equal(rig.moving, false, interrupt ? 'interrupted entrance rests' : 'normal entrance rests');
    assert.deepEqual(poses(rig), poses(restingRig()), 'the entrance settles into the same readable fan');
  }
});

test('fixed-step reference seeks keep advancing after the rig settles', () => {
  const rig = restingRig();
  for (let i = 0; i < 120; i++) rig.tick();
  assert.ok(Math.abs(rig.world.time - 1) < 1e-8);
});


const singleRig = () => new BadgeRig(undefined, { enter: false, single: true });

test('readable suspension starts upright, attached and compact', () => {
  const rig = singleRig(), card = rig.cards[0];
  assert.ok(Math.abs(card.p.x) < .005 && Math.abs(card.p.y) < .01, 'card is centered in its independent frame');
  assert.ok(Math.abs(card.q.x) < .01 && Math.abs(card.q.y) < .01 && Math.abs(card.q.z) < .01, 'print faces the reader at rest');
  assert.ok(rig.anchors.every(anchor => anchor.p.y > 1.5 && anchor.p.y < 1.7), 'suspension no longer consumes more height than the card');
  const worldPoint = (body, point) => new Vector3(point.x, point.y, point.z)
    .applyQuaternion(new Quaternion(body.q.x, body.q.y, body.q.z, body.q.w))
    .add(new Vector3(body.p.x, body.p.y, body.p.z));
  for (const joint of rig.world.joints.filter(joint => joint.a === card))
    assert.ok(worldPoint(joint.a, joint.la).distanceTo(worldPoint(joint.b, joint.lb)) < .001, 'scaled hook remains attached through the card slot');
  assertBounded(rig);
});

test('interacting with one suspension leaves the neighboring piece at rest', () => {
  const active = singleRig(), neighbor = singleRig(), initial = poses(neighbor);
  active.grab(0, { x: 0, y: 0, z: 0 }, { ...active.cards[0].p });
  active.drag({ x: 100, y: 100, z: 100 });
  for (let i = 0; i < 240; i++) { active.tick(); neighbor.advance(STEP); }
  assert.deepEqual(poses(neighbor), initial, 'no shared constraint or impulse moves the other card');
  assert.equal(neighbor.moving, false);
});

test('readable card corner drags stay bounded and return exactly to the reading pose', () => {
  const rig = singleRig(), initial = poses(rig);
  for (let round = 0; round < 12; round++) {
    const direction = round % 2 ? 1 : -1;
    const local = { x: direction * .7, y: .7, z: 0 };
    const body = rig.cards[0];
    const point = new Vector3(local.x, local.y, local.z)
      .applyQuaternion(new Quaternion(body.q.x, body.q.y, body.q.z, body.q.w))
      .add(new Vector3(body.p.x, body.p.y, body.p.z));
    rig.grab(0, local, point);
    rig.drag({ x: direction * 100, y: 100, z: 100 });
    for (let i = 0; i < 120; i++) {
      rig.tick(); assertBounded(rig);
      const card = rig.cards[0], rotation = new Quaternion(card.q.x, card.q.y, card.q.z, card.q.w);
      for (const x of [-.8, .8]) for (const y of [-1.0385, 1.0385]) {
        const corner = new Vector3(x, y, 0).applyQuaternion(rotation);
        assert.ok(Math.abs(corner.x + card.p.x) < 1.16, 'printed corners stay inside the frame and clear of the neighbor');
      }
    }
    rig.release();
    for (let i = 0; i < 1200; i++) rig.tick();
    assert.equal(rig.moving, false);
    assert.deepEqual(poses(rig), initial, 'release restores the same stable frontal reading position');
  }
});

test('single-card inspections and repeated pushes never accumulate energy', () => {
  const one = singleRig(), many = singleRig(), initial = poses(one);
  for (let i = 0; i < 100; i++) { one.inspect(); one.advance(STEP); }
  assert.deepEqual(poses(one), initial, 'inspection does not push the suspension');
  one.swing(1);
  for (let i = 0; i < 100; i++) many.swing(1);
  assert.deepEqual(many.cards[0].v, one.cards[0].v);
  assert.deepEqual(many.cards[0].w, one.cards[0].w);
  for (let i = 0; i < 1200; i++) { many.tick(); assertBounded(many); }
  assert.equal(many.moving, false);
});
