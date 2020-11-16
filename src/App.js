import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import View from '@vkontakte/vkui/dist/components/View/View';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
import Epic from '@vkontakte/vkui/dist/components/Epic/Epic';
import Tabbar from '@vkontakte/vkui/dist/components/Tabbar/Tabbar';
import TabbarItem from '@vkontakte/vkui/dist/components/TabbarItem/TabbarItem';
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
import Text from '@vkontakte/vkui/dist/components/Typography/Text/Text';
import Textarea from '@vkontakte/vkui/dist/components/Textarea/Textarea';
import Tabs from '@vkontakte/vkui/dist/components/Tabs/Tabs';
import Link from '@vkontakte/vkui/dist/components/Link/Link';
import TabsItem from '@vkontakte/vkui/dist/components/TabsItem/TabsItem';
import Avatar from '@vkontakte/vkui/dist/components/Avatar/Avatar';
import Separator from '@vkontakte/vkui/dist/components/Separator/Separator';
import Snackbar from '@vkontakte/vkui/dist/components/Snackbar/Snackbar';
import Gallery from '@vkontakte/vkui/dist/components/Gallery/Gallery';
import Alert from '@vkontakte/vkui/dist/components/Alert/Alert';
import UsersStack from '@vkontakte/vkui/dist/components/UsersStack/UsersStack';

import Icon28MessageOutline from '@vkontakte/icons/dist/28/message_outline';
import Icon28PlaceOutline from '@vkontakte/icons/dist/28/place_outline';
import Icon28AddOutline from '@vkontakte/icons/dist/28/add_outline';
import Icon24Cancel from '@vkontakte/icons/dist/24/cancel';
import Icon24Send from '@vkontakte/icons/dist/24/send';
import Icon16Done from '@vkontakte/icons/dist/16/done';
import Icon16Cancel from '@vkontakte/icons/dist/16/cancel';

import '@vkontakte/vkui/dist/vkui.css';
import './panels/stylesheets.css';

import Map from './panels/Map';
import Chat from './panels/Chat';
import Config from './panels/Config';
import FirstTimePanel from './panels/FirstTimePanel';

import dps from './img/dps.svg';
import dtp from './img/dtp.svg';
import sos from './img/sos.svg';

var marker = null;

