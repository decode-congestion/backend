const knexfile = require("./knexfile");

const env = process.env.NODE_ENV || "development";
const configOptions = knexfile[env];

const knex = require("knex")(configOptions);
const knexPostgis = require("knex-postgis");

const st = knexPostgis(knex);

knex
  .select("stop_no", "point", st.y("point").as("lat"), st.x("point").as("long"))
  .from("stops")
  .where(
    st.dwithin(
      "point",
      st.setSRID(st.makePoint(-123.114584, 49.263118), 4326),
      100,
      true
    )
  )
  .then(rows => {
    for (row of rows) {
      console.log(
        `${row["stop_no"]} ${row["point"]} ${row["lat"]} ${row["long"]}`
      );
    }
  });

// 	SELECT
//   id,
//   stop_no,
//   stops.point,
//   ST_Y(stops.point) as lat,
//   ST_X(stops.point) as long
// FROM stops
// WHERE
//   ST_DWithin(
//     stops.point,
//     ST_SetSRID(ST_MakePoint(-123.114584, 49.263118), 4326),
//     100,
//     TRUE
//   );

//console.log(sql)

// knex
//   .from("stops")
//   .select("point")
//   .where("stop_no", "=", 50001)
//   .then(rows => {
//     for (row of rows) {
//       console.log(`${st.x(row["point"])}`);
//     }
//   });

// knex("stops")
//   .select("point", st.asText("point"));

// knex
//   .from("stops")
//   .select("*")
//   .where("stop_no", "<", 50050)
//   .then(rows => {
//     for (row of rows) {
//       console.log(`${row["id"]} ${row["stop_no"]} ${row["point"]}`);
//     }
//   });

// knex
//   .from("stops")
//   .select("id", "stop_no", "point")
//   .where("");
// .then((rows) => {
// 	for (row of rows) {
// 		console.log(`${row['id']} ${row['stop_no']} ${row['point']}`);
// 	}
// })
// .catch((err) => { console.log( err); throw err})
// .finally(() => {
// 	knex.destroy();
// });
