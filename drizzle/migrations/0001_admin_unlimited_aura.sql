CREATE OR REPLACE FUNCTION public.reserve_credits(_user uuid, _amount integer, _reason text, _ref uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _ok bigint;
  _limit bigint;
  _spent numeric;
BEGIN
  -- Admins have unlimited Aura: approve the reservation without touching
  -- their balance, leaving a zero-delta audit row.
  IF public.has_role(_user, 'admin') THEN
    INSERT INTO public.credit_ledger (user_id, delta, reason, ref_id)
      VALUES (_user, 0, 'reserve:admin_free:' || _reason, _ref);
    RETURN true;
  END IF;

  SELECT daily_spend_limit INTO _limit FROM public.profiles WHERE user_id = _user FOR UPDATE;

  IF _limit IS NOT NULL THEN
    SELECT COALESCE(-SUM(delta), 0) INTO _spent
      FROM public.credit_ledger
     WHERE user_id = _user
       AND (reason LIKE 'reserve:%' OR reason LIKE 'release:%')
       AND created_at >= date_trunc('day', now() AT TIME ZONE 'utc') AT TIME ZONE 'utc';

    IF _spent + _amount > _limit THEN
      RAISE EXCEPTION 'daily_limit_reached';
    END IF;
  END IF;

  UPDATE public.profiles
     SET credits = credits - _amount,
         credits_reserved = credits_reserved + _amount
   WHERE user_id = _user
     AND credits >= _amount
  RETURNING credits INTO _ok;
  IF _ok IS NULL THEN RETURN false; END IF;
  INSERT INTO public.credit_ledger (user_id, delta, reason, ref_id)
    VALUES (_user, -_amount, 'reserve:' || _reason, _ref);
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.release_reservation(_user uuid, _amount integer, _reason text, _ref uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Admin reservations never moved any Aura, so there is nothing to give back.
  IF public.has_role(_user, 'admin') THEN
    INSERT INTO public.credit_ledger (user_id, delta, reason, ref_id)
      VALUES (_user, 0, 'release:admin_free:' || _reason, _ref);
    RETURN;
  END IF;
  UPDATE public.profiles
     SET credits = credits + _amount,
         credits_reserved = GREATEST(credits_reserved - _amount, 0)
   WHERE user_id = _user;
  INSERT INTO public.credit_ledger (user_id, delta, reason, ref_id)
    VALUES (_user, _amount, 'release:' || _reason, _ref);
END; $function$;

CREATE OR REPLACE FUNCTION public.deduct_credits(_user uuid, _amount integer, _reason text, _ref uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _new int;
BEGIN
  IF public.has_role(_user, 'admin') THEN
    INSERT INTO public.credit_ledger (user_id, delta, reason, ref_id) VALUES (_user, 0, 'admin_free:' || _reason, _ref);
    RETURN true;
  END IF;
  UPDATE public.profiles SET credits = credits - _amount
    WHERE id = _user AND credits >= _amount
    RETURNING credits INTO _new;
  IF _new IS NULL THEN RETURN false; END IF;
  INSERT INTO public.credit_ledger (user_id, delta, reason, ref_id) VALUES (_user, -_amount, _reason, _ref);
  RETURN true;
END; $function$;