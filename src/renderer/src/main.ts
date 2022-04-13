// style
import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "@renderer/styles/index.scss";

// core
import { createApp } from "vue";

// plugin
import { router } from "./routers";

import App from "./App.vue";

createApp(App)
    .use(router)
    .mount('#app')
