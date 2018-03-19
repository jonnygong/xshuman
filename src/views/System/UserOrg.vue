<template>
  <section>

    <el-row>
      <el-col :span="6">

        <el-tree :data="authTree"
                 :props="defaultProps"
                 @node-click="handleNodeClick"
                 :expand-on-click-node="false"
                 :default-expand-all="true"
                 :highlight-current="true"
                 style="max-height: 700px;"></el-tree>

      </el-col>
      <el-col :span="17" :offset="1">
        <el-col :span="24" style="color: #666"><i class="el-icon-information" style="padding-right:10px;"></i>当前选中项为：
          <el-tag>{{ selectRow.name }}</el-tag>
        </el-col>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
          <el-form :inline="true">
            <el-form-item>
              <el-button type="primary" @click="getListData">刷新</el-button>
            </el-form-item>
            <!--<el-form-item>-->
            <!--<el-button type="primary" @click="handleAdd">新增</el-button>-->
            <!--</el-form-item>-->
          </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="list" highlight-current-row
                  v-loading="listLoading"
                  @selection-change="selsChange"
                  style="width: 100%;">
          <el-table-column type="selection" width="55">
          </el-table-column>
          <el-table-column prop="email" label="登录名" min-width="120">
          </el-table-column>
          <el-table-column prop="status" label="状态">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : scope.row.status === -1 ? 'gray' : 'danger'">
                {{ scope.row.status === 1 ? '开启' : scope.row.status === -1 ? '删除' : '关闭' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="realname" label="真名" min-width="120">
          </el-table-column>
          <el-table-column prop="tel" label="联系电话" width="180">
          </el-table-column>
          <el-table-column prop="thumb" label="用户头像" width="120">
            <template slot-scope="scope">
              <el-popover trigger="hover" placement="top">
                <div class="ad-img">
                  <img :src="scope.row.thumb" :alt="scope.row.name" width="200" height="auto"
                       v-if="scope.row.thumb !== ''">
                  <p v-else>暂无图片</p>
                </div>
                <div slot="reference" class="name-wrapper">
                  <el-tag>查看图片</el-tag>
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column prop="create_time" label="创建时间" width="200">
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template slot-scope="scope">
              <!--<el-button size="small" @click="statusSubmit(scope.$index, scope.row)"-->
              <!--:disabled="scope.row.status === -1">-->
              <!--{{ scope.row.status === 1 ? '停用' : scope.row.status === 0 ? '启用' : '已删除' }}-->
              <!--</el-button>-->
              <el-button size="small" @click="handleEdit(scope.$index, scope.row)">设置权限</el-button>
              <!--<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除-->
              <!--</el-button>-->
            </template>
          </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
          <!--<el-button type="danger" @click="batchAction('remove')" :disabled="this.sels.length===0">-->
          <!--批量删除-->
          <!--</el-button>-->
          <!--<el-button type="warning" @click="batchAction('disable')" :disabled="this.sels.length===0">-->
          <!--禁用-->
          <!--</el-button>-->
          <!--<el-button type="primary" @click="batchAction('active')" :disabled="this.sels.length===0">-->
          <!--启用-->
          <!--</el-button>-->
          <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange"
                         :page-size="pagesize"
                         :total="total" style="float:right;">
          </el-pagination>
        </el-col>
      </el-col>
    </el-row>


    <!--编辑界面-->
    <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
        <el-form-item label="标题" prop="title">
          <el-input v-model="editForm.title" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
        <el-form-item label="标题" prop="title">
          <el-input v-model="addForm.title" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
  import util from '@/utils/js'

  const MODEL_NAME = 'admin'

  export default {
    data () {
      return {
        selectRow: {
          id: 0,
          name: '当前暂未选中任何公司或部门'
        },
        list: [],
        total: 0,
        page: 1,
        pagesize: 0,
        listLoading: false,
        sels: [], // 列表选中

        editFormVisible: false, // 编辑界面是否显示
        editLoading: false,
        editFormRules: {
          title: [
            {required: true, message: '请输入案例标题', trigger: 'blur'}
          ]
        },
        // 编辑界面数据
        editForm: {
          id: 0
        },

        addFormVisible: false, // 新增界面是否显示
        addLoading: false,
        addFormRules: {
          title: [
            {required: true, message: '请输入案例标题', trigger: 'blur'}
          ]
        },
        // 新增界面数据
        addForm: {},
        // Tree 相关
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        treeSource: '',
        authTree: []
      }
    },
    methods: {
      handleClick (tab, event) {
      },
      handleNodeClick (data) {
        this.selectRow.id = data.id
        this.selectRow.name = data.name
        this.getListData()
      },
      // 格式化创建时间
      formateDate (row, column) {
        return util.formatDate.format(new Date(row.update_time * 1000), 'yyyy-MM-dd hh:mm:ss')
      },
      handleCurrentChange (val) {
        this.page = val
        this.getListData()
      },
      // 获取列表
      async getListData () {
        if (this.selectRow.id === 0) return
        let params = {page: this.page, id: this.selectRow.id}
        this.listLoading = true
        const res = await this.$http.post(`Oragnize/people`, params)
        this.listLoading = false
        if (res === null) return
        this.total = res.param.pages.total
        this.pagesize = res.param.pages.pagesize
        this.list = res.param.list
      },
      // 处理为tree所需数据结构
      formatTreeData () {
        let temp = []  // 临时数组，存放父级节点
        this.treeSource.forEach((item, index) => {
          if (item.pid === 0) {
            temp.push({
              'id': item.id,
              'name': item.name,
              'tel': item.tel,
              'type': item.type,
              'parent_id': item.pid,
              'notes': item.notes,
              'code': item.code,
              'depth': item.dep,
              'address': item.address
            })
          }
        })
        this.authTree = temp.slice(0)
        this._formatChildTree(this.authTree)
      },
      // 遍历权限tree列表
      _formatChildTree (parent) {
        parent.forEach((item, index) => {
          // 初始化子集
          item.children = []
          this.treeSource.forEach(subItem => {
            // 是否是当前父元素的子集
            if (subItem.pid === item.id) {
              item.children.push({
                'id': subItem.id,
                'name': subItem.name,
                'tel': subItem.tel,
                'type': subItem.type,
                'parent_id': subItem.pid,
                'code': subItem.code,
                'notes': subItem.notes,
                'depth': subItem.dep,
                'address': subItem.address
              })
            }
          })
          if (item.children.length === 0) return
          this._formatChildTree(item.children)
        })
      },
      // 通过 id 设置已选择的权限 tree 节点
      setCheckedKeys (data, key) {
        this.$refs[key].setCheckedKeys(data)
      },
      // 获取已勾选节点的 id
      getCheckedKeys (key) {
        return this.$refs[key].getCheckedKeys()
      },
      // 删除
      handleDel (index, row) {
        this.$confirm('确认删除该记录吗?', '提示', {
          type: 'warning'
        }).then(async () => {
          this.listLoading = true
          let params = {id: row.id}
          const res = await this.$http.post(`${MODEL_NAME}/delete`, params)
          this.listLoading = false
          if (res === null) return
          this.$message({
            message: res.info,
            type: 'success'
          })
          this.getListData()
        }).catch(() => {

        })
      },
      // 显示编辑界面
      async handleEdit (index, row) {
//        this.editFormVisible = true;
//        let params = {id: row.id};
//        const res = await this.$http.post(`${MODEL_NAME}/info`, params);
//        if (res === null) return;
//        this.editForm = Object.assign({}, res.param.list);
//        this.treeSource = res.param.sources;
//        this.formatTreeData();
//        // 勾选已存在权限
//        this.setCheckedKeys(res.param.source_ids, 'editTree');
        this.$router.push({
          name: '权限管理',
          params: {
            id: row.id
          }
        })
      },
      // 显示新增界面
      async handleAdd () {
        this.addFormVisible = true
        this.addForm = {
          name: '',
          description: ''
        }
        const params = {id: 0}
        const res = await this.$http.post(`${MODEL_NAME}/info`, params)
        this.treeSource = res.param.sources
        this.formatTreeData()
      },
      // 获取组织结构
      async getOrgList () {
        let params = {id: 0}
        const res = await this.$http.post('Oragnize/list', params)
        if (res === null) return
        this.editForm = Object.assign({}, res.param.list)
        this.treeSource = res.param
        this.formatTreeData()
      },
      // 编辑
      editSubmit () {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.editLoading = true
              let params = {
                id: this.editForm.id,
                name: this.editForm.name,
                description: this.editForm.description,
                source: this.getCheckedKeys('editTree')
              }
              const res = await this.$http.post(`${MODEL_NAME}/update`, params)
              this.editLoading = false
              if (res === null) return
              this.$message({
                message: res.info,
                type: 'success'
              })
              this.$refs['editForm'].resetFields()
              this.editFormVisible = false
              this.getListData()
            })
          }
        })
      },
      // 新增
      addSubmit () {
        this.$refs.addForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.addLoading = true
              let params = Object.assign({source: this.getCheckedKeys('addTree')}, this.addForm)
              const res = await this.$http.post(`${MODEL_NAME}/add`, params)
              this.addLoading = false
              if (res === null) return
              this.$message({
                message: res.info,
                type: 'success'
              })
              this.$refs['addForm'].resetFields()
              this.addFormVisible = false
              this.getListData()
            })
          }
        })
      },
      // 修改客户状态
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
      // 批量操作
      batchAction (action) {
        // 三种操作：remove disable active
        let ids = this.sels.map(item => item.id).toString()
        const actions = {
          'remove': {
            tip: '删除',
            api: `${MODEL_NAME}/Delete`
          },
          'disable': {
            tip: '停用',
            api: `${MODEL_NAME}/Status`,
            status: 0
          },
          'active': {
            tip: '启用',
            api: `${MODEL_NAME}/Status`,
            status: 1
          }
        }
        this.$confirm(`确认${actions[action].tip}选中记录吗？`, '提示', {
          type: 'warning'
        }).then(async () => {
          this.listLoading = true
          // 非批量删除，带上 status
          let params = (action !== 'remove' ? {
            id: ids + '',
            status: actions[action].status
          } : {id: ids + ''})
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
      this.getOrgList()
    }
  }
</script>

<style lang="scss" scoped>
  .wrapper {
    .title {
      padding-bottom: 19px;
      border-bottom: 1px solid #eaeefb;
    }
  }
</style>
