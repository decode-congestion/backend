const knexfile = require("./knexfile");

const env = process.env.NODE_ENV || "development";
const configOptions = knexfile[env];

const knex = require("knex")(configOptions);
const knexPostgis = require("knex-postgis");

const db = knex({ dialect: "postgres" });

// const st = knexPostgis(db);

knex
  .from("stops")
  .select("*")
  .where("stop_no", "<", 50050)
  .then(rows => {
    for (row of rows) {
      console.log(`${row["id"]} ${row["stop_no"]} ${row["point"]}`);
    }
  });

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
