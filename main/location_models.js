class Bus {
  constructor(vehicleNum) {
    this.vehicleNum = vehicleNum;
  }
}

class BusStop {
  constructor(stopNum, coords) {
    this.stopNum = stopNum;
    this.coords = coords;
  }

  get latitude() {
    return this.coords.latitude;
  }
  get longitude() {
    return this.coords.longitude;
  }
}

class Coordinates {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }
}

module.exports = { Bus, BusStop, Coordinates };
