<template>
  <section>

    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true">
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
          <el-button type="primary" icon="search" @click="getListData">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getListData">刷新</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="list" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
              style="width: 100%;">
      <!-- 选择 -->
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
      <!-- 图片显示 -->
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
      <!-- 状态显示 -->
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : scope.row.status === -1 ? 'gray' : 'danger'">
            {{ scope.row.status === 1 ? '开启' : scope.row.status === -1 ? '已删除' : '关闭' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="230" fixed="right">
        <template slot-scope="scope">
          <el-button size="small" @click="statusSubmit(scope.$index, scope.row)"
                     :disabled="scope.row.status === -1">
            {{ scope.row.status === 1 ? '停用' : scope.row.status === 0 ? '启用' : '已删除' }}
          </el-button>
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-button type="danger" @click="batchAction('remove')" :disabled="this.sels.length===0">批量删除</el-button>
      <el-button type="warning" @click="batchAction('disable')" :disabled="this.sels.length===0">禁用</el-button>
      <el-button type="primary" @click="batchAction('active')" :disabled="this.sels.length===0">启用</el-button>
      <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange"
                     :page-size="pagesize"
                     :total="total" style="float:right;">
      </el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
        <el-form-item label="用户名" prop="email">
          <el-input v-model="editForm.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户头像" prop="thumb">
          <i-uploader v-model="editForm.thumb"></i-uploader>
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input type="password" v-model.number="editForm.password"
                    auto-complete="off"
                    placeholder="为空则不修改密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="repassword">
          <el-input type="password" v-model.number="editForm.repassword"
                    auto-complete="off"
                    placeholder="为空则不修改密码"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="realname">
          <el-input v-model="editForm.realname" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="tel">
          <el-input v-model="editForm.tel" auto-complete="off"></el-input>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="所属公司" prop="cp_id">
              <el-select v-model.number="editForm.cp_id" placeholder="选择公司" @change="handleSelectComp">
                <el-option :label="item.name"
                           :value="item.id"
                           :key="index"
                           v-for="(item, index) in compList"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">


            <el-form-item label="所属部门" prop="dp_id">
              <el-select v-model.number="editForm.dp_id" placeholder="选择部门">
                <el-option :label="item.name"
                           :value="item.id"
                           :key="index"
                           v-for="(item, index) in departList"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态" prop="status">
          <el-select v-model.number="editForm.status" placeholder="请选择状态">
            <el-option label="开启" :value="1"></el-option>
            <el-option label="关闭" :value="0"></el-option>
            <el-option label="已删除" :value="-1"></el-option>
          </el-select>
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
        <el-form-item label="用户名" prop="email">
          <el-input v-model="addForm.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户头像" prop="thumb">
          <i-uploader v-model="addForm.thumb"></i-uploader>
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input type="password" v-model.number="addForm.password"
                    auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="repassword">
          <el-input type="password" v-model.number="addForm.repassword"
                    auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="realname">
          <el-input v-model="addForm.realname" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="tel">
          <el-input v-model="addForm.tel" auto-complete="off"></el-input>
        </el-form-item>

        <el-row>
          <el-col :span="12">

            <el-form-item label="所属公司" prop="cp_id">
              <el-select v-model.number="addForm.cp_id" placeholder="选择公司" @change="handleSelectComp">
                <el-option :label="item.name"
                           :value="item.id"
                           :key="index"
                           v-for="(item, index) in compList"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属部门" prop="dp_id">
              <el-select v-model.number="addForm.dp_id" placeholder="选择部门">
                <el-option :label="item.name"
                           :value="item.id"
                           :key="index"
                           v-for="(item, index) in departList"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!--<el-form-item label="状态" prop="status">-->
        <!--<el-select v-model.number="addForm.status" placeholder="请选择状态">-->
        <!--<el-option label="开启" :value="1"></el-option>-->
        <!--<el-option label="关闭" :value="0"></el-option>-->
        <!--<el-option label="已删除" :value="-1"></el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
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
  import Uploader from '@/components/Uploader/Uploader.vue'

  const MODEL_NAME = 'admin'

  export default {
    data () {
      // 密码自定义校验规则
      const validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'))
        } else {
          if (this.addForm.repassword !== '') {
            this.$refs.addForm.validateField('repassword')
          }
          callback()
        }
      }
      const validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== this.addForm.password) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      }
      const validateEditPass = (rule, value, callback) => {
        if (this.editForm.password !== '') {
          this.$refs.editForm.validateField('repassword')
        }
        callback()
      }
      const validateEditPass2 = (rule, value, callback) => {
        if (value === '' && this.editForm.password !== '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== this.editForm.password) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      }
      return {
        tableColumn: [
          {
            prop: 'email',
            label: '登录名',
            width: 120,
            sortable: false
          },
          {
            prop: 'realname',
            label: '真名',
            width: 120,
            sortable: false
          },
          {
            prop: 'tel',
            label: '联系电话',
            width: 180,
            sortable: false
          },
          {
            prop: 'create_time',
            label: '创建时间',
            width: 200,
            sortable: false
          }
        ],

        filters: {
          value: '',
          key: '',
          options: [
            {value: 'email', label: '登录名'},
            {value: 'realname', label: '真名'},
            {value: 'tel', label: '联系电话'}
          ]
        },
        list: [],
        compList: [],
        departSource: {},
        departList: [],
        total: 0,
        page: 1,
        pagesize: 0,
        listLoading: false,
        sels: [], // 列表选中列
        selectRow: {
          name: '',
          pid: ''
        },

        editFormVisible: false, // 编辑界面是否显示
        editLoading: false,
        editFormRules: {
          email: [
            {type: 'email', required: true, message: '请输入用户名(邮箱格式)', trigger: 'blur'}
          ],
          status: [
            {type: 'number', required: true, message: '请选择状态', trigger: 'blur'}
          ],
          realname: [
            {required: true, message: '请输入真实姓名', trigger: 'blur'}
          ],
          tel: [
            {required: true, message: '请输入联系电话', trigger: 'blur'}
          ],
          thumb: [
            {required: true, message: '请上传用户头像'}
          ],
          password: [
            {validator: validateEditPass, trigger: 'blur'}
          ],
          repassword: [
            {validator: validateEditPass2, trigger: 'blur'}
          ],
          dp_id: [
            {type: 'number', required: true, message: '请选择部门', trigger: 'blur'}
          ],
          cp_id: [
            {type: 'number', required: true, message: '请选择公司', trigger: 'blur'}
          ]
        },
        // 编辑界面数据
        editForm: {
          id: '',
          email: '',
          status: '',
          realname: '',
          tel: '',
          thumb: '',
          password: '',
          repassword: '',
          dp_id: '',
          cp_id: '',
          old_cp_id: ''
        },

        addFormVisible: false, // 新增界面是否显示
        addLoading: false,
        addFormRules: {
          email: [
            {type: 'email', required: true, message: '请输入用户名(邮箱格式)', trigger: 'blur'}
          ],
//          status: [
//            {type: 'number', required: true, message: '请选择状态', trigger: 'blur'}
//          ],
          realname: [
            {required: true, message: '请输入真实姓名', trigger: 'blur'}
          ],
          tel: [
            {required: true, message: '请输入联系电话', trigger: 'blur'}
          ],
          thumb: [
            {required: true, message: '请上传用户头像'}
          ],
          password: [
            {validator: validatePass, trigger: 'blur'}
          ],
          repassword: [
            {validator: validatePass2, trigger: 'blur'}
          ],
          dp_id: [
            {type: 'number', required: true, message: '请选择部门', trigger: 'blur'}
          ],
          cp_id: [
            {type: 'number', required: true, message: '请选择公司', trigger: 'blur'}
          ]
        },
        // 新增界面数据
        addForm: {
          email: '',
          status: 1,
          realname: '',
          tel: '',
          thumb: '',
          password: '',
          repassword: '',
          dp_id: '',
          cp_id: ''
        }
      }
    },

    methods: {
      // 分页切换
      handleCurrentChange (val) {
        this.page = val
        // 获取数据
        this.getListData()
      },
      // 修改单个状态
      async statusSubmit (index, row) {
        let params = {
          id: row.id,
          status: 1 - row.status
        }
        const res = await this.$http.post(`${MODEL_NAME}/Status`, params)
        if (res === null) return
        this.$message({
          message: '状态修改成功',
          type: 'success'
        })
        row.status = 1 - row.status
      },
      // 获取列表
      async getListData () {
        let params = {
          page: this.page,
          value: this.filters.value,
          key: this.filters.key
        }
        this.listLoading = true
        const res = await this.$http.post(`${MODEL_NAME}/List`, params)
        this.listLoading = false
        if (res === null) return
        this.total = res.param.pages.total
        this.pagesize = res.param.pages.pagesize
        this.list = res.param.list
      },
      // 选择公司变化是触发的方法，传入当前公司id
      handleSelectComp (compId) {
        const {dp_id, cp_id} = this.editForm
        // eslint-disable-next-line
        if (dp_id !== '' && this.departSource[cp_id] && this.editForm.old_cp_id === this.editForm.cp_id) {
          this.departList = this.formateCategory(this.departSource[cp_id])
        } else {
          this.departList = this.formateCategory(this.departSource[compId])
          this.editForm.dp_id = ''
          this.addForm.dp_id = ''
        }
      },
      // 获取父级分类
      async getCategoryData () {
        let params = {id: 0, pid: this.selectRow.pid}
        const res = await this.$http.post(`${MODEL_NAME}/Info`, params)
        if (res === null) return
        this.compList = res.param.comp
        this.departSource = res.param.depart
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

      // 删除
      handleDel (index, row) {
        this.$confirm('确认删除该记录吗?', '提示', {
          type: 'warning'
        }).then(async () => {
          this.listLoading = true
          let params = {id: row.id}
          const res = await this.$http.post(`${MODEL_NAME}/Delete`, params)
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
        let params = {
          id: row.id,
          pid: this.selectRow.pid
        }
        const res = await this.$http.post(`${MODEL_NAME}/Info`, params)
        if (res === null) return
        this.editForm = res.param.list
        this.editForm.old_cp_id = res.param.list.cp_id // 存放旧公司id，用于清空部门id
        this.editForm.password = ''
        this.editForm.repassword = ''
        this.compList = res.param.comp
        this.departSource = res.param.depart
      },
      // 显示新增界面
      async handleAdd () {
        this.addFormVisible = true
        this.addForm = {
          email: '',
          status: 1,
          realname: '',
          tel: '',
          thumb: '',
          password: '',
          repassword: '',
          dp_id: '',
          cp_id: ''
        }
        this.getCategoryData()
      },
      // 编辑
      editSubmit () {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.editLoading = true
              let params = Object.assign({}, this.editForm)
              const res = await this.$http.post(`${MODEL_NAME}/Update`, params)
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
              let params = {
                email: this.addForm.email,
                status: this.addForm.status,
                realname: this.addForm.realname,
                tel: this.addForm.tel,
                thumb: this.addForm.thumb,
                password: this.addForm.password,
                repassword: this.addForm.repassword,
                dp_id: this.addForm.dp_id,
                cp_id: this.addForm.cp_id
              }
              const res = await this.$http.post(`${MODEL_NAME}/Add`, params)
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
      handleProChange (currentRow, oldCurrentRow) {
        this.selectRow.name = currentRow.name
        this.selectRow.pid = currentRow.id
        this.getListData()
      },
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
    },
    components: {
      'i-uploader': Uploader
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
