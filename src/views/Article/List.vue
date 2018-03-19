<template>
  <section>
    <el-row :gutter="20">
      <el-col :span="6" style="padding-top: 10px">
        <el-table :data="p_list"
                  highlight-current-row
                  v-loading="listLoading"
                  @current-change="handleProChange"
                  ref="p_list"
                  style="width: 100%">
          <el-table-column prop="c_name" min-width="180" label="分类列表">
          </el-table-column>
        </el-table>
      </el-col>
      <!--工具条-->
      <el-col :span="18" class="toolbar" style="padding-bottom: 0px">
        <el-form :inline="true" :model="filters">
          <el-form-item>
            <el-input v-model="filters.key" placeholder="关键词"></el-input>
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

      <el-col :span="18">
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
          <el-table-column prop="zan_num" label="点赞数" width="120" v-if="this.selectRow.pid !== 2">
          </el-table-column>
          <el-table-column prop="click" label="阅读量" width="120" v-if="this.selectRow.pid !== 2">
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
              <!-- <el-popover
                ref="popover1"
                placement="top"
                width="200"
                v-model="scope.row.visible">
                <el-select v-model="sort.id" placeholder="请选择分类">
                      <el-option
                        v-for="(item,index) in sort"
                        :key="index"
                        :label="item.c_name"
                        :value="item.id">
                      </el-option>
                    </el-select>
                    <el-button size="small" type="primary" @click="sortSubmit(scope.row)">确定</el-button>
                    <el-button size="small" @click="scope.row.visible = false">取消</el-button>


              </el-popover> -->
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
          <el-button type="danger"
                     @click="batchAction('remove')"
                     :disabled="this.sels.length===0">批量删除
          </el-button>
          <el-pagination layout="prev, pager, next"
                         @current-change="handleCurrentChange"
                         :page-size="pagesize"
                         :total="total" style="float:right"></el-pagination>
        </el-col>
      </el-col>
    </el-row>

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

  const MODEL_NAME = 'Article' // API模块名

  export default {
    data () {
      return {
        // 列表表头数据
        tableColumn: [
          {
            prop: 'title',
            label: '文章名称',
            width: 260,
            sortable: false
          },
          {
            prop: 'c_name',
            label: '所属分类',
            width: 120,
            sortable: false
          },
          // {
          //   prop: 'link',
          //   label: '链接地址',
          //   width: 120,
          //   sortable: false
          // },
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
          options: [
            // {value: 'c_name', label: '分类名称'}
          ]
        },
        list: [],
        p_list: [],
        sort: [],
        rowId: '',
        dialogVisible: false,
        selectRow: {
          c_name: '',
          pid: '',
          type: ''
        },
        selectArtRow: {
          c_name: '',
          pid: ''
        },
        selectSortRow: {
          c_name: '',
          pid: ''
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
        return ` ${util.formatDate.format(new Date(row[column.property] * 1000), 'yyyy-MM-dd hh:mm:ss')}`
      },
      handleCurrentChange (val) {
        this.page = val
        this.getListData()
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
        console.log(this.selectArtRow.pid === '' ? this.selectRow.pid : this.selectArtRow.pid)
        let params = {
          c_id: this.selectArtRow.pid === '' ? this.selectRow.pid : this.selectArtRow.pid,
          page: this.page,
          title: this.filters.key // 可选参数查询
          // value: this.filters.value // 可选参数查询
        }
        const res = await this.$http.post(`${MODEL_NAME}/list`, params)
        this.listLoading = false
        if (res === null) return
        this.total = res.param.pages.total
        this.pagesize = res.param.pages.pagesize
        this.list = res.param.list
        // list.forEach(item => {
        //   item.visible = false
        // })
        // this.list = list
        // console.log(list)
      },
      async getArrayData () {
        const res = await this.$http.post(`${MODEL_NAME}/category`, {
          id: 0,
          c_id: this.selectRow.pid
        })
        if (res === null) return
        this.filters.options = res.param
        // this.sort = res.param.cat.slice()
        this.filters.options.unshift({id: '', c_name: '全部分类'})
      },
      async getSortArrayData () {
        const res = await this.$http.post(`${MODEL_NAME}/category`, {
          id: 0,
          c_id: 3
        })
        if (res === null) return
        // this.filters.options = res.param.cat
        this.sort = res.param.slice()
        // this.filters.options.unshift({id: '', c_name: '全部分类'})
      },
      async getTopListData () {
        this.listLoading = true
        let params = {
          page: this.page,
          key: this.filters.key, // 可选参数查询
          value: this.filters.value // 可选参数查询
        }
        const res = await this.$http.post(`Article/category`, params)
        this.listLoading = false
        if (res === null) return
        this.p_list = res.param
        this.$refs.p_list.setCurrentRow(this.p_list[0])
      },
      handleProChange (currentRow, oldCurrentRow) {
        this.selectRow.c_name = currentRow.c_name
        this.selectRow.pid = currentRow.id
        this.selectRow.type = currentRow.type
        this.selectArtRow.c_name = ''
        this.selectArtRow.pid = ''
        this.getListData()
        this.getArrayData()
      },
      handleArtChange (currentArtRow) {
        // this.selectArtRow.c_name = currentArtRow.c_name
        this.selectArtRow.pid = currentArtRow
        this.getListData()
        console.log('222' + currentArtRow)
      },
      handleSortChange (currentSortRow) {
        // this.selectArtRow.c_name = currentArtRow.c_name
        this.selectSortRow.pid = currentSortRow
        this.getListData()
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
        }).then(async () => {
          let params = {
            id: row.id,
            p_id: this.selectRow.pid,
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
        }).catch(() => {

        })
      },
      // 显示编辑界面
      async handleEdit (index, row) {
        console.log(this.$route.path)
        this.$router.push(`${this.$route.path}/edit/${this.selectRow.pid}/${row.id}`)
      },
      // 显示新增界面
      handleAdd () {
        console.log(this.$route.path)
        this.$router.push(`${this.$route.path}/add/${this.selectRow.pid}`)
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
      async sortSubmit (row) {
        let params = {
          id: this.rowId,
          c_id: this.sort.id
          // status: 1 - row.status
        }
        console.log(this.rowId)
        const res = await this.$http.post(`${MODEL_NAME}/sort`, params)
        if (res === null) return
        this.$message({
          message: '归类成功',
          type: 'success'
        })
        this.dialogVisible = false
        this.getListData()
        // row.status = 1 - row.status
        console.log(111111)
      },
      selsChange (sels) {
        this.sels = sels
      },
      // visibleChange (row) {
      //   row.visible = false
      //   console.log(row)
      // },
      // 批量删除
      batchAction (action) {
        // 三种操作：remove disable active
        let id = this.sels.map(item => item.id).toString()
        const actions = {
          'remove': {
            tip: '删除',
            api: `${MODEL_NAME}/status`,
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
        }).catch(() => {

        })
      }
    },
    mounted () {
      this.getTopListData()
      this.getSortArrayData()
    }
  }
</script>

<style lang='scss'>
</style>
