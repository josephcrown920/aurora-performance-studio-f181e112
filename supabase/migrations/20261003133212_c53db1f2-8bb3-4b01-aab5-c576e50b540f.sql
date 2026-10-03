CREATE TABLE public.canvas_context (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 character_name text NOT NULL DEFAULT 'Josh',
 references_json jsonb NOT NULL DEFAULT '[]'::jsonb,
 brief_json jsonb,
 intent text NOT NULL DEFAULT '',
 motion_tests jsonb NOT NULL DEFAULT '[]'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.canvas_context TO authenticated;
GRANT ALL ON public.canvas_context TO service_role;
ALTER TABLE public.canvas_context ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creators manage own canvas context" ON public.canvas_context FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE FUNCTION public.touch_canvas_context() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER touch_canvas_context BEFORE UPDATE ON public.canvas_context FOR EACH ROW EXECUTE FUNCTION public.touch_canvas_context();