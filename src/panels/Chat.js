import React, { useRef } from 'react';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Div from '@vkontakte/vkui/dist/components/Div/Div';
import Group from '@vkontakte/vkui/dist/components/Group/Group';
import Cell from '@vkontakte/vkui/dist/components/Cell/Cell';
import Header from '@vkontakte/vkui/dist/components/Header/Header';
import Select from '@vkontakte/vkui/dist/components/Select/Select';
import Input from '@vkontakte/vkui/dist/components/Input/Input';
import Button from '@vkontakte/vkui/dist/components/Button/Button';
import Avatar from '@vkontakte/vkui/dist/components/Avatar/Avatar';
import Text from '@vkontakte/vkui/dist/components/Typography/Text/Text';
import Link from '@vkontakte/vkui/dist/components/Link/Link';
import Title from '@vkontakte/vkui/dist/components/Typography/Title/Title';
import CellButton from '@vkontakte/vkui/dist/components/CellButton/CellButton';
import PanelHeaderButton from '@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';

import Icon24Send from '@vkontakte/icons/dist/24/send';
import Icon28ArrowDownOutline from '@vkontakte/icons/dist/28/arrow_down_outline';
import Icon24Dropdown from '@vkontakte/icons/dist/24/dropdown';
import Icon24Cancel from '@vkontakte/icons/dist/24/cancel';

function getTimeForChat(datetime) {
	let datetimeNow = new Date();
	let difference = Math.abs(datetimeNow.getDate() - datetime.getDate());
	if (difference >= 2) {
		return '> 2 дней';
	} else if (difference === 1) {
		return 'вчера';
	} else if (difference === 0) {
		return (datetime.getMinutes() >= 10 
			? `${datetime.getHours()}:${datetime.getMinutes()}`
			: `${datetime.getHours()}:0${datetime.getMinutes()}`);
	}
}

function isStringEmpty(string) {
	string = string.trim();
	if (string.length > 0) {
		return false;
	} else {
		return true;
	}
}

class Chat extends React.Component {
	constructor (props) {
	  super(props);
	  this.cityChange = this.cityChange.bind(this);
	  this.openCloseCityDiv = this.openCloseCityDiv.bind(this);
	  this.state = {
		  cityId: localStorage.cityId || '0',
		  isCityDivOpen: true
	  }
	}

	cityChange(e) {
		this.setState({
			cityId: e.target.value
		});
		localStorage.cityId = e.target.value;
	}

	openCloseCityDiv() {
		let stateNow = this.state.isCityDivOpen;
		let chatMessagesDiv = document.getElementById('chatMessagesDiv');
		if (stateNow) chatMessagesDiv.style.paddingTop = '115px';
		else chatMessagesDiv.style.paddingTop = '5px';
		this.setState({
			isCityDivOpen: !stateNow
		});
	}

