import assert from "node:assert/strict";
import { test } from "node:test";
import { isAllowedKieModel, KIE_MOTION_MODEL, KIE_LIPSYNC_MODEL } from "./kie-models";

test("motion tests are restricted to cheap Kling 2.6", () => {
  assert.equal(KIE_MOTION_MODEL, "kling-2.6/motion-control");
  assert.equal(isAllowedKieModel(KIE_MOTION_MODEL), true);
  assert.equal(isAllowedKieModel("kling-3.0/motion-control"), false);
});
test("lip sync uses OmniHuman 2.0 rather than an expensive alternative", () => {
  assert.equal(KIE_LIPSYNC_MODEL, "omnihuman-2-0");
  assert.equal(isAllowedKieModel(KIE_LIPSYNC_MODEL), true);
});
test("Seedance and Seedream cannot pass the Kie allowlist", () => {
  assert.equal(isAllowedKieModel("seedance/2.0"), false);
  assert.equal(isAllowedKieModel("seedream/4.5"), false);
});