import React from 'react';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Div from '@vkontakte/vkui/dist/components/Div/Div';

var DG = require('2gis-maps');


class Map extends React.Component {
	constructor (props) {
		super(props);
		this.tmpMarker = null;
	}

	clickOnMapHandler = e => {
		this.tmpMarker = DG.marker([e.latlng.lat, e.latlng.lng]).addTo(this.map);
		setTimeout(this.props.onSetMarker, 550, e, this.tmpMarker);
	}

	componentDidMount() {
		this.map = DG.map('map', {
			center: [51.76, 55.11],
			zoom: 11,
			fullscreenControl: false,
			geoclicker: false
		});
		this.map.on('click', this.clickOnMapHandler);
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
