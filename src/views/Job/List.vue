<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px">
      <el-form :inline="true" :model="filters">
        <el-form-item v-if="this.filters.key === ''">
          <el-input v-model="filters.value" placeholder="请先选择搜索字段"></el-input>
        </el-form-item>
        <el-form-item v-if="this.filters.key === 'title'">
          <el-input v-model="filters.value" placeholder="请输入岗位名称"></el-input>
        </el-form-item>
        <!--<el-form-item v-if="this.filters.key === 'salary'">-->
          <!--<el-input v-model="filters.value" placeholder="请输入薪资范围"></el-input>-->
        <!--</el-form-item>-->
        <!--<el-form-item v-if="this.filters.key === 'job_year'">-->
          <!--<el-input v-model="filters.value" placeholder="请输入工作年限"></el-input>-->
        <!--</el-form-item>-->
        <!--<el-form-item v-if="this.filters.key === 'salary'">-->
          <!--<el-select v-model="filters.value" placeholder="请选择薪资范围">-->
            <!--<el-option-->
              <!--v-for="(item,index) in filters.salary"-->
              <!--:key="index"-->
              <!--:label="item.name"-->
              <!--:value="item.id">-->
            <!--</el-option>-->
          <!--</el-select>-->
        <!--</el-form-item>-->
        <!--<el-form-item v-if="this.filters.key === 'job_year'">-->
          <!--<el-select v-model="filters.value" placeholder="请选择工作年限">-->
            <!--<el-option-->
              <!--v-for="(item,index) in filters.job_year"-->
              <!--:key="index"-->
              <!--:label="item.name"-->
              <!--:value="item.id">-->
            <!--</el-option>-->
          <!--</el-select>-->
        <!--</el-form-item>-->
        <el-form-item v-if="this.filters.key === 'degree'">
          <el-select v-model="filters.value" placeholder="请选择学历">
            <el-option
              v-for="(item,index) in filters.degree"
              :key="index"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
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
        <!--<el-form-item>-->
          <!--<el-select v-model="filters.province_id.id" placeholder="请选择省份" @change="handleProvinceChange">-->
            <!--<el-option-->
              <!--v-for="(item,index) in filters.province_id"-->
              <!--:key="index"-->
              <!--:label="item.province"-->
              <!--:value="item.id">-->
            <!--</el-option>-->
          <!--</el-select>-->
        <!--</el-form-item>-->
        <!--<el-form-item v-if="showCity">-->
          <!--<el-select v-model="filters.city_id.id" placeholder="请选择城市" @change="handleCityChange">-->
            <!--<el-option-->
              <!--v-for="(item,index) in filters.city_id"-->
              <!--:key="index"-->
              <!--:label="item.city"-->
              <!--:value="item.id">-->
            <!--</el-option>-->
          <!--</el-select>-->
        <!--</el-form-item>-->
        <!--<el-form-item v-if="showZone">-->
          <!--<el-select v-model="filters.zone_id.id" placeholder="请选择区域">-->
            <!--<el-option-->
              <!--v-for="(item,index) in filters.zone_id"-->
              <!--:key="index"-->
              <!--:label="item.zone"-->
              <!--:value="item.id">-->
            <!--</el-option>-->
          <!--</el-select>-->
        <!--</el-form-item>-->
        <el-form-item>
          <el-button type="primary"
                     icon="search"
                     @click="getSearchData">搜索
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary"
                     @click="getListData">刷新
          </el-button>
        </el-form-item>
        <!--<el-form-item>-->
          <!--<el-button type="primary"-->
                     <!--@click="handleAdd">新增-->
          <!--</el-button>-->
        <!--</el-form-item>-->
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
      <!--<el-table-column prop="status" label="状态" width="100">-->
        <!--<template slot-scope="scope">-->
          <!--<el-tag :type="scope.row.status === 1 ? 'success' : scope.row.status === -1 ? 'gray' : 'danger'">-->
            <!--{{ scope.row.status === 1 ? '可用' : scope.row.status === -1 ? '已删除' : '不可用' }}-->
          <!--</el-tag>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <el-table-column label="操作" width="140" fixed="right">
        <template slot-scope="scope">
          <!--<el-button size="small"-->
                     <!--@click="statusSubmit(scope.$index, scope.row)"-->
                     <!--:disabled="scope.row.status === -1">-->
            <!--{{ scope.row.status === 1 ? '停用' : scope.row.status === 0 ? '启用' : '已删除' }}-->
          <!--</el-button>-->
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">查看</el-button>
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
  </section>
</template>

