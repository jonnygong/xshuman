<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.value" placeholder="关键词"></el-input>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.key" placeholder="请选择搜索字段">
            <el-option
              v-for="(item,index) in filters.options"
              :key="index"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary"
                     icon="search"
                     @click="getListData">搜索
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary"
                     @click="getListData">刷新
          </el-button>
        </el-form-item>
        <el-form-item>
          <a :href="`${this.baseUrl}Survey/export?id=${this.$route.params.id}`" download="统计结果">
            <el-button type="primary">统计结果导出
            </el-button>
          </a>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleBack">返回
          </el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="list"
               border
               v-loading="listLoading"
               @selection-change="selsChange"
               style="width: 100%;">
      <el-table-column prop="q_content" label="问题描述" min-width="200">
      </el-table-column>
      <el-table-column label="选项" min-width="200">
        <template slot-scope="scope">
          <p class="q-options" v-for="(item, index) in scope.row.answer" :key="index">{{ item.a_content }}</p>
        </template>
      </el-table-column>
      <el-table-column label="人数统计" min-width="120">
        <template slot-scope="scope">
          <p class="q-options" v-for="(item, index) in scope.row.answer" :key="index">{{ item.count }}</p>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <!--<el-button type="danger"-->
                 <!--@click="batchAction('remove')"-->
                 <!--:disabled="this.sels.length===0">批量删除-->
      <!--</el-button>-->
      <!--<el-button type="warning"-->
                 <!--@click="batchAction('disable')"-->
                 <!--:disabled="this.sels.length===0">批量禁用-->
      <!--</el-button>-->
      <!--<el-button type="primary"-->
                 <!--@click="batchAction('active')"-->
                 <!--:disabled="this.sels.length===0">批量启用-->
      <!--</el-button>-->
      <!--<el-pagination layout="prev, pager, next"-->
                     <!--@current-change="handleCurrentChange"-->
                     <!--:page-size="pagesize"-->
                     <!--:total="total" style="float:right;"></el-pagination>-->
    </el-col>
  </section>
</template>

<script>
  import util from '@/utils/js'
  import configs from '@/configs/api'
  const { baseUrl } = configs

  const MODEL_NAME = 'Survey' // API模块名

  export default {
    data () {
      return {
        baseUrl: baseUrl,
        // 列表表头数据
        tableColumn: [
          {
            prop: 'title',
            label: '问卷标题',
            width: 180,
            sortable: false
          },
          {
            prop: 'intro',
            label: '问卷介绍',
            width: 230,
            sortable: false
          }
        ],
        // 搜索条件
        filters: {
          value: '',
          key: 'q_content',
          options: [
            {value: 'q_content', label: '问题描述'}
          ]
        },
        list: [],
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
      // 获列表
      async getListData () {
        this.listLoading = true
        let params = {
          page: this.page,
          key: this.filters.key, // 可选参数查询
          value: this.filters.value, // 可选参数查询
          id: this.$route.params.id
        }
        const res = await this.$http.post(`${MODEL_NAME}/count`, params)
        this.listLoading = false
        if (res === null) return
        this.total = res.param.pages.total
        this.pagesize = res.param.pages.pagesize
        this.list = res.param.list
      },
      // 删除
      handleDel (index, row) {
        this.$confirm('确认删除该记录吗?', '提示', {
          type: 'warning'
        }).then(async () => {
          let params = {
            id: row.id,
            status: -1
          }
          const res = await this.$http.post(`${MODEL_NAME}/delete`, params)
          if (res === null) return
          this.$message({
            message: '状态修改成功',
            type: 'success'
          })
          row.status = -1
          this.getListData()
        }).catch(() => {

        })
      },
      // 显示编辑界面
      async handleEdit (index, row) {
        console.log(this.$route.path)
        this.$router.push(`${this.$route.path}/edit/${row.id}`)
      },
      // 显示新增界面
      handleAdd () {
        console.log(this.$route.path)
        this.$router.push(`${this.$route.path}/add`)
      },
      handleBack () {
        console.log(this.$route.path)
        this.$router.back()
      },
      // 修改状态
      async statusSubmit (index, row) {
        let params = {
          id: row.id,
          status: 1 - row.status
        }

        const res = await this.$http.post(`${MODEL_NAME}/status`, params)
        if (res === null) return
        this.$message({
          message: '状态修改成功',
          type: 'success'
        })
        row.status = 1 - row.status
      },
      selsChange (sels) {
        this.sels = sels
      },
      // 批量删除
      batchAction (action) {
        // 三种操作：remove disable active
        let ids = this.sels.map(item => item.id).toString()
        const actions = {
          'remove': {
            tip: '删除',
            api: `${MODEL_NAME}/delete`,
            status: -1
          },
          'disable': {
            tip: '停用',
            api: `${MODEL_NAME}/status`,
            status: 0
          },
          'active': {
            tip: '启用',
            api: `${MODEL_NAME}/status`,
            status: 1
          }
        }
        this.$confirm(`确认${actions[action].tip}选中记录吗？`, '提示', {
          type: 'warning'
        }).then(async () => {
          this.listLoading = true
          // 非批量删除，带上 status
          let params = {
            ids: ids + '',
            status: actions[action].status
          }
          const res = await this.$http.post(actions[action].api, params)
          this.listLoading = false
          if (res === null) return
          this.$message({
            message: res.info,
            type: 'success'
          })
          this.getListData()
        }).catch(() => {

        })
      }
    },
    mounted () {
      this.getListData()
    }
  }
</script>

<style lang="scss">
  .q-options {
    /*height:36px;*/
    /*line-height: 36px;*/
    border-bottom: solid 1px #d9d9d9;
    /*display: inline-block;*/
    /*color: #f00;*/
  }
</style>
