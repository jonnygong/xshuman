<template>
  <div class="form-wrapper" style="width: 60%">
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
        <!--单选框-->
        <el-radio-group v-if="item.type === 'radio'" v-model="formData[item.prop]">
          <el-radio :label="option[item.valueProp]"
                    :key="optionIndex"
                    v-for="(option, optionIndex) in options[item.option]">{{ option[item.labelProp] }}</el-radio>
        </el-radio-group>
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
                        type="date"
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
      <el-form-item label="年龄范围">
        <el-row>
          <el-col :span="10">
            <el-form-item prop="start_age">
              <el-input v-model="formData.start_age"
                        type="text"
                        placeholder="请输入内容"
                        auto-complete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2">-</el-col>
          <el-col :span="10">
            <el-form-item prop="end_age">
              <el-input v-model="formData.end_age"
                        type="text"
                        placeholder="请输入内容"
                        auto-complete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2">岁</el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="工作经验">
        <el-row>
          <el-col :span="10">
            <el-form-item prop="start_job_year">
              <el-input v-model="formData.start_job_year"
                        type="text"
                        placeholder="请输入内容"
                        auto-complete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2">-</el-col>
          <el-col :span="10">
            <el-form-item prop="end_job_year">
              <el-input v-model="formData.end_job_year"
                        type="text"
                        placeholder="请输入内容"
                        auto-complete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2">年</el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="工作时间">
        <el-row>
          <el-col :span="10">
            <el-form-item prop="start_job_time">
              <el-time-select v-model="formData.start_job_time"
                              align="right"
                              :picker-options="{
                                start: '00:00',
                                step: '00:30',
                                end: '24:00'
                              }"
                              placeholder="选择开始时间"
                              style="width: 100%"></el-time-select>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2">-</el-col>
          <el-col :span="10">
            <el-form-item prop="end_job_time">
              <el-time-select v-model="formData.end_job_time"
                              align="right"
                              :picker-options="{
                                start: '00:00',
                                step: '00:30',
                                end: '24:00'
                              }"
                              placeholder="选择结束时间"
                              style="width: 100%"></el-time-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="薪资">
        <el-row>
          <el-col :span="10">
            <el-form-item prop="start_salary">
              <el-input v-model="formData.start_salary"
                        type="text"
                        placeholder="请输入内容"
                        auto-complete="off"></el-input>
            </el-form-item>
            <p style="color: #f00; font-size: 12px; line-height: 24px; margin: 0">*为空则默认为面谈</p>
          </el-col>
          <el-col class="line" :span="2">-</el-col>
          <el-col :span="10">
            <el-form-item prop="end_salary">
              <el-input v-model="formData.end_salary"
                        type="text"
                        placeholder="请输入内容"
                        auto-complete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2">k</el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="岗位要求" prop="job_require">
        <el-input v-model="formData.job_require"
                  type="textarea"
                  placeholder="请输入内容"
                  auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="工作地址" prop="work_address">
        <el-input v-model="formData.work_address"
                  type="textarea"
                  placeholder="请输入内容"
                  auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="contacts">
        <el-input v-model="formData.contacts"
                  placeholder="请输入内容"
                  auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="tel">
        <el-input v-model="formData.tel"
                  placeholder="请输入内容"
                  auto-complete="off"></el-input>
      </el-form-item>
      <!-- 富文本 -->
      <!--<el-form-item label="企业介绍" prop="intro">-->
        <!--<UE :defaultMsg="formData.intro" ref="ue"></UE>-->
      <!--</el-form-item>-->
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click.native="handleCancel">取消</el-button>
      <el-button type="primary" @click.native="formSubmit" :loading="formLoading">提交</el-button>
    </div>
  </div>
</template>

