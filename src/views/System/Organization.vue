<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="getListData">刷新</el-button>
        </el-form-item>
        <el-form-item>
          <!--<el-button type="primary" @click="handleAdd">新增</el-button>-->
          <el-dropdown @command="handleAdd">
            <el-button type="primary">
              新增<i class="el-icon-caret-bottom el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="company">添加公司</el-dropdown-item>
              <el-dropdown-item command="department">添加部门</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="treeSource" border max-height="500">
      <el-table-tree-column
        file-icon="icon icon-file"
        folder-icon="icon icon-folder"
        prop="name"
        label="名称"
        width="300"></el-table-tree-column>
      <el-table-column prop="type" label="类型" width="80">
        <template slot-scope="scope">
          {{ scope.row.type === 1 ? '部门' : '公司' }}
        </template>
      </el-table-column>
      <el-table-column prop="code" label="代码" width="150"></el-table-column>
      <el-table-column prop="tel" label="电话" width="150"></el-table-column>
      <el-table-column prop="address" label="地址"></el-table-column>
      <el-table-column prop="notes" label="备注"></el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template slot-scope="scope">
          <el-button size="small" v-if="scope.row.depth !== 0" @click="handleEdit(scope.$index, scope.row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pagesize"
                     :total="total" style="float:right;">
      </el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
        <el-form-item label="ID" prop="id">
          <el-input v-model="editForm.id" auto-complete="off" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="代码" prop="code">
          <el-input v-model="editForm.code" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="上级机构" prop="pid">
          <el-select v-model.number="editForm.pid" placeholder="选择上级机构">
            <el-option :label="cate.name"
                       :value="cate.id"
                       v-for="(cate, index) in category"
                       :key="cate.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="电话" prop="tel">
          <el-input v-model="editForm.tel" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="editForm.address" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="editForm.path" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input type="textarea" v-model="editForm.notes" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <!--添加公司-->
    <el-dialog title="新增公司" v-model="addFormVisible" :close-on-click-modal="false" v-if="addType===0">
      <el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
        <el-form-item label="上级机构" prop="pid">
          <el-select v-model.number="addForm.pid" placeholder="选择上级机构">
            <el-option :label="cate.name"
                       :value="cate.id"
                       v-for="(cate, index) in category"
                       :key="cate.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="简称" prop="code">
          <el-input v-model="addForm.code" auto-complete="off" placeholder="请输入名称的首字母简写，如“ZJN”"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="tel">
          <el-input v-model="addForm.tel" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="addForm.address" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input type="textarea" v-model="addForm.notes" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit(0)" :loading="addLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--添加部门-->
    <el-dialog title="新增部门" v-model="addFormVisible" :close-on-click-modal="false" v-if="addType===1">
      <el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
        <el-form-item label="上级机构" prop="pid">
          <el-select v-model.number="addForm.pid" placeholder="选择上级机构">
            <el-option :label="cate.name"
                       :value="cate.id"
                       v-for="(cate, index) in category"
                       :key="cate.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="简称" prop="code">
          <el-input v-model="addForm.code" auto-complete="off" placeholder="请输入名称的首字母简写，如“ZJN”"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="tel">
          <el-input v-model="addForm.tel" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="addForm.address" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input type="textarea" v-model="addForm.notes" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit(1)" :loading="addLoading">提交</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
  // import util from '@/utils/js'

  const MODEL_NAME = 'Oragnize'

  export default {
    data () {
      return {
        category: [],
        categorySelect: [],
        total: 0,
        page: 1,
        pagesize: 0,
        listLoading: false,
        sels: [], // 列表选中列

        editFormVisible: false, // 编辑界面是否显示
        editLoading: false,
        editFormRules: {
          name: [
            {required: true, message: '请输入名称', trigger: 'blur'}
          ],
          pid: [
            {type: 'number', required: true, message: '请选择上级分类', trigger: 'blur'}
          ]
        },
        // 编辑界面数据
        editForm: {
          id: 0,
          name: '',
          code: '',
          type: 0,
          tel: 1,
          address: '',
          notes: '',
          pid: 0,
          path: ''
        },

        addFormVisible: false, // 新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [
            {required: true, message: '请输入名称', trigger: 'blur'}
          ],
          pid: [
            {type: 'number', required: true, message: '请选择上级机构', trigger: 'blur'}
          ]
        },
        // 添加界面数据
        addForm: {
          name: '',
          code: '',
          tel: '',
          address: '',
          notes: '',
          pid: '',
          type: ''
        },
        addType: 0, // 添加类别 0 公司 1 部门
        // Tree 相关
        treeSource: [],
        organizationTree: []
      }
    },
    methods: {
      // 分页切换
      handleCurrentChange (val) {
        this.page = val
        // 获取数据
        this.getListData()
      },
      // 获取列表
      async getListData () {
        let params = {page: this.page}
        this.listLoading = true
        const res = await this.$http.post(`${MODEL_NAME}/list`, params)
        this.listLoading = false
        if (res === null) return
//        this.total = res.param.pages.total;
//        this.pagesize = res.param.pages.pagesize;
        this.list = res.param
        this.formatTreeData()
      },
      // 显示编辑界面
      async handleEdit (index, row) {
        this.editFormVisible = true
        let params = {id: row.id, type: row.type}
        this.getCategoryData(0, row.type)
        const res = await this.$http.post(`${MODEL_NAME}/info`, params)
        if (res === null) return
        this.editForm = Object.assign({}, res.param.list)
      },
      // 处理为tree所需数据结构
      formatTreeData () {
        let temp = []  // 临时数组，存放父级节点
        this.list.forEach((item, index) => {
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
        this.treeSource = temp.slice(0)
        this._formatChildTree(this.treeSource)
      },
      // 遍历权限tree列表
      _formatChildTree (parent) {
        parent.forEach((item, index) => {
          // 初始化子集
          item.children = []
          this.list.forEach(subItem => {
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
      // 获取父级分类
      async getCategoryData (id = 0, type = 0) {
        let para = {
          id: id,
          type: type
        }
        this.listLoading = true
        const res = await this.$http.post(`${MODEL_NAME}/info`, para)
        if (res === null) return
        this.category = this.formateCategory(res.param.cat)
      },
      /**
       *  处理分类层级，传入 data <层级数组>
       *  返回层级数据
       * */
      formateCategory (data) {
        // 层级数据处理
        let select = []
        data.forEach((item, index) => {
          let _tag = '| -- '
          // 根据不同的层级 dep 数值，添加横线
          for (let i = 0; i < item.dep; i++) {
            _tag = _tag + '| -- '
          }
          let tempObj = {id: item.id, pid: item.pid, name: _tag + item.name}
          select.push(tempObj)
        })
        return select.slice(0)
      },
      // 显示新增界面
      handleAdd (command) {
        this.addFormVisible = true

        if (command === 'company') {
          this.addType = 0
          this.addForm = {
            name: '',
            code: '',
            tel: '',
            address: '',
            notes: '',
            pid: ''
          }
        } else {
          this.addType = 1
          this.addForm = {
            name: '',
            code: '',
            tel: '',
            address: '',
            notes: '',
            pid: ''
          }
        }
        this.getCategoryData(0, this.addType)
      },
      // 编辑
      editSubmit () {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.editLoading = true
              let params = Object.assign({}, this.editForm)
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
      addSubmit (type) {
        this.$refs.addForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.addLoading = true
              let params = {
                name: this.addForm.name,
                code: this.addForm.code,
                tel: this.addForm.tel,
                address: this.addForm.address,
                notes: this.addForm.notes,
                pid: this.addForm.pid,
                type: type
              }
              const res = await this.$http.post(`${MODEL_NAME}/add`, params)
              this.addLoading = false
              if (res === null) return
              this.$message({
                message: res.info,
                type: 'success'
              })
              this.addFormVisible = false
              this.getListData()
            })
          }
        })
      },
      selsChange (sels) {
        this.sels = sels
      }
    },
    mounted () {
      this.getListData()
    }
  }
</script>

<style scoped>

</style>
