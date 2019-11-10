const assert = require("chai").assert;
const { _nearestStopOrNull } = require("../main/listener.js");
const { BusStop } = require("../main/location_models.js");

describe("#_nearestStopOrNull", () => {
  it("returns an array", () => {
    const loc = {
      lat: 49.262828,
      long: -123.115053
    };
    _nearestStopOrNull(loc).then(x => {
      console.log(x);
      assert.ok(x instanceof BusStop);
    });
  });
});
