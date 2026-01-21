CREATE TABLE hello_world (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  greeting text,
  created_at timestamp with time zone DEFAULT now()
);
