import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import View from '@vkontakte/vkui/dist/components/View/View';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
import Epic from '@vkontakte/vkui/dist/components/Epic/Epic';
import Tabbar from '@vkontakte/vkui/dist/components/Tabbar/Tabbar';
import TabbarItem from '@vkontakte/vkui/dist/components/TabbarItem/TabbarItem';
import Icon28MessageOutline from '@vkontakte/icons/dist/28/message_outline';
import Icon28PlaceOutline from '@vkontakte/icons/dist/28/place_outline';
import Icon28SettingsOutline from '@vkontakte/icons/dist/28/settings_outline';
import ModalRoot from '@vkontakte/vkui/dist/components/ModalRoot/ModalRoot';
import ModalPage from '@vkontakte/vkui/dist/components/ModalPage/ModalPage';
import ModalCard from '@vkontakte/vkui/dist/components/ModalCard/ModalCard';
import ModalPageHeader from '@vkontakte/vkui/dist/components/ModalPageHeader/ModalPageHeader';
import Div from '@vkontakte/vkui/dist/components/Div/Div';
import Group from '@vkontakte/vkui/dist/components/Group/Group';
import FormLayoutGroup from '@vkontakte/vkui/dist/components/FormLayoutGroup/FormLayoutGroup';
import Button from '@vkontakte/vkui/dist/components/Button/Button';
import Header from '@vkontakte/vkui/dist/components/Header/Header';
import Cell from '@vkontakte/vkui/dist/components/Cell/Cell';
import Input from '@vkontakte/vkui/dist/components/Input/Input';
import PanelHeaderButton from '@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton';
import Title from '@vkontakte/vkui/dist/components/Typography/Title/Title';
import Icon24Cancel from '@vkontakte/icons/dist/24/cancel';
import Icon24User from '@vkontakte/icons/dist/24/user';
import Text from '@vkontakte/vkui/dist/components/Typography/Text/Text';
import Textarea from '@vkontakte/vkui/dist/components/Textarea/Textarea';
import Tabs from '@vkontakte/vkui/dist/components/Tabs/Tabs';
import TabsItem from '@vkontakte/vkui/dist/components/TabsItem/TabsItem';
import Avatar from '@vkontakte/vkui/dist/components/Avatar/Avatar';
import Separator from '@vkontakte/vkui/dist/components/Separator/Separator';
import Icon28AddOutline from '@vkontakte/icons/dist/28/add_outline';

import '@vkontakte/vkui/dist/vkui.css';
import './panels/stylesheets.css';

import Map from './panels/Map';
import Chat from './panels/Chat';
import Config from './panels/Config';

