-- Chapter settings (single row config for admin)
CREATE TABLE IF NOT EXISTS public.chapter_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_name text,
  charter_year integer,
  semester text,
  attendance_threshold_pct integer DEFAULT 70,
  dues_amount_cents integer,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Seed single row if empty
INSERT INTO public.chapter_settings (id, chapter_name, charter_year, semester, attendance_threshold_pct, dues_amount_cents)
SELECT gen_random_uuid(), 'Kappa Alpha Psi', 1911, 'Spring 2025', 70, 0
WHERE NOT EXISTS (SELECT 1 FROM public.chapter_settings LIMIT 1);

-- Audit log (who did what)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  target_type text,
  target_id text,
  details jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and e_board can read audit_log"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'e_board')
    )
  );

CREATE POLICY "Service can insert audit_log"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Violations (admin-only tracking)
CREATE TABLE IF NOT EXISTS public.violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  violation_type text NOT NULL,
  description text,
  severity text DEFAULT 'medium',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_violations_user_id ON public.violations(user_id);
CREATE INDEX IF NOT EXISTS idx_violations_created_at ON public.violations(created_at DESC);

ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and e_board can manage violations"
  ON public.violations FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'e_board'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'e_board'))
  );

-- Member notes (admin-only, per profile)
CREATE TABLE IF NOT EXISTS public.member_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  note text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_member_notes_profile_id ON public.member_notes(profile_id);

ALTER TABLE public.member_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and e_board can manage member_notes"
  ON public.member_notes FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'e_board'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'e_board'))
  );
