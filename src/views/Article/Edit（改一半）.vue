<template>
  <div class="form-wrapper">
    <el-form :model="formData" label-width="120px" :rules="formRules" ref="formData">
      <el-form-item label="所属分类" prop="c_id">
        <el-select v-model="formData.c_id" placeholder="请选择内容">
          <el-option
            v-for="(item, index) in options.c_id"
            :key="index"
            :label="item.c_name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input v-model="formData.title"
                  placeholder="请输入内容"
                  @change="changeShareTitle"
                  auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="简称" prop="abbr">
        <el-input v-model="formData.abbr"
                  placeholder="请输入内容"
                  auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input v-model="formData.author"
                  placeholder="请输入内容"
                  auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="模板类型" prop="template">
        <el-select v-model="formData.template" placeholder="请选择内容">
          <el-option
            v-for="(item, index) in options.template"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <!--<el-form-item label="内容类型" prop="con_type">-->
      <!--<el-select v-model="formData.con_type" placeholder="请选择内容">-->
      <!--<el-option-->
      <!--v-for="(item, index) in options.con_type"-->
      <!--:key="index"-->
      <!--:label="item.label"-->
      <!--:value="item.value">-->
      <!--</el-option>-->
      <!--</el-select>-->
      <!--</el-form-item>-->
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
      <el-form-item label="是否显示新闻发生时间" prop="is_show">
        <el-switch
          v-model="formData.is_show"
          on-text="是"
          off-text="否"
          on-color="#13ce66"
          off-color="#ff4949"
          :on-value="1"
          :off-value="0">
        </el-switch>
      </el-form-item>
      <el-form-item label="新闻发生时间" prop="news_time">
        <el-date-picker
          v-model="formData.news_time"
          type="datetime"
          placeholder="选择日期时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="红头文件标题" prop="red_title" v-show="formData.template === 2">
        <el-input v-model="formData.red_title"
                  placeholder="请输入内容"
                  auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="文件号" prop="policy_code" v-show="formData.template === 2">
        <el-input v-model="formData.policy_code"
                  placeholder="请输入内容"
                  auto-complete="off"></el-input>
      </el-form-item>
      <!-- 富文本 -->
      <el-form-item label="详情" prop="content" v-show="formData.template === 1 || formData.template === 2">
        <template>
          <el-col>
            <el-row :span="12">
              <UE :defaultMsg="this.formData.content" ref="ue"></UE>
            </el-row>
            <el-row :span="12">
              <el-button class="showUEContent" type="primary" @click="showUEContent">预览</el-button>
            </el-row>
          </el-col>
        </template>
      </el-form-item>
      <el-form-item label="章节" prop="con_title" v-show="formData.template === 3">
        <template>
          <div class="option-item" v-for="(item, index) in content">
            <el-row>
              <el-col style="margin-top: -5px;">第{{ index + 1 }}章</el-col>
              <el-col :span="20">
                <el-input v-model="item.title[index]" placeholder="请输入章节标题" auto-complete="off"></el-input>
              </el-col>
              <el-col :span="4">
                <div class="option-btn">
                  <el-button type="success" icon="plus" size="small"
                             @click="addOption()"></el-button>
                  <el-button type="warning" icon="close" size="small"
                             @click="delOption(index)"></el-button>
                </div>
              </el-col>
            </el-row>
            <div class="option-item" v-for="(con, conIndex) in content.options">
            <el-row>
              <el-col :span="20">
                <el-input class="option-textarea" type="textarea" v-model="con[index]" :key="index" placeholder="请输入章节内容"
                          style="display:inline-block" auto-complete="off"></el-input>
              </el-col>
              <el-col :span="4">
                <div class="option-btn">
                  <el-button type="success" icon="plus" size="small"
                             @click="addContent(index)"></el-button>
                  <el-button type="warning" icon="close" size="small"
                             @click="delContent(index, conIndex)"></el-button>
                </div>
              </el-col>
            </el-row>
            </div>
          </div>
        </template>
      </el-form-item>
      <el-form-item label="文章外链" prop="link">
        <el-input v-model="formData.link"
                  placeholder="请输入内容"
                  auto-complete="off"></el-input>
      </el-form-item>
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
            <a class="el-upload-list__item-name" style="text-decoration: none" :href="formData.attachment[index]"><i class="el-icon-document"></i>{{item}}</a>
            <label class="el-upload-list__item-status-label"><i class="el-icon-upload-success el-icon-circle-check"></i></label>
            <i class="el-icon-close" @click="handleDelete(index)"></i></li>
        </ul>
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
      <!-- </el-form> -->
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
  import configs from '@/configs/api'
  const {baseUrl} = configs
  const MODEL_NAME = 'Article' // http://api.zhongjiao.kfw001.com/webadmin/控制器/方法 -> 接口控制器名称

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
        baseUrl: baseUrl,
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
//            type: 'select',
//            prop: 'c_id',
//            label: '所属分类',
//            option: 'c_id', // 下拉列表数据别名
//            labelProp: 'c_name', // 下拉列表数组内元素 label 别名
//            valueProp: 'id', // 下拉列表数组内元素 value 别名
//            placeholder: '请输入内容'
//          },
//          {
//            type: 'text',
//            prop: 'title',
//            label: '标题'
//          },
//          {
//            type: 'text',
//            prop: 'abbr',
//            label: '简称'
//          },
//          {
//            type: 'text',
//            prop: 'author',
//            label: '作者'
//          },
//          {
//            type: 'select',
//            prop: 'template',
//            label: '模板',
//            option: 'template', // 下拉列表数据别名
//            labelProp: 'label', // 下拉列表数组内元素 label 别名
//            valueProp: 'value', // 下拉列表数组内元素 value 别名
//            placeholder: '请输入内容'
//          },
          {
            type: 'select',
            prop: 'type',
            label: '类型',
            option: 'type', // 下拉列表数据别名
            labelProp: 'label', // 下拉列表数组内元素 label 别名
            valueProp: 'value', // 下拉列表数组内元素 value 别名
            placeholder: '请输入内容'
          },
          {
            type: 'text',
            prop: 'from',
            label: '来源'
          },
          {
            type: 'upload',
            prop: 'cover',
            label: '封面图片'
          },
          {
            type: 'textarea',
            prop: 'info',
            label: '简介'
          },
