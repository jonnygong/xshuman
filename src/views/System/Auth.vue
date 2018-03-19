<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="getListData">刷新</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="list"
              highlight-current-row
              v-loading="listLoading"
              @selection-change="selsChange"
              style="width: 100%;">
      <el-table-column type="selection" width="55">
      </el-table-column>
      <el-table-column prop="name" label="角色名称" min-width="120">
      </el-table-column>
      <el-table-column prop="description" label="角色简介" min-width="120">
      </el-table-column>
      <el-table-column prop="create_time" label="创建时间" width="200">
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : scope.row.status === -1 ? 'gray' : 'danger'">
            {{ scope.row.status === 1 ? '可用' : scope.row.status === -1 ? '已删除' : '不可用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="230" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="small"
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
      <el-button type="danger" @click="batchAction('remove')" :disabled="this.sels.length===0">批量删除</el-button>
      <el-button type="warning" @click="batchAction('disable')" :disabled="this.sels.length===0">禁用</el-button>
      <el-button type="primary" @click="batchAction('active')" :disabled="this.sels.length===0">启用</el-button>
      <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pagesize"
                     :total="total" style="float:right;">
      </el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="editForm.description" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="权限管理" prop="auth">
          <el-tree
            :data="authTree"
            show-checkbox
            node-key="id"
            :default-expand-all="true"
            :props="defaultProps"
            ref="editTree">
          </el-tree>
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
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="addForm.description" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="权限管理" prop="auth">
          <el-row>
            <el-tree
              :data="authTree"
              show-checkbox
              node-key="id"
              :default-expand-all="true"
              :props="defaultProps"
              ref="addTree">
            </el-tree>
          </el-row>
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
  // import util from '@/utils/js'
  const MODEL_NAME = 'Role'

  export default {
    data () {
      return {
        list: [],
        total: 0,
        page: 1,
        pagesize: 0,
        listLoading: false,
        sels: [], //  列表选中列

        editFormVisible: false, // 编辑界面是否显示
        editLoading: false,
        editFormRules: {
          name: [
            {required: true, message: '请输入角色名称', trigger: 'blur'}
          ],
          description: [
            {required: true, message: '请输入角色描述', trigger: 'blur'}
          ]
        },
        // 编辑界面数据
        editForm: {
          id: 0,
          name: '',
          description: ''
        },

        addFormVisible: false, // 新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [
            {required: true, message: '请输入角色名称', trigger: 'blur'}
          ],
          description: [
            {required: true, message: '请输入角色描述', trigger: 'blur'}
          ]
        },
        // 新增界面数据
        addForm: {
          name: '',
          description: ''
        },
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
      // 分页切换
      handleCurrentChange (val) {
        this.page = val
        // 获取数据
        this.getListData()
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
      // 获取列表
      async getListData () {
        let params = {page: this.page}
        this.listLoading = true
        const res = await this.$http.post(`${MODEL_NAME}/list`, params)
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
          this.listLoading = true
          let params = {id: row.id, status: -1}
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
        this.editFormVisible = true
        let params = {id: row.id}
        const res = await this.$http.post(`${MODEL_NAME}/info`, params)
        if (res === null) return
        this.editForm = Object.assign({}, res.param.list)
        this.treeSource = res.param.sources
        this.formatTreeData()
        // 勾选已存在权限
        this.setCheckedKeys(res.param.source_ids, 'editTree')
      },
      // 处理为tree所需数据结构
      formatTreeData () {
        let temp = []  // 临时数组，存放父级节点
        for (let pid in this.treeSource) {
          if (this.treeSource.hasOwnProperty(pid) && pid === '0') {
            this.treeSource[pid].forEach(item => {
              temp.push(Object.assign({}, {
                id: item.id,
                name: item.name
              }))
            })
            this.authTree = temp.slice(0)
          }
        }
        this._formatChildTree(this.authTree) // 处理父级下面的子集
      },
      // 遍历权限tree列表
      _formatChildTree (data) {
        data.forEach(item => {
          const curMenu = this.treeSource[item.id + '']
          if (Array.isArray(curMenu)) {
            item.children = []
            curMenu.forEach(child => {
              item.children.push(Object.assign({}, {
                id: child.id,
                name: child.name
              }))
            })
            // 如果当前节点的id在所有节点中还能找到，则说明有子集
            this._formatChildTree(item.children)
          } else {
            return false
          }
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
            api: `${MODEL_NAME}/Delete`,
            status: -1
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
          console.log(actions[action].status)
          let params = {
            id: ids + '',
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

<style scoped>

</style>
