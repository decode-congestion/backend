const knexfile = require("./knexfile");

const env = process.env.NODE_ENV || "development";
const configOptions = knexfile[env];

const knex = require("knex")(configOptions);
const knexPostgis = require("knex-postgis");

const st = knexPostgis(knex);

// knex
//   .select("stop_no", "point", st.y("point").as("lat"), st.x("point").as("long"))
//   .from("stops")
//   .where(
//     st.dwithin(
//       "point",
//       st.setSRID(st.makePoint(-123.114584, 49.263118), 4326),
//       100,
//       true
//     )
//   )
//   .then(rows => {
//     for (row of rows) {
//       console.log(
//         `${row["stop_no"]} ${row["point"]} ${row["lat"]} ${row["long"]}`
//       );
//     }
//   });

module.exports = { knex, st };
