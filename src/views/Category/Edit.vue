<template>
  <div class="form-wrapper">
    <el-form :model="formData" label-width="120px" :rules="formRules" ref="formData">
      <el-form-item v-for="(item, index) in formItems"
                    :label="item.label"
                    :prop="item.prop"
                    :key="index">
        <!-- 普通文本、文本域 -->
        <el-input v-if="item.type === 'text' || item.type === 'textarea'"
                  :type="item.type"
                  v-model="formData[item.prop]"
                  :placeholder="item.placeholder ? item.placeholder : '请输入内容' "
                  auto-complete="off"></el-input>
        <!-- 数字 -->
        <el-input v-else-if="item.type === 'number'"
                  v-model.number="formData[item.prop]"
                  :placeholder="item.placeholder ? item.placeholder : '请输入内容' "
                  auto-complete="off"></el-input>
        <!-- 时间段 -->
        <el-row v-else-if="item.type === 'period'">
          <el-col :span="11">
            <el-form-item :prop="item.start_prop">
              <el-date-picker v-model.date="formData[item.start_prop]"
                              align="right"
                              type="datetime"
                              placeholder="选择开始日期"
                              style="width: 100%"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2">-</el-col>
          <el-col :span="11">
            <el-form-item :prop="item.end_prop">
              <el-date-picker v-model.date="formData[item.end_prop]"
                              align="right"
                              type="datetime"
                              placeholder="选择结束日期"
                              style="width: 100%"></el-date-picker>

            </el-form-item>
          </el-col>
        </el-row>
        <!-- 时间选择 -->
        <el-date-picker v-else-if="item.type === 'time'"
                        v-model.date="formData[item.prop]"
                        align="right"
                        type="datetime"
                        :placeholder="item.placeholder ? item.placeholder : '请选择时间' "
                        style="width: 100%"></el-date-picker>
        <!-- 单图片上传 -->
        <i-uploader v-else-if="item.type === 'upload'"
                    v-model="formData[item.prop]"></i-uploader>

        <!-- 选择器 -->
        <el-select v-else-if="item.type === 'select'"
                   v-model.number="formData[item.prop]"
                   :placeholder="item.placeholder ? item.placeholder : '请选择内容' ">
          <el-option :label="option[item.labelProp]"
                     :value="option[item.valueProp]"
                     :key="optionIndex"
                     v-for="(option, optionIndex) in options[item.option]"></el-option>
        </el-select>
        <!-- 经纬度 -->
        <el-row v-else-if="item.type === 'location'">
          <el-col :span="24">
            <el-row type="flex" justify="space-between">
              <el-col :span="11">
                <el-form-item prop="latitude">
                  <el-input placeholder="请输入内容" v-model.number="formData.latitude">
                    <template slot="prepend">经度</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="11" :offset="2">
                <el-form-item prop="longitude">
                  <el-input placeholder="请输入内容" v-model.number="formData.longitude">
                    <template slot="prepend">纬度</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <i-baidu-map :lng="formData.longitude" :lat="formData.latitude"
                         @success="locationSuccess"></i-baidu-map>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="图标类型">
        <el-radio-group size="large" v-model="formData.icon">
          <el-radio class="radio-item" label="qita"><i class="iconfont icon-qita tubiao"></i>其他</el-radio>
          <el-radio class="radio-item" label="dangzuzhiguanxi"><i class="iconfont icon-dangzuzhiguanxi tubiao"></i>党组织关系</el-radio>
          <el-radio class="radio-item" label="shehuibaoxian"><i class="iconfont icon-shehuibaoxian tubiao"></i>社会保险</el-radio>
          <el-radio class="radio-item" label="jinengpeixunyujianding"><i class="iconfont icon-jinengpeixunyujianding tubiao"></i>技能培训与鉴定</el-radio>
          <el-radio class="radio-item" label="laodongzhengyizhongcai"><i class="iconfont icon-laodongzhengyizhongcai tubiao"></i>劳动争议仲裁</el-radio>
          <el-radio class="radio-item" label="laodongbaozhangjiancha"><i class="iconfont icon-laodongbaozhangjiancha tubiao"></i>劳动保障监察</el-radio>
          <el-radio class="radio-item" label="laodongguanxi"><i class="iconfont icon-laodongguanxi tubiao"></i>劳动关系</el-radio>
          <el-radio class="radio-item" label="jiuyeyuzaijiuyeguanli"><i class="iconfont icon-jiuyeyuzaijiuyeguanli tubiao"></i>就业与再就业管理</el-radio>
          <el-radio class="radio-item" label="renshirencai"><i class="iconfont icon-renshirencai tubiao"></i>人事人才</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="图标颜色">
        <!--<div class="block">-->
        <el-row>
          <el-input v-model="formData.color"
                    placeholder="请输入颜色"
                    auto-complete="off"></el-input>
          <el-color-picker v-model="formData.color"></el-color-picker>
        </el-row>
        <!--</div>-->
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click.native="handleCancel">取消</el-button>
      <el-button type="primary" @click.native="formSubmit" :loading="formLoading">提交</el-button>
    </div>
  </div>
