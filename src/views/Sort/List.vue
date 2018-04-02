<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.value" placeholder="关键词"></el-input>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.options.id" placeholder="请选择文章分类" @change="handleArtChange">
            <el-option
              v-for="(item,index) in filters.options"
              :key="index"
              :label="item.c_name"
              :value="item.id">
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
          <el-button type="primary"
                     @click="handleAdd">新增
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
      <!-- 普通列表显示 -->
      <el-table-column
        v-for="(item,index) in tableColumn"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :min-width="item.width"
        :sortable="item.sortable">
      </el-table-column>
      <!-- 时间戳转日期 -->
      <!-- <el-table-column prop="update_time" label="更新时间" width="180" :formatter="formateTime">
      </el-table-column> -->
      <!-- 图片显示 -->
      <el-table-column prop="cover" label="封面图片" width="130">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <div class="ad-img">
              <img :src="scope.row.cover" :alt="scope.row.name" width="200" height="auto"
                   v-if="scope.row.cover !== ''">
              <p v-else>暂无图片</p>
            </div>
            <div slot="reference" class="name-wrapper">
              <el-tag>查看图片</el-tag>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : scope.row.status === -1 ? 'gray' : 'danger'">
            {{ scope.row.status === 1 ? '可用' : scope.row.status === -1 ? '已删除' : '不可用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260" fixed="right">
        <template slot-scope="scope">
          <el-button size="small" @click="getRowid(scope.row)">归类</el-button>

          <el-button size="small"
                     @click="statusSubmit(scope.$index, scope.row)"
                     :disabled="scope.row.status === -1">
            {{ scope.row.status === 1 ? '停用' : scope.row.status === 0 ? '启用' : '已删除' }}
          </el-button>
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <!-- <el-button type="danger"
                 @click="batchAction('remove')"
                 :disabled="this.sels.length===0">批量删除
      </el-button> -->
      <el-pagination layout="prev, pager, next"
                     @current-change="handleCurrentChange"
                     :page-size="pagesize"
                     :total="total" style="float:right"></el-pagination>
    </el-col>

    <el-dialog
      title="归类"
      :visible.sync="dialogVisible"
      size="tiny"
      top="40%"
      :before-close="handleClose"
      center>
      <template slot-scope="scope">
        <el-select v-model="sort.id" placeholder="请选择分类">
          <el-option
            v-for="(item,index) in sort"
            :key="index"
            :label="item.c_name"
            :value="item.id">
          </el-option>
        </el-select>
        <el-button size="small" type="primary" @click="sortSubmit(scope.row)">确定</el-button>
        <el-button size="small" @click="dialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script>
  import util from '@/utils/js'

  const MODEL_NAME = 'Sort' // API模块名

  export default {
    data () {
      return {
        // 列表表头数据
        tableColumn: [
          {
            prop: 'sort',
            label: '排序值',
            width: 100,
            sortable: true
          },
          {
            prop: 'title',
            label: '文章标题',
            width: 180,
            sortable: false
          },
          {
            prop: 'c_name',
            label: '归类名称',
            width: 120,
            sortable: false
          },
          {
            prop: 'zan_num',
            label: '点赞数',
            width: 100,
            sortable: false
          },
          {
            prop: 'click',
            label: '阅读量',
            width: 100,
            sortable: false
          },
          {
            prop: 'update_time',
            label: '更新时间',
            width: 180,
            sortable: false
          }
        ],
        // 搜索条件
        filters: {
          value: '',
          key: '',
          options: []
        },
        list: [],
        rowId: '',
        sort: [],
        dialogVisible: false,
        p_list: [],
        selectArtRow: {
          c_name: '',
          id: ''
        },
        selectRow: {
          c_name: '',
          pid: '',
          type: ''
        },
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
        return ` ${util.formatDate.format(
          new Date(row[column.property] * 1000),
          'yyyy-MM-dd hh:mm:ss'
        )}`
      },
      handleCurrentChange (val) {
        this.page = val
        this.getListData()
      },
      handleArtChange (currentArtRow) {
        // this.selectArtRow.c_name = currentArtRow.c_name
        this.selectArtRow.id = currentArtRow
        this.getListData()
        console.log('222' + currentArtRow)
      },
      handleClose (done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done()
          })
          .catch(_ => {
          })
      },
      // 获列表
      async getListData () {
        this.listLoading = true
        let params = {
          p_id: 3,
          c_id: this.selectArtRow.id === '' ? 3 : this.selectArtRow.id,
          s_id: 3,
          page: this.page,
          title: this.filters.value // 可选参数查询
          // key: this.filters.key, // 可选参数查询
          // value: this.filters.value // 可选参数查询
        }
        const res = await this.$http.post(`${MODEL_NAME}/list`, params)
        this.listLoading = false
        if (res === null) return
        this.total = res.param.pages.total
        this.pagesize = res.param.pages.pagesize
        this.list = res.param.list
      },
      async getArrayData () {
        const res = await this.$http.post(`Article/category`, {
          id: 0,
          c_id: 3
        })
        if (res === null) return
        this.filters.options = res.param
        // this.sort = res.param.cat.slice()
        this.filters.options.unshift({id: '', c_name: '全部分类'})
      },
      async sortSubmit (row) {
        let params = {
          id: this.rowId,
          c_id: this.sort.id
          // status: 1 - row.status
        }
        console.log(this.rowId)
        const res = await this.$http.post(`Article/sort`, params)
        if (res === null) return
        this.$message({
          message: '归类成功',
          type: 'success'
        })
        this.dialogVisible = false
        this.getListData()
      },
      async getSortArrayData () {
        const res = await this.$http.post(`${MODEL_NAME}/info`, {
          id: 0,
          c_id: 3
        })
        if (res === null) return
        // this.filters.options = res.param.cat
        this.sort = res.param.cat.slice()
        // this.filters.options.unshift({id: '', c_name: '全部分类'})
      },
      getRowid (row) {
        this.rowId = row.id
        this.dialogVisible = true
        // row.visible = true
        console.log(row)
      },
      // 删除
      handleDel (index, row) {
        this.$confirm('确认删除该记录吗?', '提示', {
          type: 'warning'
        })
          .then(async () => {
            let params = {
              id: row.id,
              p_id: this.selectRow.pid,
              s_id: 3,
              status: -1
            }
            const res = await this.$http.post(`${MODEL_NAME}/status`, params)
            if (res === null) return
            this.$message({
              message: '状态修改成功',
              type: 'success'
            })
            row.status = -1
            this.getListData()
          })
          .catch(() => {
          })
      },
      // 显示编辑界面
      async handleEdit (index, row) {
        console.log(this.$route.path)
        this.$router.push(
          `${this.$route.path}/edit/${this.selectRow.c_id}/${row.id}`
        )
      },
      // 显示新增界面
      handleAdd () {
        console.log(this.$route.path)
        this.$router.push(
          `${this.$route.path}/add/${this.selectRow.c_id}`
        )
      },
      // 修改状态
      async statusSubmit (index, row) {
        let params = {
          id: row.id,
//          c_id: 3,
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
        let id = this.sels.map(item => item.id).toString()
        const actions = {
          remove: {
            tip: '删除',
            api: `${MODEL_NAME}/status`,
            status: -1
          },
          disable: {
            tip: '停用',
            api: `${MODEL_NAME}/status`,
            status: 0
          },
          active: {
            tip: '启用',
            api: `${MODEL_NAME}/status`,
            status: 1
          }
        }
        this.$confirm(`确认${actions[action].tip}选中记录吗？`, '提示', {
          type: 'warning'
        })
          .then(async () => {
            this.listLoading = true
            // 非批量删除，带上 status
            let params = {
              id: id + '',
              p_id: this.selectRow.pid,
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
          })
          .catch(() => {
          })
      }
    },
    mounted () {
      this.getListData()
      this.getSortArrayData()
      this.getArrayData()
    }
  }
</script>

<style lang='scss'>

</style>
