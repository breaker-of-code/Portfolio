import * as THREE from 'three';
export function createContactMailbox(b){
 const g=new THREE.Group();g.name='Coastal contact mailbox';
 const cream=0xfff3d5,dark=0x284b54,teal=0x42bbc4,amber=0xffbc45,coral=0xed9384;
 const box=(s,p,c,bevel=.04)=>b.box(g,s,p,c,bevel);
  box([1.4,.17,1.12],[0,.12,0],cream,.055);box([.2,.94,.24],[0,.64,-.04],dark,.025);
  const arch=(r,bottom)=>{const p=[[-r,bottom],[r,bottom],[r,1.79]];for(let i=0;i<=16;i++){const a=i/16*Math.PI;p.push([Math.cos(a)*r,1.79+Math.sin(a)*r])}return p};
  b.prism(g,arch(.78,1.05),1.18,cream);
  b.prism(g,arch(.67,1.15),.035,teal).position.z=.64;
  box([1.04,.57,.05],[0,1.67,.71],cream,.04);
  b.polygon(g,[[-.5,1.94,.745],[.5,1.94,.745],[0,1.59,.76]],amber);
  box([.31,.09,.1],[0,1.27,.73],dark,.025);
  box([.075,.84,.085],[.88,1.94,-.05],coral,.025);box([.43,.3,.075],[1.07,2.23,-.05],coral,.035);

 return g;
}
