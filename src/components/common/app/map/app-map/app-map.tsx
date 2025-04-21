import {
  Component,
  h,
  Method,
  State,
  Prop,
  Event,
  EventEmitter,
  Element,
  Host,
  Watch,
} from "@stencil/core";
import { TranslationService } from "../../../../../services/common/translations";
import { toastController } from "@ionic/core";
import { MAPBOX, Environment } from "../../../../../global/env";
import mapboxgl from "mapbox-gl";
//import {UDiveFilterService} from "../../../../../services/udive/ud-db-filter";
import {
  CollectionGroup,
  SearchTag,
} from "../../../../../interfaces/interfaces";
import { DatabaseService } from "../../../../../services/common/database";
import { Subscription } from "rxjs";
import { Marker } from "../../../../../interfaces/interfaces";

import { Geolocation } from "@capacitor/geolocation";
import { Network } from "@capacitor/network";
//import {TrasteelFilterService} from "../../../../../services/trasteel/ud-db-filter";
import { MapService, Position } from "../../../../../services/common/map";
import { UDiveFilterService } from "../../../../../services/udive/ud-db-filter";
import { TrasteelFilterService } from "../../../../../services/trasteel/common/trs-db-filter";
import { each, toNumber } from "lodash";

/*const shapes = {
  BLOB:
    "M129.9,75C86.6,150 -86.6,150 -129.9,75C-173.2,0 -86.6,-150 0,-150C86.6,-150 173.2,0 129.9,75Z",
  MAP_PIN:
    "M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z",
  SQUARE_PIN: "M22-48h-44v43h16l6 5 6-5h16z",
  SHIELD:
    "M18.8-31.8c.3-3.4 1.3-6.6 3.2-9.5l-7-6.7c-2.2 1.8-4.8 2.8-7.6 3-2.6.2-5.1-.2-7.5-1.4-2.4 1.1-4.9 1.6-7.5 1.4-2.7-.2-5.1-1.1-7.3-2.7l-7.1 6.7c1.7 2.9 2.7 6 2.9 9.2.1 1.5-.3 3.5-1.3 6.1-.5 1.5-.9 2.7-1.2 3.8-.2 1-.4 1.9-.5 2.5 0 2.8.8 5.3 2.5 7.5 1.3 1.6 3.5 3.4 6.5 5.4 3.3 1.6 5.8 2.6 7.6 3.1.5.2 1 .4 1.5.7l1.5.6c1.2.7 2 1.4 2.4 2.1.5-.8 1.3-1.5 2.4-2.1.7-.3 1.3-.5 1.9-.8.5-.2.9-.4 1.1-.5.4-.1.9-.3 1.5-.6.6-.2 1.3-.5 2.2-.8 1.7-.6 3-1.1 3.8-1.6 2.9-2 5.1-3.8 6.4-5.3 1.7-2.2 2.6-4.8 2.5-7.6-.1-1.3-.7-3.3-1.7-6.1-.9-2.8-1.3-4.9-1.2-6.4z",
  ROUTE:
    "M24-28.3c-.2-13.3-7.9-18.5-8.3-18.7l-1.2-.8-1.2.8c-2 1.4-4.1 2-6.1 2-3.4 0-5.8-1.9-5.9-1.9l-1.3-1.1-1.3 1.1c-.1.1-2.5 1.9-5.9 1.9-2.1 0-4.1-.7-6.1-2l-1.2-.8-1.2.8c-.8.6-8 5.9-8.2 18.7-.2 1.1 2.9 22.2 23.9 28.3 22.9-6.7 24.1-26.9 24-28.3z",
  SQUARE: "M-24-48h48v48h-48z",
  SQUARE_ROUNDED:
    "M24-8c0 4.4-3.6 8-8 8h-32c-4.4 0-8-3.6-8-8v-32c0-4.4 3.6-8 8-8h32c4.4 0 8 3.6 8 8v32z"
};*/

