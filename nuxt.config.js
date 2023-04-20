export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'PG_Bridge',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {hid: 'description', name: 'description', content: ''},
      {name: 'format-detection', content: 'telephone=no'}
    ],
    link: [
      {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'}
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'element-ui/lib/theme-chalk/index.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '@/plugins/element-ui',
    {src: '~/plugins/vue-ls.js', ssr: false},
    {src: '~/plugins/event-bus.js', ssr: false}
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/style-resources',
    'nuxt-windicss'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    'nuxt-i18n'
  ],
  i18n: {
    locales: [
      {
        code: 'en',
        name: 'English',
        iso: 'en-US',
        file: 'en-US.js'
      },
      {
        code: 'zh',
        name: '简体中文',
        iso: 'zh-CN',
        file: 'zh-CN.js'
      }
    ],
    defaultLocale: 'en',
    vueI18n: {
      fallbackLocale: 'en'
    },
    lazy: true,
    langDir: 'lang/',
    strategy: 'no_prefix'
  },
  vuex: {
    moduleName: 'i18n',
    syncLocale: true
  },
  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [/^element-ui/]
  }
}
