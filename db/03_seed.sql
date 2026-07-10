-- ============================================================================
--  AMIS – seed data (safe to run once, otherwise idempotent via ON CONFLICT)
-- ============================================================================

-- Reference values ------------------------------------------------------------
insert into public.regions (name, code) values
  ('National Capital Region', 'NCR'),
  ('Region I', 'R1'),
  ('Region II', 'R2'),
  ('Region III', 'R3'),
  ('CALABARZON', 'R4A'),
  ('MIMAROPA', 'R4B'),
  ('Region V', 'R5'),
  ('Region VI', 'R6'),
  ('Region VII', 'R7'),
  ('Region VIII', 'R8'),
  ('Region IX', 'R9'),
  ('Region X', 'R10'),
  ('Region XI', 'R11'),
  ('Region XII', 'R12'),
  ('Caraga', 'R13'),
  ('BARMM', 'BARMM'),
  ('CAR', 'CAR')
on conflict (name) do nothing;

insert into public.units_of_measurement (name, code) values
  ('Piece','pc'), ('Set','set'), ('Box','box'), ('Ream','ream'),
  ('Roll','roll'), ('Bottle','btl'), ('Meter','m'), ('Kilogram','kg')
on conflict (code) do nothing;

insert into public.custodian_types (name) values
  ('Property Custodian'), ('End User'), ('IT Custodian'), ('Warehouse Custodian')
on conflict (name) do nothing;

insert into public.classifications (name) values
  ('IT Equipment'), ('Office Furniture'), ('Vehicle'), ('Consumable'),
  ('Semi-Expendable Property (SEP)'), ('Property, Plant and Equipment (PPE)')
on conflict (name) do nothing;

insert into public.categories (name) values
  ('Computer'), ('Printer'), ('Networking'), ('Peripheral'),
  ('Furniture'), ('Appliance'), ('Tool'), ('Supplies')
on conflict (name) do nothing;

insert into public.security_questions (question) values
  ('What is your favorite color?'),
  ('What was the name of your first pet?'),
  ('In what city were you born?'),
  ('What is your mother''s maiden name?'),
  ('What was the name of your first school?')
on conflict (question) do nothing;
