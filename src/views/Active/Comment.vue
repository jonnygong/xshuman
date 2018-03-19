<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-button type="primary"
                     @click="getListData">刷新
          </el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="list"
              highlight-current-row
              v-loading="listLoading"
              @selection-change="selsChange"
              style="width: 100%">
      <el-table-column type="selection" width="55">
      </el-table-column>
      <el-table-column prop="title" label="用户昵称" width="120">
      </el-table-column>
      <!-- 图片显示 -->
      <el-table-column prop="headimgurl" label="用户头像" width="130">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <div class="ad-img">
              <img :src="scope.row.headimgurl" :alt="scope.row.name" width="200" height="auto"
                   v-if="scope.row.headimgurl !== ''">
              <p v-else>暂无图片</p>
            </div>
            <div slot="reference" class="name-wrapper">
              <el-tag>查看图片</el-tag>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <!-- 普通列表显示 -->
      <el-table-column
        v-for="(item,index) in tableColumn"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :min-width="item.width"
        :sortable="item.sortable">
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : scope.row.status === -1 ? 'danger' : 'primary'">
            {{ scope.row.status === 1 ? '审核通过' : scope.row.status === -1 ? '审核拒绝' : '初始状态' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template slot-scope="scope">
          <el-button size="small" @click="statusSubmitPass(scope.$index, scope.row)">审核通过</el-button>
          <el-button size="small" @click="statusSubmitStart(scope.$index, scope.row)">初始状态</el-button>
          <el-button size="small" @click="statusSubmitUnpass(scope.$index, scope.row)">审核拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-button type="success"
                 @click="batchAction('active')"
                 :disabled="this.sels.length===0">批量审核通过
      </el-button>
      <el-button type="primary"
                 @click="batchAction('disable')"
                 :disabled="this.sels.length===0">批量初始状态
      </el-button>
      <el-button type="danger"
                 @click="batchAction('remove')"
                 :disabled="this.sels.length===0">批量审核拒绝
      </el-button>
      <el-pagination layout="prev, pager, next"
                     @current-change="handleCurrentChange"
                     :page-size="pagesize"
                     :total="total" style="float:right"></el-pagination>
    </el-col>
  </section>
</template>

<script>
  import util from '@/utils/js'

  const MODEL_NAME = 'Active' // API模块名

  export default {
    data () {
      return {
        // 列表表头数据
        tableColumn: [
          {
            prop: 'content',
            label: '评论内容',
            width: 200,
            sortable: false
          },
          {
            prop: 'zan_num',
            label: '点赞数',
            width: 100,
            sortable: false
          }
        ],
        // 搜索条件
        filters: {
          value: '',
          key: '',
          options: [
            {value: 'title', label: '活动名称'}
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
          aid: this.$route.params.id
        }
        const res = await this.$http.post(`${MODEL_NAME}/clist`, params)
        this.listLoading = false
        if (res === null) return
        // this.total = res.param.pages.total
        // this.pagesize = res.param.pages.pagesize
        this.list = res.param
      },
      // 删除
      handleDel (index, row) {
        this.$confirm('确认删除该记录吗?', '提示', {
          type: 'warning'
        }).then(async () => {
          let params = {
            ids: row.id,
            // p_id: this.selectRow.pid,
            status: -1
          }

          const res = await this.$http.post(`${MODEL_NAME}/cstatus`, params)
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
      async handleClist (index, row) {
        console.log(`${this.$route.path}/enroll/${row.id}`)
        this.$router.push(`${this.$route.path}/enroll/${row.id}`)
      },
      async handleCstatus (index, row) {
        console.log(this.$route.path)
        this.$router.push(`${this.$route.path}/comment/${row.id}`)
      },
      // 显示新增界面
      handleAdd () {
        console.log(this.$route.path)
        this.$router.push(`${this.$route.path}/add`)
      },
      // 修改状态
      async statusSubmitPass (index, row) {
        let params = {
          ids: row.id,
          aid: this.$route.params.id,
          status: 1
        }

        const res = await this.$http.post(`${MODEL_NAME}/cstatus`, params)
        if (res === null) return
        this.$message({
          message: '状态修改成功',
          type: 'success'
        })
        row.status = 1
      },
      async statusSubmitStart (index, row) {
        let params = {
          ids: row.id,
          aid: this.$route.params.id,
          status: 0
        }

        const res = await this.$http.post(`${MODEL_NAME}/cstatus`, params)
        if (res === null) return
        this.$message({
          message: '状态修改成功',
          type: 'success'
        })
        row.status = 0
      },
      async statusSubmitUnpass (index, row) {
        let params = {
          ids: row.id,
          aid: this.$route.params.id,
          status: -1
        }

        const res = await this.$http.post(`${MODEL_NAME}/cstatus`, params)
        if (res === null) return
        this.$message({
          message: '状态修改成功',
          type: 'success'
        })
        row.status = -1
      },
      selsChange (sels) {
        this.sels = sels
      },
      // 批量删除
      batchAction (action) {
        // 三种操作：remove disable active
        let id = this.sels.map(item => item.id).toString()
        const actions = {
          'remove': {
            tip: '审核拒绝',
            api: `${MODEL_NAME}/cstatus`,
            status: -1
          },
          'disable': {
            tip: '初始状态',
            api: `${MODEL_NAME}/cstatus`,
            status: 0
          },
          'active': {
            tip: '审核通过',
            api: `${MODEL_NAME}/cstatus`,
            status: 1
          }
        }
        this.$confirm(`确认${actions[action].tip}选中记录吗？`, '提示', {
          type: 'warning'
        }).then(async () => {
          this.listLoading = true
          // 非批量删除，带上 status
          let params = {
            ids: id + '',
            aid: this.$route.params.id,
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

<style lang='scss'>
</style>
