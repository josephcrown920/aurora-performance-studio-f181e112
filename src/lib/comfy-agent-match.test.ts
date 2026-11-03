import { describe, it, expect } from "vitest";
import { matchComfyTemplate, unfinishedRuns, finishedOutputs } from "./comfy-agent-match";

const t = [
  { id: "1", name: "Wan Motion Transfer", description: "copy dance from phone clip" },
  { id: "2", name: "Upscale Portrait", description: "sharpen faces" },
];

describe("comfy agent matching", () => {
  it("picks the workflow named in the brief", () => {
    expect(matchComfyTemplate("do a motion transfer from my phone", t)?.id).toBe("1");
  });
  it("returns null when nothing matches", () => {
    expect(matchComfyTemplate("write a poem", t)).toBeNull();
  });
  it("treats queued and running as unfinished", () => {
    const r = [{ id: "a", workflow_id: "1", status: "running" }, { id: "b", workflow_id: "1", status: "succeeded", output_url: "x" }, { id: "c", workflow_id: "1", status: "queued" }];
    expect(unfinishedRuns(r).map((x) => x.id)).toEqual(["a", "c"]);
    expect(finishedOutputs(r).map((x) => x.id)).toEqual(["b"]);
  });
});

import { detectComfyInputs } from "./comfy-agent-match";
describe("make app from ComfyUI workflow", () => {
  it("turns prompt, image and seed nodes into fields", () => {
    const r = detectComfyInputs({
      "6": { class_type: "CLIPTextEncode", inputs: { text: "a dancer" } },
      "10": { class_type: "LoadImage", inputs: { image: "x.png" } },
      "3": { class_type: "KSampler", inputs: { seed: 42 } },
    });
    expect(r.inputs.map((i) => i.key)).toEqual(["6.text", "10.image", "3.seed"]);
    expect(r.kind).toBe("image");
  });
  it("marks Wan graphs as video apps", () => {
    expect(detectComfyInputs({ "1": { class_type: "WanFunControlToVideo", inputs: {} } }).kind).toBe("video");
  });
});
