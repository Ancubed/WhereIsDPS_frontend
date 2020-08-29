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
import Subhead from '@vkontakte/vkui/dist/components/Typography/Subhead/Subhead';
import Textarea from '@vkontakte/vkui/dist/components/Textarea/Textarea';
import Tabs from '@vkontakte/vkui/dist/components/Tabs/Tabs';
import Link from '@vkontakte/vkui/dist/components/Link/Link';
import TabsItem from '@vkontakte/vkui/dist/components/TabsItem/TabsItem';
import Avatar from '@vkontakte/vkui/dist/components/Avatar/Avatar';
import Separator from '@vkontakte/vkui/dist/components/Separator/Separator';
import Icon28AddOutline from '@vkontakte/icons/dist/28/add_outline';
import UsersStack from '@vkontakte/vkui/dist/components/UsersStack/UsersStack';
import Icon16Done from '@vkontakte/icons/dist/16/done';
import Icon16Cancel from '@vkontakte/icons/dist/16/cancel';
import Snackbar from '@vkontakte/vkui/dist/components/Snackbar/Snackbar';

import '@vkontakte/vkui/dist/vkui.css';
import './panels/stylesheets.css';

import Map from './panels/Map';
import Chat from './panels/Chat';
import Config from './panels/Config';

import dps from './img/dps.svg';
import dtp from './img/dtp.svg';
import sos from './img/sos.svg';

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
	const infoCards = {
		'dps': 'infoCardMarkerDps',
		'dtp': 'infoCardMarkerDtp',
		'sos': 'infoCardMarkerSos'
	}
	const MODAL_PAGE_MARKER_SELECT = 'selectMarkerType';
	const [fetchedUser, setUser] = useState(null);
	const [comment, setComment] = useState('');
	const [activeStory, setActiveStory] = useState('mapPanel');
	const [popout, setPopout] = useState(<ScreenSpinner size='large' />);
	const [modal, setModal] = useState(null);
	const [activeType, setActiveType] = useState('dps');
	const [activeRows, setActiveRows] = useState('');
	const [clickedMarker, setClickedMarker] = useState(null);
	const [activeDescription, setActiveDescription] = useState(descriptions[activeType]);
	const [snackbar, setSnackbar] = useState(null);
	

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
			console.log(user);
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

	function onClickMarker(markerInfo) {
		setClickedMarker(markerInfo);
		setModal(infoCards[markerInfo.type]);
	}

	function getDiffTime(start) {
		let end = new Date;
		let diff = end - start;
		let hours = Math.floor((diff % 86400000) / 3600000);
		let minutes = Math.round(((diff % 86400000) % 3600000) / 60000);
		return hours == 0 ? minutes + 'м. назад' : hours + 'ч. ' + minutes + 'м. назад';
	}

	async function addMarker() {
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
			markerInfo.confirmed = [];
		}
		let response = false;
		try {
			response = await fetch("http://localhost:3010/addmarker", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(markerInfo)
			});
		} catch(e) {
			setSnackbar(
				<Snackbar
				layout="horizontal"
				duration={2000}
				onClose={() => {
						setSnackbar(null);
				}}
				before={<Avatar size={24} style={{backgroundColor: 'var(--accent)'}}><Icon16Cancel fill="#fff" width={14} height={14} /></Avatar>}
				>
				Сервер недоступен.
				</Snackbar>
			);
		}
		if (!response) {
			setSnackbar(
				<Snackbar
				layout="horizontal"
				duration={2000}
				onClose={() => {
						setSnackbar(null);
				}}
				before={<Avatar size={24} style={{backgroundColor: 'var(--accent)'}}><Icon16Cancel fill="#fff" width={14} height={14} /></Avatar>}
				>
				Возникла серверная ошибка.
				</Snackbar>
			);
		}
		// updateMarkersOnMap().then((markers) => {
		// 	console.log(markers);
		// })
		
		//место для ререндера карты после нового добавления маркера на карту
	}

	async function updateMarkers() {
		// return [
		// 	{
		// 	  _id: '5f4a5174f1b66520e40db74a',
		// 	  type: 'dtp',
		// 	  userId: 178441004,
		// 	  firstName: 'Андрей',
		// 	  lastName: 'Антонов',
		// 	  photo: 'https://sun9-5.userapi.com/impg/GI2ErVcS16HCJAznpNdqAncuQQdiY-7USnldNw/PVj1y8rfJJs.jpg?size=100x0&quality=88&crop=352,354,799,799&sign=7e5edc5f80102ee418174c2a12ffde37&ava=1',
		// 	  datetime: 1598706036245,
		// 	  data: { lat: 51.78186043052068, lng: 55.08256519446151 },
		// 	  comment: 'Средний ряд, правый ряд. ',
		// 	  confirmed: []
		// 	},
		// 	{
		// 	  _id: '5f4a5183f1b66520e40db74b',
		// 	  type: 'dps',
		// 	  userId: 178441004,
		// 	  firstName: 'Андрей',
		// 	  lastName: 'Антонов',
		// 	  photo: 'https://sun9-5.userapi.com/impg/GI2ErVcS16HCJAznpNdqAncuQQdiY-7USnldNw/PVj1y8rfJJs.jpg?size=100x0&quality=88&crop=352,354,799,799&sign=7e5edc5f80102ee418174c2a12ffde37&ava=1',
		// 	  datetime: 1598706051086,
		// 	  data: { lat: 51.775488008119375, lng: 55.17251575598494 },
		// 	  comment: 'В обе стороны',
		// 	  confirmed: [{
		// 		  	userId: 178441004,
		// 			firstName: 'Андрей',
		// 			photo: 'https://sun9-5.userapi.com/impg/GI2ErVcS16HCJAznpNdqAncuQQdiY-7USnldNw/PVj1y8rfJJs.jpg?size=100x0&quality=88&crop=352,354,799,799&sign=7e5edc5f80102ee418174c2a12ffde37&ava=1',
		// 		},
		// 		{
		// 			userId: 178441004,
		// 		  	firstName: 'Андрей',
		// 		  	photo: 'https://sun9-5.userapi.com/impg/GI2ErVcS16HCJAznpNdqAncuQQdiY-7USnldNw/PVj1y8rfJJs.jpg?size=100x0&quality=88&crop=352,354,799,799&sign=7e5edc5f80102ee418174c2a12ffde37&ava=1',
		// 		},
		// 		{
		// 			userId: 178441004,
		// 			firstName: 'Андрей',
		// 			photo: 'https://sun9-5.userapi.com/impg/GI2ErVcS16HCJAznpNdqAncuQQdiY-7USnldNw/PVj1y8rfJJs.jpg?size=100x0&quality=88&crop=352,354,799,799&sign=7e5edc5f80102ee418174c2a12ffde37&ava=1',
		// 		},
		// 		{
		// 			userId: 178441004,
		// 			firstName: 'Андрей',
		// 			photo: 'https://sun9-5.userapi.com/impg/GI2ErVcS16HCJAznpNdqAncuQQdiY-7USnldNw/PVj1y8rfJJs.jpg?size=100x0&quality=88&crop=352,354,799,799&sign=7e5edc5f80102ee418174c2a12ffde37&ava=1',
		// 		}]
		// 	},
		// 	{
		// 	  _id: '5f4a54e5f1b66520e40db74d',
		// 	  type: 'sos',
		// 	  userId: 178441004,
		// 	  firstName: 'Андрей',
		// 	  lastName: 'Антонов',
		// 	  photo: 'https://sun9-5.userapi.com/impg/GI2ErVcS16HCJAznpNdqAncuQQdiY-7USnldNw/PVj1y8rfJJs.jpg?size=100x0&quality=88&crop=352,354,799,799&sign=7e5edc5f80102ee418174c2a12ffde37&ava=1',
		// 	  datetime: 1598706917419,
		// 	  data: { lat: 51.79884913146363, lng: 55.134201049804695 },
		// 	  comment: 'Hi'
		// 	}
		//   ];
		try {
			let response = await fetch('http://localhost:3010/getmarkers');
			let json = await response.json();
			let markers = await json;
			return markers;
		} catch(e) {
			setSnackbar(
				<Snackbar
				layout="horizontal"
				duration={5000}
				onClose={() => {
						setSnackbar(null);
				}}
				before={<Avatar size={24} style={{backgroundColor: 'var(--accent)'}}><Icon16Cancel fill="#fff" width={14} height={14} /></Avatar>}
				>
				Сервер недоступен.
				</Snackbar>
			);
			return [];
		}
	}

	async function removeMarker() {
		if (clickedMarker) {
			let response = false;
			try {
				response = await fetch("http://localhost:3010/removemarker", {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						idToConfirm: clickedMarker._id
					})
				});
			} catch(e) {
				setSnackbar(
					<Snackbar
					layout="horizontal"
					duration={20000}
					onClose={() => {
							setSnackbar(null);
					}}
					before={<Avatar size={24} style={{backgroundColor: 'var(--accent)'}}><Icon16Cancel fill="#fff" width={14} height={14} /></Avatar>}
					>
					Сервер недоступен.
					</Snackbar>
				);
			}
			if (!response) {
				setSnackbar(
					<Snackbar
					layout="horizontal"
					duration={20000}
					onClose={() => {
							setSnackbar(null);
					}}
					before={<Avatar size={24} style={{backgroundColor: 'var(--accent)'}}><Icon16Cancel fill="#fff" width={14} height={14} /></Avatar>}
					>
					Возникла серверная ошибка.
					</Snackbar>
				);
			}
		}
	}

	async function confirmMarker() {
		if (clickedMarker) {
			if (!includesId()) {
				let response = false;
				try {
					response = await fetch("http://localhost:3010/confirmmarker", {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							idToConfirm: clickedMarker._id,
							userData: {
								userId: fetchedUser.id,
								firstName: fetchedUser.first_name,
								photo: fetchedUser.photo_100
							}
						})
					});
				} catch(e) {
					setSnackbar(
						<Snackbar
						layout="horizontal"
						duration={20000}
						onClose={() => {
								setSnackbar(null);
						}}
						before={<Avatar size={24} style={{backgroundColor: 'var(--accent)'}}><Icon16Cancel fill="#fff" width={14} height={14} /></Avatar>}
						>
						Сервер недоступен.
						</Snackbar>
					);
				}
				if (!response) {
					setSnackbar(
						<Snackbar
						layout="horizontal"
						duration={20000}
						onClose={() => {
								setSnackbar(null);
						}}
						before={<Avatar size={24} style={{backgroundColor: 'var(--accent)'}}><Icon16Cancel fill="#fff" width={14} height={14} /></Avatar>}
						>
						Возникла серверная ошибка.
						</Snackbar>
					);
				} else {
					setSnackbar(
						<Snackbar
						layout="horizontal"
						duration={1000}
						onClose={() => {
								setSnackbar(null);
						}}
						before={<Avatar size={24} style={{backgroundColor: 'var(--accent)'}}><Icon16Done fill="#fff" width={14} height={14} /></Avatar>}
						>
						Спасибо!
						</Snackbar>
					);
				}
			}
			else {
				setSnackbar(
					<Snackbar
					layout="horizontal"
					duration={2000}
					onClose={() => {
							setSnackbar(null);
					}}
					before={<Avatar size={24} style={{backgroundColor: 'var(--accent)'}}><Icon16Cancel fill="#fff" width={14} height={14} /></Avatar>}
					>
					Вы не можете подтвердить этот маркер.
					</Snackbar>
				);
			}
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

	function includesId() {
		if(clickedMarker.userId === fetchedUser.id) {
			return true;
		}
		for(let i = 0; i < clickedMarker.confirmed.length; i++) {
			if(clickedMarker.confirmed[i].userId === fetchedUser.id) {
				return true;
			}	
			return false;
		}
	}

	function divideConfirmed() {
		if (clickedMarker && clickedMarker.confirmed) {
			let photoArr = [];
			let firstNameArr = [];
			let userIdArr = [];
			for(let i = 0; i < clickedMarker.confirmed.length; i++) {
				photoArr.push(clickedMarker.confirmed[i].photo);
				firstNameArr.push(clickedMarker.confirmed[i].firstName);
				userIdArr.push(clickedMarker.confirmed[i].userId);
			}
			return [photoArr, firstNameArr, userIdArr];
		}
		return null;
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
								<Avatar size={64} style={{ marginBottom: 0 }} src={dps}></Avatar>
								ДПС
							</TabsItem>
							<TabsItem className='tabsItem'
							onClick={() => {
								setActiveType('dtp');
								setActiveDescription(descriptions['dtp']);
							}}
							selected={activeType === 'dtp'}
							>
								<Avatar size={64} style={{ marginBottom: 0 }} src={dtp}></Avatar>
								ДТП
							</TabsItem>
							<TabsItem className='tabsItem'
							onClick={() => {
								setActiveType('sos');
								setActiveDescription(descriptions['sos']);

							}}
							selected={activeType === 'sos'}
							>
								<Avatar size={64} style={{ marginBottom: 0 }} src={sos}></Avatar>
								SOS
							</TabsItem>
						</Tabs>
						</Cell>
						<Separator style={{ margin: 0 }} />
						<Cell id='description'>
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
						addMarker();
						setModal(null);
						setComment('');
						onRemoveMarker();
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
						addMarker();
						setModal(null);
						setComment('');
						setActiveRows('');
						onRemoveMarker();
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
						addMarker();
						setModal(null);
						setComment('');
						onRemoveMarker();
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
			<ModalCard
				id={infoCards['dtp']}
				onClose={() => {
					setModal(null);
					}}
				header={'ДТП'}
				actions={[
					{
					title: 'Закрыть',
					mode: 'secondary',
					action: () => {
						setModal(null);
					}},
					{
					title: 'Подтвердить',
					mode: 'primary',
					action: () => {
						confirmMarker();
						setModal(null);
					}}
				]}>
				{!clickedMarker ||
						<Div className='cardInfo'>
							{!divideConfirmed() || 
								<Div className='counter'>
									<UsersStack  className='userStack'
											photos={divideConfirmed()[0]}
											size="m"
											count={3}
											layout="vertical"
										>{divideConfirmed()[0].length > 1 
										? (divideConfirmed()[0].length === 2 
										? `${divideConfirmed()[1][0]} и ${divideConfirmed()[1][1]} подтвердили.`
										: `${divideConfirmed()[1][0]}, ${divideConfirmed()[1][1]} и еще ${divideConfirmed()[0].length - 2} подтвердили.`)
										: (divideConfirmed()[1].length == 0 ? 'Пока не подтвердил ни один человек.' : `${divideConfirmed()[1][0]} подтвердил.`)
											}
									</UsersStack>
								</Div>
							}
							<Group className='markerInfo' separator='hide'>
							<Cell className='markerOwnerCell' asideContent={<Text>{getDiffTime(clickedMarker.datetime)}</Text>}>
								<Link href={`https://vk.com/id${clickedMarker.userId}`} target='_blank'>
									<Div className='markerOwner'>
										<Div className='userPhoto'>
											<Avatar className='userAvatar' size={44} style={{ margin: 0, padding: 0 }} src={clickedMarker.photo}/>
										</Div>
										<Div className='userName'>
											<Title level='3' weight="medium" style={{margin: 0, padding: 0 }}>{clickedMarker.firstName + ' ' + clickedMarker.lastName[0] + '.'}</Title>
										</Div>
									</Div>
								</Link>
							</Cell>
							</Group>
							<Group className='markerComment' 
								header={<Header className='markerCommentHeader' mode="primary">Комментарий</Header>}
								description={clickedMarker.comment}
								separator="hide">
							</Group>
						</Div>
				}
			</ModalCard>
			<ModalCard
				id={infoCards['dps']}
				onClose={() => {
					setModal(null);
					}}
				header={'ДПС'}
				actions={[
					{
					title: 'Закрыть',
					mode: 'secondary',
					action: () => {
						setModal(null);
					}},
					{
					title: 'Подтвердить',
					mode: 'primary',
					action: () => {
						confirmMarker();
						setModal(null);
					}}
				]}>
				{!clickedMarker ||
						<Div className='cardInfo'>
						{!divideConfirmed() || 
								<Div className='counter'>
									<UsersStack  className='userStack'
											photos={divideConfirmed()[0]}
											size="m"
											count={3}
											layout="vertical"
										>{divideConfirmed()[0].length > 1 
										? (divideConfirmed()[0].length === 2 
										? `${divideConfirmed()[1][0]}, ${divideConfirmed()[1][1]} подтвердили.`
										: `${divideConfirmed()[1][0]}, ${divideConfirmed()[1][1]} и еще ${divideConfirmed()[0].length - 2} подтвердили.`)
										: (divideConfirmed()[1].length == 0 ? 'Пока не подтвердил ни один человек.' : `${divideConfirmed()[1][0]} подтвердил.`)
											}
									</UsersStack>
								</Div>
							}
							<Group className='markerInfo' separator='hide'>
							<Cell className='markerOwnerCell' asideContent={<Text>{getDiffTime(clickedMarker.datetime)}</Text>}>
								<Link href={`https://vk.com/id${clickedMarker.userId}`} target='_blank'>
									<Div className='markerOwner'>
										<Div className='userPhoto'>
											<Avatar className='userAvatar' size={44} style={{ margin: 0, padding: 0 }} src={clickedMarker.photo}/>
										</Div>
										<Div className='userName'>
											<Title level='3' weight="medium" style={{margin: 0, padding: 0 }}>{clickedMarker.firstName + ' ' + clickedMarker.lastName[0] + '.'}</Title>
										</Div>
									</Div>
								</Link>
							</Cell>
							</Group>
							<Group className='markerComment' 
								header={<Header className='markerCommentHeader' mode="primary">Комментарий</Header>}
								description={clickedMarker.comment}
								separator="hide">
							</Group>
						</Div>
				}
			</ModalCard>
			<ModalCard
				id={infoCards['sos']}
				onClose={() => {
					setModal(null);
					}}
				header={'Нужна помощь'}
				actions={[
					{
					title: 'Закрыть',
					mode: 'secondary',
					action: () => {
						setModal(null);
					}}]}>
					{!clickedMarker ||
						<Div className='card'>
							<Div className='cardInfo'>
								<Group className='markerInfo' separator='hide'>
								<Cell className='markerOwnerCell' asideContent={<Text>{getDiffTime(clickedMarker.datetime)}</Text>}>
									<Link href={`https://vk.com/id${clickedMarker.userId}`} target='_blank'>
										<Div className='markerOwner'>
											<Div className='userPhoto'>
												<Avatar className='userAvatar' size={44} style={{ margin: 0, padding: 0 }} src={clickedMarker.photo}/>
											</Div>
											<Div className='userName'>
												<Title level='3' weight="medium" style={{margin: 0, padding: 0 }}>{clickedMarker.firstName + ' ' + clickedMarker.lastName[0] + '.'}</Title>
											</Div>
										</Div>
									</Link>
								</Cell>
								</Group>
								<Group className='markerComment' 
									header={<Header className='markerCommentHeader' mode="primary">Комментарий</Header>}
									description={clickedMarker.comment}
									separator="hide">
								</Group>
							</Div>
							{clickedMarker.userId !== fetchedUser.id ||
								<Group className='removeButtonDiv'
									separator="hide">
									<Button mode='primary' size='xl' id='removeButton' onClick={() => {
										console.log(clickedMarker.userId);
										console.log(fetchedUser.userId);
										removeMarker();
										setModal(null);
										}}>
										Удалить
									</Button>
								</Group>}
						</Div>
				}
			</ModalCard>
		</ModalRoot>
	);

	return (
		<Epic activeStory={activeStory} tabbar={
			<Tabbar>
				{snackbar}
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
			 	<Map id="mapPanel" onSetMarker={onSetMarker} updateMarkersOnMap={updateMarkers} onClickMarker={onClickMarker}/>
			</View>
			<View id="configPanel" activePanel="configPanel">
				<Config id="configPanel"/>
			</View>
			
		  </Epic>
	);
}

export default App;

