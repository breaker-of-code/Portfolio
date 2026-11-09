import * as THREE from 'three';

// Selected set B: modern offices, one silhouette per career stop.
export function createCareerBuilding(b, variant = 0) {
 const i=((variant % 5)+5)%5;
 const cream=0xfff3d5,teal=0x43aeb8,glass=0x69b9c9,dark=0x284b54,gold=0xffbc45;
 const g=new THREE.Group();g.name=['Glass-front HQ','Twin volumes','Stepped campus','Bridge office','Glass tower'][i];
 const box=(s,p,c=cream,r=.035)=>b.box(g,s,p,c,r);
 const windows=(w,rows,y=1,z=.82)=>{for(let row=0;row<rows;row++)for(let col=0;col<w;col++)box([.38,.39,.04],[(col-(w-1)/2)*.58,y+row*.64,z],glass,.015)};
 box([3.5,.16,2.8],[0,.08,0],0xa3b65b);
  const heights=[2.35,3.05,2,2.7,3.2],h=heights[i];
  if(i===0){box([2.7,h,1.7],[0,h/2+.16,0]);box([1.5,h-.3,.08],[.25,h/2+.2,.9],glass);for(let y=.5;y<h;y+=.55)box([1.55,.07,.12],[.25,y,.95],cream);}
  if(i===1){box([1.55,h,1.65],[-.5,h/2+.16,0]);box([1.35,1.75,1.65],[.85,1.03,0],teal);windows(2,4,.6,.86);box([1.8,.15,1.9],[-.5,h+.2,0],dark);}
  if(i===2){for(let k=0;k<3;k++){box([2.8-k*.6,.72,1.8-k*.15],[k*.2,.52+k*.72,0],k===1?teal:cream);box([2.4-k*.5,.35,.04],[k*.2,.6+k*.72,.94-k*.075],glass);}}
  if(i===3){for(const x of [-.95,.95])box([.7,2.25,1.5],[x,1.3,0]);box([3.1,.85,1.8],[0,2.8,0],teal);box([2.8,.48,.04],[0,2.83,.94],glass);box([1.3,.9,.9],[0,.6,-.25],glass);}
  if(i===4){box([2.4,h,1.5],[0,h/2+.16,0],glass);for(const x of [-1.2,0,1.2])box([.13,h+.16,1.65],[x,h/2+.16,0]);for(let y=.9;y<h;y+=.7)box([2.6,.12,1.65],[0,y,0]);box([2.7,.2,1.8],[0,h+.25,0],dark);}
 box([.5,.76,.06],[0,.54,1.065],dark);box([.09,.09,.08],[.15,.55,1.11],gold,.01);
 for(const x of [-1.35,1.35])box([.32,.32,.4],[x,.32,1],0x91af35);
 return g;
}
