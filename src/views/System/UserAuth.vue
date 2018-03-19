<template>
  <section>
    <el-row :gutter="24" v-loading="listLoading">
      <el-col :span="12" class="wrapper">
        <div class="content">
          <h3 class="title">角色权限</h3>
          <el-table :data="role"
                    ref="roleTable"
                    style="width: 100%;height: 500px;overflow-y: scroll;"
                    @selection-change="selsRoleChange"
                    @select="handleRoleSelect">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column prop="id" label="角色ID" min-width="80">
            </el-table-column>
            <el-table-column prop="name" label="角色名称" min-width="100">
            </el-table-column>
          </el-table>
          <h3 class="title">项目数据权限</h3>
          <el-table :data="project"
                    highlight-current-row
                    ref="projectTable"
                    style="width: 100%;height: 500px;overflow-y: scroll;" @selection-change="selsProChange">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column prop="id" label="项目ID" min-width="80">
            </el-table-column>
            <el-table-column prop="name" label="项目名称" min-width="100">
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="12" class="wrapper">
        <div class="content">

          <h3 class="title">系统功能权限</h3>
          <el-tree
            :data="authTree"
            show-checkbox
            node-key="id"
            :default-expand-all="true"
            :props="defaultProps"
            ref="authTree"
            style="height:1072px;overflow-y: scroll;">
          </el-tree>
        </div>
      </el-col>
    </el-row>
    <el-row style="margin-top: 20px;">
      <el-button type="primary" @click="handleSave" :loading="editLoading">保存</el-button>
      <el-button @click="$router.back()">返回</el-button>
    </el-row>
  </section>
</template>

