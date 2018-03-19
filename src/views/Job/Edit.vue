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
      <!--<el-form-item label="省份" v-model="formData.province_id">-->
        <!--<el-input placeholder="请输入内容" auto-complete="off" :value="`${options.province_id[formData.province_id]}`">-->
        <!--</el-input>-->
      <!--</el-form-item>-->
      <!--<el-form-item label="城市" v-model="formData.city_id">-->
        <!--<el-input placeholder="请输入内容" auto-complete="off" :value="`${options.city_id[formData.city_id]}`">-->
        <!--</el-input>-->
      <!--</el-form-item>-->
      <!--<el-form-item label="区域" v-model="formData.zone_id">-->
        <!--<el-input placeholder="请输入内容" auto-complete="off" :value="`${options.zone_id[formData.zone_id]}`">-->
        <!--</el-input>-->
      <!--</el-form-item>-->
    </el-form>
    <!--<div slot="footer" class="dialog-footer">-->
    <!--<el-button @click.native="handleCancel">取消</el-button>-->
    <!--<el-button type="primary" @click.native="formSubmit" :loading="formLoading">提交</el-button>-->
    <!--</div>-->
  </div>
</template>

<script>
  const MODEL_NAME = 'Job' // http://api.zhongjiao.kfw001.com/webadmin/控制器/方法 -> 接口控制器名称

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
            type: 'text',
            prop: 'title',
            label: '岗位名称'
          },
          {
            type: 'text',
            prop: 'unit',
            label: '单位名称'
          },
          {
            type: 'text',
            prop: 'address',
            label: '工作地点'
          },
          {
            type: 'select',
            prop: 'salary',
            label: '薪资范围',
            option: 'salary', // 下拉列表数据别名
            labelProp: 'name', // 下拉列表数组内元素 label 别名
            valueProp: 'id', // 下拉列表数组内元素 value 别名
            placeholder: '请输入内容'
          },
          {
            type: 'select',
            prop: 'degree',
            label: '学历',
            option: 'degree', // 下拉列表数据别名
            labelProp: 'name', // 下拉列表数组内元素 label 别名
            valueProp: 'id', // 下拉列表数组内元素 value 别名
            placeholder: '请输入内容'
          },
          {
            type: 'select',
            prop: 'job_year',
            label: '工作年限',
            option: 'job_year', // 下拉列表数据别名
            labelProp: 'name', // 下拉列表数组内元素 label 别名
            valueProp: 'id', // 下拉列表数组内元素 value 别名
            placeholder: '请输入内容'
          },
          {
            type: 'text',
            prop: 'job_time',
            label: '工作时间'
          },
          {
            type: 'text',
            prop: 'email',
            label: '邮箱地址'
          },
          {
            type: 'textarea',
            prop: 'intro',
            label: '岗位介绍'
          }
//        {
//          type: 'select',
//          prop: 'province_id',
//          label: '省份',
//          option: 'province_id', // 下拉列表数据别名
//          labelProp: 'province', // 下拉列表数组内元素 label 别名
//          valueProp: 'id', // 下拉列表数组内元素 value 别名
//          placeholder: '请输入内容'
//        },
//        {
//          type: 'select',
//          prop: 'city_id',
//          label: '城市',
//          option: 'city_id', // 下拉列表数据别名
//          labelProp: 'city', // 下拉列表数组内元素 label 别名
//          valueProp: 'id', // 下拉列表数组内元素 value 别名
//          placeholder: '请输入内容'
//        },
//        {
//          type: 'select',
//          prop: 'zone_id',
//          label: '区域',
//          option: 'zone_id', // 下拉列表数据别名
//          labelProp: 'zone', // 下拉列表数组内元素 label 别名
//          valueProp: 'id', // 下拉列表数组内元素 value 别名
//          placeholder: '请输入内容'
//        }
        ],
        // 下拉列表数据
        options: {
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
        cat: [],
        list: [],
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
          id: this.$route.params.id
//        p_id: this.$route.params.pid
        }
        const res = await this.$http.post(`${MODEL_NAME}/info`, params)
        if (res === null) return
        this.formData = Object.assign({}, res.param)
//        Promise.all([this.getProvinceData(), this.getCityData(res.param.province_id), this.getZoneData(res.param.city_id)]).then(() => {
//          this.formData = Object.assign({}, res.param)
//        })
      },
      async getProvinceData () {
        const res = await this.$http.post(`/Sysinfo/province`, {})
        if (res === null) return
//      this.options.province_id = res.param
//      this.options.province_id.unshift({province: '未选择', id: 0})
        res.param.forEach(item => {
          this.options.province_id[item.id] = item.province
        })
        this.options.province_id[0] = '无'
        console.log(this.options.province_id[this.formData.province_id])
//        this.getCityData(res.param.province_id)
        Promise.resolve()
      },
      async getCityData (id) {
        const res = await this.$http.post(`/Sysinfo/city`, {
          province_id: id
        })
        if (res === null) {
          this.options.city_id[0] = '无'
        } else {
          res.param.forEach(item => {
            this.options.city_id[item.id] = item.city
          })
          this.options.city_id[0] = '无'
        }
//      this.options.city_id = this.formateCategory(res.param)
//      this.options.city_id.unshift({province: '未选择', id: 0})
        Promise.resolve()
      },
      async getZoneData (id) {
        const res = await this.$http.post(`/Sysinfo/zone`, {
          city_id: id
        })
        if (res === null) {
          this.options.zone_id[0] = '无'
        } else {
          res.param.forEach(item => {
            this.options.zone_id[item.id] = item.zone
          })
          this.options.zone_id[0] = '无'
        }
//      this.options.zone_id = this.formateCategory(res.param)
//      this.options.zone_id.unshift({province: '未选择', id: 0})
        Promise.resolve()
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
//    this.getArrayData()
    },
    components: {}
  }
</script>

<style lang='scss' scoped>

</style>
