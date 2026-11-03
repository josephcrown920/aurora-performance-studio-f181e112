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
