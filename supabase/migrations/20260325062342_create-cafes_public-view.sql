create view cafes_public as
select
  name,
  ST_Lat(location) as latitude,
  ST_Long(location) as longitude,
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