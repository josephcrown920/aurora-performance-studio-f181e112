CREATE TABLE public.perform_anywhere_campaigns (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 character_name text NOT NULL,
 reference_paths jsonb NOT NULL DEFAULT '[]'::jsonb,
 preferences text NOT NULL,
 plan jsonb NOT NULL,
 renders jsonb NOT NULL DEFAULT '{}'::jsonb,
 active_shot integer,
 blocked_message text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.perform_anywhere_campaigns TO authenticated;
GRANT ALL ON public.perform_anywhere_campaigns TO service_role;
ALTER TABLE public.perform_anywhere_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creators manage own Perform Anywhere campaigns" ON public.perform_anywhere_campaigns FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE FUNCTION public.touch_perform_anywhere_campaigns() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER touch_perform_anywhere_campaigns BEFORE UPDATE ON public.perform_anywhere_campaigns FOR EACH ROW EXECUTE FUNCTION public.touch_perform_anywhere_campaigns();