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
      <!-- 富文本 -->
      <el-form-item label="入会信息" prop="desc">
        <UE :defaultMsg="formData.desc" ref="ue"></UE>
      </el-form-item>
      <!-- 自定义表单项目 -->
      <el-form-item label="附件上传" prop="attachment" width="200">
        <el-upload
          class="upload-demo"
          :action="`${baseUrl}/Upload/image`"
          :on-change="handleChange"
          :file-list="fileslist"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :show-file-list="false"
          multiple>
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">只能上传office相关文件及图片，且不超过2Mb</div>
        </el-upload>
        <ul class="el-upload-list el-upload-list--text">
          <li class="el-upload-list__item is-success" v-for="(item, index) in formData.attachment_name" >
            <a class="el-upload-list__item-name" style="text-decoration: none" :href="formData.attachment[index]"><i class="el-icon-document"></i>{{item}}
            </a>
            <label class="el-upload-list__item-status-label"><i class="el-icon-upload-success el-icon-circle-check"></i></label>
            <i class="el-icon-close" @click="handleDelete(index)"></i></li>
        </ul>
      </el-form-item>
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
  import configs from '@/configs/api'
  const {baseUrl} = configs

  const MODEL_NAME = 'User' // http://api.zhongjiao.kfw001.com/webadmin/控制器/方法 -> 接口控制器名称

  export default {
    data () {
      // 富文本校验
      var validateContent = (rule, value, callback) => {
        value = this.$refs['ue'].getUEContent()
        if (value === '') {
          callback(new Error('请输入内容'))
        } else {
          callback()
        }
      }
      return {
        baseUrl: baseUrl,
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
            label: '入会标题'
          },
          {
            type: 'upload',
            prop: 'cover',
            label: '入会图片'
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
          cover: [
            {required: true, message: '请上传封面图片'}
          ],
          title: [{required: true, message: '请输入内容', trigger: 'blur'}],
          desc: [
            {validator: validateContent, trigger: 'blur'}
          ]
        },
        // 新增界面数据
        formData: {
          title: '',
          cover: '',
          desc: '',
          attachment: '',
          attachment_name: ''
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
          // p_id: this.$route.params.pid
        }
        const res = await this.$http.post(`${MODEL_NAME}/intro`, params)
        if (res === null) return
        this.formData = Object.assign({}, res.param)
      },
      formateOptions (source) {
        let _data = []
        for (let key in source) {
          _data.push({label: source[key], value: key * 1})
        }
        return _data.slice(0)
      },
      handleChange (file, fileList) {
        this.fileslist = fileList.slice(-3)
        // console.log(file, fileList)
      },
      handleUploadSuccess (response, file, fileList) {
        if (response.status === 200) {
          this.$message({
            message: '上传成功',
            type: 'success'
          })
          this.formData.attachment = this.formData.attachment || []
          this.formData.attachment.push(response.param[0].path)
          this.formData.attachment_name = this.formData.attachment_name || []
          this.formData.attachment_name.push(response.param[0].name)
//          this.formData.attachment = response.param[0].path
          // console.log(response.param[0].path)
          console.log(fileList)
        } else {
          this.$message({
            message: response.info,
            type: 'warning'
          })
          // console.log(fileList)
        }
      },
      handleDelete (index) {
        this.formData.attachment.splice(index, 1)
        this.formData.attachment_name.splice(index, 1)
      },
      handleUploadError (err, file, fileList) {
        this.$message({
          message: '上传失败',
          type: 'warning'
        })
        console.log(err, file, fileList)
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
      // 编辑
      formSubmit () {
        this.$refs.formData.validate(valid => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.formLoading = true
              let params = Object.assign(
                {},
                this.formData
              )
              params.desc = this.getUEContent('ue') // 富文本内容
              const res = await this.$http.post(`${MODEL_NAME}/introsave`, params)
              this.formLoading = false
              if (res === null) return
              this.$message({
                message: '修改成功',
                type: 'success'
              })
              this.handleEdit()
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
    },
    components: {
      UE,
      'i-uploader': Uploader
    }
  }
</script>

<style lang='scss' scoped>

</style>
