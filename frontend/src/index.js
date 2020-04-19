import React from 'react';
import ReactDOM from 'react-dom';

// import styles and fonts
import './fonts/korinna-bold/korinn.ttf';
import './fonts/vni-swiss-condense/vni.common.VSWISEC.ttf';

import './styles/index.scss';
//mdbreact
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
// Korina bold (quesiton text font)

import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
