import React from 'react';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';


class Config extends React.Component {
	constructor (props) {
	  super(props);
	}
	render () {
	  return (
		<Panel className="panel" id={this.props.id}>
			<PanelHeader>Настройки</PanelHeader>
	  	</Panel>
	  );
	  }
	}

export default Config;
