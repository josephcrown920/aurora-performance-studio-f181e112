/** Aurora agent skill: identity-aware LoRA + Omni planning. No paid API calls. */
export const AURORA_CHARACTER_SKILL = Object.freeze({
 id:"aurora.character", actions:["validate-training","plan-omni","verify-lipsync"],
 description:"Preflight Soul LoRA training and multimodal Omni generation without spending credits",
 costUSD:0, requiresApprovalForGeneration:true
});
export function validateSoulTraining({images=[],identityRequired=true}={}) {
 if(!Array.isArray(images)||images.length<10) return {ok:false,reason:"Provide at least 10 usable, consented reference photos",count:Array.isArray(images)?images.length:0};
 if(images.some(x=>!x||typeof x.url!=="string"||!/^https:\/\//.test(x.url))) return {ok:false,reason:"Each reference must have an HTTPS image URL"};
 const identities=new Set(images.map(x=>x.identityId).filter(Boolean));
 if(identityRequired && (identities.size!==1||images.some(x=>!x.identityId))) return {ok:false,reason:"All photos must carry the same authoritative identity ID"};
 return {ok:true,count:images.length,identityId:images[0].identityId,requiresTraining:true,paidJobSubmitted:false};
}
export function planOmni({model,referenceImageUrl,audioUrl,drivingVideoUrl,identityId,consent=false}={}) {
 const models={"omnihuman-2-0":{requires:["referenceImageUrl","audioUrl"],purpose:"lip-sync"},"kling-2.6/motion-control":{requires:["referenceImageUrl","drivingVideoUrl"],purpose:"motion"}};
 const selected=models[model];
 if(!selected) return {ok:false,reason:"Provider model is not verified; no paid request sent"};
 if(!consent) return {ok:false,reason:"Consent required for identity-based generation"};
 if(!identityId) return {ok:false,reason:"Missing identity lock"};
 for(const field of selected.requires) if(typeof ({referenceImageUrl,audioUrl,drivingVideoUrl})[field]!=="string"||!/^https:\/\//.test(({referenceImageUrl,audioUrl,drivingVideoUrl})[field])) return {ok:false,reason:`Missing valid ${field}`};
 return {ok:true,model,purpose:selected.purpose,identityId,requiresExplicitCostApproval:true,paidJobSubmitted:false};
}
export function verifyLipSync({audioProvided,detectedSpeech,faceStable,mouthMorphing}={}) {
 const issues=[];
 if(!audioProvided)issues.push("Original audio missing");
 if(detectedSpeech===false)issues.push("No detectable speech in output");
 if(faceStable!==true)issues.push("Identity consistency not verified");
 if(mouthMorphing!==false)issues.push("Mouth morphology not verified");
 return {passed:issues.length===0,issues};
}
