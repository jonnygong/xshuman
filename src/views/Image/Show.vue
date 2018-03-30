<template>
  <section>
    <!--工具条-->
    <!--<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">-->
    <!--<el-form :inline="true" :model="filters">-->
    <!--<el-form-item>-->
    <!--<el-input v-model="filters.value" placeholder="关键词"></el-input>-->
    <!--</el-form-item>-->
    <!--<el-form-item>-->
    <!--<el-select v-model="filters.key" placeholder="请选择搜索字段">-->
    <!--<el-option-->
    <!--v-for="(item,index) in filters.options"-->
    <!--:key="index"-->
    <!--:label="item.label"-->
    <!--:value="item.value">-->
    <!--</el-option>-->
    <!--</el-select>-->
    <!--</el-form-item>-->
    <!--<el-form-item>-->
    <!--<el-button type="primary"-->
    <!--icon="search"-->
    <!--@click="getListData">搜索-->
    <!--</el-button>-->
    <!--</el-form-item>-->
    <!--<el-form-item>-->
    <!--<el-button type="primary"-->
    <!--@click="getListData">刷新-->
    <!--</el-button>-->
    <!--</el-form-item>-->
    <!--<el-form-item>-->
    <!--<el-button type="primary"-->
    <!--@click="handleAdd">新增-->
    <!--</el-button>-->
    <!--</el-form-item>-->
    <!--</el-form>-->
    <!--</el-col>-->

    <!--列表-->
    <el-tabs v-model="editableTabsValue" type="card" editable @edit="handleTabsEdit">
      <el-tab-pane
        :key="item.name"
        v-for="(item, index) in editableTabs"
        :label="item.title"
        :name="item.name"
      >
        {{item.content}}
        <el-row>
          <el-col :span="5" v-for="(o, index) in 6" :key="o" :offset="index > 0 ? 1 : 0">
            <el-card :body-style="{ padding: '0px' }">
              <img src="http://kfw-mp.oss-cn-hangzhou.aliyuncs.com/system/2018-03-21/5ab2161aebf55.jpg" class="image">
              <div style="padding: 14px;">
                <span>好吃的汉堡</span>
                <div class="bottom clearfix">
                  <time class="time">2018-03-29 17:44</time>
                  <el-button type="text" class="button">操作按钮</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>


  </section>
</template>

<script>
  import util from '@/utils/js'

  const MODEL_NAME = 'Hospital' // API模块名

  export default {
    data () {
      return {
        editableTabsValue: '2',
        editableTabs: [{
          title: 'Tab 1',
          name: '1',
          content: 'Tab 1 content'
        }, {
          title: 'Tab 2',
          name: '2',
          content: 'Tab 2 content'
        }],
        tabIndex: 2,
        // 列表表头数据
        tableColumn: [
          {
            prop: 'id',
            label: 'ID',
            width: 80,
            sortable: true
          },
          {
            prop: 'name',
            label: '招租名称',
            width: 120,
            sortable: false
          }
        ],
        // 搜索条件
        filters: {
          value: '',
          key: 'name',
          options: [
            {value: 'name', label: '名称'}
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
      handleTabsEdit (targetName, action) {
        if (action === 'add') {
          let newTabName = ++this.tabIndex + ''
          this.editableTabs.push({
            title: 'New Tab',
            name: newTabName,
            content: 'New Tab content'
          })
          this.editableTabsValue = newTabName
        }
        if (action === 'remove') {
          let tabs = this.editableTabs
          let activeName = this.editableTabsValue
          if (activeName === targetName) {
            tabs.forEach((tab, index) => {
              if (tab.name === targetName) {
                let nextTab = tabs[index + 1] || tabs[index - 1]
                if (nextTab) {
                  activeName = nextTab.name
                }
              }
            })
          }

          this.editableTabsValue = activeName
          this.editableTabs = tabs.filter(tab => tab.name !== targetName)
        }
      },

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
          value: this.filters.value // 可选参数查询
        }
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
  .time {
    font-size: 13px;
    color: #999;
  }

  .bottom {
    margin-top: 13px;
    line-height: 12px;
  }

  .button {
    padding: 0;
    float: right;
  }

  .image {
    width: 100%;
    display: block;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }

  .clearfix:after {
    clear: both
  }
</style>
