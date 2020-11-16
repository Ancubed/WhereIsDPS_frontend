import React from 'react';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Div from '@vkontakte/vkui/dist/components/Div/Div';
import Group from '@vkontakte/vkui/dist/components/Group/Group';
import Cell from '@vkontakte/vkui/dist/components/Cell/Cell';
import Header from '@vkontakte/vkui/dist/components/Header/Header';
import CellButton from '@vkontakte/vkui/dist/components/CellButton/CellButton';
import Input from '@vkontakte/vkui/dist/components/Input/Input';
import Button from '@vkontakte/vkui/dist/components/Button/Button';
import Avatar from '@vkontakte/vkui/dist/components/Avatar/Avatar';
import Text from '@vkontakte/vkui/dist/components/Typography/Text/Text';
import Link from '@vkontakte/vkui/dist/components/Link/Link';
import Title from '@vkontakte/vkui/dist/components/Typography/Title/Title';
import Search from '@vkontakte/vkui/dist/components/Search/Search';
import List from '@vkontakte/vkui/dist/components/List/List';
import PanelHeaderButton from '@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton';

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

class Chat extends React.Component {
	constructor (props) {
	  super(props);
	  this.cityChange = this.cityChange.bind(this);
	  this.openCloseCityDiv = this.openCloseCityDiv.bind(this);
	  this.onChangeInputCity = this.onChangeInputCity.bind(this);
      this.getCities = this.getCities.bind(this);
	  this.state = {
			search: '',			
	  }
	  this.cities = [];
    }

    onChangeInputCity (e) { 
		this.setState({ 
			search: e.target.value 
		}); 
	}

    get citiesInList () {
		if (this.cities.length > 0) {
			const search = this.state.search.toLowerCase();
			return this.cities.filter(({name}) => name.toLowerCase().indexOf(search) > -1);
		}
		else return [];
    }

	cityChange(id, name) {
		this.props.setCity({id: id, name: name});
		localStorage.setItem('cityId', id);
		localStorage.setItem('cityName', name);
	}

	openCloseCityDiv() {
		let stateNow = this.props.isCityDivClosed;
		this.props.setCityDivClosed(!stateNow);
	}

