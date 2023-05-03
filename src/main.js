import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

import { OhVueIcon, addIcons } from 'oh-vue-icons';
import * as BiIcons from 'oh-vue-icons/icons/bi';
import * as RiIcons from 'oh-vue-icons/icons/ri';

import VueMathjax from 'vue-mathjax-next';

const Bi = Object.values({ ...BiIcons });
addIcons(...Bi);

const Ri = Object.values({ ...RiIcons });
addIcons(...Ri);

const app = createApp(App);
app.use(VueMathjax);
app.component('v-icon', OhVueIcon);
app.mount('#app');
