<template>
  <div class="form-wrapper">
    <el-form :model="formData" label-width="120px" :rules="formRules" ref="formData">
      <el-form-item label="标题" prop="title">
        <el-input v-model="formData.title"
                  placeholder="请输入内容"
                  @change="changeShareTitle"
                  auto-complete="off"></el-input>
      </el-form-item>
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
                              style="width: 100%;"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2">-</el-col>
          <el-col :span="11">
            <el-form-item :prop="item.end_prop">
              <el-date-picker v-model.date="formData[item.end_prop]"
                              align="right"
                              type="datetime"
                              placeholder="选择结束日期"
                              style="width: 100%;"></el-date-picker>

            </el-form-item>
          </el-col>
        </el-row>
        <!-- 时间选择 -->
        <el-date-picker v-else-if="item.type === 'time'"
                        v-model.date="formData[item.prop]"
                        align="right"
                        type="datetime"
                        :placeholder="item.placeholder ? item.placeholder : '请选择时间' "
                        style="width: 100%;"></el-date-picker>
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
      <!--<el-form-item label="添加题目">-->
        <!--<template>-->
          <!--<el-button type="primary" @click="singleVisible = true">单选题</el-button>-->
          <!--<el-button type="primary" @click="multipleVisible = true">多选题</el-button>-->
          <!--&lt;!&ndash;<el-button type="primary" @click="textVisible = true">文本题</el-button>&ndash;&gt;-->
        <!--</template>-->
      <!--</el-form-item>-->
      <el-form-item label="问卷题目" class="question-item">
        <template>
          <p v-if="formData.survey_arr.length == 0" style="margin: 0;">一点东西都没有，赶快点击上方按钮添加题目吧！</p>
          <el-row v-for="(item, index) in formData.survey_arr" :key="index">
            <el-col :span="24">
              <el-row>
                <el-col :span="12" style="margin-top: -15px;">
                  <p class="question-hover">Q{{ index + 1 }}:
                    <span v-if="item.q_status === 1">（单选）</span>
                    <span v-if="item.q_status === 0">（多选）</span>
                    <el-input type="textarea" v-model="item.q_content" :value="item.q_content" placeholder="请输入题目内容"></el-input>
                  </p>
                  <!--<div class="question-action" >-->
                  <!--<el-button icon="delete" size="small"-->
                  <!--@click="delOption(singleForm)"></el-button>-->
                  <!--</div>-->
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <div v-if="item.q_status === 1">
                    <div class="single-option question-hover" v-for="(option, index) in item.answer_arr" :key="index">
                      <!--<el-radio :label="option.a_content" disabled>-->
                      <!--</el-radio>-->
                      <!--<i class="el-icon-caret-right"></i>-->
                      <el-input v-model="option.a_content" :value="option.a_content" placeholder="请输入选项内容" style="padding: 5px 0"></el-input>
                      <!--<i class="el-icon-delete question-action" @click="delOption(item.answer_arr, index)"></i>-->
                    </div>
                  </div>
                  <div v-if="item.q_status === 0">
                    <el-checkbox-group class="question-hover" v-for="(option, index) in item.answer_arr" :key="index">
                      <!--<el-checkbox :label="option.a_content" disabled></el-checkbox>-->
                      <el-input v-model="option.a_content" :value="option.a_content" placeholder="请输入选项内容" style="padding: 5px 0"></el-input>
                      <!--<i class="el-icon-delete question-action" @click="delOption(item.answer_arr, index)"></i>-->
                    </el-checkbox-group>
                  </div>
                  <div v-if="item.q_status === 2">
                    <el-input auto-complete="off" disabled></el-input>
                  </div>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-form-item>
      <el-form-item label="分享标题" prop="share_title">
        <el-input v-model="formData.share_title"
                  placeholder="请输入内容"
                  auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="分享图片" prop="share_img">
        <i-uploader v-model="formData.share_img"></i-uploader>
      </el-form-item>
      <el-form-item label="分享描述" prop="share_describe">
        <el-input v-model="formData.share_describe"
                  placeholder="请输入内容"
                  auto-complete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click.native="handleCancel">取消</el-button>
      <el-button type="primary" @click.native="formSubmit" :loading="formLoading">提交</el-button>
      <!--<el-button type="primary" @click="singleVisible = true" :loading="formLoading">添加题目</el-button>-->
    </div>

    <!--单选题-->
    <el-dialog title="添加单选题" :visible.sync="singleVisible">
      <el-form :model="singleForm">
        <el-form-item label="题目说明" :label-width="formLabelWidth">
          <el-input v-model="singleForm.q_content" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="选项" :label-width="formLabelWidth">
          <div class="option-item" v-for="(option, index) in singleForm.answer_arr" :key="index">
            <el-row>
              <el-col :span="19">
                <el-input v-model="option.a_content" :key="index" placeholder="请输入选项内容"
                          style="display:inline-block" auto-complete="off"></el-input>
              </el-col>
              <el-col :span="5">
                <div class="option-btn" style="width: 180px;">
                  <el-button type="success" icon="plus" size="small"
                             @click="addOption(singleForm)"></el-button>
                  <el-button type="warning" icon="close" size="small"
                             @click="delOption(singleForm.answer_arr, index)"></el-button>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="singleVisible = false">取 消</el-button>
        <el-button type="primary" @click="addSingle">确 定</el-button>
      </div>
    </el-dialog>

    <!--多选题-->
    <el-dialog title="添加多选题" :visible.sync="multipleVisible">
      <el-form :model="multipleForm">
        <el-form-item label="题目说明" :label-width="formLabelWidth">
          <el-input v-model="multipleForm.q_content" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="选项" :label-width="formLabelWidth">
          <div class="option-item" v-for="(option, index) in multipleForm.answer_arr" :key="index">
            <el-row>
              <el-col :span="20">
                <el-input v-model="option.a_content" :key="index" placeholder="请输入选项内容"
                          style="display:inline-block" auto-complete="off"></el-input>
              </el-col>
              <el-col :span="4">
                <div class="option-btn" style="width: 180px;">
                  <el-button type="success" icon="plus" size="small"
                             @click="addOption(multipleForm)"></el-button>
                  <el-button type="warning" icon="close" size="small"
                             @click="delOption(multipleForm.answer_arr, index)"></el-button>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="multipleVisible = false">取 消</el-button>
        <el-button type="primary" @click="addMultiple">确 定</el-button>
      </div>
    </el-dialog>

    <!--文本题-->
    <el-dialog title="添加文本题" :visible.sync="textVisible">
      <el-form :model="textForm">
        <el-form-item label="题目说明" :label-width="formLabelWidth">
          <el-input v-model="textForm.q_content" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="textVisible = false">取 消</el-button>
        <el-button type="primary" @click="addText">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import UE from '@/components/UEditor/UEditor'
  import Uploader from '@/components/Uploader/Uploader'
  import MutiUploader from '@/components/MutiUploader/MutiUploader'
  import BaiduMap from '@/components/BaiduMap/BaiduMap'

  const MODEL_NAME = 'Survey' // http://api.zhongjiao.kfw001.com/webadmin/控制器/方法 -> 接口控制器名称

  export default {
    data () {
      // 富文本校验
//      var validateContent = (rule, value, callback) => {
//        value = this.$refs['ue'].getUEContent()
//        if (value === '') {
//          callback(new Error('请输入内容'))
//        } else {
//          callback()
//        }
//      }
      return {
        dialogTableVisible: false,
        singleVisible: false,
        multipleVisible: false,
        textVisible: false,
        form: [],
        singleForm: {
          q_status: 1,
          q_content: '',
          answer_arr: [{id: 0, a_content: ''}]
        },
        multipleForm: {
          q_status: 0,
          q_content: '',
          answer_arr: [{id: 0, a_content: ''}]
        },
        textForm: {
          q_status: 2,
          q_content: ''
        },
        formLabelWidth: '120px',
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
            type: 'textarea',
            prop: 'intro',
            label: '问卷介绍'
          },
          {
            type: 'period',
            start_prop: 'start_time',
            end_prop: 'end_time',
            label: '时间段'
          }
        ],
        // 下拉列表数据
        options: {
          sale_status: [
            {value: 2, label: '在售'},
            {value: 1, label: '未售'}
          ],
          type: []
        },
        formLoading: false,
        formRules: {
          title: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          intro: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          start_time: [
            {type: 'date', required: true, message: '请输入开始时间', trigger: 'blur'}
          ],
          end_time: [
            {type: 'date', required: true, message: '请输入结束时间', trigger: 'blur'}
          ]
        },
        // 新增界面数据
        formData: {
          title: '',
          intro: '',
          start_time: '',
          end_time: '',
          status: 1,
          share_img: '',
          share_title: '',
          share_describe: '',
          survey_arr: []
        }
      }
    },
    methods: {
      // 百度地图定位成功后的回调
      locationSuccess (data) {
        this.formData.longitude = data.lng
        this.formData.latitude = data.lat
      },
      changeShareTitle () {
        this.formData.share_title = this.formData.title
      },
      handleCancel () {
        this.$router.back()
      },
      // 显示编辑界面
      async handleEdit (index, row) {
        let params = {
          id: this.$route.params.id
        }
        const res = await this.$http.post(`${MODEL_NAME}/info`, params)
        if (res === null) return
        this.formData = Object.assign({}, res.param)
        this.formData.start_time = new Date(this.formData.start_time)
        this.formData.end_time = new Date(this.formData.end_time)
      },
      async getArrayData () {
        const res = await this.$http.post(`${MODEL_NAME}/array`)
        if (res === null) return
        this.array = res.param
        // 搜索选项
        this.filters.options.type = this.formateOptions(res.param.type)
        this.filters.options.type.unshift({label: '全部分类', value: ''})
      },
      formateOptions (source) {
        let _data = []
        for (let key in source) {
          _data.push({label: source[key], value: key * 1})
        }
        return _data.slice(0)
      },
      // 编辑
      formSubmit () {
        this.$refs.formData.validate(valid => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.formLoading = true
              // 处理时间为时间戳
              let startTime = this.formData.start_time
              if (typeof this.formData.start_time === 'number') {
                startTime = parseInt(this.formData.start_time / 1000)
              } else {
                startTime = parseInt(new Date(this.formData.start_time).getTime() / 1000)
              }
              let endTime = this.formData.end_time
              if (typeof this.formData.end_time === 'number') {
                endTime = parseInt(this.formData.end_time / 1000)
              } else {
                endTime = parseInt(new Date(this.formData.end_time).getTime() / 1000)
              }
              let params = Object.assign({}, this.formData)
              params.start_time = startTime // 后台接收10位时间戳，需要转换
              params.end_time = endTime // 后台接收10位时间戳，需要转换
              params.survey_arr = JSON.stringify(this.formData.survey_arr)
//              params.detail = this.getUEContent('ue') // 富文本内容
//              params.images = this.getImageList('album') // 多图上传
              const res = await this.$http.post(`${MODEL_NAME}/actupdate`, params)
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
      },
      // 新增选项
      addOption (source) {
        source.answer_arr.push({a_content: ''})
      },
      // 删除选项
      delOption (source, index) {
        if (source.length > 1) {
          source.splice(index, 1)
        } else {
          this.$message({
            message: '最后一个啦！',
            type: 'warning'
          })
        }
      },
      delQuestion (index) {
        this.formData.survey_arr.splice(index, 1)
      },
      addSingle () {
        this.formData.survey_arr.push(this.singleForm)
        this.singleForm = {q_status: 1, q_content: '', answer_arr: [{a_content: ''}]}
        this.singleVisible = false
      },
      addMultiple () {
        this.formData.survey_arr.push(this.multipleForm)
        this.multipleForm = {q_status: 0, q_content: '', answer_arr: [{a_content: ''}]}
        this.multipleVisible = false
      },
      addText () {
        this.formData.survey_arr.push(this.textForm)
        this.textForm = {q_status: 2, q_content: ''}
        this.textVisible = false
      },
      // UEditor 获取内容，传入 ref 的值
      getUEContent (ele) {
        return this.$refs[ele].getUEContent()
      },
      // 多图上传获取内容，传入 ref 的值
      getImageList (ele) {
        return this.$refs[ele].getImageList()
      }
    },
    mounted () {
      this.handleEdit()
    },
    components: {
      UE,
      'i-uploader': Uploader,
      'i-baidu-map': BaiduMap,
      'i-muti-uploader': MutiUploader
    }
  }
</script>

<style lang="scss" scoped>
  .option-btn {
    padding-left: 10px;
  }

  .option-item {
    padding: 5px 0;
  }

  .option-addtion {
    height: 30px;
    line-height: 30px;
  }

  .add-button button {
    margin: 0 10px;
  }

  .question-action {
    display: none;
    margin-left: 30px;
  }

  .question-hover:hover .question-action {
    display: inline-block;
  }

  .question-action {
    cursor: pointer;
  }
</style>