@Component({
  tag: "app-map",
  styleUrl: "app-map.scss",
})
export class AppMap {
  @Element() el: HTMLElement;
  @Event() mapLoadingCompleted: EventEmitter;
  @Event() dragMarkerEnd: EventEmitter;
  @Event() emitMapBounds: EventEmitter;
  @Prop() pageId: string;
  @Prop({ mutable: true }) markers: Marker[] = []; //used to insert markers from outside component - in case of any marker then the map is not populated
  @Prop() markersAsFeature = false;
  @Prop({ mutable: true }) searchTags: SearchTag[] = []; //used to search markers inside the database

  @Prop() center: any;
  @Prop({ mutable: true }) currentPosition: boolean = false;
  @Prop({ mutable: true }) draggableMarkerPosition: any; //set to {} to get the marker in the current user position - otherwise set to lat/lon

  @State() mapsLoaded: boolean = false;
  @State() loadErrorMessage: string = "";

  public map: any;

  private mapElement: any;
  private networkHandler = null;
  toast: HTMLIonToastElement;
  currentMarkers = [];
  draggableMapMarker: any;
  startLocation: Position = null;
  searchFilters = [];
  markerCollections: CollectionGroup;
  geoJsonData: any[] = [];
  actualCenterPosition: any;
  mapDataSub$: Subscription;
  dbFilter: any;

  waitForMapCounts = 0;

  @Watch("markers")
  updateMarkers() {
    //remove markers
    this.currentMarkers.forEach((marker) => {
      marker.remove();
    });
    this.addMarkers();
  }

  addMarkers() {
    //add markers as clustered points like MapData or as normal markers
    if (this.markersAsFeature) {
      if (this.markers.length > 0) {
        this.addMapPointsForCollection(
          this.markers,
          "primary",
          "markers-feature"
        );
        this.fitToBounds(this.markers);
      }
    } else {
      //add markers
      this.currentMarkers = [];
      if (this.markers.length > 0) {
        this.markers.forEach((marker: Marker) => {
          var el = Object.assign(document.createElement("app-map-icon"), {
            marker: marker,
          });
          let lngLat = new mapboxgl.LngLat(
            toNumber(marker.longitude),
            toNumber(marker.latitude)
          );
          const mapBoxMarker = new mapboxgl.Marker(el)
            .setLngLat(lngLat)
            .addTo(this.map);
          // Add a layer for the marker icon

          if (marker.clickFn)
            mapBoxMarker.getElement().addEventListener("click", () => {
              marker.clickFn();
            });
          this.currentMarkers.push(mapBoxMarker);
        });
        this.fitToBounds(this.markers);
      }
    }
  }

