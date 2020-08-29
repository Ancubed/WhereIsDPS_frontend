import React from 'react';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Icon28ChatsOutline from '@vkontakte/icons/dist/28/chats_outline';
import Placeholder from '@vkontakte/vkui/dist/components/Placeholder/Placeholder';

class Chat extends React.Component {
	constructor (props) {
	  super(props);
	}
	render () {
	  return (
		<Panel className="panel" id={this.props.id}>
			<PanelHeader>Чат</PanelHeader>
			<Placeholder
            icon={<Icon28ChatsOutline />}
            header="Чат"
          >
			Здесь будет чат города.
          </Placeholder>
	  	</Panel>
	  );
	  }
	}

export default Chat;
