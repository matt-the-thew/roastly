select auth.send_email(
  'signup',
  'test@localhost',
  jsonb_build_object(
    'confirmation_url',
    'http://localhost:3000'
  )
);
