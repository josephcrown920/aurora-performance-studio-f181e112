import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN || "auroraperformancestudio.com";
const ENDPOINT = `https://${DOMAIN}/api/canvas/comfy`;

type Status = { ok: boolean; error?: string } | null;

export default function ComfyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<Status>(null);
  const [checking, setChecking] = useState(false);
  const [workflow, setWorkflow] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState("");

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch(ENDPOINT);
      const data = await res.json();
      setStatus({ ok: !!data.ok, error: data.error });
    } catch (e) {
      setStatus({ ok: false, error: e instanceof Error ? e.message : "Unreachable" });
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  const run = async () => {
    setResult("");
    let parsed: unknown;
    try {
      parsed = JSON.parse(workflow);
    } catch {
      setResult("Workflow must be valid ComfyUI API JSON.");
      return;
    }
    setRunning(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow: parsed, wait: true }),
      });
      const data = await res.json();
      setResult(data.ok ? JSON.stringify(data.outputs ?? data, null, 2) : data.error || "Run failed.");
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Run failed.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120, gap: 16 }}
    >
      <Text style={[s.title, { color: colors.foreground }]}>ComfyUI</Text>
      <View style={[s.card, { borderColor: colors.border, backgroundColor: colors.muted }]}>
        <Feather name={status?.ok ? "check-circle" : "alert-circle"} size={18} color={status?.ok ? colors.primary : colors.mutedForeground} />
        <Text style={{ color: colors.foreground, flex: 1 }}>
          {checking ? "Checking GPU worker…" : status?.ok ? "GPU worker online" : `Offline${status?.error ? `: ${status.error}` : ""}`}
        </Text>
        <Pressable onPress={check} accessibilityRole="button" accessibilityLabel="Recheck ComfyUI">
          <Feather name="refresh-cw" size={18} color={colors.primary} />
        </Pressable>
      </View>
      <TextInput
        multiline
        value={workflow}
        onChangeText={setWorkflow}
        placeholder="Paste ComfyUI API workflow JSON"
        placeholderTextColor={colors.mutedForeground}
        style={[s.input, { color: colors.foreground, borderColor: colors.border }]}
      />
      <Pressable
        onPress={run}
        disabled={running || !workflow.trim()}
        style={[s.button, { backgroundColor: colors.primary, opacity: running || !workflow.trim() ? 0.6 : 1 }]}
      >
        {running ? <ActivityIndicator color={colors.primaryForeground} /> : <Text style={{ color: colors.primaryForeground, fontWeight: "700" }}>Run workflow</Text>}
      </Pressable>
      {!!result && <Text selectable style={{ color: colors.foreground, fontFamily: "monospace", fontSize: 12 }}>{result}</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800" },
  card: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  input: { minHeight: 180, borderWidth: 1, borderRadius: 14, padding: 12, textAlignVertical: "top", fontSize: 13 },
  button: { minHeight: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
});
