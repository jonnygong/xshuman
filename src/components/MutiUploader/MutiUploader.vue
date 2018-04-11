<template>
  <div class="i-muti-uploader">
    <!-- 图片批量上传 -->
    <el-upload
      class="upload-demo"
      ref="upload"
      :action="`${this.baseUrl}/upload/image`"
      :on-remove="handleRemove"
      :http-request="customMutiUpload"
      :file-list="images"
      list-type="picture"
      :auto-upload="false"
      :multiple="true">
      <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
      <el-button @click="handleDialogLocal" size="small" type="primary">选取图片库文件</el-button>
      <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
      <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
    </el-upload>

    <el-dialog size="large" title="选取图片库文件" :visible.sync="dialogVisible">
      <div class="imgs">
        <el-card :class="{checked : item.checked}" class="item" v-for="(item, index) in list" :key="index"
                 :body-style="{ padding: '0px' }">
          <img :src="item.path" class="image" @click="getImage(item)">
          <!--<div style="padding: 0;">-->
          <!--<span>{{ item.name }}</span>-->
          <!--</div>-->
        </el-card>
      </div>

      <!--工具条-->
      <el-col :span="24" class="toolbar">

        <div class="dialog-footer" style="float:right; margin-left: 10px;">
          <el-button @click.native="handleCancel">取消</el-button>
          <el-button type="primary" @click.native="formSubmit">提交</el-button>
        </div>
        <el-pagination layout="prev, pager, next"
                       @current-change="handleCurrentChange"
                       :page-size="pagesize"
                       :total="total" style="float:right;"></el-pagination>
      </el-col>
    </el-dialog>
  </div>

</template>

<script>
  import configs from '@/configs/api'

  const {baseUrl} = configs
  /**
   * 二次封装 Element UI 多图 Uploader 组件
   *
   * 1. 引入 components, 设置组件别名 'i-muti-uploader'
   * 2. 传入参数 value:<form.data> 用于上传图片的表单字段
   * Demo
   * <i-muti-uploader value="editForm.images"></i-muti-uploader>
   *
   * import MutiUploader from '@/components/MutiUploader';
   *
   * components: {
 *  'i-muti-uploader': MutiUploader
 * }
   *
   */
  export default {
    name: 'mutiUploader',
    props: {
      value: {
        type: String,
        default: ''
      },
      id: {
        type: Number,
        default: 1
      }
    },
    data () {
      return {
        baseUrl: baseUrl,
        images: [],
        dialogVisible: false,
        // 搜索条件
        filters: {
          value: '',
          key: 'name',
          options: [
            {value: 'name', label: '图片名称'}
          ]
        },
        list: [],
        rowId: '',
        routeId: 1,
        total: 0,
        page: 1,
        pagesize: 20,
        listLoading: false,
        sels: [] // 列表选中列
      }
    },
    watch: {
      value (val) {
        let _images = val.indexOf(',') > -1 ? val.split(',') : val
        let _imageList = []
        if (!Array.isArray(_images)) {
          let _url = _images.split('/')
          _imageList.push({
            uid: new Date().getTime(),
            name: _url[_url.length - 1],
            url: _images
          })
        } else {
          _images.forEach((item, index) => {
            let _url = item.split('/')
            _imageList.push({
              uid: new Date().getTime(),
              name: _url[_url.length - 1],
              url: item
            })
          })
        }
        this.images = _imageList.slice()
      }
    },
    methods: {
      submitUpload () {
        this.$refs.upload.submit()
      },
      handleCancel () {
        this.dialogVisible = false
      },
      getImage (item) {
        item.checked = !item.checked
      },
      formSubmit () {
        this.list.forEach(item => {
          if (item.checked) {
            this.images.push({
              name: item.name,
              status: 'success',
              uid: new Date().getTime(),
              url: item.path
            })
          }
        })
        this.dialogVisible = false
      },
      getImageList () {
        // 处理相册字段上传格式为 <http://xx , http://xx >
        let _images = []
        if (!Array.isArray(this.images)) {
          return this.images
        } else {
          this.images.forEach((item, index) => {
            _images.push(item.url)
          })
          return _images + ''
        }
      },
      // 新增页面 批量上传图片
      customMutiUpload (file) {
        this._uploadMutiImage(file)
      },
      /**
       * 统一上传接口
       * @param file 接收文件对象
       * @private
       */
      async _uploadMutiImage (file) {
        // 将文件转为 base64 上传至服务器
        console.log(file.file)
        let params = {
          category_id: this.id,
          pic: file.file
        }
        const res = await this.$http.post('uploadImage', params)
        if (res === null) return
        console.log(res)
        this.images.push({
          name: file.file.name,
          status: 'success',
          uid: new Date().getTime(),
          url: res.param[0].path
        })
      },
      // 图片上传前限制条件
      beforeImageUpload (file) {
        const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
        const isLt2M = file.size / 1024 / 1024 < 2

        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 或 PNG 格式!')
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!')
        }
        return isJPG && isLt2M
      },
      // 相册上传删除
      handleRemove (file, fileList) {
        console.log(file, fileList)
        let _this = this
        // 移除预览列表的同时，删除相关联的文件列表数组
        this.images.forEach((item, index) => {
          if (item.uid === file.uid) {
            _this.images.splice(index, 1)
          }
        })
      },
      handleDialogLocal () {
        this.getListData()
        this.dialogVisible = true
      },
      handleCurrentChange (val) {
        this.page = val
        this.getListData()
      },
      // 获列表
      async getListData () {
        this.listLoading = true
        let params = {
//          id: this.$route.params.id,
          page: this.page,
          key: this.filters.key, // 可选参数查询
          value: this.filters.value // 可选参数查询
        }
        const res = await this.$http.post(`upload/allimg`, params)
        this.listLoading = false
        if (res === null) return
        this.total = res.param.pages.total
        this.pagesize = res.param.pages.pagesize
        this.list = res.param.list
        this.list.forEach(item => {
//          item = res.param.list
          this.$set(item, 'checked', false)
        })
      }
    }
  }
</script>

<style lang="scss">
  .avatar-uploader .el-upload {
    position: relative;
    margin-top: 10px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    overflow: hidden;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #20a0ff;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    min-width: 178px;
    min-height: 178px;
    line-height: 178px;
    text-align: center;
  }

  .avatar {
    display: block;
    max-width: 200px;
  }

  .imgs {
    width: 100%;
    column-count: 5;
    column-gap: 0;
    /*align-content: baseline;*/

    .item {
      box-sizing: border-box;
      break-inside: avoid;
      padding: 10px;
      margin: 10px;
      height: auto;

      /*&:hover {*/
      /*border-color: #f00;*/
      /*}*/
    }
    .checked {
      border-color: #f00;
    }
    .image {
      width: 100%;
      display: block;
    }
  }

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

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }

  .clearfix:after {
    clear: both
  }
</style>
