import React, { useState, useEffect } from 'react';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Div from '@vkontakte/vkui/dist/components/Div/Div';

var DG = require('2gis-maps');
var markersArr = [];

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
		console.log(markerData);
	}
	
	updateMarkers() {
		this.props.updateMarkersOnMap().then((markers) => {
			markersArr = markers;
			for (let i=0; i < markersArr.length; i++) {
				DG.marker([markersArr[i].data.lat, markersArr[i].data.lng])
				.on('click', () => {
					this.popupOpenHandler(markersArr[i]);
				})
				.addTo(this.map)
			}
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
		}, 2000);
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
// function Map(props) {
// 	const tmpMarker = null;
// 	const [map, setMap] = useState(null);


// 	const clickOnMapHandler = e => {
// 		tmpMarker = DG.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
// 		setTimeout(props.onSetMarker, 550, e, tmpMarker);
// 	}

// 	useEffect(() => {
// 		async function mapInit() {
// 			setMap(DG.map('map', {
// 				center: [51.76, 55.11],
// 				zoom: 11,
// 				fullscreenControl: false,
// 				geoclicker: false
// 			}));
// 		}
// 		mapInit().then((res) => {
// 			console.log(map);
// 			map.on('click', clickOnMapHandler);

// 		});
// 		//map.on('click', clickOnMapHandler);
// 		return function cleanup() {
// 			setMap(null);
// 		};
// 	}, []);

// 	return (
// 		<Panel className="panel" id={props.id}>
// 			<PanelHeader>Карта</PanelHeader>
// 			<Div id='map'></Div>
// 	  	</Panel>
// 	  );
// }
export default Map;
