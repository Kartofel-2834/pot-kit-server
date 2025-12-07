// Styles
import '@/assets/css/main.css';
import '@/assets/css/index.css';

// Composables
import { setup as setupDialogs, terminate as terminateDialogs } from '@/composables/dialog';
import { setup as setupDeviceIs, terminate as terminateDeviceIs } from '@/composables/device-is';
import { setup as setupFocus, terminate as terminateFocus } from '@/composables/focus';

import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

setupFocus();
setupDialogs();
setupDeviceIs();

app.mount('#app');
