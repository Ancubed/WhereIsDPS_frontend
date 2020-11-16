import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Div from '@vkontakte/vkui/dist/components/Div/Div';
import Title from '@vkontakte/vkui/dist/components/Typography/Title/Title';

import dps from '../img/dpsmarker.svg';
import dtp from '../img/dtpmarker.svg';
import sos from '../img/sosmarker.svg';
import positionImg from '../img/position.svg';

var DG = require('2gis-maps');
var markers = DG.featureGroup();


class Map extends React.Component {
	constructor (props) {
		super(props);
		this.tmpMarker = null;
		this.positionAccess = false;
		this.myPosition = null;
	}

	clickOnMapHandler = e => {
		this.tmpMarker = DG.marker([e.latlng.lat, e.latlng.lng]).addTo(this.map);
		setTimeout(this.props.onSetMarker, 550, e, this.tmpMarker);
	}

	popupOpenHandler(markerData) {
		this.props.onClickMarker(markerData);
	}

	async updatePosition() {
		try {
			await bridge.send("VKWebAppGetGeodata").then((e) => {
				if (e.available && this.myPosition) {
					this.myPosition.setLatLng([e.lat, e.long]);
				}
			}, reason => {
				console.log('Cant get a geolocation	');
			});
		} catch(e) {
		}

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
						iconAnchor: [20, 55]
					});
				} else if (markersInfo[i].type === 'dtp') {
					myIcon = DG.icon({
						iconUrl: dtp,
						iconRetinaUrl: dtp,
						iconSize: [40, 60],
						iconAnchor: [20, 55]
					});
				} else {
					myIcon = DG.icon({
						iconUrl: sos,
						iconRetinaUrl: sos,
						iconSize: [40, 60],
						iconAnchor: [20, 55]
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

	async componentDidMount() {
		this.myPosition = DG.marker([0, 0], {icon: DG.icon({
			iconUrl: positionImg,
			iconRetinaUrl: positionImg,
			iconSize: [24, 24],
			iconAnchor: [12, 13]})
		});
		let lat = localStorage.lat || 55.74489304677828;
		let lng = localStorage.lng || 37.61306762695313;
		let zoom = localStorage.zoom || 10;
		this.map = DG.map('map', {
			center: [lat, lng],
			zoom: zoom,
			fullscreenControl: false,
			geoclicker: false,
			minZoom: 4,
			touchZoom: true
		});
		try {
			await bridge.send("VKWebAppGetGeodata").then((e) => {
				if (e.available && e.lat && e.long) {
					lat = e.lat;
					lng = e.long;
					this.myPosition.setLatLng([lat, lng]);
					this.positionAccess = true;
					this.updatePosition();
					this.myPosition.addTo(this.map);
					this.map.flyTo(this.myPosition.getLatLng(), localStorage.zoom || 10, {animate: true, duration: 1});
					this.timerForPosition = setInterval(() => {
						if (this.positionAccess) this.updatePosition();
					}, 800);
				}
			}, reason => {
				console.log('Cant get a geolocation');
			});
		} catch(e) {
			console.log('cant load a position');
		}
		this.map.on('projectchange', (e) => {
			console.log(e.getProject());
		});
		this.map.on('zoom', () => {
			localStorage.zoom = this.map.getZoom();
		});
		this.map.on('move', () => {
			clearInterval(this.timerForCentred);
			if (this.positionAccess && this.myPosition) {
				this.timerForCentred = setTimeout(() => {
					this.map.flyTo(this.myPosition.getLatLng(), localStorage.zoom || 10, {animate: true, duration: 1});
				}, 15000);
			}
			let center = this.map.getCenter();
			localStorage.lat = center.lat;
			localStorage.lng = center.lng;
		});
		this.updateMarkers();
		this.map.on('click', this.clickOnMapHandler);
		this.timerForMarkers = setInterval(() => {
			this.updateMarkers();
		}, 3000);
	}

	componentWillUnmount() {
		clearInterval(this.timerForMarkers);
		clearInterval(this.timerForPosition);
		clearInterval(this.timerForCentred);
		this.myPosition = null;
  	}	

	render () {
	  return (
		<Panel className="panel" id={this.props.id}>
				<PanelHeader>
					<Title level="2" weight="bold" style={{ margin: 0, padding: 0 }}>
						Карта
					</Title>
				</PanelHeader>
			<Div id='map'></Div>
	  	</Panel>
	  );
	  }
	}

export default Map;
