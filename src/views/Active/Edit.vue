<template>
  <div class="form-wrapper">
    <el-form :model="formData" label-width="120px" :rules="formRules" ref="formData">
      <el-form-item label="活动名称" prop="title">
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
      <!-- 多图片上传 -->
      <el-form-item label="活动图片" prop="cover">
        <i-muti-uploader :value="formData.cover" ref="album"></i-muti-uploader>
      </el-form-item>
      <!-- 富文本 -->
      <el-form-item label="活动介绍" prop="intro">
        <el-col>
            <el-row :span="12">
              <UE :defaultMsg="formData.intro" ref="ue"></UE>
              <!--<div id="WangEditor"></div>-->
              <!--<vue-editor useCustomImageHandler @imageAdded="handleImageAdded" v-model="formData.intro"></vue-editor>-->
            </el-row>
            <el-row :span="12">
              <el-button class="showUEContent" type="primary" @click="showUEContent">预览</el-button>
            </el-row>
          </el-col>
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
                  type="textarea"
                  placeholder="请输入内容"
                  auto-complete="off"></el-input>
      </el-form-item>

      <el-dialog title="富文本内容预览" :visible.sync="dialogTableVisible">
        <template>
          <div class="UEimg">
            <img :src='formData.img' alt='富文本内容预览' />
          </div>
        </template>
      </el-dialog>
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
  import { VueEditor } from 'vue2-editor'
  import WangEditor from 'wangeditor'

  const MODEL_NAME = 'Active' // http://api.zhongjiao.kfw001.com/webadmin/控制器/方法 -> 接口控制器名称

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
//          {
//            type: 'text',
//            prop: 'title',
//            label: '活动名称'
//          },
          {
            type: 'period',
            start_prop: 'start_time',
            end_prop: 'end_time',
            label: '活动时间'
          },
          {
            type: 'period',
            start_prop: 'poll_start_time',
            end_prop: 'poll_end_time',
            label: '报名时间'
          },
          // {
          //   type: 'upload',
          //   prop: 'cover',
          //   label: '活动图片'
          // },
          {
            type: 'text',
            prop: 'company',
            label: '所属公司'
          },
          {
            type: 'number',
            prop: 'total_num',
            label: '总人数'
          },
          {
            type: 'number',
            prop: 'pre_num',
            label: '每单位可报人数'
          }
        ],
        // 下拉列表数据
        options: {
          p_id: []
        },
        cat: [],
        list: [],
        formLoading: false,
        formRules: {
          total_num: [
            {type: 'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
          pre_num: [
            {type: 'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
          cover: [{required: true, message: '请上传图片'}],
          title: [{required: true, message: '请输入内容', trigger: 'blur'}],
          company: [{required: true, message: '请输入内容', trigger: 'blur'}],
          start_time: [
            {type: 'date', required: true, message: '请输入开始时间', trigger: 'blur'}
          ],
          end_time: [
            {type: 'date', required: true, message: '请输入结束时间', trigger: 'blur'}
          ],
          poll_start_time: [
            {type: 'date', required: true, message: '请输入开始时间', trigger: 'blur'}
          ],
          poll_end_time: [
            {type: 'date', required: true, message: '请输入结束时间', trigger: 'blur'}
          ],
          intro: [{validator: validateContent, trigger: 'blur'}]
        },
        // 新增界面数据
        formData: {
          title: '',
          start_time: '',
          end_time: '',
          poll_start_time: '',
          poll_end_time: '',
          cover: '',
          company: '',
          total_num: '',
          intro: '',
          pre_num: '',
          img: '',
          share_title: '',
          share_img: '',
          share_describe: ''
        }
      }
    },
    methods: {
      handleCancel () {
        this.$router.back()
      },
      changeShareTitle () {
        this.formData.share_title = this.formData.title
      },
      // 显示编辑界面
      async handleEdit (index, row) {
        let params = {
          id: this.$route.params.id,
          p_id: this.$route.params.pid
        }
        const res = await this.$http.post(`${MODEL_NAME}/info`, params)
        if (res === null) return
        this.formData = Object.assign({}, res.param)
        this.formData.start_time = new Date(res.param.start_time)
        this.formData.end_time = new Date(res.param.end_time)
        this.formData.poll_start_time = new Date(res.param.poll_start_time)
        this.formData.poll_end_time = new Date(res.param.poll_end_time)
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
      showUEContent () {
        this.formLoading = true
        let params = Object.assign(
          {p_id: this.$route.params.pid},
          this.formData
        )
        params.intro = this.getUEContent('ue') // 富文本内容
        const res = this.$http.post(`${MODEL_NAME}/update`, params)
        this.formLoading = false
        if (res === null) return
        this.handleEdit()
        this.dialogTableVisible = true
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
              // 处理时间为时间戳
              let pollStartTime = this.formData.poll_start_time
              if (typeof this.formData.poll_start_time === 'number') {
                pollStartTime = this.formData.poll_start_time / 1000
              } else {
                pollStartTime = new Date(this.formData.poll_start_time).getTime() / 1000
              }
              let pollEndTime = this.formData.poll_end_time
              if (typeof this.formData.poll_end_time === 'number') {
                pollEndTime = this.formData.poll_end_time / 1000
              } else {
                pollEndTime = new Date(this.formData.poll_end_time).getTime() / 1000
              }
              let startTime = this.formData.start_time
              if (typeof this.formData.start_time === 'number') {
                startTime = this.formData.start_time / 1000
              } else {
                startTime = new Date(this.formData.start_time).getTime() / 1000
              }
              let endTime = this.formData.end_time
              if (typeof this.formData.end_time === 'number') {
                endTime = this.formData.end_time / 1000
              } else {
                endTime = new Date(this.formData.end_time).getTime() / 1000
              }
              let params = Object.assign(
                {p_id: this.$route.params.pid},
                this.formData
              )
              params.poll_start_time = pollStartTime // 后台接收10位时间戳，需要转换
              params.poll_end_time = pollEndTime // 后台接收10位时间戳，需要转换
              params.start_time = startTime // 后台接收10位时间戳，需要转换
              params.end_time = endTime // 后台接收10位时间戳，需要转换
              params.intro = this.getUEContent('ue') // 富文本内容
              params.cover = this.getImageList('album') // 多图上传
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
      // UEditor 获取内容，传入 ref 的值
      getUEContent (ele) {
        return this.$refs[ele].getUEContent()
      },
      // 多图上传获取内容，传入 ref 的值
      getImageList (ele) {
        return this.$refs[ele].getImageList()
      },
      creatWangeditor () {
//        let that = this
        this.editor = new WangEditor('#WangEditor')  // 这个地方传入div元素的id 需要加#号
        // 配置 onchange 事件
        this.editor.change = function () {          // 这里是change 不是官方文档中的 onchange
          // 编辑区域内容变化时，实时打印出当前内容
          console.log(this.txt.html())
        }
        this.editor.customConfig.uploadImgServer = 'http://xshuman.kfw001.com/api/admin/upload/image'  // 上传图片到服务器
        this.editor.create()     // 生成编辑器
        this.editor.txt.html('<p>输入内容...</p>')   // 注意：这个地方是txt  不是官方文档中的$txt
      },
      selsChange (sels) {
        this.sels = sels
      }
    },
    mounted () {
      this.handleEdit()
//      this.creatWangeditor()
      // this.getArrayData()
    },
    components: {
      UE,
      VueEditor,
      'i-uploader': Uploader,
      'i-baidu-map': BaiduMap,
      'i-muti-uploader': MutiUploader
    }
  }
</script>

<style lang='scss' scoped>
.showUEContent {
    margin-top: 20px;
  }

  .UEimg {
    display: flex;
    flex: 1;
    flex-direction: row;
    justify-content: center;
  }
</style>
