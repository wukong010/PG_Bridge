<script>
export default {
  data() {
    return {
      total: 0,
    }
  },
  computed: {
    statusEnum() {
      return {
        'ExchangedDone': '已完成',
        'BorrowAmountDone': '已完成',
        'BadHandlerDone': '已完成',
        'Unused': '处理中',
      }
    },
    historyData() {
      return this.$store.state.history
    }
  }
}
</script>

<template>
  <div class="history">
    <p class="history-title">历史记录</p>
    <el-card class="history-card">
      <el-table :data="historyData" size="small">
        <el-table-column
          prop="from"
          label="来源网络">
        </el-table-column>
        <el-table-column
          prop="to"
          label="目标网络">
        </el-table-column>
        <el-table-column
          prop="fromAddress"
          label="发起地址">
        </el-table-column>
        <el-table-column
          prop="toAddress"
          label="接收地址">
        </el-table-column>
        <el-table-column
          prop="amount"
          label="交易数量">
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="{row}">
            <span class="text-success" v-if="row.status == 'ExchangedDone' || row.status == 'BorrowAmountDone' || row.status == 'BadHandlerDone'">{{statusEnum[row.status]}}</span>
            <span class="text-warning" v-if="row.status == 'Unused'">{{statusEnum[row.status]}}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="history-page__box">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="1000">
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<style lang="less">
.text-success {
  color: #67C23A;
}
.text-warning {
  color: #E6A23C;
}
.history-card {
  border-radius: 10px;
}
.history-page__box {
  text-align: center;
  padding-top: 20px;
}
.history-title {
  margin: 24px 0 10px;
}
.history {
  width: 548px;
  padding-bottom: 24px;
}
</style>
