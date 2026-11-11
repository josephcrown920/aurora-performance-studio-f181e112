/** Framework-neutral, zero-network VFX skill for Aurora canvas agents. */
export const EFFECTS = Object.freeze([
  ['night-vision','pixel'],['cold-vision','pixel'],['thermal-vision','pixel'],['infrared','pixel'],
  ['bullet-time','camera'],['earth-zoom','camera'],['gold-grill-mouth-zoom','camera'],
  ['hyper-switch','timeline'],['speed-ramp','timeline'],['freeze-frame','timeline'],
  ['dolly-zoom','camera'],['whip-pan','camera'],['vhs-glitch','composite'],
  ['cinematic-rain','composite'],['strobe','timeline'],
].map(([id,kind])=>Object.freeze({id,kind,implemented:kind==='pixel',requires:kind==='pixel'?[]:kind==='camera'?['camera-renderer']:kind==='timeline'?['timeline-renderer']:['compositor']})));
export const CANVAS_VFX_SKILL = Object.freeze({id:'aurora.vfx',description:'Discover and apply local visual looks; plan advanced VFX without pretending to render them',actions:['list','inspect','apply-pixel'],sideEffects:'local-pixel-mutation',costUSD:0});
export function runCanvasVfxSkill({action,id,frame,intensity=1}={}) {
  if(action==='list') return EFFECTS;
  const effect=EFFECTS.find(x=>x.id===id);
  if(!effect) throw new Error(`Unknown Aurora effect: ${id}`);
  if(action==='inspect') return effect;
  if(action!=='apply-pixel') throw new Error(`Unknown action: ${action}`);
  if(!effect.implemented) throw new Error(`${id} requires ${effect.requires.join(', ')}; no render was performed`);
  if(!frame || !Number.isInteger(frame.width) || !Number.isInteger(frame.height) || frame.width<1 || frame.height<1 || !frame.data || frame.data.length!==frame.width*frame.height*4) throw new Error('Invalid RGBA frame');
  if(typeof intensity!=='number'||!Number.isFinite(intensity)||intensity<0||intensity>1) throw new Error('Intensity must be between 0 and 1');
  const d=frame.data;
  for(let i=0;i<d.length;i+=4){
    const [r,g,b]=[d[i],d[i+1],d[i+2]];
    const l=.2126*r+.7152*g+.0722*b;
    let [nr,ng,nb]=[r,g,b];
    if(id==='night-vision') [nr,ng,nb]=[l*.13,Math.min(255,l*1.4+20),l*.12];
    if(id==='cold-vision') [nr,ng,nb]=[l*.38,Math.min(255,l*.95+15),Math.min(255,l*1.4+30)];
    if(id==='infrared') nr=ng=nb=Math.max(0,Math.min(255,(l-110)*1.35+128));
    if(id==='thermal-vision'){const t=l/255;[nr,ng,nb]=[Math.min(255,Math.max(0,(t-.25)*510)),Math.min(255,Math.max(0,255-Math.abs(t-.55)*510)),Math.min(255,Math.max(0,(.65-t)*510))];}
    d[i]=r+(nr-r)*intensity;d[i+1]=g+(ng-g)*intensity;d[i+2]=b+(nb-b)*intensity;
  }
  return frame;
}