//          {
//            type: 'text',
//            prop: 'link',
//            label: '外链'
//          },
          {
            type: 'number',
            prop: 'sort',
            label: '排序'
          }
//          {
//            type: 'select',
//            prop: 'is_show',
//            label: '是否显示新闻发现时间',
//            option: 'is_show', // 下拉列表数据别名
//            labelProp: 'label', // 下拉列表数组内元素 label 别名
//            valueProp: 'value', // 下拉列表数组内元素 value 别名
//            placeholder: '请输入内容'
//          },
//          {
//            type: 'time',
//            prop: 'news_time',
//            label: '新闻发生时间'
//          }
        ],
        // 下拉列表数据
        options: {
          c_id: [],
          cat: [],
          type: [
            {value: 1, label: '原创'},
            {value: 2, label: '转载'},
            {value: 3, label: '外链'}
          ],
          is_show: [{value: 0, label: '否'}, {value: 1, label: '是'}],
          news_time: [],
          template: [
            {value: 1, label: '默认模板'},
            {value: 2, label: '红头文件'},
            {value: 3, label: '大法规'}
          ],
          p_id: [],
          con_type: [
            {value: 1, label: '富文本编辑框'},
            {value: 2, label: '章节'}
          ]
        },
        icon_color: '',
        content: [{title: '', options: ['']}],
        UEcontent: '',
        list: [],
        fileslist: [],
        formLoading: false,
        formRules: {
          c_id: [
            {type: 'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
          type: [
            {type: 'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
          is_show: [
            {type: 'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
          template: [
            {type: 'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
//          con_type: [
//            {type: 'number', required: true, message: '请输入内容', trigger: 'blur'}
//          ],
          cover: [
            {required: true, message: '请上传封面图片'}
          ],
          title: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          author: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          from: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          info: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
//          link: [
//            {required: true, message: '请输入内容', trigger: 'blur'}
//          ],
          sort: [
            {type: 'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
          news_time: [
            {type: 'date', required: true, message: '请输入时间', trigger: 'blur'}
          ]
//          content: [
//            {validator: validateContent, trigger: 'blur'}
//          ]
        },
        // 新增界面数据
        formData: {
          title: '',
          cover: '',
          author: '',
          from: '',
          news_time: '',
          info: '',
          c_id: '',
          type: '',
          link: '',
          sort: '',
          is_show: '',
          content: '',
          attachment: [],
          attachment_name: [],
          abbr: '',
          template: 1,
          icon: '',
//          con_type: '',
          con_title: [''],
          policy_code: '',
          red_title: '',
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
      // 新增选项
      addOption () {
//        this.formData.con_title.push('')
        this.content.push({title: '', options: ['']})
      },
      // 删除选项
      delOption (index) {
        if (this.content.length > 1) {
          this.content.splice(index, 1)
//          this.content[index].splice(conIndex, 1)
        } else {
          this.$message({
            message: '最后一个啦！',
            type: 'warning'
          })
        }
      },
      addContent (index) {
//        this.formData.con_title.push('')
        this.content[index].options.push('')
      },
      delContent (index, conIndex) {
        if (this.content[index].options.length > 1) {
          this.content[index].options.splice(conIndex, 1)
//          this.content[index].splice(conIndex, 1)
        } else {
          this.$message({
            message: '最后一个啦！',
            type: 'warning'
          })
        }
      },
      showUEContent () {
        this.formLoading = true
        this.options.cat.forEach(item => {
          if (this.formData.c_id === item.id) {
            this.formData.icon = item.color
            console.log(this.formData.icon)
          }
        })
        let params = Object.assign(
          {c_id: this.$route.params.c_id},
          this.formData
        )
        if (this.formData.template === 3) {
          params.content = this.content
        } else {
          params.con_title = ['']
          params.content = this.getUEContent('ue') // 富文本内容
          console.log(params.con_title)
        }
//              params.content = this.getUEContent('ue') // 富文本内容
        const res = this.$http.post(`${MODEL_NAME}/update`, params)
        this.formLoading = false
        if (res === null) return
        this.handleEdit()
        console.log(this.formData.img)
        this.dialogTableVisible = true
      },
      closeDialog () {
        this.dialogTableVisible = false
      },
      changeContype (val) {
        console.log(val)
//        if (this.formData.con_type === 2) {
//          if (params.con_title.length < 1) {
//            params.content = ['']
//            params.con_title = ['']
//            console.log(11111)
//          } else {
//            params.content = this.content
//          }
//        }
        this.handleEdit()
//        this.UEcontent = ''
//        this.content = ['']
//          this.formData.con_title = ['']
//        if (val === 1) {
//          this.UEcontent = ''
//        } else {
//          this.content = ['']
//          this.formData.con_title = ['']
//        }
      },
      // 显示编辑界面
      async handleEdit (index, row) {
        let params = {
          id: this.$route.params.id,
          c_id: this.$route.params.c_id
        }
        const res = await this.$http.post(`${MODEL_NAME}/info`, params)
        if (res === null) return
        this.formData = Object.assign({}, res.param.list)
        this.options.c_id = this.formateCategory(res.param.cat)
        this.formData.news_time = new Date(this.formData.news_time * 1000)
        if (res.param.list.attachment === '') {
          this.formData.attachment = []
          this.formData.attachment_name = []
        }
        this.fileslist = this.formData.attachment_name
        if (res.param.list.template === 3) {
          this.content = res.param.list.content
        } else {
          this.formData.content = res.param.list.content
        }
        this.options.cat = res.param.cat
      },
//      async getArrayData () {
//        const res = await this.$http.post(`${MODEL_NAME}/info`, {
//          id: 0,
//          c_id: this.$route.params.c_id
//        })
//        if (res === null) return
//        this.options.c_id = this.formateCategory(res.param.cat)
//        this.options.cat = res.param.cat
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
            // pid: item.pid,
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
              this.options.cat.forEach(item => {
                if (this.formData.c_id === item.id) {
                  this.formData.icon = item.color
                  console.log(this.formData.icon)
                }
              })
              let params = Object.assign(
                {c_id: this.$route.params.c_id},
                this.formData
              )
              // 处理时间为时间戳
//              let newsTime = this.formData.news_time
//              if (typeof this.formData.news_time === 'number') {
//                newsTime = this.formData.news_time
//              } else {
//                newsTime = new Date(this.formData.news_time).getTime()
//              }
//              params.news_time = newsTime // 后台接收10位时间戳，需要转换
              if (this.formData.template === 3) {
                params.content = this.content
              } else {
                params.con_title = ['']
                params.content = this.getUEContent('ue') // 富文本内容
                console.log(params.con_title)
              }
//              params.content = this.getUEContent('ue') // 富文本内容
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
      selsChange (sels) {
        this.sels = sels
      }
    },
    mounted () {
      this.handleEdit()
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

  .option-textarea {
    margin: 10px 0;
  }

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
