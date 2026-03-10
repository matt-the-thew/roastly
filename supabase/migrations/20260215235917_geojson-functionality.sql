CREATE EXTENSION postgis;

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  location GEOMETRY(Point, 4326),
  address VARCHAR(255),
  rating SMALLINT
);
