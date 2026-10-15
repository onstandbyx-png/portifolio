import assert from 'node:assert/strict';
import {createChapterState,galleryPose} from '../public/assets/showcase/scroll-gallery.js';

// A user's selection must survive every subsequent scroll event, including
// scrolling back out of and into the section, until explicitly resumed.
const chapters=createChapterState(5);
chapters.scroll(1.4);chapters.choose(3);
for(const progress of [0,4,2.6,1,0,4])assert.equal(chapters.scroll(progress),3);
assert.equal(chapters.mode,'manual');
assert.equal(chapters.resume(1.25),1.25);
assert.equal(chapters.mode,'scroll');

// Pause freezes the camera, but never blocks direct navigation. Resuming scroll
// while globally paused must still preserve the current reading state.
chapters.pause(true);assert.equal(chapters.scroll(4),1.25);
assert.equal(chapters.choose(2),2);assert.equal(chapters.resume(4),2);
chapters.pause(false);assert.equal(chapters.scroll(4),4);
assert.equal(chapters.scroll(-20),0);assert.equal(chapters.choose(20),4);

// The reference fold is a reversible projection, independent of scroll
// direction or timing. Only one card is active at any checkpoint.
const forward=[];
for(let cursor=0;cursor<=3;cursor+=.125){
 const poses=Array.from({length:4},(_,index)=>galleryPose(index,cursor));
 assert.equal(poses.filter(pose=>pose.active).length,1);
 assert.ok(poses.every(pose=>pose.scale>=.88&&pose.scale<=1&&pose.opacity>=0&&pose.opacity<=1));
 forward.push({cursor,poses});
}
for(const {cursor,poses} of forward.reverse())assert.deepEqual(Array.from({length:4},(_,index)=>galleryPose(index,cursor)),poses);
for(let index=0;index<4;index++){
 const pose=galleryPose(index,index,true);
 assert.ok(pose.angle===0);assert.equal(pose.scale,1);assert.equal(pose.opacity,1);
}
console.log('Scroll gallery: manual selection, pause, boundaries and reversible projection PASS');
