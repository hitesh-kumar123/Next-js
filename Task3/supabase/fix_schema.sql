-- 1. FIX ROLE UPDATE TRIGGER: Allow server-side service_role (where auth.uid() is null) to change roles during public checkout and CSV imports.
CREATE OR REPLACE FUNCTION public.check_role_update()
RETURNS trigger AS $$
BEGIN
  IF old.role <> new.role THEN
    IF auth.uid() IS NOT NULL AND public.get_user_role(auth.uid()) <> 'Admin'::public.user_role THEN
      RAISE EXCEPTION 'Only Admins can change user roles.';
    END IF;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. FIX PUBLIC SUBDOMAIN CHECKOUT: Allow guest users to load active gym info, forms, products, and waivers.
-- Allow everyone to read Admin profiles (since subdomain is only set on Admin accounts)
DROP POLICY IF EXISTS "Allow public read access to users" ON public.users;
CREATE POLICY "Allow public read access to users" ON public.users
  FOR SELECT USING (
    role = 'Admin' OR 
    auth.uid() = id OR 
    (auth.uid() IS NOT NULL AND public.get_user_role(auth.uid()) IN ('Admin', 'Manager'))
  );

-- Allow everyone to read active forms
DROP POLICY IF EXISTS "Allow public read access to active signup forms" ON public.signup_forms;
CREATE POLICY "Allow public read access to active signup forms" ON public.signup_forms
  FOR SELECT USING (
    is_active = true OR 
    (auth.uid() IS NOT NULL AND public.get_user_role(auth.uid()) IN ('Admin', 'Manager'))
  );

-- Allow everyone to read products
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products" ON public.products
  FOR SELECT USING (true);

-- Allow everyone to read waivers
DROP POLICY IF EXISTS "Allow public read access to waivers" ON public.waivers;
CREATE POLICY "Allow public read access to waivers" ON public.waivers
  FOR SELECT USING (true);

-- Allow everyone to read form products junction table
DROP POLICY IF EXISTS "Allow public read access to form products" ON public.signup_form_products;
CREATE POLICY "Allow public read access to form products" ON public.signup_form_products
  FOR SELECT USING (true);


-- 3. REMOVE SECURITY VULNERABILITIES: Drop public client-side write permissions for memberships/waivers.
DROP POLICY IF EXISTS "Allow public to insert purchases during checkout" ON public.member_products;
DROP POLICY IF EXISTS "Allow public to insert agreements during checkout" ON public.waiver_agreements;


-- 4. EMAIL & SMS REMINDER SETTINGS: Add columns to users table for event notification toggles.
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email_reminders BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS sms_reminders BOOLEAN DEFAULT TRUE;

-- 5. UNIQUE INVITE CONSTRAINT: Add unique constraint on email to invites table to support upserts.
ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS invites_email_key;
ALTER TABLE public.invites ADD CONSTRAINT invites_email_key UNIQUE (email);

-- 6. TRAINER SCHEDULING RLS: Update classes table RLS to allow Trainers to insert and modify classes.
DROP POLICY IF EXISTS "Allow staff to insert classes" ON public.classes;
CREATE POLICY "Allow staff to insert classes" ON public.classes
  FOR INSERT TO authenticated WITH CHECK (public.get_user_role(auth.uid()) IN ('Admin', 'Manager', 'Trainer'));

DROP POLICY IF EXISTS "Allow staff to modify classes" ON public.classes;
CREATE POLICY "Allow staff to modify classes" ON public.classes
  FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) IN ('Admin', 'Manager', 'Trainer'));
