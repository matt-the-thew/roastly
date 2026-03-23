INSERT INTO cafes (name, slug, location, roast_level, brew_focus, vibe, description, has_wifi, has_bathroom, has_outlets, has_patio)
VALUES 
  (
    'Cafe Sapientia', 
    'Sapientia',
    extensions.st_point(-118.78461047927505, 34.18507587654156), 
    'light',
    'both',
    'quiet',
    'This joint is a cozy, underground neighborhood favorite. On weekends it''s absolutely hopping; between the early morning rush and the after-school rush, it''s a quiet place to get some good work done.',
    true,
    true,
    true,
    true
  ),
  (
    'Five07 on the Boulevard', 
    'T.O. Five07',
    extensions.st_point(-118.837267, 34.170472), 
    'dark',
    'espresso',
    'grab-and-go',
    'This cafe is a sister location of a larger, sit-down type of joint up the 23. However, they send all their most senior baristas here, to hold down the fort while most of the staff works the other cafe. This means that the coffee here is the best of the best. There are a few seats, and a couple of tables on the sidewalk.',
    true,
    true,
    true,
    false
  ),
  (
    'Ragamuffin Coffee Roasters', 
    'Ragamuffin',
    extensions.st_point(-118.953329, 34.179434), 
    'dark',
    'espresso',
    'social',
    'Ragamuffin has few locations, if I remember right. This one, however, has really incredible breakfast burritos in the morning. Pair this with a constantly changing, creative pastry selection and you''ve got a cafe that''s worth spending some time in.',
    true,
    true,
    true,
    false
  )