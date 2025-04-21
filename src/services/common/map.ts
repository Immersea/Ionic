import { BehaviorSubject } from "rxjs";
import { Marker } from "../../interfaces/interfaces";
import { geohashForLocation } from "geofire-common/dist/geofire-common/index.esm.js";
import { GeoPoint } from "firebase/firestore";
import { Environment } from "../../global/env";

export class Position {
  geohash: string;
  geopoint: GeoPoint;
}

export class LocationIQ {
  place_id: string;
  lat: number;
  lon: number;
  display_name: string;
  osm_id: string;
  osm_typ: string;
  address: {
    city: string;
    country: string;
    country_code: string;
    county: string;
    postcode: string;
    road: string;
    state: string;
    suburb: string;
  };
  boundingbox: string[];
  class: string;
  icon: string;
  importance: number;
  type: string;

  constructor(data?) {
    this.place_id = data && data.place_id ? data.place_id : null;
    this.lat = data && data.lat ? Number(data.lat) : null;
    this.lon = data && data.lon ? Number(data.lon) : null;
    this.display_name = data && data.display_name ? data.display_name : null;
    this.osm_id = data && data.osm_id ? data.osm_id : null;
    this.osm_typ = data && data.osm_typ ? data.osm_typ : null;
    this.address = {
      city: null,
      country: null,
      country_code: null,
      county: null,
      postcode: null,
      road: null,
      state: null,
      suburb: null,
    };
    if (data && data.address) {
      this.address.city = data.address.city ? data.address.city : null;
      this.address.country = data.address.country ? data.address.country : null;
      this.address.country_code = data.address.country_code
        ? data.address.country_code
        : null;
      this.address.county = data.address.county ? data.address.county : null;
      this.address.postcode = data.address.postcode
        ? data.address.postcode
        : null;
      this.address.road = data.address.road ? data.address.road : null;
      this.address.state = data.address.state ? data.address.state : null;
      this.address.suburb = data.address.suburb ? data.address.suburb : null;
    }
    this.boundingbox = data && data.boundingbox ? data.boundingbox : null;
    this.class = data && data.class ? data.class : null;
    this.icon = data && data.icon ? data.icon : null;
    this.importance = data && data.importance ? data.importance : null;
    this.type = data && data.type ? data.type : null;
  }
}

export class MapController {
  mapMarkerClick$: BehaviorSubject<Marker> = new BehaviorSubject(<Marker>{});

  markerClicked(marker: Marker) {
    this.mapMarkerClick$.next(marker);
  }

  getStandardPosition() {
    if (Environment.isTrasteel()) {
      return { lat: 46.00773, lng: 8.95504 }; //Trasteel position
    } else {
      return { lat: 46, lng: 13 };
    }
  }

  getPosition(lat?: number, lng?: number): Position {
    // Compute the GeoHash for a lat/lng point
    if (!lat) lat = this.getStandardPosition().lat;
    if (!lng) lng = this.getStandardPosition().lng;
    const hash = geohashForLocation([lat, lng]);
    return {
      geohash: hash,
      geopoint: new GeoPoint(lat, lng),
    };
  }

  setPosition(position: any): Position {
    if (
      position.geohash &&
      position.geopoint &&
      (position.geopoint.latitude || position.geopoint._latitude) &&
      (position.geopoint.longitude || position.geopoint._latitude)
    ) {
      const lat = position.geopoint.latitude
        ? position.geopoint.latitude
        : position.geopoint._latitude;
      const lon = position.geopoint.longitude
        ? position.geopoint.longitude
        : position.geopoint._longitude;
      return {
        geohash: position.geohash,
        geopoint: new GeoPoint(lat, lon),
      };
    } else {
      return null;
    }
  }
}
export const MapService = new MapController();
