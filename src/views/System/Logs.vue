<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="getListData">刷新</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="list" highlight-current-row v-loading="listLoading" style="width: 100%;">
      <el-table-column prop="admin_id" label="用户编号" width="120">
      </el-table-column>
      <el-table-column prop="rid" label="操作信息ID" min-width="120">
      </el-table-column>
      <el-table-column prop="module" label="模块名称" min-width="120">
      </el-table-column>
      <el-table-column prop="controller" label="控制器名称" min-width="120">
      </el-table-column>
      <el-table-column prop="action" label="方法名称" min-width="120">
      </el-table-column>
      <el-table-column prop="create_time" label="更新时间" width="200" sortable>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-pagination layout="prev, pager, next"
                     @current-change="handleCurrentChange"
                     :page-size="pagesize"
                     :total="total"
                     style="float:right;">
      </el-pagination>
    </el-col>
  </section>
</template>

<script>
  // import util from '@/utils/js'

  export default {
    data () {
      return {
        list: [],
        total: 0,
        page: 1,
        pagesize: 0,
        listLoading: false,
        sels: [] // 列表选中列
      }
    },
    methods: {
      handleCurrentChange (val) {
        this.page = val
        this.getListData()
      },
      // 获取列表
      async getListData () {
        this.listLoading = true
        const params = {
          page: this.page
        }
        const res = await this.$http.post('logRecord', params)
        this.listLoading = false
        if (res === null) return
        // 数据获取成功操作
        this.total = res.param.pages.total
        this.pagesize = res.param.pages.pagesize
        this.list = res.param.list
      }
    },
    mounted () {
      this.getListData()
    }
  }
</script>

<style scoped>

</style>
