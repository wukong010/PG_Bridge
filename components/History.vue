<script>
import eventBus from '~/plugins/event-bus'
export default {
  data() {
    return {
      total: 0,
      page: 1
    }
  },
  computed: {
    statusEnum() {
      return {
        'ExchangedDone': this.$t('completed'),
        'BorrowAmountDone': this.$t('completed'),
        'BadHandlerDone': this.$t('completed'),
        'Unused': this.$t('processing'),
      }
    },
    historyData() {
      return this.$store.state.history || []
    }
  },
  methods: {
    next() {
      eventBus.$emit('chainChanged', 'next')
    },
    prev() {
      eventBus.$emit('chainChanged', 'prev')
    }
  }
}
</script>

<template>
  <div class="history w-xl <sm:w-xs">
    <p class="history-title">{{ $t('historical_record') }}</p>
    <el-card class="history-card">
      <el-table :data="historyData" size="small">
        <el-table-column
          prop="from"
          :label="$t('source')">
        </el-table-column>
        <el-table-column
          prop="to"
          :label="$t('goal')">
        </el-table-column>
        <el-table-column
          prop="fromAddress"
          :label="$t('source_address')">
        </el-table-column>
        <el-table-column
          prop="toAddress"
          :label="$t('delivery_address')">
        </el-table-column>
        <el-table-column
          prop="amount"
          :label="$t('quantity')">
        </el-table-column>
        <el-table-column :label="$t('status')">
          <template slot-scope="{row}">
            <span class="text-success" v-if="row.status == 'ExchangedDone' || row.status == 'BorrowAmountDone' || row.status == 'BadHandlerDone'">{{statusEnum[row.status]}}</span>
            <span class="text-warning" v-if="row.status == 'Unused'">{{statusEnum[row.status]}}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="history-page__box">
        <el-button type="primary" icon="el-icon-arrow-left" size="small" :disabled="page == 1" @click="prev"></el-button>
        <el-button type="primary" icon="el-icon-arrow-right" size="small" :disabled="historyData.length < 10" @click="next"></el-button>
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
  padding-bottom: 24px;
}
</style>