	render () {
	  return (
		<Panel className="panel" id={this.props.id}>
			<PanelHeader>
				Канал
				<PanelHeaderButton id='openClosePanelHeaderButton' onClick={this.openCloseCityDiv}>
				{this.state.isCityDivOpen
				?
					<Icon24Dropdown  />
				: 
					<Icon24Cancel />
				}
				</PanelHeaderButton>
			</PanelHeader>
			<Div id='chat'>
				<Div id='chatCityDiv'>
				{this.state.isCityDivOpen ||
					<Group header={<Header mode="secondary">Город</Header>}
					separator='show'>
						<Cell id='cellCity'>
							<Select placeholder="Выберите город" onChange={this.cityChange} defaultValue={this.state.cityId}>
								<option value="0">Оренбург</option>
								<option value="1">Казань</option>
								<option value="2">Уфа</option>
							</Select>
						</Cell>
					</Group>
				}
				</Div>
				<Messages fetchedUser={this.props.fetchedUser} cityId={this.state.cityId}/>
				<MessageSend fetchedUser={this.props.fetchedUser} cityId={this.state.cityId}/>
			</Div>
	  	</Panel>
	  );
	  }
	}

	class Messages extends React.Component {
		isComponentMount = false;
		isMessagesWasScroll = false;

		constructor (props) {
			super(props);
			this.getMessages = this.getMessages.bind(this);
			this.scrollToBottom = this.scrollToBottom.bind(this);
			this.createMessageDiv = this.createMessageDiv.bind(this);
			this.buttonScrollDownRender = this.buttonScrollDownRender.bind(this);
			this.chatScrollListener = this.chatScrollListener.bind(this);
			this.state = {
				datetime: Date.now(),
				messages: null,
				isMessageSends: false,
				popout: <ScreenSpinner size='large' />
			}
			this.messagesEndRef = React.createRef();
			this.intervalToGetMessages = null;
			this.timeoutToMessagesWasntScroll = null;
			this.intervalToScrollLastMessageIfUserNotScroll = null;
		}


		scrollToBottom = (behavior = "smooth") => {
			if (this.state.messages && this.state.messages.length > 0) {
				try {
					this.messagesEndRef.current.scrollIntoView({ 
						block: "end", 
						inline: "nearest", 
						behavior: behavior
					});
					return true;
				} catch (e) {
					console.log(e);
				}
				return false;
			}
		};

		buttonScrollDownRender(isNeedRender) {
			let buttonScrollDown = document.getElementById('buttonScrollDown')
			try {
				isNeedRender ? buttonScrollDown.style.display = 'block' : buttonScrollDown.style.display = 'none';
			} catch (e) {
				console.log(e)
			}
		}

		chatScrollListener() {
			clearInterval(this.intervalToScrollLastMessageIfUserNotScroll);
			clearTimeout(this.timeoutToMessagesWasntScroll);
			const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
			const clientHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
			const windowHeight = window.innerHeight;
			if ((clientHeight - windowHeight) < 300) this.buttonScrollDownRender(false);
			else this.buttonScrollDownRender(true);
			console.log(clientHeight - windowHeight);
			if (scrollTop+1 >= clientHeight - windowHeight) {
				this.timeoutToMessagesWasntScroll = setTimeout(() => {
					this.intervalToScrollLastMessageIfUserNotScroll = setInterval(() => {
						this.scrollToBottom();
					}, 100);
				}, 1000);
			}
			if (scrollTop+1 >= clientHeight - windowHeight - 500){
				this.buttonScrollDownRender(false);
			}
		}

		createMessageDiv(messages) {
			if (this.isComponentMount) {
				try {
					this.setState({messages: messages});
				} catch (e) {
					console.log(e);
				}
			}
		}

		async getMessages() {
			let messages = [];
			let filter = {
				cityId: this.props.cityId,
				datetime: this.state.datetime
			}
			try {
				let response = await fetch("https://vk-miniapps-where-is-dps.herokuapp.com/getmessages", {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(filter)
				});
				messages = await response.json();
			} catch(e) {
				console.log('err');
			}
			return messages;
		}
	
		componentDidMount() {
			this.isComponentMount = true;
			this.getMessages().then((messages) => {
				this.createMessageDiv(messages);
				this.scrollToBottom('auto');
			});
			this.intervalToGetMessages = setInterval(() => {
				this.getMessages().then((messages) => {
					this.createMessageDiv(messages);
				});
			}, 1000);
			window.addEventListener('scroll', this.chatScrollListener);
			this.setState({popout: null});
		}
	
		componentWillUnmount() {
			this.isComponentMount = false;
			window.removeEventListener('scroll', this.chatScrollListener);
			clearInterval(this.intervalToGetMessages);
			clearInterval(this.intervalToScrollLastMessageIfUserNotScroll);
			clearTimeout(this.timeoutToMessagesWasntScroll);
		}
							
		render () {
			return (
				<Div id='chatMessagesDivCont' popout={this.state.popout}>
					{this.state.messages &&
					(this.state.messages.length != 0
					?
						<Div id='chatMessagesDiv'>
							<Button id='buttonScrollDown' mode="secondary" size="l" onClick={() => this.scrollToBottom()}>
								<Icon28ArrowDownOutline />
							</Button>
							{this.state.messages.map((message, index) => 
								index === this.state.messages.length - 1 
								?
									message.userId === this.props.fetchedUser.id
									? <Message key={index} message={message} ref={this.myRef} class={'myMessage'}/>
									: <Message key={index} message={message} ref={this.myRef} class={'message'}/>
								:
									message.userId === this.props.fetchedUser.id
									? <Message key={index} message={message} class={'myMessage'}/>
									: <Message key={index} message={message} class={'message'}/>
							)
							}
						</Div>
					: <Div id='chatMessagesEmpty'>
						<Text className='messageTextText'>Канал пока пуст.</Text>
					</Div>)
					}
					<div ref={this.messagesEndRef} />
				</Div>
		)};
	}

	class Message extends React.Component {
		constructor (props) {
		  super(props);
		}
		render () {
		let message = this.props.message;
		let datetime = new Date(message.datetime);
		return (
			<Div className={this.props.class}>
				<Avatar size={42} className='messageAvatar' src={message.photo}></Avatar>
				<Div className='messageContent'>
					<Div className='messageOwnerCell'>
						<Link className='messageOwnerLink' href={`https://vk.com/id${message.userId}`} target='_blank'>
							<Div className='messageOwner'>
								<Div className='messageUserName'>
									<Title level='3' weight="medium" style={{margin: 0, padding: 0 }}>{`${message.firstName} ${message.lastName}`}</Title>
								</Div>
							</Div>
						</Link>
						<Text className='secondaryText'>{getTimeForChat(datetime)}</Text>
					</Div>
					<Div className='messageText'>
						<Text className='messageTextText'>{message.message}</Text>
					</Div>
				</Div>
			</Div>
		)}
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
			console.log('isStringEmpty(messageNotState) ' + isStringEmpty(this.messageNotState));
			console.log('messageNotState ' + this.messageNotState);
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
				let messageInfo = {
					userId: this.props.fetchedUser.id,
					cityId: this.props.cityId,
					firstName: this.props.fetchedUser.first_name,
					lastName: this.props.fetchedUser.last_name,
					photo: this.props.fetchedUser.photo_100,
					message: trimmedMessage
				}
				let response = false;
				try {
					response = await fetch("https://vk-miniapps-where-is-dps.herokuapp.com/addmessage", {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(messageInfo)
					});
					this.setState({
						message:  ''
					});
				} catch(e) {
					console.log('err');
				}
				if (!response) {
					console.log('res return false');
				}
			}
		}

		render () {
		return (
			<Div id='chatMessageSendDiv'>
					<Input id='chatMessageInput' autoComplete='off' type="text" value={this.state.message} placeholder='Введите сообщение' maxLength="256" onChange={this.messageChange}/>
					<Button mode='secondary' id='messageSendButton' onClick={() => {
							this.messageNotState = '';
							this.buttonSendMessageRender();	
							this.sendMessage();
						}}>
						<Icon24Send/>
					</Button>
				</Div>
		)}
	}

export default Chat;
