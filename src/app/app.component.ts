import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as mapboxgl from 'mapbox-gl'
import { HttpClient } from "@angular/common/http";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  map: mapboxgl.Map;
  chitturRua: any = [];
  stations: any = [];
  constructor(private httpClient: HttpClient) { }

  ngOnInit() {

    (mapboxgl as typeof mapboxgl).accessToken = environment.mapbox.accessToken;
    this.map = new mapboxgl.Map({
      container: 'myMap',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [76.786, 10.72],
      zoom: 11
    });
    this.map.addControl(new mapboxgl.NavigationControl());
    // this.map.on('click', (e) => {
    //   console.log(e.lngLat);
    // })
    const marker = new mapboxgl.Marker({
      draggable: true
    }).setLngLat([76.9454378, 8.5449448]).addTo(this.map)

    //load geojson chittur rua
    this.httpClient.get("assets/chittur_rua.geojson").subscribe(data => {
      console.log(data);
      this.chitturRua = data;
    })


    //load points geojson
    this.httpClient.get("assets/updated_points.geojson").subscribe(data => {
      console.log(data);
      this.stations = data;
    })


    this.map.on('load', (e) => {

      this.map.addSource('chittur_rua', { type: 'geojson', data: this.chitturRua });
      this.map.addLayer({
        'id': 'chittur_rua',
        'type': 'line',
        'source': 'chittur_rua',
        'layout': {},
        'paint': {
          'line-color': '#FF0000',
          'line-width': 1.5

        }
      });

      this.map.addSource('palakkad_points', { type: 'geojson', data: this.stations });
      this.map.addLayer({
        'id': 'pointlayer',
        'type': 'circle',
        'source': 'palakkad_points',
        "paint": {
          "circle-radius": 8,
          "circle-color": "#02bcfa",
          'circle-opacity': 0.5,
          'circle-stroke-color': 'white',
          'circle-stroke-width': 2,
        }
      });

      this.map.on('click', 'pointlayer', (e) => {
        console.log(e.lngLat);
      })

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      })

      this.map.on('mouseenter', 'pointlayer', (e) => {
        this.map.getCanvas().style.cursor = 'pointer';
        popup.setLngLat(e.features[0].geometry.coordinates.slice())
          .setHTML("AREA : " + e.features[0].properties.Area + "<br>TYPE : " + e.features[0].properties.Locality)

          .addTo(this.map);
      })

      this.map.on('mouseleave', 'pointlayer', (e) => {
        this.map.getCanvas().style.cursor = '';
        popup.remove();
      })







    })








  }

}