  @Method()
  async mapLoaded(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.waitForMapCounts = 0;
      this.waitForMap(resolve, reject);
    });
  }
  waitForMap(resolveFunc, rejectFunc) {
    if (this.map) {
      this.map.on("load", () => resolveFunc(true));
    } else if (this.waitForMapCounts <= 20) {
      setTimeout(() => {
        this.waitForMapCounts += 1;
        this.waitForMap(resolveFunc, rejectFunc);
      }, 200);
    } else {
      rejectFunc(false);
    }
  }

  @Method()
  async createLine(id, pointA, pointB) {
    if (pointA && pointB) {
      const geojson = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [
                  pointA.position.geopoint.longitude,
                  pointA.position.geopoint.latitude,
                ],
                [
                  pointB.position.geopoint.longitude,
                  pointB.position.geopoint.latitude,
                ],
              ],
            },
          },
        ],
      };
      this.map.addSource(id, {
        type: "geojson",
        data: geojson,
      });
      this.map.addLayer({
        id: id,
        type: "line",
        source: id,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#1ac8ff",
          "line-width": 5,
        },
      });
    }

    return true;
  }

  @Method()
  async removeLine(id) {
    if (this.map.getLayer(id)) this.map.removeLayer(id);
    if (this.map.getSource(id)) this.map.removeSource(id);
    return true;
  }

  @Method()
  async fitToBounds(points?) {
    if (this.map) {
      if (points && points.length > 0) {
        if (points.length > 1) {
          const bounds = new mapboxgl.LngLatBounds();
          points.forEach((point) => {
            if (point) {
              let lngLat = null;
              if (point.position) {
                lngLat = new mapboxgl.LngLat(
                  point.position.geopoint.longitude,
                  point.position.geopoint.latitude
                );
              } else {
                lngLat = new mapboxgl.LngLat(point.longitude, point.latitude);
              }
              bounds.extend(lngLat);
            }
          });
          this.map.fitBounds(bounds, {
            padding: { top: 100, bottom: 100, left: 100, right: 100 },
            duration: 500,
          });
        } else {
          //set zoom level and center map
          let lngLat = null;
          if (points[0].position) {
            lngLat = new mapboxgl.LngLat(
              points[0].position.geopoint.longitude,
              points[0].position.geopoint.latitude
            );
          } else {
            lngLat = new mapboxgl.LngLat(
              points[0].longitude,
              points[0].latitude
            );
          }
          this.map.easeTo({
            center: lngLat,
            zoom: 18,
          });
        }
        this.map.resize();
        return true;
      } else if (this.geoJsonData.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        this.geoJsonData.forEach((geojson) => {
          geojson.features.forEach((feature) => {
            bounds.extend(feature.geometry.coordinates);
          });
        });
        this.map.fitBounds(bounds, {
          padding: { top: 100, bottom: 100, left: 100, right: 100 },
          duration: 500,
        });
        return true;
      } else {
        return false;
      }
    }
  }

  @Method()
  async triggerMapResize() {
    this.mapLoaded().then(() => {
      this.mapFlyTo(this.actualCenterPosition);
      this.map.resize();
    });
  }

  @Method()
  async closePopup() {
    this.map.fire("closePopup");
    return true;
  }

  @Method()
  async updateSearchTags(searchTags) {
    this.searchTags = searchTags;
    this.dbFilter.filterDocuments(searchTags);
    return true;
  }

  @Watch("draggableMarkerPosition")
  async updateDraggableMarkerPos() {
    const lngLat = new mapboxgl.LngLat(
      this.draggableMarkerPosition.lon,
      this.draggableMarkerPosition.lat
    );
    this.draggableMapMarker.setLngLat(lngLat);
    this.mapFlyTo(lngLat);
    return true;
  }

  componentWillLoad() {
    this.startLocation = MapService.getPosition();
    //get updates from data collections
    if (Environment.isUdive() || Environment.isDecoplanner()) {
      this.dbFilter = UDiveFilterService;
    } else if (Environment.isTrasteel()) {
      this.dbFilter = TrasteelFilterService;
    }
    if (this.dbFilter) {
      this.mapDataSub$ = this.dbFilter.mapDataSub$.subscribe((data) => {
        this.markerCollections = data;
        this.createGeoJsonData();
      });
    } else {
      this.createGeoJsonData();
    }
  }

  componentDidLoad() {
    //init map
    this.init().then(
      () => {
        this.loadErrorMessage = "";
      },
      (err) => {
        //this.loadErrorMessage = err;
        this.mapsLoaded = false;
        //this.createGeoJsonData();
        this.createToastOverlay("Error: " + err);
        console.log("Error ", err);
      }
    );
  }

  disconnectedCallback() {
    this.toast ? this.toast.dismiss() : undefined;
    this.mapDataSub$ ? this.mapDataSub$.unsubscribe() : undefined;
  }

  async createToastOverlay(error) {
    this.toast ? this.toast.dismiss() : undefined;
    let message = error
      ? error
      : TranslationService.getTransl(
          "current_position",
          "Looking for current position"
        );
    this.toast = await toastController.create({
      message: error ? message : message + "...",
      duration: error ? 2000 : 0,
      color: error ? "danger" : "dark",
      buttons: [
        {
          icon: "close",
          role: "cancel",
        },
      ],
    });
    this.toast.present();
  }

  init(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loadSDK().then(
        () => {
          this.initMap().then(
            () => {
              resolve(true);
            },
            (err) => {
              reject(err);
            }
          );
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  loadSDK(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.mapsLoaded) {
        Network.getStatus().then(
          (status) => {
            if (status.connected) {
              resolve(true);
            } else {
              if (this.networkHandler == null) {
                this.networkHandler = Network.addListener(
                  "networkStatusChange",
                  (status) => {
                    if (status.connected) {
                      this.networkHandler.remove();
                      this.init().then(
                        () => {
                          this.loadErrorMessage = "";
                        },
                        (err) => {
                          console.log("Error ", err);
                          this.createToastOverlay("Error: " + err);
                          //this.loadErrorMessage = err;
                        }
                      );
                    }
                  }
                );
              }
              reject("Network offline");
            }
          },
          (err) => {
            console.log(err);
            // NOTE: navigator.onLine temporarily required until Network plugin has web implementation
            if (navigator.onLine) {
              resolve(true);
            } else {
              reject("Network offline");
            }
          }
        );
      } else {
        reject("SDK already loaded");
      }
    });
  }

  async initMap(): Promise<any> {
    this.mapElement = this.el.querySelector("#map-container-" + this.pageId);
    const previousUserLocation: Position =
      await DatabaseService.getLocalDocument("lastUserLocation");
    var previousUserZoom =
      await DatabaseService.getLocalDocument("lastUserZoom");

    //if draggablemarker then don't find position and center on the marker
    if (this.draggableMarkerPosition) {
      this.currentPosition = false;
    } else if (this.center) {
      this.currentPosition = false;
    } else if (!previousUserLocation || !previousUserLocation.geopoint) {
      //find current location if there is no previous user location
      this.currentPosition = true;
    } else {
      this.startLocation = MapService.getPosition(
        previousUserLocation.geopoint.latitude,
        previousUserLocation.geopoint.longitude
      );
    }
    previousUserZoom = previousUserZoom ? previousUserZoom : 10;

    mapboxgl.accessToken = MAPBOX;

    let center = this.center
      ? new mapboxgl.LngLat(
          this.center.position.geopoint.longitude,
          this.center.position.geopoint.latitude
        )
      : new mapboxgl.LngLat(
          this.startLocation.geopoint.longitude,
          this.startLocation.geopoint.latitude
        );
    this.map = new mapboxgl.Map({
      container: this.mapElement,
      attributionControl: false, //need this to show a compact attribution icon (i) instead of the whole text
      center: center,
      zoom: this.center ? "15" : previousUserZoom,
    });
    let layerId = "satellite-v9";
    this.map.setStyle("mapbox://styles/mapbox/" + layerId);
    this.map.on("load", () => {
      this.mapElement.style.visibility = "visible";
      this.map.resize();
      this.mapsLoaded = true;
      if (this.dbFilter) {
        this.dbFilter.sendMapData();
      } else {
        //run incase of no dbFilter to load markers
        this.createGeoJsonData();
      }
      this.loadErrorMessage = "";
      // Add geolocate control to the map.
      this.map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
        }),
        "bottom-left"
      );
      this.mapLoadingCompleted.emit(true);
    });
    this.map.on("moveend", () => {
      this.saveCurrentPosition();
      var bounds = this.map.getBounds();
      this.emitMapBounds.emit(bounds);
    });

    this.map.on("zoom", () => {
      this.saveCurrentPosition();
    });

    return this.setCurrentPosition();
  }

  async setCurrentPosition(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      //search for user position if required by Prop or if there is a new draggable marker to be set or if there is no previous user current position
      if (
        this.currentPosition ||
        (this.draggableMarkerPosition &&
          Object.keys(this.draggableMarkerPosition).length == 0) //new site/etc. draggableMarker = {}
      ) {
        await this.createToastOverlay(false);
        let pos = {
          latitude: this.startLocation.geopoint.latitude,
          longitude: this.startLocation.geopoint.longitude,
        };
        Geolocation.getCurrentPosition().then(
          (position) => {
            if (position && position.coords) {
              pos = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
            }
            if (!this.center) {
              let lngLat = new mapboxgl.LngLat(pos.longitude, pos.latitude);
              this.mapFlyTo(lngLat);
            }
            //save position in local storage for next center
            this.saveCurrentPosition();
            if (this.currentPosition) {
              //this.geoPositionMarker(pos.latitude, pos.longitude);
            } else {
              this.draggableMarker(pos.latitude, pos.longitude);
            }
            this.toast.dismiss();

            resolve(true);
          },
          () => {
            //fly anyway to last known position and set draggable marker
            let lngLat = new mapboxgl.LngLat(pos.longitude, pos.latitude);
            this.mapFlyTo(lngLat);
            if (!this.currentPosition) {
              this.draggableMarker(pos.latitude, pos.longitude);
            }
            reject("Could not find current position");
          }
        );
      } else if (
        this.draggableMarkerPosition &&
        this.draggableMarkerPosition.lat
      ) {
        this.draggableMarker(
          this.draggableMarkerPosition.lat,
          this.draggableMarkerPosition.lon
        );
        resolve(true);
      } else {
        resolve(true);
      }
    });
  }

  saveCurrentPosition() {
    //save position in local storage for next center
    if (this.pageId == "map" || this.pageId == "dashboard") {
      const center = this.map.getCenter();
      DatabaseService.saveLocalDocument(
        "lastUserLocation",
        MapService.getPosition(center.lat, center.lon)
      );
      DatabaseService.saveLocalDocument("lastUserZoom", this.map.getZoom());
    }
  }

  /*async geoPositionMarker(lat, lon) {
    var size = 100;
    var map = this.map;
    // implementation of CustomLayerInterface to draw a pulsing dot icon on the map
    // see https://docs.mapbox.com/mapbox-gl-js/api/#customlayerinterface for more info
    var pulsingDot = {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),

      // get rendering context for the map canvas when layer is added to the map
      onAdd: function() {
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext("2d");
      },

      // called once before every frame where the icon will be used
      render: function() {
        var duration = 1000;
        var t = (performance.now() % duration) / duration;

        var radius = (size / 2) * 0.3;
        var outerRadius = (size / 3) * 0.7 * t + radius;
        var context = this.context;

        // draw outer circle
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
          this.width / 2,
          this.height / 2,
          outerRadius,
          0,
          Math.PI * 2
        );
        context.fillStyle = "rgba(137, 200, 200," + (1 - t) + ")";
        context.fill();

        // draw inner circle
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        context.fillStyle = "rgba(137, 196, 244, 1)";
        context.strokeStyle = "white";
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        // update this image's data with data from the canvas
        this.data = context.getImageData(0, 0, this.width, this.height).data;

        // continuously repaint the map, resulting in the smooth animation of the dot
        map.triggerRepaint();

        // return `true` to let the map know that the image was updated
        return true;
      }
    };

    this.map.addImage("pulsing-dot", pulsingDot, { pixelRatio: 2 });

    this.map.addSource("points", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [lon, lat]
            }
          }
        ]
      }
    });
    this.map.addLayer({
      id: "points",
      type: "symbol",
      source: "points",
      layout: {
        "icon-image": "pulsing-dot"
      }
    });
  }*/

  async draggableMarker(lat, lon) {
    // create a HTML element for each feature
    var el = document.createElement("ion-icon");
    el.className = "marker";
    el.name = "pin";
    el.color = "danger";
    el.size = "large";
    let lngLat = new mapboxgl.LngLat(toNumber(lon), toNumber(lat));
    this.draggableMapMarker = new mapboxgl.Marker(el)
      .setLngLat(lngLat)
      .addTo(this.map);
    this.draggableMapMarker.setDraggable(true);
    this.draggableMapMarker.setOffset([0, -12]);
    this.draggableMapMarker.on("dragend", () => {
      var lngLat = this.draggableMapMarker.getLngLat();
      this.mapFlyTo(lngLat);
    });
    this.mapFlyTo(lngLat);
  }

  mapFlyTo(lngLat) {
    if (lngLat && lngLat.lat) {
      this.actualCenterPosition = lngLat;
      this.dragMarkerEnd.emit({
        lat: lngLat.lat,
        lon: lngLat.lng,
      });
      this.map.flyTo({
        center: lngLat,
        essential: true,
      });
    }
  }

  async createGeoJsonData() {
    if (this.mapsLoaded) {
      if (!this.markers || this.markers.length == 0) {
        //this.dbFilter.filterDocuments(this.searchTags);
        //this.markerCollections = this.dbFilter.mapData;
        this.geoJsonData = [];
        each(this.markerCollections, async (collectionItems, collectionKey) => {
          const collection = collectionItems.filteredCollection;
          this.addMapPointsForCollection(
            collection,
            collectionItems.icon ? collectionItems.icon.color : "primary",
            collectionKey
          );
        });
      } else {
        this.addMarkers();
      }
    }
  }

  addMapPointsForCollection(collection, color, key) {
    const featureCollection = {
      type: "FeatureCollection",
      crs: {
        type: "name",
        properties: {
          name: key,
          color: color,
        },
      },
      features: [],
    };
    each(collection, async (markerItem, markerKey) => {
      if (markerItem && markerItem.position) {
        featureCollection.features.push({
          type: "Feature",
          properties: {
            id: markerKey,
            item: JSON.stringify(markerItem),
            collection: key,
          },
          geometry: {
            type: "Point",
            coordinates: [
              markerItem.position.geopoint.longitude,
              markerItem.position.geopoint.latitude,
            ],
          },
        });
      }
    });

    if (featureCollection.features.length > 0) {
      this.geoJsonData.push(featureCollection);
      this.addCluster(featureCollection);
    } else {
      //remove old collection
      this.removeCluster(featureCollection);
    }
  }

  async addCluster(geoJsonData) {
    if (this.map) {
      const dataName = geoJsonData.crs.properties.name;
      const dataColor = geoJsonData.crs.properties.color;

      //set first layers
      const layer1Id = "clusters-" + dataName;
      const layer2Id = "cluster-count-" + dataName;
      const layer3Id = "unclustered-point-" + dataName;
      const source = this.map.getSource(dataName);
      if (!source) {
        // Add a new source from our GeoJSON data and
        // set the 'cluster' option to true. GL-JS will
        // add the point_count property to your source data.
        this.map.addSource(dataName, {
          type: "geojson",
          // Point to GeoJSON data.
          data: geoJsonData,
          cluster: true,
          clusterMaxZoom: 14, // Max zoom to cluster points on
          clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
        });
        this.map.addLayer({
          id: layer1Id,
          type: "circle",
          source: dataName,
          filter: ["has", "point_count"],
          paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * 20px circles when point count is less than 100
            //   * 30px circles when point count is between 100 and 300
            //   * 40px circles when point count is greater than or equal to 300
            "circle-color": getComputedStyle(
              document.documentElement
            ).getPropertyValue("--ion-color-" + dataColor),
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              100,
              30,
              300,
              40,
            ],
          },
        });

        this.map.addLayer({
          id: layer2Id,
          type: "symbol",
          source: dataName,
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
        });

        this.map.addLayer({
          id: layer3Id,
          type: "circle",
          source: dataName,
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": getComputedStyle(
              document.documentElement
            ).getPropertyValue("--ion-color-" + dataColor),
            "circle-radius": 8,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
          },
        });

        // inspect a cluster on click
        this.map.on("click", layer1Id, (e) => {
          var features = this.map.queryRenderedFeatures(e.point, {
            layers: [layer1Id],
          });
          var clusterId = features[0].properties.cluster_id;
          this.map
            .getSource(dataName)
            .getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return;

              this.map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom,
              });
            });
        });

        // When a click event occurs on a feature in
        // the unclustered-point layer, open a popup at
        // the location of the feature, with
        // description HTML from its properties.
        this.map.on("click", layer3Id, (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          // Ensure that if the map is zoomed out such that
          // multiple copies of the feature are visible, the
          // popup appears over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          // create the popup
          const properties = JSON.stringify(e.features[0].properties);
          const popup = new mapboxgl.Popup({ offset: 15 })
            .setLngLat(coordinates)
            .setHTML("<app-map-popup properties='" + properties + "' />")
            .addTo(this.map);
          // Add a custom event listener to the map
          this.map.on("closePopup", () => {
            popup.remove();
          });
        });

        this.map.on("mouseenter", layer1Id, () => {
          this.map.getCanvas().style.cursor = "pointer";
        });
        this.map.on("mouseleave", layer1Id, () => {
          this.map.getCanvas().style.cursor = "";
        });
        this.map.on("mouseenter", layer3Id, () => {
          this.map.getCanvas().style.cursor = "pointer";
        });
        this.map.on("mouseleave", layer3Id, () => {
          this.map.getCanvas().style.cursor = "";
        });
      } else {
        //update source data
        source.setData(geoJsonData);
      }
    }
  }

  removeCluster(geoJsonData) {
    if (this.map) {
      const sourceId = geoJsonData.crs.properties.name;
      // Find all layers that use the source
      this.map.getStyle().layers.forEach((layer) => {
        if (layer.source === sourceId) {
          this.map.removeLayer(layer.id);
        }
      });

      // Once all layers are removed, remove the source
      if (this.map.getSource(sourceId)) {
        this.map.removeSource(sourceId);
      }
    }
  }

  /*@Method()
  async addMarker(marker: Marker) {
    var mapMarker = null;
    if (USE_GOOGLE) {
      let latLng = new google.maps.LatLng(marker.lat, marker.lon);
      mapMarker = new google.maps.Marker({
        map: this.map,
        position: latLng,
        animation: google.maps.Animation.DROP,
        icon: {
          path: shapes.ROUTE,
          fillColor: marker.icon.color,
          fillOpacity: 0.8,
          strokeColor: "",
          strokeWeight: 0,
          labelOrigin: new google.maps.Point(0, -26)
        },
        label: {
          fontFamily: "'map-icons'",
          text: marker.icon.name, //icon code
          fontSize: "30px",
          fontWeight: "900", //careful! some icons in FA5 only exist for specific font weights
          color: "blue" //color of the text inside marker
        }
      });
    } else {
      let latLng = new mapboxgl.LngLat(
        toNumber(marker.lon),
        toNumber(marker.lat)
      );
      // create a HTML element for each feature
      var el = document.createElement("ion-icon");
      if (marker.icon.type == "mapicon") {
        el.className = "marker map-icon " + marker.icon.name;
      } else {
        el.className = "marker";
        el.name = marker.icon.name;
      }
      el.color = marker.icon.color;
      // make a marker for each feature and add to the map
      // create the popup
      var popup = new mapboxgl.Popup({ offset: 15 }).setHTML(
        "<app-map-popup name='" +
          marker.name +
          "' collection='" +
          marker.collection +
          "' item='" +
          marker.id +
          "' />"
      );
      mapMarker = new mapboxgl.Marker(el)
        .setLngLat(latLng)
        .setPopup(popup)
        .addTo(this.map);
    }
    return mapMarker;
  }

  @Method()
  async getCenter() {
    return this.map.getCenter();
  }*/

  render() {
    return (
      <Host>
        <div id={"map-container-" + this.pageId}></div>
        {!this.mapsLoaded ? (
          <div id='load-message'>
            {this.loadErrorMessage != "" ? (
              <div>
                <ion-icon name='warning' color='dark'></ion-icon>
                <ion-text color='dark'>
                  <h3>{this.loadErrorMessage}</h3>
                </ion-text>
              </div>
            ) : (
              <div>
                <ion-spinner name='bubbles' color='dark'></ion-spinner>
                <ion-text color='dark'>
                  <h3>
                    <my-transl tag='loading_map' text='Loading map'></my-transl>
                    ...
                  </h3>
                </ion-text>
              </div>
            )}
          </div>
        ) : undefined}
      </Host>
    );
  }
}
