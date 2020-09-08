import React from 'react';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Div from '@vkontakte/vkui/dist/components/Div/Div';
import Group from '@vkontakte/vkui/dist/components/Group/Group';
import Cell from '@vkontakte/vkui/dist/components/Cell/Cell';
import Header from '@vkontakte/vkui/dist/components/Header/Header';
import Switch from '@vkontakte/vkui/dist/components/Switch/Switch';
import Select from '@vkontakte/vkui/dist/components/Select/Select';
import Subhead from '@vkontakte/vkui/dist/components/Typography/Subhead/Subhead';

class Config extends React.Component {
	constructor (props) {
	  super(props);
	}
	render () {
	  return (
		<Panel className="panel" id={this.props.id}>
			<PanelHeader>Настройки</PanelHeader>
			<Div id='config'>
				<Group header={<Header mode="secondary">Канал</Header>}>
					<Cell id='cellCity'>
						<Subhead weight="semibold" style={{ margin: 0, padding: 0 }}>Город</Subhead>
						<Select placeholder="Выберите">
							<option value="m">Мужской</option>
							<option value="f">Женский</option>
						</Select>
					</Cell>
				</Group>
			</Div>
	  	</Panel>
	  );
	  }
	}

export default Config;
