SELECT
  id,
  stop_no,
  stops.point,
  ST_Y(stops.point) as lat,
  ST_X(stops.point) as long
FROM stops
WHERE
  ST_DWithin(
    stops.point,
    ST_SetSRID(ST_MakePoint(-123.114584, 49.263118), 4326),
    100,
    TRUE
  );