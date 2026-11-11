import { CANVAS_VFX_SKILL, runCanvasVfxSkill } from './aurora-canvas-vfx.mjs';
import { AURORA_CHARACTER_SKILL, validateSoulTraining, planOmni, verifyLipSync } from './aurora-character-agent.mjs';

/** Read-only registry with explicit, typed-ish dispatch. No remote execution. */
export const AURORA_CANVAS_AGENT_TOOLS = Object.freeze([
 { ...CANVAS_VFX_SKILL, permissions:['local-media-edit'],requiresApproval:false },
 { ...AURORA_CHARACTER_SKILL, permissions:['read-reference-metadata'],requiresApproval:false }
]);
export function listAuroraCanvasAgentTools() {
 return AURORA_CANVAS_AGENT_TOOLS.map(({id,description,actions,permissions,requiresApproval,costUSD})=>({id,description,actions,permissions,requiresApproval,costUSD:costUSD??0}));
}
export function executeAuroraCanvasAgentTool({tool,action,input={}}={}) {
 if(!input || typeof input!=='object'||Array.isArray(input))throw Error('Tool input must be an object');
 if(tool==='aurora.vfx')return runCanvasVfxSkill({action,...input});
 if(tool==='aurora.character'){
  if(action==='validate-training')return validateSoulTraining(input);
  if(action==='plan-omni')return planOmni(input);
  if(action==='verify-lipsync')return verifyLipSync(input);
 }
 throw Error('Unknown or unauthorized Aurora agent tool/action');
}
