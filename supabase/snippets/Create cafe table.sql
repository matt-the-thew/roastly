CREATE TABLE cafes (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name varchar(254) NOT NULL,
  location geography(POINT) NOT NULL,
  info TEXT,
)