<script>
import Web3 from "web3";
import {ChainNameFromIdentifier, L3Chain} from "@l3chain/sdk";
import {ABI, ExchangePairsGenerater, ExchangeRouter} from "@l3exchange/sdk";
import {fromWei, toBN, toWei} from "web3-utils";
import _ from 'lodash';
import NP from 'number-precision';

const exchangeConfig = {
  graphQL: {
    HOST: 'http://l3test.org:8000/subgraphs/name/l3/exchange_host',
    BSC: 'http://l3test.org:8000/subgraphs/name/l3/exchange_bsc'
  },
  providers: {
    HOST: 'http://l3test.org:18545',
    BSC: 'http://l3test.org:38545',
  },
  addresses: {
    factory: {
      HOST: '0x9a6579CA0e9FA2E79d7B0060601d13D698f96550',
      BSC: '0x9a6579CA0e9FA2E79d7B0060601d13D698f96550'
    },
    router: {
      HOST: '0x69a75303f418664B5aDd25bD327d114e92a6F478',
      BSC: '0x69a75303f418664B5aDd25bD327d114e92a6F478'
    }
  },
}

const l3chain = new L3Chain({
  HOST: {
    web3Provider: new Web3.providers.HttpProvider(exchangeConfig.providers.HOST),
    chainIdentifier: "0x0000000000000000000000000000000000000000000000000000000000000000",
    contractAddress: "0xf135b82D34058aE35d3c537a2EfB83462d4ee76e",
    graphDataBaseHost: "http://l3test.org:8000/subgraphs/name/l3chain/host_database"
  },
  BSC: {
    web3Provider: new Web3.providers.HttpProvider(exchangeConfig.providers.BSC),
    chainIdentifier: "0xe1430158eac8c4aa6a515be5ef2c576a7a9559adbd0c276cd9573854e0473494",
    contractAddress: "0xf135b82D34058aE35d3c537a2EfB83462d4ee76e"
  },
})

