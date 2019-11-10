
DROP TABLE IF EXISTS testcase 

;

CREATE TABLE testcase(gid serial primary key)

;

SELECT AddGeometryColumn('public', 'testcase', 'the_geom', 4326, 'POLYGON', 2)

;

INSERT INTO testcase(the_geom)
    SELECT ST_buffer(ST_setsrid(ST_makepoint(-123.154358 + n*random()/500.00, 49.263795 + n*random()/500.00),4326), n*0.0001)
        FROM generate_series(1,500) As n

;

CREATE INDEX idx_testcase_the_geom  ON testcase USING gist(the_geom);