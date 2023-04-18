<template>
  <div id="app">
    <Header />
    <h1 class="title">W3全链跨链桥</h1>
    <h4 class="sub-title">简单-快速-安全</h4>
    <div class="card-box">
      <Card />
      <History />
    </div>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
  created() {
    // 监听链的切换
    // window.ethereum.on('chainChanged', chainId => {
    //   const hexChainId = web3.utils.toNumber(chainId);
    //   this.$store.commit('setState', {key: 'chainId', val: hexChainId})
    // });
  }
}
</script>

<style lang="less">
@import "app";
</style>
