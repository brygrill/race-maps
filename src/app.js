import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import fire from './firebase';
import bc50k from './data/bc50k.json';
import bc50kMarkers from './data/bc50kmarkers.json';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX;
const me = process.env.REACT_APP_ME;

export default class App extends Component {
  state = {
    loc: [-76.05, 40.39],
  };

  componentDidMount() {
    // Init Map
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/outdoors-v9',
      center: [-76.05, 40.39],
      zoom: 12.5,
    });

    // Add Controls
    map.addControl(new mapboxgl.NavigationControl());

    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
    );

    // Load Map
    this.mapOnLoad(map).then(() => {
      // Get location
      this.getMyLocation(map);
    }).catch(error => {
      console.log(error);
    })
  }

  getMyLocation = map => {
    const loc = fire.database().ref(`users/${me}`);
    loc.on('value', data => {
      const locData = data.val();
      const lng = locData.location.coords.longitude;
      const lat = locData.location.coords.latitude;
      // can seem to find source when fires right away
      // this is sucky but should work for now
      setTimeout(() => {
      map
        .getSource('mylocation')
        .setData(this.locationToGeoJson([lng, lat]));
      }, 1500);
      this.setState({ loc: locData });
    });
  };

  locationToGeoJson = coordinates => {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates,
      },
      properties: {},
    };
  };

  mapOnLoad = map => {
    return new Promise((resolve, reject) => {
      try {
        map.on('load', () => {
          // Blues Cruise course
          map.addSource('bc50k', {
            type: 'geojson',
            data: bc50k,
          });

          map.addLayer({
            id: 'bc50k',
            type: 'line',
            source: 'bc50k',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#1E824C',
              'line-width': 4,
            },
          });

          // Mile markers
          map.addSource('bc50kmarkers', {
            type: 'geojson',
            data: bc50kMarkers,
          });

          map.addLayer({
            id: 'bc50kmarkers',
            type: 'symbol',
            source: 'bc50kmarkers',
            layout: {
              'text-field': '{mark}',
            },
            paint: {
              'text-color': '#fff',
              'text-halo-color': '#000',
              'text-halo-width': 5,
            },
          });

          // Location from firebase
          map.addSource('mylocation', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [0, 0],
              },
              properties: {},
            },
          });

          map.addLayer({
            id: 'mylocation',
            type: 'circle',
            source: 'mylocation',
            paint: {
              'circle-color': '#674172',
              'circle-radius': 8,
            },
          });
        });
        resolve(map);
      } catch (e) {
        reject(e);
      }
    });
  };

  render() {
    console.log(this.state);
    return (
      <div>
        <div
          ref={el => (this.mapContainer = el)} // eslint-disable-line no-return-assign
          className="absolute top right left bottom"
        />
      </div>
    );
  }
}