export default {
  name: 'CardComponent',
  data() {
    return {
      expert_mode: false,
      dialogVisible: false,
      injectionWeb3: null,
      coinName: '',
      toAccount: '',
      hostPairs: [],
      currentCurrencyIndex: 0,
      router: null,
      currencyPopover: false,
      amount: '',
      fees: null,
      chainIndex: 0,
      generatedDatas: null,
      chainPopover: false,
      networkName: {
        '0x0000000000000000000000000000000000000000000000000000000000000000': 'PG Network',
        '0xe1430158eac8c4aa6a515be5ef2c576a7a9559adbd0c276cd9573854e0473494': 'Ethereum Network Main',
        '0xe1430158eac8c4aa6a515be5ef2c576a7a9559adbd0c276cd9573854e0473499': 'BNB Smart Chain',
      },
      chainEunm: {
        '10240': 'PG',
        '18545': 'HOST',
        '38545': 'BSC',
      },
      address: '',
      chainTokenEunm: {
        '10240': 'PG',
        '18545': 'HOST',
        '38545': 'BSC',
      },
      feesFormat: {
        feeAmount: 0,
        feeAdditionalAmount: 0,
        feel3: 0,
      },
      loading: false,
    }
  },
  computed: {
    fromChain() {
      return this.chainEunm[this.chainId]
    },
    tokenBalance() {
      return this.$store.state.tokenBalance
    },
    chainId() {
      return this.$store.state.chainId
    },
    fromAccount() {
      return this.$store.state.address
    },
    usePair() {
      return this.hostPairs[this.currentCurrencyIndex] || null
    },
    obtainToken() {
      return NP.minus(this.amount, this.feesFormat.feeAdditionalAmount)
    },
    chainList() {
      if (this.usePair) {
        const targetPairs = this.usePair.toExchangeTokenIds.map(toETID => this.generatedDatas.find(
          e => e.etid.chainIdentifier == toETID.chainIdentifier
            && e.etid.shadowEmiter == toETID.shadowEmiter
            && e.etid.tokenContract == toETID.tokenContract
        ))
        return targetPairs
      }
      return []
    },
    fromToken() {
      return this.usePair ? this.usePair._metaData : null
    },
    btnDisable() {
      return Number(this.amount) > 0 && Number(this.amount) <= Number(this.tokenBalance)
    }
  },
  mounted() {
    if (!this.expert_mode) {
      this.toAccount = this.fromAccount
    }
  },
  async created() {
    // const injectionWeb3 = new Web3(new Web3.providers.HttpProvider('http://l3test.org:18545'));
    const injectionWeb3 = new Web3(window.ethereum);
    this.injectionWeb3 = injectionWeb3

    window.ethereum.on('chainChanged', chainId => {
      // const hexChainId = web3.utils.toNumber(chainId);
      // this.$store.commit('setState', {key: 'chainId', val: hexChainId})
      this.getParis()
      this.updateTokenBalance()
    });

    // 获取Pair信息
    const generatedDatas = await ExchangePairsGenerater(exchangeConfig);
    this.generatedDatas = generatedDatas
    // 创建Router
    let router = new ExchangeRouter({
      ...exchangeConfig,
      l3chain,
      generatedDatas,
    });
    this.router = router
    this.getParis()
    this.updateTokenBalance()
  },
  methods: {
    getParis() {
      // 获取Exchagne支持的所有Pair
      let hostPairs = this.router.supportExchangePairs(this.fromChain);
      this.hostPairs = hostPairs
    },
    updateTokenBalance() {
      this.$store.dispatch('getTokenBalance', this.fromToken?.tokenAddress || 0)
    },
    async exchange() {
      // 发起交易,建立Router的合约交互实例
      let routerSender = new this.injectionWeb3.eth.Contract(ABI.Router, this.router.contractAddress[this.fromChain]);
      const targetEtid = this.chainList[this.chainIndex].etid;
      const txSender = routerSender.methods.tokenExchangeToChain(
        this.usePair.metaData.etid,
        targetEtid,
        this.toAccount,
        toWei(String(this.amount)),
      );
      const data = {
        from: this.fromAccount,
        value: toBN(this.fees.feeAmount.toString()).add(
          toBN(this.fees.feel3.toString())
        )
      }
      let gas = await txSender.estimateGas(data)
      console.log(`tokenExchangeToChain gas: ${gas}`);
      this.loading = true
      let callret = await txSender.call({
        from: this.fromAccount,
        value: toBN(this.fees.feeAmount.toString()).add(
          toBN(this.fees.feel3.toString())
        )
      }).then((res) => {
        console.log(`tokenExchangeToChain call: ${res.toString()}`)
        txSender.send({
          from: this.fromAccount,
          value: toBN(this.fees.feeAmount.toString()).add(
            toBN(this.fees.feel3.toString())
          )
        }).then(res => {
          this.$notify({
            title: '成功',
            message: '您的交易已执行完成。',
            type: 'success'
          })
          this.loading = false
          this.updateTokenBalance()
          this.amount = ''
        }).catch(err => {
          this.loading = false
        })
      }).catch(err => {
        this.loading = false
      })
      // console.log(`tokenExchangeToChain call: ${callret.toString()}`)
    },
    async approve() {
      // 使用Web3创建合约交互实例
      let fromTokenContract = new this.injectionWeb3.eth.Contract(ABI.ERC20, this.usePair.metaData.tokenAddress);
      const spender = this.router.contractAddress[this.fromChain]
      const owner = this.fromAccount
      const amount = this.injectionWeb3.utils.toWei(String(this.amount))
      // 查询授权额度
      const allowance = await fromTokenContract.methods.allowance(owner, spender).call();
      console.log(allowance, amount);
      if (allowance >= amount) {
        this.exchange()
      } else {
        await fromTokenContract.methods.approve(spender, this.injectionWeb3.utils.toWei(String(this.amount))).send({
          from: this.fromAccount,
        }).then(() => {
          console.log(`Approve Router Successed`);
          this.exchange()
        })
      }
    },
    async getExchangeHistory() {
      // 获取交易记录
      // 更多查询条件: http://l3test.org:8000/subgraphs/name/l3/exchange_host
      let exchangeHistory = await this.router.selectExchangeHistory(this.fromChain, {
        first: 10,
        orderBy: "time",
        orderDirection: "asc",
        where: {
          fromAccount: accounts[0]
        }
      })

      for (let record of exchangeHistory) {
        let infos = [
          `${ChainNameFromIdentifier(record.from.chainIdentifier)}-${record.from.tokenSymbol}`,
          '/',
          `${ChainNameFromIdentifier(record.to.chainIdentifier)}-${record.to.tokenSymbol}`,
          " ",
          record.from.account,
          ` -> `,
          record.to.account,
          ` : ${fromWei(record.amount)}`,
          ` (${(await this.router.getExchangeHistoryState(record)).toString()})`
        ]
        console.log(infos.join(''));
      }
    },
    openExpertMode() {
      this.expert_mode = true
      this.dialogVisible = false
    },
    closeExpertMode() {
      if (this.expert_mode) {
        this.expert_mode = false
      } else {
        this.dialogVisible = true
      }
    },
    tapCurrency(index) {
      this.currentCurrencyIndex = index
      this.currencyPopover = false
      this.updateTokenBalance()
    },
    tapChain(index) {
      this.chainIndex = index
      this.chainPopover = false
    },
    async getFee() {
      const targetEtid = this.chainList[this.chainIndex].etid;
      let fees = await this.usePair.exchangeToEstimateFee(
        targetEtid,
        this.fromAccount,
        this.toAccount,
        this.injectionWeb3.utils.toWei(String(this.amount)),
      );
      this.fees = fees;
      this.feesFormat = {
        feeAmount: this._fromWei(fees.feeAmount),
        feeAdditionalAmount: this._fromWei(fees.feeAdditionalAmount),
        feel3: this._fromWei(fees.feel3),
      }
      console.log(fees);
    },
    _fromWei(val, unit = 'ether') {
      return this.injectionWeb3.utils.fromWei(String(val), unit)
    },
    _getFee: _.debounce(function() {
      console.log(typeof this.amount);
      if (Number(this.amount) <= Number(this.tokenBalance)) {
        this.getFee()
      }
      console.log('获取手续费');
    }, 1000),
  },
  watch: {
    expert_mode(val) {
      if (!val) {
        this.toAccount = this.fromAccount
      }
    }
  }
}
</script>

