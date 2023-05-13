import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

import { OhVueIcon, addIcons } from 'oh-vue-icons';
import * as BiIcons from 'oh-vue-icons/icons/bi';
import * as RiIcons from 'oh-vue-icons/icons/ri';
import * as HiIcons from 'oh-vue-icons/icons/hi';
import * as CoIcons from 'oh-vue-icons/icons/co';
import * as LaIcons from 'oh-vue-icons/icons/la';
import { PrWindowMaximize, PrWindowMinimize } from 'oh-vue-icons/icons/pr';
import { MdMinimizeOutlined } from 'oh-vue-icons/icons/md';

import Popper from 'vue3-popper';

import VueMathjax from 'vue-mathjax-next';

const Bi = Object.values({ ...BiIcons });
addIcons(...Bi);

const Ri = Object.values({ ...RiIcons });
addIcons(...Ri);

const Hi = Object.values({ ...HiIcons });
addIcons(...Hi);

const Co = Object.values({ ...CoIcons });
addIcons(...Co);

const La = Object.values({ ...LaIcons });
addIcons(...La);

addIcons(PrWindowMaximize, PrWindowMinimize, MdMinimizeOutlined);

const app = createApp(App);
app.use(VueMathjax);
app.component('v-icon', OhVueIcon);
app.component('Popper', Popper);
app.mount('#app');
