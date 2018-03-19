# 下沙人社后台管理系统

## 目录结构

```
.
├─.idea
│  └─inspectionProfiles
├─build                               # webpack 配置文件
├─config                              # 项目主配置文件
├─src
│  ├─assets                           # 模块静态资源（可被 webpack 打包）
│  │  └─images                        # 图片资源 
│  ├─components                       # UI 通用组件
│  │  ├─BaiduMap                      # 百度地图
│  │  ├─MutiUploader                  # 多图上传
│  │  ├─openedPageTags                # 已打开标签组件
│  │  ├─UEditor                       # UEditor 富文本编辑器
│  │  └─Uploader                      # 单个图片上传
│  ├─configs                          # 项目配置文件 
│  ├─plugins                          # 项目插件
│  │  ├─axios                         # Ajax 请求 
│  │  │  └─fn
│  │  ├─fastclick                     # 移动端防止点击穿透 
│  │  ├─iconfont
│  │  ├─router                        # Vue Router
│  │  │  └─routes
│  │  ├─store                         # Vuex
│  │  │  ├─actions
│  │  │  ├─getters
│  │  │  ├─mutations
│  │  │  └─state
│  │  ├─tree-grid                     # 树形表格 
│  │  └─vue-baidu-map                 # 百度地图 
│  ├─styles                           # 通用样式
│  ├─utils                            # 通用工具函数
│  │  └─js
│  └─views                            # 页面模板
│      ├─Active                       # 活动管理
│      ├─Ads                          # 广告管理
│      ├─Article                      # 文章管理
│      ├─Canvass                      # 民意调查
│      ├─Category                     # 分类管理
│      ├─Ejob                         # 参展企业岗位
│      ├─Enterprise                   # 参展企业
│      ├─Goods                        # 内部福利
│      ├─Intro                        # 入会须知
│      ├─Job                          # 职位管理
│      ├─Login                        # 登录
│      ├─Main                         # 主框架
│      ├─Model                        # 页面模板
│      ├─Onsite                       # 现场招聘会管理
│      ├─Place                        # 广告位管理
│      ├─Resume                       # 简历表
│      ├─Sort                         # 归类列表
│      ├─Summary                      # 协会简介
│      ├─System                       # 权限管理
│      ├─User                         # 协会管理
│      └─Welcome                      # 欢迎页
├─static                              # 静态资源（不被 webpack 处理）
│    └── ueditor                      # UEditor 库
│       └─ ...

```


## 测试、部署说明

### 开发调试
```bash
# 安装依赖
npm install 或 yarn

# 本地调试 localhost:8080
npm run dev
```

### 上线部署

```
# 构建部署
npm run build
```

> 发布目录 /admin/shop

