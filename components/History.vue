<script>
export default {
  data() {
    return {
      total: 0,
      historyData: [],
    }
  }
}
</script>

<template>
  <div class="history">
    <p class="history-title">历史记录</p>
    <el-card class="history-card">
      <el-table
        :data="historyData"
        style="width: 100%">
        <el-table-column
          prop="date"
          label="TO">
        </el-table-column>
        <el-table-column
          prop="name"
          label="币种">
        </el-table-column>
        <el-table-column
          prop="address"
          label="金额">
        </el-table-column>
        <el-table-column
          prop="address"
          label="状态">
        </el-table-column>
        <el-table-column
          prop="address"
          label="Txid">
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
