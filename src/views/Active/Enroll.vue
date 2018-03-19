<template>
  <el-col :span="24">
    <el-row>
      <a :href="`http://xshuman.kfw001.com/api/admin/active/enrolldata?aid=${this.$route.params.id}`" download v-if="!displayInfo">
        <el-button type="primary">报名人员信息下载</el-button>
      </a>
    </el-row>
    <el-row>
    <el-collapse
      v-model="activeNames"
      @change="handleChange"
      class="enrollList"
      v-for="(item, index) in list"
      :key="index"
      :value="activeNames">
      <el-collapse-item :title="`公司名称：${ item.title }`" :name="index">
        <el-table
          :data="item.contact"
          highlight-current-row
          v-loading="listLoading"
          @selection-change="selsChange"
          border
          style="width: 100%">
          <!-- <el-table-column :data="list.contact"> -->
          <el-table-column
            prop="name"
            label="姓名"
            min-width="120">
          </el-table-column>
          <el-table-column
            prop="tel"
            label="电话"
            min-width="140">
          </el-table-column>
          <!-- </el-table-column> -->
        </el-table>
      </el-collapse-item>
    </el-collapse>
    </el-row>
    <el-row>
      <el-pagination layout="prev, pager, next"
                     @current-change="handleCurrentChange"
                     :page-size="pagesize"
                     :total="total" style="float:right; margin-top: 20px;"></el-pagination>
    </el-row>
    <div class="alertInfo" v-if="displayInfo">当前活动暂无报名信息！</div>
  </el-col>
</template>

<script>
  import util from '@/utils/js'

  const MODEL_NAME = 'Active' // API模块名

  export default {
    data () {
      return {
        enrolldata: '',
        displayInfo: false,
        list: [],
        activeNames: [0],
        total: 0,
        page: 1,
        pagesize: 10,
        listLoading: false,
        sels: [] // 列表选中列
      }
    },
    methods: {
      // 格式化更新时间
      formateTime (row, column) {
        return ` ${util.formatDate.format(new Date(row[column.property] * 1000), 'yyyy-MM-dd hh:mm:ss')}`
      },
      handleCurrentChange (val) {
        this.page = val
        this.getListData()
      },
      handleChange (val) {
        console.log(val)
      },
      // 获列表
      async getListData () {
        this.listLoading = true
        let params = {
          page: this.page,
          aid: this.$route.params.id
        }
        const res = await this.$http.post(`${MODEL_NAME}/enroll`, params)
        this.listLoading = false
        if (res.param.list.length === 0) {
          this.displayInfo = true
        }
        // if (res === null) return
        this.list = res.param.list
        this.total = res.param.pages.total
        this.pagesize = res.param.pages.pagesize
      },
      async getEnrollData () {
        let params = {
          aid: this.$route.params.id
        }
        const res = await this.$http.post(`${MODEL_NAME}/enrolldata`, params)
        this.enrolldata = res.param
      },
      selsChange (sels) {
        this.sels = sels
      }
    },
    mounted () {
      this.getListData()
//      this.getEnrollData()
    }
  }
</script>

<style lang='scss' scoped>
  .alertInfo {
    display: inline-block;
    color: #999;
    font-size: 16px;
    position: absolute;
    transform: translate(-50%, -50%);
    top: 40%;
    left: 50%;
  }
  .enrollList {
    margin-top: 20px;
  }
</style>
