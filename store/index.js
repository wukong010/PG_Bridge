import Vue from 'vue';
import multicallABI from '~/static/abi/Multicall.json';
import erc20ABI from '~/static/abi/erc20.json';
import Web3 from 'web3'
import { toBN } from 'web3-utils';

const web3 = new Web3(window.ethereum)

export const state = () => ({
  address: Vue.ls.get('address'),
  chainId: Vue.ls.get('chainId'),
  balance: Vue.ls.get('balance'),
  hostPairs: Vue.ls.get('hostPairs'),
  tokenBalance: Vue.ls.get('tokenBalance'),
  connectionStatus: Vue.ls.get('connectionStatus') || false,
  history: [],
})

export const mutations = {
  setState(state, {key, val}) {
    // console.log(key, val);
    state[key] = val
    Vue.ls.set(key, val)
  },
  resetState(state) {
    Object.keys(state).forEach(key => {
      if (key !== 'locale') {
        state[key] = null
      }
    })
  }
}

export const actions = {
  async getTokenBalance({commit, state}, {tokenAddress, tokenDecimals}) {
    const num1 = toBN(10)
    const num2 = toBN(tokenDecimals)
    const num3 = toBN(num1 ** num2)
    // 实例化ERC20代币合约
    const tokenContract = new web3.eth.Contract(erc20ABI, tokenAddress);
    // 查询余额
    tokenContract.methods.balanceOf(state.address).call()
      .then((balance) => {
        console.log(`您的余额为：${balance}个代币`);
        const _balance = toBN(balance);
        const val = _balance.div(num3).toString();
        commit('setState', {'key': 'tokenBalance', val})
      })
      .catch((error) => {
        console.error(error);
      });
  },
  async updateTokenBalance({commit, state}, hostPairs) {
    const multicallContract = new web3.eth.Contract(multicallABI, "0x25bA6427E701fb65F706753e5dB145193dF9Fa0D");
    const user = state.address
    const calls = hostPairs.map((p) => ({
      target: p._metaData.tokenAddress,
      callData: web3.eth.abi.encodeFunctionCall({
        name: 'balanceOf',
        type: 'function',
        inputs: [{
          type: 'address',
          name: ''
        }]
      }, [user])
    }));

    const response = await multicallContract.methods.aggregate(calls).call();
    const balances = response.map((balance) => web3.eth.abi.decodeParameter('uint256', balance));
    console.log(balances);
    // console.log(state, hostPairs);
  }
}

// const getTokenBalances = async (tokens, user) => {
//   const calls = tokens.map((token) => ({
//     target: token.address,
//     callData: web3.eth.abi.encodeFunctionCall({
//       name: 'balanceOf',
//       type: 'function',
//       inputs: [{
//         type: 'address',
//         name: ''
//       }]
//     }, [user])
//   }));
//
//   const response = await multicallContract.methods.aggregate(calls).call();
//   const balances = response.map((balance) => web3.eth.abi.decodeParameter('uint256', balance));
//   return balances;
// }
