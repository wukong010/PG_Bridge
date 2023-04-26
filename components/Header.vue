<template>
  <header class="header <sm:p-4 sm:(px-8 py-4)">
    <img class="logo <sm:h-22px sm:h-38px" src="/logo.png" alt="">
    <div class="menu-box <md:hidden sm:flex">
      <a href="">{{ $t('transaction') }}</a>
      <a href="">{{ $t('liquidity') }}</a>
      <a href="">{{ $t('farms') }}</a>
      <a href="">{{ $t('nodes') }}</a>
      <a href="">{{ $t('bridge') }}</a>
    </div>
    <div class="flex items-center">
      <div class="connect-btn" @click="_enable">
        <img src="/icon-wallet@2x.png" alt="">
        <span>{{ address ? `0x...${address.slice(-4)}` : $t('connect_wallet') }}</span>
      </div>
      <el-popover
        placement="bottom"
        :visible-arrow="false"
        trigger="hover"
        v-model="visible">
        <div>
          <div class="py-8px cursor-pointer hover:text-[#1263F1] transition duration-300" @click="changeLang('en')">English</div>
          <div class="py-8px cursor-pointer hover:text-[#1263F1] transition duration-300" @click="changeLang('zh')">简体中文</div>
        </div>
        <div class="cursor-pointer" slot="reference">
          <img class="w-22px h-22px ml-8px" src="@/static/zh-cn.png" alt="" v-if="locale == 'zh'">
          <img class="w-22px h-22px ml-8px" src="@/static/en.png" alt="" v-if="locale == 'en'">
        </div>
      </el-popover>
    </div>
  </header>
</template>

<script>
import Web3 from "web3"

export default {
  data() {
    return {
      web3: null,
      visible: false,
    }
  },
  computed: {
    address() {
      return this.$store.state.address
    },
    locale() {
      return this.$i18n.locale
    }
  },
  mounted() {
    const web3 = new Web3(window.ethereum);
    // const web3 = new Web3(Web3.givenProvider);
    this.web3 = web3
    this.getBalance()
    web3.eth.net.getId((error, chainId) => {
      this.$store.commit('setState', {key: 'chainId', val: chainId})
    })

    // 监听链的切换
    window.ethereum.on('chainChanged', chainId => {
      const hexChainId = web3.utils.toNumber(chainId)
      this.$store.commit('setState', {key: 'chainId', val: hexChainId})
      this.getBalance()
    })
  },
  methods: {
    isWalletConnected() {
      return window.ethereum.selectedAddress !== null
    },
    changeLang(val) {
      // this.$store.commit('setState', {key: 'locale', val})
      // this.$i18n.locale = val
      this.$i18n.setLocale(val).then(() => {
        return false
          // this.$router.push({ path: this.$route.path, query: this.$route.query })
        })
      this.visible = false
    },
    async _enable() {
      if (this.address) {
        this._logout()
      } else {
        try {
          if (this.isWalletConnected()) {
            this.$store.commit('setState', {key: 'address', val: window.ethereum.selectedAddress})
          } else {
            // 请求用户授权连接钱包
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
          }
        } catch (err) {
          console.log(err)
        }
      }
    },
    getBalance() {
      if (!this.address) return
      this.web3.eth.getBalance(this.address).then(balance => {
        this.$store.commit('setState', {key: 'balance', val: this.web3.utils.fromWei(balance)})
      })
    },
    _logout() {
      this.$store.commit('resetState')
      this.$ls.clear()
    }
  }
}
</script>

<style>

</style>