	async getCities () {
		let cities = [];
			try {
				let response = await fetch(`https://brainrtp.me:8443/getcities${window.location.search}`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				});
				cities = await response.json();
			} catch(e) {
				this.props.setNewSnackbar('Сервер недоступен.', 5000);
				console.log('cities loading error');
			}
		return cities;
	}

	async componentDidMount() {
		this.props.changePopoutState(true);
		this.cities = await this.getCities();
		this.props.changePopoutState(false);
	}

	componentWillUnmount() {
		this.cities = [];
	}

	render () {
	  return (
		<Panel className="panel" id={this.props.id}>
			<PanelHeader id='panelHeader'>
				{this.props.city.name.split(',')[0]}
				<PanelHeaderButton id='openClosePanelHeaderButton' onClick={() => {
					this.props.changePopoutState(true);
					this.openCloseCityDiv();
					this.props.changePopoutState(false);
					}}>
				{this.props.isCityDivClosed
				?
					<Icon24Dropdown />
				: 
					<Icon24Cancel />
				}
				</PanelHeaderButton>
			</PanelHeader>
			<Div id='chat'>
			{this.props.isCityDivClosed ||
				<Div id='chatCityDiv'>
					<Group header={<Header mode="secondary">Город</Header>}
					separator='hide'>
						<Cell id='cellCity'>
							<Search id='citySearch' value={this.state.search} onChange={this.onChangeInputCity} maxLength='100' after={null}/>
								{this.citiesInList.length > 0 && this.citiesInList.length < 100 
								?
									<List id='cityList'>
									{this.citiesInList.map(city => <CellButton className={'cityCellButton'} onClick={() => {
										this.cityChange(city.id, city.name);
										this.openCloseCityDiv();
										}} 
										key={city.id}>{city.name}</CellButton>)}
									</List>
								:
									<List id='cityList'>
									{this.citiesInList.slice(0, 20).map(city => <CellButton className={'cityCellButton'} onClick={() => {
										this.cityChange(city.id, city.name);
										this.openCloseCityDiv();
										}} 
										key={city.id}>{city.name}</CellButton>)}
									</List>
								}
						</Cell>
					</Group>
				</Div>
			}	{!this.props.isCityDivClosed ||
					<Messages fetchedUser={this.props.fetchedUser} cityId={this.props.city.id} changePopoutState={this.props.changePopoutState} setNewSnackbar={this.props.setNewSnackbar}/>
				}
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
				messages: [],
				isMessageSends: false,
				isMessagesLoad: false
			}
			this.datetime = 0;
			this.messagesEndRef = React.createRef();
			this.intervalToGetMessages = null;
			this.timeoutToMessagesWasntScroll = null;
			this.intervalToScrollLastMessageIfUserNotScroll = null;
		}


		scrollToBottom = (behavior = "auto") => {
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
			if (scrollTop+200 >= clientHeight - windowHeight) {
				this.timeoutToMessagesWasntScroll = setTimeout(() => {
					this.intervalToScrollLastMessageIfUserNotScroll = setInterval(() => {
						this.scrollToBottom('smooth');
					}, 100);
				}, 400);
			}
			if (scrollTop+1 >= clientHeight - windowHeight - 500){
				this.buttonScrollDownRender(false);
			}
		}

		createMessageDiv(messages, isNeedToUpdate = false) {
			if (this.isComponentMount) {
				try {
					if (isNeedToUpdate) {
						this.setState(
							{messages: [...this.state.messages, ...messages]}
						);
					} else {
						this.setState(
							{messages: messages}
						);
					}
				} catch (e) {
					console.log(e);
				}
			}
		}

		async getMessages() {
			let messages = [];
			let filter = {
				cityId: this.props.cityId,
				datetime: this.datetime,
				sign: window.location.search.slice(1, window.location.search.length)
			}
			try {
				let response = await fetch("https://brainrtp.me:8443/getmessages", {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(filter)
				});
				messages = await response.json();
				if (messages.length > 0) {
					this.datetime = messages[messages.length - 1].datetime;
				}
				else if (messages.length === 0 && this.state.messages.length === 0) {
					this.datetime = 0;
				}
				this.setState({
					isMessagesLoad: true
				});
			} catch(e) {
				this.props.setNewSnackbar('Сервер недоступен.', 5000);
				console.log(e);
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
					this.createMessageDiv(messages, true);
				});
			}, 800);
			window.addEventListener('scroll', this.chatScrollListener);
		}
	
		componentWillUnmount() {
			this.isComponentMount = false;
			window.removeEventListener('scroll', this.chatScrollListener);
			clearInterval(this.intervalToGetMessages);
			clearInterval(this.intervalToScrollLastMessageIfUserNotScroll);
			clearTimeout(this.timeoutToMessagesWasntScroll);
		}

		componentDidUpdate(prevProps) {
			if (prevProps.cityId !== this.props.cityId) {
				this.setState({
					messages: []
				});
				this.datetime = 0;
			}
		}
							
		render () {
			return (
				<Div id='chatMessagesDivCont'>
					{this.state.messages.length > 0
					?
						<Div id='chatMessagesDiv'>
							<Button id='buttonScrollDown' mode="secondary" size="l" onClick={() => this.scrollToBottom("smooth")}>
								<Icon28ArrowDownOutline />
							</Button>
							{this.state.messages.map((message, index) => 
								message.userId === this.props.fetchedUser.id
								? <Message key={index} message={message} class={'myMessage'}/>
								: <Message key={index} message={message} class={'message'}/>
							)
							}
						</Div>
					: this.state.isMessagesLoad &&
						<Div id='chatMessagesEmpty'>
							<Text id='emptyCityList' className='messageTextText'>Канал пока пуст.</Text>
						</Div>
					}
					<div ref={this.messagesEndRef} id='ref'/>
				</Div>
		)};
	}

	class Message extends React.Component {
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

export default Chat;