<script>
  import util from '@/utils/js'

  const MODEL_NAME = 'Job' // API模块名

  export default {
    data () {
      return {
        // 列表表头数据
        tableColumn: [
          {
            prop: 'title',
            label: '岗位名称',
            width: 120,
            sortable: false
          },
          {
            prop: 'unit',
            label: '单位名称',
            width: 120,
            sortable: false
          },
          {
            prop: 'address',
            label: '工作地点',
            width: 120,
            sortable: false
          },
          {
            prop: 'salary',
            label: '薪资',
            width: 120,
            sortable: false
          },
          {
            prop: 'degree',
            label: '学历',
            width: 120,
            sortable: false
          },
          {
            prop: 'job_year',
            label: '工作年限',
            width: 120,
            sortable: false
          }
        ],
        // 搜索条件
        filters: {
          value: '',
          key: '',
          options: [
            {value: '', label: '全部'},
            {value: 'title', label: '岗位名称'},
//            {value: 'job_year', label: '工作年限'},
            {value: 'degree', label: '学历'}
//            {value: 'salary', label: '薪资'}
          ],
          salary: [
            {id: 1, name: '3k-5k'},
            {id: 2, name: '5k-10k'},
            {id: 3, name: '10k-15k'},
            {id: 4, name: '15k-20k'},
            {id: 5, name: '20k以上'}
          ],
          degree: [
            {id: 1, name: '大专及以下'},
            {id: 2, name: '本科'},
            {id: 3, name: '研究生及以上'}
          ],
          post_nature: [
            {id: 1, name: '正式岗位'},
            {id: 2, name: '实习岗位'}
          ],
          job_year: [
            {id: 1, name: '1年以下'},
            {id: 2, name: '1-3年'},
            {id: 3, name: '3-5年'},
            {id: 4, name: '5-10年'},
            {id: 5, name: '10年以上'}
          ],
          province_id: [],
          city_id: [],
          zone_id: []
        },
        list: [],
        p_list: [],
        selectProvinceRow: {
          id: '',
          province: ''
        },
        selectCityRow: {
          id: '',
          city: ''
        },
        selectZoneRow: {
          id: '',
          zone: ''
        },
        showCity: false,
        showZone: false,
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
        this.showCity = false
        this.showZone = false
        let params = {
//          p_id: this.selectRow.pid,
          page: this.page,
          key: this.filters.key, // 可选参数查询
          value: this.filters.value // 可选参数查询
//          degree: this.filters.degree.id
//          province_id: this.filters.province_id.id
        }
        const res = await this.$http.post(`${MODEL_NAME}/list`, params)
        this.listLoading = false
        if (res === null) return
        this.total = res.param.pages.total
        this.pagesize = res.param.pages.pagesize
        this.list = res.param.list
      },
      async getSearchData () {
        this.listLoading = true
        let params = {
//          p_id: this.selectRow.pid,
          page: this.page,
          key: this.filters.key, // 可选参数查询
          value: this.filters.value // 可选参数查询
        }
        const res = await this.$http.post(`${MODEL_NAME}/list`, params)
        this.listLoading = false
        if (res === null) return
        this.total = res.param.pages.total
        this.pagesize = res.param.pages.pagesize
        this.list = res.param.list
      },
      async getProvinceData () {
        const res = await this.$http.post(`/Sysinfo/province`, {})
        if (res === null) return
        this.filters.province_id = res.param
        this.filters.province_id.unshift({province: '全部', id: 0})
      },
      async getCityData (id) {
        const res = await this.$http.post(`/Sysinfo/city`, {
          province_id: id
        })
        if (res === null) return
        this.filters.city_id = res.param
        this.filters.city_id.unshift({city: '全部', id: 0})
      },
      async getZoneData (id) {
        const res = await this.$http.post(`/Sysinfo/zone`, {
          city_id: id
        })
        if (res === null) return
        this.filters.zone_id = res.param
        this.filters.zone_id.unshift({zone: '全部', id: 0})
      },
      handleProvinceChange (currentRow) {
        if (currentRow === 0) {
          this.showCity = false
          return
        }
        this.selectProvinceRow.id = currentRow
        this.getCityData(this.selectProvinceRow.id)
        this.showCity = true
      },
      handleCityChange (currentRow) {
        if (currentRow === 0) {
          this.showZone = false
          return
        }
        this.selectCityRow.id = currentRow
        this.getZoneData(this.selectCityRow.id)
        this.showZone = true
      },
//      handleZoneChange (currentRow) {
//        this.selectZoneRow.id = currentRow
//        this.getListData()
//      },
      // 删除
      handleDel (index, row) {
        this.$confirm('确认删除该记录吗?', '提示', {
          type: 'warning'
        }).then(async () => {
          let params = {
            id: row.id,
//            p_id: this.selectRow.pid,
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
        this.$router.push(`${this.$route.path}/edit/${row.id}`)
      },
      // 显示新增界面
      handleAdd () {
        console.log(this.$route.path)
        this.$router.push(`${this.$route.path}/add`)
      },
      // 修改状态
      async statusSubmit (index, row) {
        let params = {
          id: row.id,
//          p_id: this.selectRow.pid,
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
//            p_id: this.selectRow.pid,
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
//      this.getProvinceData()
    }
  }
</script>

<style lang='scss'>
</style>