<template>
  <div class="card">
    <div class="coin-select__box">
      <span>跨链币种</span>

      <el-popover
        popper-class="chain-row__left--popover"
        placement="bottom"
        :visible-arrow="false"
        v-model="currencyPopover"
        trigger="click">
        <div class="chain-select__box">
          <el-input
            class="mb-20"
            placeholder="请输入币种名称"
            prefix-icon="el-icon-search"
            v-model="coinName">
          </el-input>
          <div class="chain-select__item" v-for="(item, index) in hostPairs" :key="index" @click="tapCurrency(index)">
            <img src="/tokens/tether-usdt-logo.png" alt="">
            <span>{{ item._metaData.tokenName }}</span>
            <i class="el-icon-check" v-if="currentCurrencyIndex === index"></i>
          </div>
        </div>
        <div slot="reference" class="coin-select__content">
          <img class="coin-select__icon" src="/tokens/tether-usdt-logo.png" alt="">
          <span>{{ hostPairs.length ? hostPairs[currentCurrencyIndex]._metaData.tokenName : '--' }}</span>
          <i class="el-icon-arrow-down"></i>
        </div>
      </el-popover>
    </div>

    <div class="chain-row">
      <div class="chain-row__left flex-2 br">
        <img class="chain-row__icon" src="/tokens/bnb-bnb-logo.png" alt="">
        <div class="chain-row__left--name">
          <p>当前您连接的是</p>
          <div>
            <span>{{chainEunm[chainId] || '--'}}</span>
          </div>
        </div>
      </div>

      <div class="chain-row__input">
        <p>余额：{{tokenBalance}}</p>
        <div>
          <input type="number" placeholder="0" v-model="amount" @input="_getFee">
          <span @click="amount = tokenBalance">MAX</span>
        </div>
      </div>
    </div>

    <div class="exchange-box">
      <el-button icon="el-icon-sort" circle></el-button>
    </div>

    <div class="chain-row mb-24">
      <el-popover
        v-model="chainPopover"
        popper-class="chain-row__left--popover"
        placement="bottom"
        :visible-arrow="false"
        trigger="click">
        <div class="chain-select__box">
          <div class="chain-select__item" v-for="(item, index) in chainList" :key="index" @click="tapChain(index)">
            <img src="/tokens/polygon-matic-logo.png" alt="">
            <span>{{networkName[item.etid.chainIdentifier]}}</span>
            <i class="el-icon-check" v-if="chainIndex == index"></i>
          </div>
          <div class="chain-no__data" v-if="chainList.length === 0">暂时没有数据~</div>
        </div>
        <div slot="reference" class="chain-row__left pointer">
          <img class="chain-row__icon" src="/tokens/ethereum-eth-logo.png" alt="">
          <div class="chain-row__left--name">
            <p>跨链至</p>
            <div>
              <span>{{chainList.length ? networkName[chainList[chainIndex].etid.chainIdentifier] : '--'}}</span>
              <i class="el-icon-arrow-down"></i>
            </div>
          </div>
        </div>
      </el-popover>

      <div class="chain-row__right">
        <p>预计将获得</p>
        <p>{{obtainToken}}</p>
      </div>
    </div>

    <div class="address-input__box">
      <div class="address-input__head">
        <span>接收地址</span>
        <div @click.stop="closeExpertMode">
          <span>专家模式</span>
          <el-switch :value="expert_mode"></el-switch>
        </div>
      </div>
      <input class="address-input" type="text" placeholder="请输入目标地址" v-model="toAccount" :disabled="!expert_mode">
      <p class="address-input__tip">接收地址请勿填写交易所地址</p>
    </div>

    <div class="card-info">
      <div class="card-info__row">
        <span>基础手续费</span>
        <span>{{ feesFormat.feeAmount }} {{chainEunm[chainId] || '--'}}</span>
      </div>
      <div class="card-info__row">
        <span>验证节点GAS Fee</span>
        <span>{{ feesFormat.feel3 }} {{chainTokenEunm[chainId] || '--'}}</span>
      </div>
      <div class="card-info__row">
        <span>大额跨链手续费</span>
        <span>{{ feesFormat.feeAdditionalAmount }} {{ fromToken ? fromToken.tokenSymbol : '--' }}</span>
      </div>
    </div>
    <div class="card-info__foot">
      <p>*跨链数量超过 {0} 额外收取 {百分比数值} {{ fromToken ? fromToken.tokenSymbol : '--' }}</p>
      <p>*收款地址请不要填写中心化交易所地址，由于跨链是合约交易，交易所无法入帐</p>
      <p>*到账时间：1-600秒</p>
    </div>

    <button type="button" class="swap-btn" :class="{'btn-disable': !btnDisable || loading}" :disabled="!btnDisable || loading" @click="approve">
      <i class="el-icon-loading" v-if="loading"></i>
      <span>跨链兑换</span>
    </button>

    <el-dialog
      title="专家模式"
      custom-class="expert-dialog"
      :visible.sync="dialogVisible"
      :show-close="false"
      width="460px">
      <div class="expert-dialog__content">
        <div class="expert-dialog__alert">
          <i class="el-icon-warning-outline"></i>
          <div>
            专家模式将允许您自定义跨链目标地址，错误的地址输入可能导致跨链桥智能合约无法处理您的请求，导致跨链无法执行。且转至错误目标地址的跨链资产无法追回，请您谨慎使用。
          </div>
        </div>
        <div class="expert-dialog__open" @click="openExpertMode">开启专家模式</div>
        <div class="expert-dialog__cancel" @click="dialogVisible = false">取消</div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="less">
@import "Card";
</style>