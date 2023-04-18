import Vue from 'vue';
import VueStorage from 'vue-ls';

Vue.use(VueStorage, {
  namespace: 'pg__',
  storage: 'local',
});
