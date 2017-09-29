import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';


import bc50k from './data/bc50k.json';
import bc50kMarkers from './data/bc50kmarkers.json';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX;

export default class App extends Component {
  state = {};

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

    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    }));

    // Load Map
    this.mapOnLoad(map);
  }

  mapOnLoad = map => {
    map.on('load', () => {
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
    });
  };

  render() {
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
