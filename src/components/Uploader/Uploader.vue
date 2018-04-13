<template>
  <div class="i-uploader">
    <el-input v-model="cover" placeholder="请输入内容"></el-input>
    <el-upload
      class="avatar-uploader"
      :action="`${this.baseUrl}/upload/image`"
      :show-file-list="false"
      :on-success="uploadSuccess"
      :before-upload="beforeImageUpload">
      <img v-if="cover" :src="cover" class="avatar">
      <i v-if="!isPhoto" class="el-icon-plus avatar-uploader-icon"></i>
    </el-upload>
    <el-button @click="handleDialogLocal" size="small" type="primary">选取图片库文件</el-button>

    <el-dialog size="large" title="选取图片库文件" :visible.sync="dialogVisible">
      <div class="imgs">
        <el-card class="item" v-for="(item, index) in list" :key="index"
                 :body-style="{ padding: '0px' }">
          <img :src="item.path" class="image" @click="formSubmit(item)">
        </el-card>
      </div>

      <!--工具条-->
      <el-col :span="24" class="toolbar">
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
   * 二次封装 Element UI Uploader组件
   *
   * 1. 引入 components, 设置组件别名 'i-uploader'
   * 2. 传入参数 v-model:<form.data> 用于上传图片的表单字段
   * Demo
   * <i-uploader v-model="editForm.cover"></i-uploader>
   *
   * import Uploader from '@/components/Uploader';
   *
   * components: {
 *  'i-uploader': Uploader
 * }
   *
   */

  export default {
    name: 'i-uploader',
    props: {
      value: {
        type: String,
        default: ''
      }
    },
    data () {
      return {
        baseUrl: baseUrl,
        cover: this.value,
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
        sels: -1 // 列表选中列
      }
    },
    watch: {
      value (val) {
        this.cover = val
      },
      cover (val) {
        this.$emit('input', val)
      }
    },
    computed: {
      isPhoto () {
        let reg = /^http|(jpg|jpeg|png)+$/
        this.cover = this.cover || ''
        return this.cover.match(reg) && this.cover.match(reg).length >= 2
      }
    },
    methods: {
      handleCancel () {
        this.dialogVisible = false
      },
      formSubmit (item) {
        this.cover = item.path
        this.dialogVisible = false
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
      uploadSuccess (response, file, fileList) {
//        const res = this.$http.post('uploadImage')
        if (response === null) return
        this.cover = response.param[0].path
      },
      handleDialogLocal () {
        this.dialogVisible = true
        this.getListData()
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
//      // 处理编辑页面上传
//      customUpload (file) {
//        this._uploadImage(file)
//      },
      /**
       * 统一上传接口
       * @param file 接收文件对象
       * @private
       */
//      _uploadImage (file) {
//        // 将文件转为 base64 上传至服务器
//        let reader = new FileReader()
//        reader.readAsDataURL(file.file)
//        reader.onload = async () => {
//          // 拿到 base64 代码
//          let params = {
//            pic: reader.result
//          }
//          const res = await this.$http.post('uploadImage', params)
//          if (res === null) return
//          this.cover = res.param.path
//        }
//      }
    }
  }
</script>

<style lang='scss'>
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
    .item {
      box-sizing: border-box;
      break-inside: avoid;
      padding: 10px;
      margin: 10px;
      height: auto;
    }
    .image {
      width: 100%;
      display: block;
    }

  }

</style>
