<template>
  <header class="header">
    <img class="logo" src="/logo.png" alt="">
    <div class="menu-box">
      <a href="">交易</a>
      <a href="">流动性</a>
      <a href="">龙场</a>
      <a href="">节点预选</a>
      <a href="">跨链桥</a>
    </div>
    <div class="flex items-center">
      <div class="connect-btn" @click="_enable">
        <img src="/icon-wallet@2x.png" alt="">
        <span>{{ address ? `0x...${address.slice(-4)}` : '连接钱包' }}</span>
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
<!--    <div @click="changeLang('en')">English</div>-->
  </header>
</template>

<script>
import Web3 from "web3";

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
      return this.$store.state.locale
    }
  },
  mounted() {
    const web3 = new Web3(window.ethereum);
    // const web3 = new Web3(Web3.givenProvider);
    this.web3 = web3
    this.getBalance()
    web3.eth.net.getId((error, chainId) => {
      console.log(chainId);
      this.$store.commit('setState', {key: 'chainId', val: chainId})
    })

    window.ethereum.on('accountsChanged', (accounts) => {
      console.log(accounts);
      if (accounts.length) {
        const address = accounts[0];
        this.$store.commit('setState', {key: 'address', val: address})
      } else {
        this.$store.commit('setState', {key: 'address', val: null})
      }
    });

    // 监听链的切换
    window.ethereum.on('chainChanged', chainId => {
      const hexChainId = web3.utils.toNumber(chainId);
      console.log(hexChainId);
      this.$store.commit('setState', {key: 'chainId', val: hexChainId})
      this.getBalance()
    });
  },
  methods: {
    changeLang(val) {
      this.$store.commit('setState', {key: 'locale', val})
      this.$i18n.locale = val
      this.visible = false
    },
    async _enable() {
      if (this.address) {
        this._logout()
      } else {
        await window.ethereum.enable();
        // const accounts = await this.web3.eth.getAccounts();
        // const address = accounts[0];
        // this.$store.commit('setState', {key: 'address', val: address})
      }
    },
    getBalance() {
      this.web3.eth.getBalance(this.address).then(balance => {
        this.$store.commit('setState', {key: 'balance', val: this.web3.utils.fromWei(balance)})
      })
    },
    _logout() {
      // this.web3.eth.clearSubscriptions()
      // this.web3.currentProvider.disconnect()
      // this.$store.commit('setState', {key: 'address', val: null})
    }
  }
}
</script>

<style>

</style>
