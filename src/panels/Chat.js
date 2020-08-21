import React from 'react';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';


class Chat extends React.Component {
	constructor (props) {
	  super(props);
	}
	render () {
	  return (
		<Panel className="panel" id={this.props.id}>
			<PanelHeader>Чат</PanelHeader>
	  	</Panel>
	  );
	  }
	}

export default Chat;
