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
      <el-form-item label="添加题目">
        <template>
          <el-button type="primary" @click="singleVisible = true">单选题</el-button>
          <el-button type="primary" @click="multipleVisible = true">多选题</el-button>
          <el-button type="primary" @click="textVisible = true">文本题</el-button>
        </template>
      </el-form-item>
      <el-form-item label="问卷题目" class="question-item">
        <template>
          <p v-if="form.length == 0" style="margin: 0;">一点东西都没有，赶快点击上方按钮添加题目吧！</p>
          <el-row v-for="(item, index) in form" :key="index">
            <el-col :span="24">
              <el-row>
                <el-col :span="6" style="margin-top: -15px;">
                  <p class="question-hover">Q{{ index + 1 }}:  {{ item.title }} <i
                    class="el-icon-delete question-action" @click="delQuestion(index)"></i></p>
                  <!--<div class="question-action" >-->
                  <!--<el-button icon="delete" size="small"-->
                  <!--@click="delOption(singleForm)"></el-button>-->
                  <!--</div>-->
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="18">
                  <div v-if="item.type === 1">
                    <div class="single-option question-hover" v-for="(option, index) in item.options" :key="index">
                      <el-radio :label="option" disabled>
                      </el-radio>
                      <i class="el-icon-delete question-action" @click="delOption(item.options, index)"></i>
                    </div>
                  </div>
                  <div v-if="item.type === 2">
                    <el-checkbox-group class="question-hover" v-for="(option, index) in item.options" :key="index">
                      <el-checkbox :label="option" disabled></el-checkbox>
                      <i class="el-icon-delete question-action" @click="delOption(item.options, index)"></i>
                    </el-checkbox-group>
                  </div>
                  <div v-if="item.type === 3">
                    <el-input auto-complete="off" disabled></el-input>
                  </div>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
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
          <el-input v-model="singleForm.title" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="选项" :label-width="formLabelWidth">
          <div class="option-item" v-for="(option, index) in singleForm.options" :key="index">
            <el-row>
              <el-col :span="19">
                <el-input v-model="singleForm.options[index]" :key="index" placeholder="请输入选项内容"
                          style="display:inline-block" auto-complete="off"></el-input>
              </el-col>
              <el-col :span="5">
                <div class="option-btn" style="width: 180px;">
                  <el-button type="success" icon="plus" size="small"
                             @click="addOption(singleForm)"></el-button>
                  <el-button type="warning" icon="close" size="small"
                             @click="delOption(singleForm.options, index)"></el-button>
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
          <el-input v-model="multipleForm.title" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="选项" :label-width="formLabelWidth">
          <div class="option-item" v-for="(option, index) in multipleForm.options" :key="index">
            <el-row>
              <el-col :span="20">
                <el-input v-model="multipleForm.options[index]" :key="index" placeholder="请输入选项内容"
                          style="display:inline-block" auto-complete="off"></el-input>
              </el-col>
              <el-col :span="4">
                <div class="option-btn" style="width: 180px;">
                  <el-button type="success" icon="plus" size="small"
                             @click="addOption(multipleForm)"></el-button>
                  <el-button type="warning" icon="close" size="small"
                             @click="delOption(multipleForm.options, index)"></el-button>
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
          <el-input v-model="textForm.title" auto-complete="off"></el-input>
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

  const MODEL_NAME = 'Cms' // http://api.zhongjiao.kfw001.com/webadmin/控制器/方法 -> 接口控制器名称

  export default {
    data () {
      var validateContent = (rule, value, callback) => {
        value = this.$refs['ue'].getUEContent()
        if (value === '') {
          callback(new Error('请输入内容'))
        } else {
          callback()
        }
      }
      return {
        dialogTableVisible: false,
        singleVisible: false,
        multipleVisible: false,
        textVisible: false,
        form: [],
        singleForm: {
          type: 1,
          title: '',
          options: ['']
        },
        multipleForm: {
          type: 2,
          title: '',
          options: ['']
        },
        textForm: {
          type: 3,
          title: ''
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
            type: 'text',
            prop: 'title',
            label: '问卷标题'
          },
          {
            type: 'textarea',
            prop: 'content',
            label: '问卷描述'
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
          sale_status: [
            {type: 'number', required: true, message: '请选择区域', trigger: 'blur'}
          ],
          cover: [
            {required: true, message: '请上传封面图片'}
          ],
          title: [
            {required: true, message: '请输入项目标题', trigger: 'blur'}
          ],
          start_time: [
            {type: 'date', required: true, message: '请输入开始时间', trigger: 'blur'}
          ],
          end_time: [
            {type: 'date', required: true, message: '请输入结束时间', trigger: 'blur'}
          ],
          avg_price: [
            {type: 'number', required: true, message: '请输入均价', trigger: 'blur'}
          ],
          latitude: [
            {type: 'number', required: true, message: '请选择纬度', trigger: 'blur'}
          ],
          longitude: [
            {type: 'number', required: true, message: '请选择经度', trigger: 'blur'}
          ],
          detail: [
            {validator: validateContent, trigger: 'blur'}
          ]
        },
        // 新增界面数据
        formData: {
          title: '',
          avg_price: '',
          info: '',
          cover: '',
          images: '',
          latitude: 0,
          longitude: 0,
          detail: '',
          start_time: '',
          end_time: '',
          sale_status: ''
        }
      }
    },
    methods: {
      // 百度地图定位成功后的回调
      locationSuccess (data) {
        this.formData.longitude = data.lng
        this.formData.latitude = data.lat
      },
      handleCancel () {
        this.$router.back()
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
      // 新增
      formSubmit () {
        this.$refs.formData.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.formLoading = true

              let params = Object.assign({}, this.formData)
              params.detail = this.getUEContent('detail') // 富文本内容
              params.images = this.getImageList('album') // 多图上传
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
      },
      // 新增选项
      addOption (source) {
        source.options.push('')
      },
      submitCheckbox (name) {
        if (this.validQuestion(this.singleForm)) {
          const data = Object.assign({}, this.singleForm)
          this.$store.dispatch('addMultiple', data)
          this.singleVisible = false
          this.multipleVisible = false
          this.textVisible = false
        }
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
        this.form.splice(index, 1)
      },
      addSingle () {
        this.form.push(this.singleForm)
        this.singleForm = {type: 1, title: '', options: ['']}
        this.singleVisible = false
      },
      addMultiple () {
        this.form.push(this.multipleForm)
        this.multipleForm = {type: 2, title: '', options: ['']}
        this.multipleVisible = false
      },
      addText () {
        this.form.push(this.textForm)
        this.textForm = {type: 3, title: ''}
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