String.prototype.replaceAt = function(index, replacement) {
	return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

String.prototype.firstLetterCaps = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var marker = null;

const App = () => {
	const descriptions = {
		'dps': 'Экипаж ДПС при исполнении',
		'dtp': 'Дорожно-транспортное происшествие',
		'sos': 'Просьба о помощи',
	}
	const MODAL_CARD_ADD_MARKER_DPS = 'addCardMarkerDps';
	const MODAL_CARD_ADD_MARKER_DTP = 'addCardMarkerDtp';
	const MODAL_CARD_ADD_MARKER_SOS = 'addCardMarkerSos';
	const MODAL_PAGE_MARKER_SELECT = 'selectMarkerType';
	const [fetchedUser, setUser] = useState(null);
	const [comment, setComment] = useState('');
	const [activeStory, setActiveStory] = useState('mapPanel');
	const [popout, setPopout] = useState(<ScreenSpinner size='large' />);
	const [modal, setModal] = useState(null);
	const [activeType, setActiveType] = useState('dps');
	const [activeRows, setActiveRows] = useState('');
	const [activeDescription, setActiveDescription] = useState(descriptions[activeType]);
	

	useEffect(() => {
		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				document.body.attributes.setNamedItem(schemeAttribute);
				console.log(schemeAttribute);
			}
		});
		async function fetchData() {
			const user = await bridge.send('VKWebAppGetUserInfo');
			setUser(user);
			setPopout(null);
		}
		fetchData();
	}, []);

	const onStoryChange = e => {
		setActiveStory(e.currentTarget.dataset.story);
	}

	function onSetMarker(e, showClickPositionMarker) {
		marker = showClickPositionMarker;
		setModal(MODAL_PAGE_MARKER_SELECT);
	}

	function onRemoveMarker() {
		if (marker) marker.remove();
		marker = null;
	}

	function commentChange(e) {
		setComment(e.target.value);
	}

	function rowChange(letter) {
		if ((activeRows).includes(letter)) setActiveRows(activeRows.replace(letter, ''));
		else setActiveRows(activeRows + letter);
	}

	async function sendMarkerInfo() {
		let markerInfo = {
			type: activeType,
			userId: fetchedUser.id,
			firstName: fetchedUser.first_name,
			lastName: fetchedUser.last_name,
			photo: fetchedUser.photo_100,
			datetime: Date.now(),
			data: marker._latlng,
			comment: comment,
		}
		if (activeType === 'dps' || activeType === 'dtp') {
			markerInfo.isConfirm = false;
		}
		let response = false;
		try {
			response = await fetch("http://127.0.0.1:3000/addmarker", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(markerInfo)
			});
		} catch(e) {
			console.log('Сервер недоступен.');
		}
		if (!response) {
			alert('Что-то пошло не так... \nВозможно, сервер недоступен.');
		}
		try {
			let response = await fetch('http://127.0.0.1:3000/getmarkers');
			let json = await response.json();
			let lessons = await json;
			console.log(lessons);
		} catch(e) {
			console.log('Сервер недоступен.');
		}
	}

	function dtpCommentChange(row) {
		let localComment = comment.toLowerCase();
		if ((localComment.toLowerCase()).includes(row)) {
			console.log(localComment.toLowerCase() + " " + row);
			let indexOfComma = (localComment).indexOf(row) - 2;
			console.log(indexOfComma);
			let tmpComm = localComment.replace(new RegExp(row + '.\\s'), '');
			if (indexOfComma >= 0 && tmpComm.charAt(indexOfComma + 2) === '') {
				tmpComm = tmpComm.replaceAt(indexOfComma, '.');
			}
			setComment(tmpComm.firstLetterCaps());
		}
		else {
			if (localComment.length === 0) {
				setComment(row.firstLetterCaps() + '. ');
			}
			else if (localComment[comment.length - 2] === '.') {
				setComment(comment.replace('. ', ', ').firstLetterCaps() + row + '. ');
			}
		} 
	}

	let modalRoot = (
		<ModalRoot activeModal={modal}>
			<ModalPage 
				id={MODAL_PAGE_MARKER_SELECT}
				onClose={() => {
					onRemoveMarker();
					setModal(null);
				}}
				header={
					<ModalPageHeader
					right={
						<PanelHeaderButton onClick={() => {
							onRemoveMarker();
							setModal(null);
						}}><Icon24Cancel /></PanelHeaderButton>
					}
					>
						Добавить метку
					</ModalPageHeader>
				}
			>
				<Div id='modalDiv'>
					<Group id='types' header={<Header style={{ margin: 0,  paddingLeft: 30 }} mode="secondary">Тип события</Header>}>
						<Cell className='typesTabs' asideContent=''>
						<Tabs id='typeTabs'>
							<TabsItem className='tabsItem'
							onClick={() => {
								setActiveType('dps');
								setActiveDescription(descriptions['dps']);
							}}
							selected={activeType === 'dps'}
							>
								<Avatar size={64} style={{ marginBottom: 0 }}><Icon24User /></Avatar>
								ДПС
							</TabsItem>
							<TabsItem className='tabsItem'
							onClick={() => {
								setActiveType('dtp');
								setActiveDescription(descriptions['dtp']);
							}}
							selected={activeType === 'dtp'}
							>
								<Avatar size={64} style={{ marginBottom: 0 }}><Icon24User /></Avatar>
								ДТП
							</TabsItem>
							<TabsItem className='tabsItem'
							onClick={() => {
								setActiveType('sos');
								setActiveDescription(descriptions['sos']);

							}}
							selected={activeType === 'sos'}
							>
								<Avatar size={64} style={{ marginBottom: 0 }}><Icon24User /></Avatar>
								SOS
							</TabsItem>
						</Tabs>
						</Cell>
						<Separator style={{ margin: 0 }} />
						<Cell id='description' asideContent=''>
							<Text weight="regular" style={{ margin: 0,  padding: 0 }}>{activeDescription}</Text>
						</Cell>
					</Group>
					<FormLayoutGroup id='buttons'>
						<Cell id='modalButtons' asideContent=''>
							<Button mode="primary" onClick={() => {
								{if (activeType === 'dps') setModal(MODAL_CARD_ADD_MARKER_DPS);
								else if (activeType === 'dtp') setModal(MODAL_CARD_ADD_MARKER_DTP);
								else setModal(MODAL_CARD_ADD_MARKER_SOS);}
								}} size="xl" stretched>Далее</Button>
						</Cell>
					</FormLayoutGroup>
				</Div>
			</ModalPage>
			<ModalCard
				id={MODAL_CARD_ADD_MARKER_DPS}
				onClose={() => {
					onRemoveMarker();
					setModal(null);
					setComment('');
					}}
				header={'ДПС'}
				actionsLayout="vertical"
				actions={[
					{
					title: 'Добавить',
					mode: 'primary',
					action: () => {
						sendMarkerInfo();
						onRemoveMarker();
						setModal(null);
						setComment('');
					}},
					{
					title: 'Отменить',
					mode: 'secondary',
					action: () => {
						setModal(MODAL_PAGE_MARKER_SELECT);
						setComment('');
					}}
				]}>
				<Group id='comment' header={<Header style={{ margin: 0,  paddingLeft: 0 }} mode="secondary">Комментарий</Header>}>
					<Textarea onChange={commentChange} />
				</Group>
			</ModalCard>
			<ModalCard
				id={MODAL_CARD_ADD_MARKER_DTP}
				onClose={() => {
					onRemoveMarker();
					setModal(null);
					setComment('');
					setActiveRows('');
					}}
				header={'ДТП'}
				actionsLayout="vertical"
				actions={[
					{
					title: 'Добавить',
					mode: 'primary',
					action: () => {
						sendMarkerInfo();
						onRemoveMarker();
						setModal(null);
						setComment('');
						setActiveRows('');
					}},
					{
					title: 'Отменить',
					mode: 'secondary',
					action: () => {
						setModal(MODAL_PAGE_MARKER_SELECT);
						setComment('');
						setActiveRows('');
					}}
				]}>
				<Group id='rows' header={<Header style={{ margin: 0,  paddingLeft: 0 }} mode="secondary">Выберите ряд</Header>}>
					<Cell className='rowTabs' asideContent=''>
					<Tabs id='rowTabs'>
						<TabsItem className='tabsItem'
						onClick={() => {
							rowChange('l');
							dtpCommentChange('левый ряд');
						}}
						selected={activeRows.includes('l')}
						>
							<Avatar className='tabsItemAvatar' size={63} style={{ margin: 0 }}><Icon28AddOutline /></Avatar>
							Левый
						</TabsItem>
						<TabsItem className='tabsItem'
						onClick={() => {
							rowChange('m');
							dtpCommentChange('средний ряд');
						}}
						selected={activeRows.includes('m')}
						>
							<Avatar className='tabsItemAvatar' size={63} style={{ margin: 0 }}><Icon28AddOutline /></Avatar>
							Средний
						</TabsItem>
						<TabsItem className='tabsItem'
						onClick={() => {
							rowChange('r');
							dtpCommentChange('правый ряд');
						}}
						selected={activeRows.includes('r')}
						>
							<Avatar className='tabsItemAvatar' size={63} style={{ margin: 0 }}><Icon28AddOutline /></Avatar>
							Правый
						</TabsItem>
					</Tabs>
					</Cell>
				</Group>
				<Group id='comment' header={<Header style={{ margin: 0,  paddingLeft: 0 }} mode="secondary">Комментарий</Header>}>
					<Input type='text' defaultValue={comment} onChange={commentChange} />
				</Group>
			</ModalCard>
			<ModalCard
				id={MODAL_CARD_ADD_MARKER_SOS}
				onClose={() => {
					onRemoveMarker();
					setModal(null);
					setComment('');
					}}
				header={'Помощь'}
				actionsLayout="vertical"
				actions={[
					{
					title: 'Добавить',
					mode: 'primary',
					action: () => {
						sendMarkerInfo();
						onRemoveMarker();
						setModal(null);
						setComment('');
					}},
					{
					title: 'Отменить',
					mode: 'secondary',
					action: () => {
						setModal(MODAL_PAGE_MARKER_SELECT);
						setComment('');
					}}
				]}>
				<Group id='comment' header={<Header style={{ margin: 0,  paddingLeft: 0 }} mode="secondary">Что случилось</Header>}>
					<Textarea onChange={commentChange} />
				</Group>
			</ModalCard>
		</ModalRoot>
	);

	return (
		<Epic activeStory={activeStory} tabbar={
			<Tabbar>
			  <TabbarItem
				onClick={onStoryChange}
				selected={activeStory === 'chatPanel'}
				data-story="chatPanel"
				text="Чат"
			  ><Icon28MessageOutline /></TabbarItem>
			  <TabbarItem
				onClick={onStoryChange}
				selected={activeStory === 'mapPanel'}
				data-story="mapPanel"
				text="Карта"
			  ><Icon28PlaceOutline /></TabbarItem>
			   <TabbarItem
				onClick={onStoryChange}
				selected={activeStory === 'configPanel'}
				data-story="configPanel"
				text="Настройки"
			  ><Icon28SettingsOutline /></TabbarItem>
			</Tabbar>
		  }>
			<View id="chatPanel" activePanel="chatPanel">
				<Chat id="chatPanel"/>
			</View>
			<View id="mapPanel" activePanel="mapPanel" modal = {modalRoot}>
			 	<Map id="mapPanel" onSetMarker={onSetMarker}/>
			</View>
			<View id="configPanel" activePanel="configPanel">
				<Config id="configPanel"/>
			</View>
			
		  </Epic>
	);
}

export default App;

