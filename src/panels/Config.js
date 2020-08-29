import React from 'react';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Placeholder from '@vkontakte/vkui/dist/components/Placeholder/Placeholder';
import Icon28SettingsOutline from '@vkontakte/icons/dist/28/settings_outline';

class Config extends React.Component {
	constructor (props) {
	  super(props);
	}
	render () {
	  return (
		<Panel className="panel" id={this.props.id}>
			<PanelHeader>Настройки</PanelHeader>
			<Placeholder
            icon={<Icon28SettingsOutline />}
            header="Настройки"
          >
			Здесь будут настройки карты и тем.
          </Placeholder>
	  	</Panel>
	  );
	  }
	}

export default Config;
