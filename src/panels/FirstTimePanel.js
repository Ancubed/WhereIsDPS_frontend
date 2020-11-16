import React from 'react';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Avatar from '@vkontakte/vkui/dist/components/Avatar/Avatar';
import Link from '@vkontakte/vkui/dist/components/Link/Link';

import dps from '../img/dps.svg';
import dtp from '../img/dtp.svg';
import sos from '../img/sos.svg';

function Config(props) {
	  return (
		<Panel className="panel" id={props.id}>
			<PanelHeader>Антирадар</PanelHeader>
			<div id='firstTimePanel'>
				<div id='contentFirstTimePanel'>
					<h1 id='headerFirstTimePanel' weight="bold">Добро пожаловать!</h1>
					<h3 id='subheadFirstTimePanel' weight="medium" style={{ textAlign: "center" }}>Антирадар - это интерактивная карта ДПС и ДТП городов России.</h3>
					<div className='descElemFirstTimePanel'>
						<div className='textBlock'>
							<h3 className='textBlockHeader' weight="regular">ДПС</h3>
							<span className='textBlockDescription'>Экипаж ДПС при исполнении</span>
						</div>
						<Avatar size={54} style={{ marginBottom: 0 }} src={dps}></Avatar>
					</div>
					<div className='descElemFirstTimePanel'>
						<div className='textBlock'>
							<h3 className='textBlockHeader' weight="regular">ДТП</h3>
							<span className='textBlockDescription'>Дорожно-транспортное происшествие</span>
						</div>
						<Avatar size={54} style={{ marginBottom: 0 }} src={dtp}></Avatar>
					</div>
					<div className='descElemFirstTimePanel'>
						<div className='textBlock'>
							<h3 className='textBlockHeader' weight="regular">SOS</h3>
							<span className='textBlockDescription'>Просьба о помощи</span>
						</div>
						<Avatar size={54} style={{ marginBottom: 0 }} src={sos}></Avatar>
					</div>
					<div id='terms'>
						<div id='termsSubheadDiv'>
							<h3 className='termsSubhead tsbold' weight="bold">
								Для Вашего удобства, приложению необходим доступ к геолокации.
							</h3>
							<h3 className='termsSubhead' weight="medium">
								Продолжая использование, Вы соглашаетесь с:
							</h3>
						</div>
						<Link href="https://vk.com/dev/uprivacy" target="_blank">Политика конфиденциальности</Link>
						<Link href="https://vk.com/dev/uterms" target="_blank">Пользовательское соглашение</Link>
					</div>
				</div>
			</div>
	  	</Panel>
	  );
}

export default Config;
