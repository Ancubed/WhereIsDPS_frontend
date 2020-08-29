import React, { useState, useEffect } from 'react';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Div from '@vkontakte/vkui/dist/components/Div/Div';

import dps from '../img/dpsmarker.svg';
import dtp from '../img/dtpmarker.svg';
import sos from '../img/sosmarker.svg';

var DG = require('2gis-maps');
var markers = DG.featureGroup();

class Map extends React.Component {
	constructor (props) {
		super(props);
		this.tmpMarker = null;
	}

	clickOnMapHandler = e => {
		this.tmpMarker = DG.marker([e.latlng.lat, e.latlng.lng]).addTo(this.map);
		setTimeout(this.props.onSetMarker, 550, e, this.tmpMarker);
	}

	popupOpenHandler(markerData) {
		this.props.onClickMarker(markerData);
	}

	updateMarkers() {
		this.props.updateMarkersOnMap().then((markersInfo) => {
			markers.clearLayers();
			for (let i=0; i < markersInfo.length; i++) {
				let myIcon;
				if (markersInfo[i].type === 'dps') {
					myIcon = DG.icon({
						iconUrl: dps,
						iconRetinaUrl: dps,
						iconSize: [40, 60],
						iconAnchor: [20, 55],
						// shadowUrl: 'my-icon-shadow.png',
						// shadowRetinaUrl: 'my-icon-shadow@2x.png',
					});
				} else if (markersInfo[i].type === 'dtp') {
					myIcon = DG.icon({
						iconUrl: dtp,
						iconRetinaUrl: dtp,
						iconSize: [40, 60],
						iconAnchor: [20, 55],
						// shadowUrl: 'my-icon-shadow.png',
						// shadowRetinaUrl: 'my-icon-shadow@2x.png',
					});
				} else {
					myIcon = DG.icon({
						iconUrl: sos,
						iconRetinaUrl: sos,
						iconSize: [40, 60],
						iconAnchor: [20, 55],
						// shadowUrl: 'my-icon-shadow.png',
						// shadowRetinaUrl: 'my-icon-shadow@2x.png',
					});
				}
				DG.marker([markersInfo[i].data.lat, markersInfo[i].data.lng], {icon: myIcon})
				.on('click', () => {
					this.popupOpenHandler(markersInfo[i]);
				})
				.addTo(markers);
			}
			markers.addTo(this.map);
		})
	}

	componentDidMount() {
		this.map = DG.map('map', {
			center: [51.76, 55.11],
			zoom: 11,
			fullscreenControl: false,
			geoclicker: false
		});
		this.updateMarkers();
		this.map.on('click', this.clickOnMapHandler);
		this.timer = setInterval(() => {
			this.updateMarkers();
		}, 3000);
	}

	componentWillUnmount() {
    	clearInterval(this.timer);
  	}	

	render () {
	  return (
		<Panel className="panel" id={this.props.id}>
			<PanelHeader>Карта</PanelHeader>
			<Div id='map'></Div>
	  	</Panel>
	  );
	  }
	}

export default Map;