<script>
  // import util from '@/utils/js'

  const MODEL_NAME = 'admin'

  export default {
    data () {
      return {
        // 角色列表
        role: [],
        roleSels: [], // 角色列表选中
        // 项目列表
        project: [],
        projectSels: [], // 项目数据列表选中
        // 权限列表
        treeSource: '', // 未经处理的数据
        authTree: [], // 已经处理完毕的数据
        // 角色对应权限列表
        sources_ids: [],

        total: 0,
        page: 1,
        pagesize: 0,
        listLoading: false,

        // 编辑界面数据
        editLoading: false,

        // Tree 相关
        defaultProps: {
          children: 'children',
          label: 'name'
        }
      }
    },
    watch: {
      // 如果路由有变化，会再次执行该方法
      '$route': 'getListData'
    },
    methods: {
      async handleSave () {
        this.editLoading = true
        if (this.getCheckedKeys('authTree').length === 0) {
          this.$message({
            message: '必须勾选权限',
            type: 'warning'
          })
          this.editLoading = false
          return
        }
        let params = {
          id: this.$route.params.id,
          rids: this.formatToIds(this.roleSels).length === 0 ? '' : this.formatToIds(this.roleSels),
          pids: this.formatToIds(this.projectSels).length === 0 ? '' : this.formatToIds(this.projectSels),
          resources: this.getCheckedKeys('authTree').length === 0 ? '' : this.getCheckedKeys('authTree')
        }
        const res = await this.$http.post(`${MODEL_NAME}/savepower`, params)
        this.editLoading = false
        if (res === null) return
        this.$message({
          message: res.info,
          type: 'success'
        })
        this.$router.back()
      },
      // 将含有对象的数组格式化为id的数组集合
      formatToIds (data) {
        let _result = []
        data.forEach(item => {
          _result.push(item.id)
        })
        return _result
      },

      handleNodeClick (data) {
        this.selectRow.id = data.id
        this.selectRow.name = data.name
        this.getListData()
      },
      // 显示编辑界面
      async getListData () {
        if (this.$route.name !== '权限管理') return
        this.listLoading = true
        let params = {id: this.$route.params.id}
        const res = await this.$http.post(`${MODEL_NAME}/setpower`, params)
        this.listLoading = false
        if (res === null) return
        const {project, sources, role, check_role, check_sources, check_project, sources_ids} = res.param

        this.project = project // 项目数据
        this.treeSource = sources // 系统功能权限
        this.role = role // 角色权限
        // eslint-disable-next-line
        this.sources_ids = sources_ids

        this.formatTreeData() // 处理为系统功能树形所需结构

        // 勾选已知选项（角色和项目权限）
        // eslint-disable-next-line
        this.roleSels = this.formatCheckedId(this.role, check_role === null ? [] : typeof check_role === 'number' ? check_role : check_role.split(','))
        // eslint-disable-next-line
        this.projectSels = this.formatCheckedId(this.project, check_project === null ? [] : typeof check_project === 'number' ? check_project : check_project.split(','))
        this.toggleSelection(this.roleSels, 'roleTable')
        this.toggleSelection(this.projectSels, 'projectTable')

        // 勾选已存在权限
        // eslint-disable-next-line
        this.setCheckedKeys(check_sources === null ? [] : check_sources.split(','), 'authTree')
      },
      /**
       * 处理为所需的已选中数据,适用于 el-table
       * @param source 数据来源
       * @param ids 已选择id数组
       * @return 返回数组
       */
      formatCheckedId (source, ids) {
        let _CheckedIds = []
        if (typeof ids === 'number') {
          source.forEach((item, index) => {
            if (Number(item.id) === Number(ids)) {
              _CheckedIds.push(source[index])
            }
          })
        } else {
          ids.forEach(id => {
            source.forEach((item, index) => {
              if (Number(item.id) === Number(id)) {
                _CheckedIds.push(source[index])
              }
            })
          })
        }

        return _CheckedIds.slice(0)
      },
      /**
       * 勾选已存在的角色权限
       * @param rows
       * @param refName 表格DOM名称
       */
      toggleSelection (rows, refName) {
        if (rows) {
          rows.forEach(row => {
            // 由于数据是异步获取，所以需要等到DOM都加载完毕后，再勾选
            this.$nextTick(() => {
              this.$refs[refName].toggleRowSelection(row)
            })
          })
        } else {
          this.$refs[refName].clearSelection()
        }
      },
      // 用户勾选角色时触发的操作
      handleRoleSelect (selection, row) {
        let id = row.id
        // 如果返回为 true 表示当前为勾选，否则为取消勾选
        let isChecked = selection.some(item => item.id === row.id)
        // 勾选执行的操作 : 取消勾选执行的操作
        isChecked ? this._checkedAuth(id) : this._unCheckedAuth(id)
      },
      /**
       * 移除当前角色权限
       * @param source 当前角色的id集合
       * @private
       */
      _removeAuth (source) {
        let allAuth = this.getCheckedKeys('authTree')
        source.forEach(item => {
          let index = allAuth.indexOf(Number(item))
          if (index > -1) {
            allAuth.splice(index, 1)
          }
        })
        this.setCheckedKeys(allAuth, 'authTree')
      },
      /**
       * 添加当前角色权限
       * @param source 当前角色的id集合
       * @private
       */
      _addAuth (source) {
        let allAuth = this.getCheckedKeys('authTree')
        allAuth = allAuth.concat(source)
        let result = Array.from(new Set(allAuth))
        // 数组去重
        this.setCheckedKeys(result, 'authTree')
      },
      // 勾选操作
      _checkedAuth (id) {
        let _temp = this.getRoleSources(id)
        // 数组内元素转为数值类型
        _temp = _temp.map(data => +data) // 将数组元素变为Number类型，防止勾选错误
        this._addAuth(_temp)
      },
      // 取消勾选操作
      _unCheckedAuth (id) {
        let _temp = this.getRoleSources(id)
        // 数组内元素转为数值类型
        _temp = _temp.map(data => +data) // 将数组元素变为Number类型，防止勾选错误
        this._removeAuth(_temp)
      },
      // 提取当前勾选对应的ids
      getRoleSources (id) {
        let curSources = []
        this.sources_ids.forEach(source => {
          if (Number(id) === Number(source.role_id)) {
            curSources = source.resource_ids.split(',')
          }
        })
        return curSources.slice(0)
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

      // 勾选项发生变化时的事件
      selsProChange (sels) {
        this.projectSels = sels
      },
      selsRoleChange (sels) {
        this.roleSels = sels
      }
    },
    mounted () {
      this.getListData()
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
