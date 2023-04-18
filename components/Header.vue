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
    <div class="connect-btn" @click="_enable">
      <img src="/icon-wallet@2x.png" alt="">
      <span>{{ address ? `0x...${address.slice(-4)}` : '连接钱包' }}</span>
    </div>
  </header>
</template>

<script>
import Web3 from "web3";

export default {
  data() {
    return {
      web3: null,
    }
  },
  computed: {
    address() {
      return this.$store.state.address
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