<script>
  import UE from '@/components/UEditor/UEditor'
  import Uploader from '@/components/Uploader/Uploader'
  import MutiUploader from '@/components/MutiUploader/MutiUploader'
  import BaiduMap from '@/components/BaiduMap/BaiduMap'

  const MODEL_NAME = 'Ejob' // http://api.zhongjiao.kfw001.com/webadmin/控制器/方法 -> 接口控制器名称

  export default {
    data () {
//      var validateContent = (rule, value, callback) => {
//        value = this.$refs['ue'].getUEContent()
//        if (value === '') {
//          callback(new Error('请输入内容'))
//        } else {
//          callback()
//        }
//      }
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
            type: 'number',
            prop: 'gap_num',
            label: '缺口人数'
          },
          {
            type: 'number',
            prop: 'pnum',
            label: '招聘人数'
          },
          {
            type: 'radio',
            prop: 'is_send',
            label: '是否派遣工',
            option: 'is_send', // 下拉列表数据别名
            labelProp: 'label', // 下拉列表数组内元素 label 别名
            valueProp: 'value' // 下拉列表数组内元素 value 别名
          },
          {
            type: 'radio',
            prop: 'degree',
            label: '学历',
            option: 'degree', // 下拉列表数据别名
            labelProp: 'label', // 下拉列表数组内元素 label 别名
            valueProp: 'value' // 下拉列表数组内元素 value 别名
          },
          {
            type: 'text',
            prop: 'email',
            label: '投递邮箱'
          },
          {
            type: 'text',
            prop: 'unit_name',
            label: '单位名称'
          },
          {
            type: 'textarea',
            prop: 'address',
            label: '单位地址'
          },
          {
            type: 'radio',
            prop: 'sex',
            label: '性别要求',
            option: 'sex', // 下拉列表数据别名
            labelProp: 'label', // 下拉列表数组内元素 label 别名
            valueProp: 'value' // 下拉列表数组内元素 value 别名
          }
//          {
//            type: 'select',
//            prop: 'degree',
//            label: '学历',
//            option: 'degree', // 下拉列表数据别名
//            labelProp: 'label', // 下拉列表数组内元素 label 别名
//            valueProp: 'value', // 下拉列表数组内元素 value 别名
//            placeholder: '请输入内容'
//          }
        ],
        // 下拉列表数据
        options: {
          degree: [
            {value: 1, label: '研究生'},
            {value: 2, label: '本科'},
            {value: 3, label: '大专及以下'}
          ],
          sex: [
            {value: 1, label: '男'},
            {value: 2, label: '女'},
            {value: 3, label: '不限'}
          ],
          is_send: [
            {value: 1, label: '是'},
            {value: 2, label: '否'}
          ]
        },
        list: [],
        formLoading: false,
        formRules: {
          title: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          pnum: [
            {type: 'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
          gap_num: [
            {type: 'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
          is_send: [
            {type: 'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
          sex: [
            {type: 'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
          address: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          unit_name: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          email: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          degree: [
            {type: 'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
//          start_salary: [
//            {required: true, message: '请输入内容', trigger: 'blur'}
//          ],
//          end_salary: [
//            {required: true, message: '请输入内容', trigger: 'blur'}
//          ],
          start_job_year: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          end_job_year: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          start_job_time: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          end_job_time: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          start_age: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          end_age: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ]
        },
        // 新增界面数据
        formData: {
          title: '',
          pnum: '',
          degree: '',
          salary: '',
          job_year: '',
          age: '',
          job_time: '',
          address: '',
          email: '',
          unit_name: '',
          gap_num: '',
          is_send: '',
          work_address: '',
          contacts: '',
          tel: '',
          sex: '',
          job_require: '',
          start_salary: '',
          end_salary: '',
          start_job_year: '',
          end_job_year: '',
          start_job_time: '',
          end_job_time: '',
          start_age: '',
          end_age: ''
        }
      }
    },
    methods: {
      handleCancel () {
        this.$router.back()
      },
//      async getArrayData () {
//        const res = await this.$http.post(`${MODEL_NAME}/info`, {
//          id: 0,
//          p_id: this.$route.params.pid
//        })
//        if (res === null) return
//        this.options.p_id = this.formateCategory(res.param.cat)
//        console.log(this.options.p_id)
//        // this.list = res.param.list
//        // 搜索选项
//        // this.filters.options.type = this.formateOptions(res.param.type)
//        // this.filters.options.type.unshift({label: '全部分类', value: ''})
//      },
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
      // UEditor 获取内容，传入 ref 的值
      getUEContent (ele) {
        return this.$refs[ele].getUEContent()
      },
      // 新增
      formSubmit () {
        this.$refs.formData.validate(valid => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.formLoading = true
              let params = Object.assign({
                eid: this.$route.params.eid
              }, this.formData)
//              params.intro = this.getUEContent('ue') // 富文本内容
              params.salary = [this.formData.start_salary, this.formData.end_salary]
              params.job_year = [this.formData.start_job_year, this.formData.end_job_year]
              params.job_time = [this.formData.start_job_time, this.formData.end_job_time]
              params.age = [this.formData.start_age, this.formData.end_age]
              const res = await this.$http.post(`${MODEL_NAME}/add`, params)
              this.formLoading = false
              if (res === null) return
              this.$message({
                message: '新建成功',
                type: 'success'
              })
              this.handleCancel()
            })
          }
        })
      }
    },
    mounted () {
      // this.getArrayData()
    },
    components: {
      UE,
      'i-uploader': Uploader,
      'i-baidu-map': BaiduMap,
      'i-muti-uploader': MutiUploader
    }
  }
</script>

<style lang='scss' scoped>

</style>