String.prototype.replaceAt = function(index, replacement) {
	return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

String.prototype.firstLetterCaps = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function getDiffTime(start) {
	let end = new Date;
	let diff = end - start;
	let hours = Math.floor((diff % 86400000) / 3600000);
	let minutes = Math.round(((diff % 86400000) % 3600000) / 60000);
	return hours === 0 ? minutes + 'м. назад' : hours + 'ч. ' + minutes + 'м. назад';
}

function isStringEmpty(string) {
	string = string.trim();
	if (string.length > 0) {
		return false;
	} else {
		return true;
	}
}

function Comment(props) {
	let comment = props.comment;
	return (
	<Div size="m" className='commentCell'>
		<Group className='commentInfo'
		separator='hide'
		description={comment.comment}>
			<Cell className='commentOwnerCell' asideContent={<Text>{getDiffTime(comment.datetime)}</Text>}>
				<Link href={`https://vk.com/id${comment.userId}`} target='_blank'>
					<Div className='commentOwner'>
						<Div className='commentUserName'>
							<Title level='3' weight="medium" style={{margin: 0, padding: 0 }}>{comment.firstName}</Title>
						</Div>
					</Div>
				</Link>
			</Cell>
		</Group>
	</Div>);
}

class MessageSend extends React.Component {
	constructor (props) {
		  super(props);
		this.sendMessage = this.sendMessage.bind(this);
		this.messageChange = this.messageChange.bind(this);
		this.buttonSendMessageRender = this.buttonSendMessageRender.bind(this);
		this.state = {
			message: ''
		}
		this.messageNotState='';
		this.sendsMessagesLimit = 30;
	}

	messageChange(e) {
		this.setState({
			message:  e.target.value
		});
		this.messageNotState = e.target.value;
		this.buttonSendMessageRender();
	}

	buttonSendMessageRender() {
		let isNeedRender = !isStringEmpty(this.messageNotState);
		let buttonSendMessage = document.getElementById('messageSendButton')
		try {
			isNeedRender ? buttonSendMessage.style.display = 'block' : buttonSendMessage.style.display = 'none';
		} catch (e) {
			console.log(e)
		}
	}

	async sendMessage() {
		let trimmedMessage = this.state.message.replace(/\s+/g, ' ').trim();
		if (this.state.message.length > 0) {
			if (this.props.sendsMessagesCount < this.sendsMessagesLimit) {
				let messageInfo = {
					userId: this.props.fetchedUser.id,
					cityId: this.props.cityId,
					firstName: this.props.fetchedUser.first_name,
					lastName: this.props.fetchedUser.last_name,
					photo: this.props.fetchedUser.photo_100,
					message: trimmedMessage,
					sign: window.location.search.slice(1, window.location.search.length)
				}
				let response = false;
				try {
					response = await fetch("https://brainrtp.me:8443/addmessage", {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(messageInfo)
					});
					if (response) {
						this.setState({
							message:  ''
						});
						let newCount = this.props.sendsMessagesCount + 1;
						this.props.setSendsMessagesCount(newCount);
						if (newCount === this.sendsMessagesLimit-1) this.props.setSendsMessagesLimitTimer(setTimeout(() => this.props.setSendsMessagesCount(0), 30000));
					}
				} catch(e) {
					console.log('err in send messages');
				}
				if (!response) {
					console.log('res return false');
				}
			} else {
				this.props.setNewSnackbar('Вы отправили слишком много сообщений.\nПодождите 30 секунд, прежде чем отправить еще одно.', 5000);
			}
		}
	}

	render () {
		return (
			<Div id='chatMessageSendDiv'>
				<Input id='chatMessageInput' autoComplete='off' type="text" maxLength='256' value={this.state.message} placeholder='Введите сообщение' maxLength="256" onChange={this.messageChange}/>
				<Button mode='secondary' id='messageSendButton' onClick={() => {
						this.messageNotState = '';
						this.buttonSendMessageRender();	
						this.sendMessage();
					}}>
					<Icon24Send/>
				</Button>
			</Div>
		)
	}
}

const App = () => {
	const descriptions = {
		'dps': 'Экипаж ДПС при исполнении',
		'dtp': 'Дорожно-транспортное происшествие',
		'sos': 'Просьба о помощи',
	}
	const infoCards = {
		'dps': 'infoCardMarkerDps',
		'dtp': 'infoCardMarkerDtp',
		'sos': 'infoCardMarkerSos'
	}
	const MODAL_CARD_ADD_MARKER_DPS = 'addCardMarkerDps';
	const MODAL_CARD_ADD_MARKER_DTP = 'addCardMarkerDtp';
	const MODAL_CARD_ADD_MARKER_SOS = 'addCardMarkerSos';
	const MODAL_PAGE_MARKER_SELECT = 'selectMarkerType';
	const [fetchedUser, setUser] = useState(null);
	const [popout, setPopout] = useState(<ScreenSpinner size='large' name='ScreenSpinner'/>);
	const [modal, setModal] = useState(null);
	const [snackbar, setSnackbar] = useState(null);

	const [isFirstTime, setFirstTime] = useState(true);

	const [markerDescription, setMarkerDescription] = useState('');
	const [activeStory, setActiveStory] = useState(localStorage.getItem('isNotFirstTime') ? 'mapPanel' : 'firstTimePanel');
	const [activeType, setActiveType] = useState('dps');
	const [activeRows, setActiveRows] = useState('');
	const [clickedMarker, setClickedMarker] = useState(null);
	const [activeDescription, setActiveDescription] = useState(descriptions[activeType]);
	const [newComment, setNewComment] = useState('');

	const [city, setCity] = useState({id: localStorage.getItem('cityId') || '605', name: localStorage.getItem('cityName') || 'Москва, Московская область'});
	const [isCityDivClosed, setCityDivClosed] = useState(true);

	const [timer, setTimer] = useState(Date.now()-60000);

	const [sendsMessagesCount, setSendsMessagesCount] = useState(0);
	const [sendsMessagesLimitTimer, setSendsMessagesLimitTimer] = useState(null);

	useEffect(() => {
		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				document.body.attributes.setNamedItem(schemeAttribute);
			}
		});
		async function fetchData() {
			const user = await bridge.send('VKWebAppGetUserInfo');
			setUser(user);
			setPopout(null);
		}
		fetchData();
		localStorage.setItem('isNotFirstTime', true);

		return () => {
			setSendsMessagesCount(0);
			setSendsMessagesLimitTimer(null);
		};
	}, []);

	function setNewSnackbar(message, duration, success = false) {
		setSnackbar (
			<Snackbar
			layout="horizontal"
			duration={duration}
			onClose={() => {
					setSnackbar(null);
			}}
			before={<Avatar size={24} style={{backgroundColor: 'var(--accent)'}}>{
				success 
				? 
				<Icon16Done fill="#fff" width={14} height={14} />
				: 
				<Icon16Cancel fill="#fff" width={14} height={14} />
				}
				</Avatar>}
			>
			{message}
			</Snackbar>
		);
	}

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

	function markerDescriptionChange(e) {
		setMarkerDescription(e.target.value);
	}

	function commentChange(e) {
		setNewComment(e.target.value);
	}

	function rowChange(letter) {
		if ((activeRows).includes(letter)) setActiveRows(activeRows.replace(letter, ''));
		else setActiveRows(activeRows + letter);
	}

	function onClickMarker(markerInfo) {
		try {
			setClickedMarker(markerInfo);
			setModal(infoCards[markerInfo.type]);
		} catch (e) {
			console.log(e);
			setModal(null);
		}
	}

	function isTimeOut(needSec) {
		let end = new Date;
		let seconds = Math.floor((end - timer) / 1000);
		return seconds >= needSec ? true : false;
	}

	async function addMarker() {
		if (isTimeOut(20)) {
			let markerInfo = {
				type: activeType,
				userId: fetchedUser.id,
				firstName: fetchedUser.first_name,
				lastName: fetchedUser.last_name,
				photo: fetchedUser.photo_100,
				data: marker._latlng,
				markerDescription: markerDescription,
				comments: [],
				sign: window.location.search.slice(1, window.location.search.length)
			}
			if (activeType === 'dps' || activeType === 'dtp') {
				markerInfo.confirmed = [];
			}
			let response = false;
			try {
				setPopout(<ScreenSpinner name='ScreenSpinner'/>);
				response = await fetch("https://brainrtp.me:8443/addmarker", {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(markerInfo)
				});
				setTimer(Date.now());
			} catch(e) {
				setNewSnackbar('Сервер недоступен.', 5000);
			}
			if (!response) {
				setNewSnackbar('Упс... Возникла серверная ошибка.', 2000);
			}
		} else {
			setNewSnackbar(`Вам нужно подождать 20 cекунд, прежде чем вы сможете поставить метку.\n\nСпасибо за понимание.`, 4500);
		}
	}

	async function updateMarkers() {
		try {
			let response = await fetch(`https://brainrtp.me:8443/getmarkers${window.location.search}`);
			let json = await response.json();
			let markers = await json;
			if (popout && popout.props.name === 'ScreenSpinner') {
				setPopout(null);
			}
			return markers;
		} catch(e) {
			setNewSnackbar('Сервер недоступен.', 5000);
			return [];
		}
	}

	async function removeMarker() {
		if (clickedMarker) {
			let response = false;
			try {
				setPopout(<ScreenSpinner name='ScreenSpinner'/>);
				response = await fetch("https://brainrtp.me:8443/removemarker", {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						idToConfirm: clickedMarker._id,
						sign: window.location.search.slice(1, window.location.search.length)
					})
				});
			} catch(e) {
				setNewSnackbar('Сервер недоступен.', 5000);
			}
			if (!response) {
				setNewSnackbar('Упс... Возникла серверная ошибка.', 2000);
			}
		}
	}

	async function addNewMarkerComment() {
		if (newComment !== '' && clickedMarker) {
			let response = false;
			try {
				setPopout(<ScreenSpinner name='ScreenSpinner'/>);
				response = await fetch("https://brainrtp.me:8443/addmarkercomment", {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						idToConfirm: clickedMarker._id,
						userData: {
							userId: fetchedUser.id,
							firstName: fetchedUser.first_name,
							comment: newComment
						},
						sign: window.location.search.slice(1, window.location.search.length)
					})
				});
			} catch(e) {
				setNewSnackbar('Сервер недоступен.', 5000);
			}
			if (!response) {
				setNewSnackbar('Упс... Возникла серверная ошибка.', 2000);
			}
		} else {
			setNewSnackbar('Пустой комментарий отправлен не будет.', 2000);
		}
	}

	function includesId() {
		if(clickedMarker.userId === fetchedUser.id) {
			return true;
		}
		if (clickedMarker.confirmed) {
			for(const confirmed of clickedMarker.confirmed) {
				if(confirmed.userId === fetchedUser.id) {
					return true;
				}	
			}
		}
		return false;
	}

	async function confirmMarker() {
		if (clickedMarker) {
			if (!includesId()) {
				if (isTimeOut(5)) {
					let response = false;
					try {
						setPopout(<ScreenSpinner name='ScreenSpinner'/>);
						setTimer(Date.now());
						response = await fetch("https://brainrtp.me:8443/confirmmarker", {
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
								},
								sign: window.location.search.slice(1, window.location.search.length)
							})
						});
					} catch(e) {
						setNewSnackbar('Сервер недоступен.', 5000);
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
						setNewSnackbar('Сервер недоступен.', 1000, true);
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
				} else {
					setNewSnackbar(`Вам нужно подождать несколько секунд, прежде чем вы сможете подтвердить еще одну метку.\n\nСпасибо за понимание.`, 4500);
				}
			}
			else {
				setNewSnackbar('Вы не можете подтвердить этот маркер.', 2000);
			}
		}
	}

	function dtpCommentChange(row) {
		let localComment = markerDescription.toLowerCase();
		if ((localComment.toLowerCase()).includes(row)) {
			let indexOfComma = (localComment).indexOf(row) - 2;
			let tmpComm = localComment.replace(new RegExp(row + '.\\s'), '');
			if (indexOfComma >= 0 && tmpComm.charAt(indexOfComma + 2) === '') {
				tmpComm = tmpComm.replaceAt(indexOfComma, '.');
			}
			setMarkerDescription(tmpComm.firstLetterCaps());
		}
		else {
			if (localComment.length === 0) {
				setMarkerDescription(row.firstLetterCaps() + '. ');
			}
			else if (localComment[markerDescription.length - 2] === '.') {
				setMarkerDescription(markerDescription.replace('. ', ', ').firstLetterCaps() + row + '. ');
			}
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

	function changePopoutState(isPopoutNeed) {
		setPopout(isPopoutNeed ? <ScreenSpinner size='large' name='ScreenSpinner'/> : null);
	}

	function openAlertDelete() {
		setPopout(
			<Alert
				actionsLayout="horizontal"
				actions={[{
					title: 'Удалить',
					mode: 'destructive',
					action: () => removeMarker()
				}, {
					title: 'Отменить',
					mode: 'cancel',
					action: () => setPopout(null)
				}]}
				onClose={() => {
					setPopout(null);
				}}
				>
				<h2>Подтвердите действие</h2>
				<p>Вы уверены, что хотите удалить маркер?</p>
			</Alert>
		  );
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
									if (activeType === 'dps') setModal(MODAL_CARD_ADD_MARKER_DPS);
									else if (activeType === 'dtp') setModal(MODAL_CARD_ADD_MARKER_DTP);
									else setModal(MODAL_CARD_ADD_MARKER_SOS);
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
					setMarkerDescription('');
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
						setMarkerDescription('');
						onRemoveMarker();
					}},
					{
					title: 'Отменить',
					mode: 'secondary',
					action: () => {
						setModal(MODAL_PAGE_MARKER_SELECT);
						setMarkerDescription('');
					}}
				]}>
				<Group id='comment' header={<Header style={{ margin: 0,  paddingLeft: 0 }} mode="secondary">Описание</Header>}>
					<Textarea  maxLength='150' onChange={markerDescriptionChange} />
				</Group>
			</ModalCard>
			<ModalCard
				id={MODAL_CARD_ADD_MARKER_DTP}
				onClose={() => {
					onRemoveMarker();
					setModal(null);
					setMarkerDescription('');
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
						setMarkerDescription('');
						setActiveRows('');
						onRemoveMarker();
					}},
					{
					title: 'Отменить',
					mode: 'secondary',
					action: () => {
						setModal(MODAL_PAGE_MARKER_SELECT);
						setMarkerDescription('');
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
				<Group id='comment' header={<Header style={{ margin: 0,  paddingLeft: 0 }} mode="secondary">Описание</Header>}>
					<Input type='text' maxLength='150' defaultValue={markerDescription} onChange={markerDescriptionChange} />
				</Group>
			</ModalCard>
			<ModalCard
				id={MODAL_CARD_ADD_MARKER_SOS}
				onClose={() => {
					onRemoveMarker();
					setModal(null);
					setMarkerDescription('');
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
						setMarkerDescription('');
						onRemoveMarker();
					}},
					{
					title: 'Отменить',
					mode: 'secondary',
					action: () => {
						setModal(MODAL_PAGE_MARKER_SELECT);
						setMarkerDescription('');
					}}
				]}>
				<Group id='comment' header={<Header style={{ margin: 0,  paddingLeft: 0 }} mode="secondary">Что случилось</Header>}>
					<Textarea maxLength='150' onChange={markerDescriptionChange} />
				</Group>
			</ModalCard>
			<ModalCard
				id={infoCards['dtp']}
				onClose={() => {
					setModal(null);
					}}
				header={'ДТП'}>
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
										: (divideConfirmed()[1].length === 0 ? 'Пока не подтвердил ни один человек.' : `${divideConfirmed()[1][0]} подтвердил.`)
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
							{clickedMarker.markerDescription === '' || 
								<Group className='markerDescription' 
									header={<Header className='markerDescriptionHeader' mode="primary">Описание</Header>}
									description={clickedMarker.markerDescription}
									separator="hide">
								</Group>
							}
							<Group className='commentDescription' 
								header={<Header className='markerCommentsHeader' mode="primary">Комментарии</Header>}>
								{clickedMarker.comments.length === 0 || 
								<Gallery 
									className='commentsDiv'
									slideWidth="90%"
									align="center">
									{clickedMarker.comments.map((comment, index) => 
										<Comment key={index} comment={comment}/>)
									}
								</Gallery>
								}	
								<Div className='commentInputDiv'>
									<Input className='commentInput' type="text" placeholder='Введите комментарий' maxLength="50" onChange={commentChange}/>
									<Button mode='secondary' className='commentButton' onClick={() => {
										setModal(null);
										addNewMarkerComment();
										}}>
										<Icon24Send/>
									</Button>
								</Div>
							</Group>
							<Div className='cardButtons'>
								<Button mode='secondary' size='xl' id='removeButton' onClick={() => {
									setModal(null);
									}}>
									Закрыть
								</Button>
								{clickedMarker.userId !== fetchedUser.id 
								?
									includesId() ||
									<Button className='primaryButton' mode='primary' size='xl' onClick={() => {	
											setModal(null);				
											confirmMarker();
										}}>
										Подтвердить
									</Button>
								: 
									<Button className='primaryButton' mode='primary' size='xl' onClick={() => {		
											setModal(null);
											openAlertDelete();
										}}>
										Удалить
									</Button>
								}
							</Div>
						</Div>
				}
			</ModalCard>
			<ModalCard
				id={infoCards['dps']}
				onClose={() => {
					setModal(null);
					}}
				header={'ДПС'}>
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
										: (divideConfirmed()[1].length === 0 ? 'Пока не подтвердил ни один человек.' : `${divideConfirmed()[1][0]} подтвердил.`)
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
							{clickedMarker.markerDescription === '' || 
							<Group className='markerDescription' 
								header={<Header className='markerDescriptionHeader' mode="primary">Описание</Header>}
								description={clickedMarker.markerDescription}
								separator="hide">
							</Group>
							}
							<Group className='commentDescription' 
								header={<Header className='markerCommentsHeader' mode="primary">Комментарии</Header>}>
								{clickedMarker.comments.length === 0 || 
								<Gallery 
									className='commentsDiv'
									slideWidth="90%"
									align="center">
									{clickedMarker.comments.map((comment, index) => 
										<Comment key={index} comment={comment}/>)
									}
								</Gallery>
								}	
								<Div className='commentInputDiv'>
									<Input className='commentInput' type="text" placeholder='Введите комментарий' maxLength="50" onChange={commentChange}/>
									<Button mode='secondary' className='commentButton' onClick={() => {
										setModal(null);
										addNewMarkerComment();
										}}>
										<Icon24Send/>
									</Button>
								</Div>
							</Group>
							<Div className='cardButtons'>
								<Button mode='secondary' size='xl' id='removeButton' onClick={() => {
									setModal(null);
									}}>
									Закрыть
								</Button>
								{clickedMarker.userId !== fetchedUser.id 
								?
									includesId() ||
									<Button className='primaryButton' mode='primary' size='xl' onClick={() => {	
											setModal(null);				
											confirmMarker();
										}}>
										Подтвердить
									</Button>
									
								: 
									<Button className='primaryButton' mode='primary' size='xl' onClick={() => {						
											setModal(null);
											openAlertDelete();
										}}>
										Удалить
									</Button>
								}
							</Div>
						</Div>
				}
			</ModalCard>
			<ModalCard
				id={infoCards['sos']}
				onClose={() => {
					setModal(null);
					}}
					header={'Нужна помощь'}>
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
								{clickedMarker.markerDescription === '' || 
									<Group className='markerDescription' 
										header={<Header className='markerDescriptionHeader' mode="primary">Описание</Header>}
										description={clickedMarker.markerDescription}
										separator="hide">
									</Group>
								}
							</Div>
							<Group className='commentDescription' 
								header={<Header className='markerCommentsHeader' mode="primary">Комментарии</Header>}>
								{clickedMarker.comments.length === 0 || 
								<Gallery 
									className='commentsDiv'
									slideWidth="90%"
									align="center">
									{clickedMarker.comments.map((comment, index) => 
										<Comment key={index} comment={comment}/>)
									}
								</Gallery>
								}	
								<Div className='commentInputDiv'>
									<Input className='commentInput' type="text" placeholder='Введите комментарий' maxLength="50" onChange={commentChange}/>
									<Button mode='secondary' className='commentButton' onClick={() => {
										addNewMarkerComment();
										setModal(null);
										}}>
										<Icon24Send/>
									</Button>
								</Div>
							</Group>
							<Div className='cardButtons'>
								<Button mode='secondary' size='xl' id='removeButton' onClick={() => {
									setModal(null);
									}}>
									Закрыть
								</Button>
								{clickedMarker.userId !== fetchedUser.id ||
									<Button className='primaryButton' mode='primary' size='xl' onClick={() => {						
											openAlertDelete();
											setModal(null);
										}}>
										Удалить
									</Button>
								}
							</Div>
						</Div>
				}
			</ModalCard>
		</ModalRoot>
	);

	return (
		<Epic activeStory={activeStory} tabbar={
			<Tabbar>
				{activeStory === 'chatPanel'
				?
					isCityDivClosed 
					?
						<MessageSend 
							fetchedUser={fetchedUser} 
							cityId={city.id} 
							setNewSnackbar={setNewSnackbar}
							sendsMessagesCount={sendsMessagesCount}
							setSendsMessagesCount={setSendsMessagesCount}
							sendsMessagesLimitTimer={sendsMessagesLimitTimer}
							setSendsMessagesLimitTimer={setSendsMessagesLimitTimer}
							setNewSnackbar={setNewSnackbar}
						/>
					: null
				: null
				}
				{snackbar}
			<TabbarItem
				onClick={onStoryChange}
				selected={activeStory === 'chatPanel'}
				data-story="chatPanel"
				text="Канал"
			><Icon28MessageOutline /></TabbarItem>
			<TabbarItem
				onClick={onStoryChange}
				selected={activeStory === 'mapPanel'}
				data-story="mapPanel"
				text="Карта"
			><Icon28PlaceOutline /></TabbarItem>
			{/* {<TabbarItem
				onClick={onStoryChange}
				selected={activeStory === 'configPanel'}
				data-story="configPanel"
				text="Настройки"
			><Icon28SettingsOutline /></TabbarItem>} */}
			</Tabbar>
		}>
			<View id="chatPanel" activePanel="chatPanel" popout={popout}>
				<Chat 
					id="chatPanel" 
					fetchedUser={fetchedUser} 
					city={city} 
					setCity={setCity} 
					isCityDivClosed={isCityDivClosed}
					setCityDivClosed={setCityDivClosed} 
					changePopoutState={changePopoutState} 
					setNewSnackbar={setNewSnackbar}
				/>
			</View>
			<View id="mapPanel" activePanel="mapPanel" popout={popout} modal={modalRoot}>
				<Map 
					id="mapPanel" 
					onSetMarker={onSetMarker} 
					updateMarkersOnMap={updateMarkers} 
					onClickMarker={onClickMarker}
				/>
			</View>
			<View id="firstTimePanel" activePanel="firstTimePanel">
				<FirstTimePanel 
					id="firstTimePanel" 
					setFirstTime={setFirstTime}
				/>
			</View>
			{/* {<View id="configPanel" activePanel="configPanel">
				<Config id="configPanel"/>
			</View>} */}
		</Epic>
	);
}

export default App;

