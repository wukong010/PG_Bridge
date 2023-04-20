<template>
  <div id="app">
    <Header />
    <h1 class="title">{{ $t('text3') }}</h1>
    <h4 class="sub-title">{{$t('simple')}}-{{$t('quick')}}-{{ $t('safety') }}</h4>
    <div class="card-box">
      <Card />
      <History />
    </div>
  </div>
</template>

<script>
import Web3 from 'web3'
import eventBus from '~/plugins/event-bus'
export default {
  name: 'IndexPage',
  created() {
    // 检查浏览器是否安装了MetaMask或其他兼容的钱包
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask或其他兼容钱包已检测到！')
      const web3 = new Web3(window.ethereum) 
      window.ethereum.on('chainChanged', chainId => {
        const hexChainId = web3.utils.toNumber(chainId)
        eventBus.$emit('chainChanged', hexChainId)
      })

      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('accountsChanged', accounts);
        this.$store.commit('setState', {key: 'address', val: accounts.length ? accounts[0] : null})
      })
    } else {
      alert('请安装MetaMask或其他兼容的钱包！')
    }
  }
}
</script>

<style lang="less">
@import "app";
</style>
