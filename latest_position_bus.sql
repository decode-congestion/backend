SELECT DISTINCT vp.vehicle_no 
, max_rec
, ST_Y(vp.point) as lat
, ST_X(vp.point) as long
FROM 
(
SELECT vehicle_no, max(recorded_at) as max_rec 
FROM vehicle_positions
GROUP BY vehicle_no 
) T1 
INNER JOIN vehicle_positions vp ON vp.vehicle_no = T1.vehicle_no AND vp.recorded_at = T1.max_rec
ORDER BY vp.vehicle_no 