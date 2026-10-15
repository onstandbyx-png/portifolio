import assert from 'node:assert/strict';
import {createChapterState,galleryPose,readingProgress} from '../public/assets/showcase/scroll-gallery.js';

// Choosing a chapter never captures scroll ownership. The very next native
// scroll event takes over, in either direction, without a resume interaction.
const chapters=createChapterState(5);
chapters.scroll(1.4);assert.equal(chapters.choose(3),3);
for(const progress of [0,4,2.6,1,0,4])assert.equal(chapters.scroll(progress),progress);
assert.equal(chapters.mode,'scroll');
assert.equal(chapters.scroll(1.25),1.25);

// Pause removes intermediate poses, not native navigation. A chapter reached
// while paused is still the current chapter when motion is enabled again.
assert.equal(chapters.pause(true),1);assert.equal(chapters.scroll(3.6),4);
assert.equal(chapters.choose(2),2);assert.equal(chapters.resume(3.4),3);
assert.equal(chapters.pause(false),3);assert.equal(chapters.scroll(4),4);
assert.equal(chapters.scroll(-20),0);assert.equal(chapters.choose(20),4);

// Pausing or opening the current work settles its reading plane without
// moving the page. Resuming in place preserves that pose; the next actual
// scroll change resumes the reversible timeline, with no focus ownership.
chapters.scroll(1.46);assert.equal(chapters.pause(true),1);
assert.equal(chapters.pause(false),1);assert.equal(chapters.scroll(1.46),1);
assert.equal(chapters.scroll(1.47),1.47);
assert.equal(chapters.settle(),1);assert.equal(chapters.scroll(1.47),1);
assert.equal(chapters.scroll(1.6),1.6);

// Reading plateaus occupy .35 on either side of every chapter, with smooth
// reversible passages between them. Endpoints remain exact for camera stops.
for(let chapter=0;chapter<4;chapter++){
 for(const offset of [-.34,0,.34])assert.equal(readingProgress(Math.max(0,chapter+offset)),chapter);
 assert.equal(readingProgress(chapter),chapter);
}

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
console.log('Scroll gallery: native scroll ownership, pause, boundaries and reversible projection PASS');
