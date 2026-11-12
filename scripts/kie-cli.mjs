#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
const [command, ...args] = process.argv.slice(2);
const opt = name => { const i = args.indexOf(`--${name}`); return i < 0 ? undefined : args[i + 1]; };
async function main() {
  if (!['models', 'status', 'submit'].includes(command)) {
    console.log('Kie: models | status --task-id ID | submit --request job.json --estimate-usd N --max-usd N [--execute]\nSubmit defaults to dry-run. Estimates are operator-supplied, NOT provider-enforced caps. Never retry an uncertain submission automatically. Requires KIE_API_KEY for network calls.');
    return;
  }
  let body;
  if (command === 'submit') {
    if (!opt('request')) throw Error('Provide --request job.json containing {model,input}.');
    body = JSON.parse(await readFile(opt('request'), 'utf8'));
    if (typeof body.model !== 'string' || !body.model.trim() || !body.input || typeof body.input !== 'object' || Array.isArray(body.input)) throw Error('Request requires a model and input object.');
    if (Object.keys(body).some(k => !['model','input','callBackUrl'].includes(k))) throw Error('Unexpected request fields. Keep credentials in KIE_API_KEY only.');
    const estimate = Number(opt('estimate-usd')), maximum = Number(opt('max-usd'));
    if (!Number.isFinite(estimate) || estimate <= 0 || !Number.isFinite(maximum) || maximum <= 0 || estimate > maximum) throw Error('Provide a positive verified estimate no greater than --max-usd.');
    if (!args.includes('--execute')) { console.log(JSON.stringify({dryRun:true,model:body.model,estimateUsd:estimate,maxUsd:maximum,note:'No request submitted. Provider charges are not capped by this client.'})); return; }
  }
  const key = process.env.KIE_API_KEY?.trim();
  if (!key) throw Error('KIE_API_KEY is not set. Add it through a secure environment secret.');
  if (command === 'status' && !opt('task-id')) throw Error('Provide --task-id.');
  const path = command === 'models' ? '/openai/v1/models' : command === 'status' ? `/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(opt('task-id'))}` : '/api/v1/jobs/createTask';
  let response;
  try { response = await fetch(`https://api.kie.ai${path}`, {method:command === 'submit' ? 'POST' : 'GET',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},...(body ? {body:JSON.stringify(body)} : {}),signal:AbortSignal.timeout(30000)}); }
  catch { throw Error(command === 'submit' ? 'Submission outcome unknown. Check Kie logs before retrying to avoid duplicate charges.' : 'Kie request failed.'); }
  const result = await response.json();
  if (!response.ok || (result.code !== undefined && result.code !== 200)) throw Error(`Kie request rejected (${result.code ?? response.status}). Check provider logs; secrets and request inputs are omitted.`);
  if (command === 'submit') {
    if (!result.data?.taskId) throw Error('No task ID returned. Check Kie logs before retrying.');
    console.log(JSON.stringify({taskId:result.data.taskId,state:'submitted',note:'Submission is not render completion. Use status to retrieve results.'}));
  } else console.log(JSON.stringify(result,null,2));
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
