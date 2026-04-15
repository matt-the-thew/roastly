create view cafes_location_only as
select
  id,
  name,
  ST_Y(location::geometry) as latitude,
  ST_X(location::geometry) as longitude,
from cafes;