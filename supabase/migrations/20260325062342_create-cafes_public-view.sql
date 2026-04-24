create view cafes_public as
select
  name,
  extensions.ST_Y(location::extensions.geometry) as latitude,
  extensions.ST_X(location::extensions.geometry) as longitude,
  roast_level,
  brew_focus,
  vibe,
  description,
  has_wifi,
  has_bathroom,
  has_outlets,
  has_patio,
  is_verified
from cafes;