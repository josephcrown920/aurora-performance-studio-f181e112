import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { editorChatKey, readEditorChat } from "./editor-chat";

describe("project editing conversations", () => {
  test("two projects keep separate prompt histories", () => {
    const values = new Map([[editorChatKey("owner", "one"), JSON.stringify([{ role: "user", text: "Trim my first scene" }])]]);
    const storage = { getItem: (key: string) => values.get(key) ?? null };
    assert.equal(readEditorChat(storage, "owner", "one")?.[0]?.text, "Trim my first scene");
    assert.equal(readEditorChat(storage, "owner", "two"), null);
  });
  test("another account cannot restore this account's conversation", () => {
    assert.notEqual(editorChatKey("owner", "one"), editorChatKey("another", "one"));
  });
  test("all 201 project messages remain scrollable after restore", () => {
    const messages = Array.from({ length: 201 }, (_, i) => ({ role: "user", text: `edit ${i}` }));
    assert.equal(readEditorChat({ getItem: () => JSON.stringify(messages) }, "owner", "one")?.length, 201);
  });
});