</template>

<script>
  const MODEL_NAME = 'Category' // http://api.zhongjiao.kfw001.com/webadmin/控制器/方法 -> 接口控制器名称
  export default {
    data () {
      return {
        /**
         * type 'text'(普通文本) 'number'(数值) 'textarea'(文本域)
         *      'period'(时间段)  --> start_prop / end_prop 对应 开始 / 结束 时间字段名称
         *      'time'(时间选择) 'upload'(图片上传) 'location'(经纬度)
         *      'select'(选择器)  --> option 字段对应 data 中 options 里字段名
         * prop 对应 formData 字段 和 validate 名称
         * label 对应表单名称
         * placeholder 对应提示信息
         */
        formItems: [
          {
            type: 'select',
            prop: 'p_id',
            label: '上级分类',
            option: 'p_id', // 下拉列表数据别名
            labelProp: 'c_name', // 下拉列表数组内元素 label 别名
            valueProp: 'id', // 下拉列表数组内元素 value 别名
            placeholder: '请输入内容'
          },
          {
            type: 'text',
            prop: 'c_name',
            label: '分类名称'
          }
//          {
//            type: 'text',
//            prop: 'icon',
//            label: 'icon名称'
//          },
//          {
//            type: 'text',
//            prop: 'color',
//            label: 'icon颜色'
//          }
        ],
        // 下拉列表数据
        options: {
          p_id: []
        },
        cat: [],
        list: [],
        color: '#20a0ff',
        formLoading: false,
        formRules: {
          p_id: [
            {
              type: 'number',
              required: true,
              message: '请选择父级名称',
              trigger: 'blur'
            }
          ],
          c_name: [{required: true, message: '请输入内容', trigger: 'blur'}],
          path: [{required: true, message: '请输入内容', trigger: 'blur'}]
        },
        // 新增界面数据
        formData: {
          p_id: '',
          c_name: '',
          path: '',
          icon: '',
          color: ''
        }
      }
    },
    methods: {
      handleCancel () {
        this.$router.back()
      },
      // 显示编辑界面
      async handleEdit (index, row) {
        let params = {
          id: this.$route.params.id,
          p_id: this.$route.params.pid
        }
        const res = await this.$http.post(`${MODEL_NAME}/info`, params)
        if (res === null) return
        this.formData = Object.assign({}, res.param.list)
      },
      async getArrayData () {
        const res = await this.$http.post(`${MODEL_NAME}/info`, {
          id: 0,
          p_id: this.$route.params.pid
        })
        if (res === null) return
        this.options.p_id = this.formateCategory(res.param.cat)
        console.log(this.options.p_id)
      },
      formateOptions (source) {
        let _data = []
        for (let key in source) {
          _data.push({label: source[key], value: key * 1})
        }
        return _data.slice(0)
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
          let tempObj = {
            id: item.id,
            pid: item.pid,
            c_name: _tag + item.c_name
          }
          select.push(tempObj)
        })
        return select.slice(0)
      },
      // 编辑
      formSubmit () {
        this.$refs.formData.validate(valid => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.formLoading = true
              let params = Object.assign(
                {p_id: this.$route.params.pid},
                this.formData
              )
              const res = await this.$http.post(`${MODEL_NAME}/update`, params)
              this.formLoading = false
              if (res === null) return
              this.$message({
                message: '修改成功',
                type: 'success'
              })
              this.handleCancel()
            })
          }
        })
      },
      selsChange (sels) {
        this.sels = sels
      }
    },
    mounted () {
      this.handleEdit()
      this.getArrayData()
    },
    components: {}
  }
</script>

<style lang='scss' scoped>
  .tubiao {
    font-size: 28px;
    padding: 0 10px;
  }
  .radio-item {
    display: block;
    margin-left: 0;
  }
  .icon-qita {
    color: #e6c667;
  }
  .icon-dangzuzhiguanxi {
    color: #e6a667;
  }
  .icon-shehuibaoxian {
    color: #a667e6;
  }
  .icon-jinengpeixunyujianding {
    color: #677ce6;
  }
  .icon-laodongzhengyizhongcai {
    color: #e66767;
  }
  .icon-laodongbaozhangjiancha {
    color: #e567e6;
  }
  .icon-laodongguanxi {
    color: #7c67e6;
  }
  .icon-jiuyeyuzaijiuyeguanli {
    color: #67a6e6;
  }
  .icon-renshirencai {
    color: #67b5e6;
  }
</style>
