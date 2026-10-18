import assert from 'node:assert/strict';
import {createChapterState,galleryPose,readingProgress} from '../public/assets/showcase/scroll-gallery.js';

const chapters=createChapterState(5);
chapters.scroll(1.4);assert.equal(chapters.choose(3),3);
for(const progress of [0,4,2.6,1,0,4])assert.equal(chapters.scroll(progress),progress);
assert.equal(chapters.mode,'scroll');
assert.equal(chapters.scroll(1.25),1.25);
assert.equal(chapters.pause(true),1);assert.equal(chapters.scroll(3.6),4);
assert.equal(chapters.choose(2),2);assert.equal(chapters.resume(3.4),3);
assert.equal(chapters.pause(false),3);assert.equal(chapters.scroll(4),4);
assert.equal(chapters.scroll(-20),0);assert.equal(chapters.choose(20),4);
chapters.scroll(1.46);assert.equal(chapters.pause(true),1);
assert.equal(chapters.pause(false),1);assert.equal(chapters.scroll(1.46),1);
assert.equal(chapters.scroll(1.47),1.47);
assert.equal(chapters.settle(),1);assert.equal(chapters.scroll(1.47),1);
assert.equal(chapters.scroll(1.6),1.6);

// Two .22 reading plateaus leave .56 of each interval for the passage.
for(let chapter=0;chapter<4;chapter++){
 for(const offset of [-.21,0,.21])assert.equal(readingProgress(Math.max(0,chapter+offset)),chapter);
 assert.equal(readingProgress(chapter),chapter);
 assert(readingProgress(chapter+.25)>chapter);
 assert(readingProgress(chapter+.75)<chapter+1);
}
assert(Math.abs(readingProgress(.499)-readingProgress(.501))<.01);
// Desktop spends less time on a static frame but has a longer transition.
assert.equal(readingProgress(.12,true),0);
assert(readingProgress(.18,true)>0);
assert(readingProgress(.82,true)<1);
assert.equal(readingProgress(.90,true),1);
assert(Math.abs(readingProgress(.499,true)-readingProgress(.501,true))<.01);
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
for(const mobile of [true,false]){
 const a=galleryPose(0,.5,mobile),b=galleryPose(1,.5,mobile);
 // The gallery now travels sideways as a layered carousel, not vertically.
 // Verify legible full-size cards and balanced lateral motion without 68deg flips.
 assert(b.x-a.x >= (mobile ? 30 : 24),'Layered passage must preserve lateral card spacing');
 assert(Math.abs(a.x+b.x) < .001,'Adjacent cards balance around the reading center');
 assert(Math.abs(a.angle+b.angle) < .001,'Tilts stay reversible and symmetrical');
 assert([a,b].every(p=>p.scale>.90&&Math.abs(p.angle)<=13),'Artwork stays readable without harsh shrinking or rotation');
}
console.log('Scroll gallery: native navigation, readable plateaus, continuous passages, spacing and reversible projection PASS');
