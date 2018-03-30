const Main = () => import('@/views/Main/Main.vue')

/**
 *  路由与导航分离
 *  路由对象 meta 标签
 *  meta: {
 *  requiresAuth: true,
 *  alias: 'Pmsadmin/Oragnize/list' // 用于权限的校验
 *  }
 *
 */

let routes = [
  // 登录页
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: '用户登录'
  },
  // 欢迎页
  {
    path: '/',
    component: Main,
    name: '首页',
    redirect: '/main',
    children: [{
      path: '/main',
      component: () => import('@/views/Welcome/Welcome.vue'),
      name: '欢迎使用'
    }]
  },
  // 系统管理
  {
    path: '/system',
    component: Main,
    name: '系统管理',
    redirect: '/system/organization',
    children: [
      {
        path: '/system/organization',
        component: () => import('@/views/System/Organization.vue'),
        name: '组织结构',
        meta: {requiresAuth: true, alias: 'Admin/Oragnize/list'}
      },
      {
        path: '/system/user',
        component: () => import('@/views/System/User.vue'),
        name: '人员管理',
        redirect: '/system/user/index',
        children: [{
          path: '/system/user/index',
          component: () => import('@/views/System/UserList.vue'),
          name: '职员列表',
          meta: {requiresAuth: true, alias: 'Admin/Admin/list'}
        },
        {
          path: '/system/user/auth/:id',
          component: () => import('@/views/System/UserAuth.vue'),
          name: '权限管理',
          meta: {requiresAuth: true, alias: 'Admin/Admin/list'}
        },
        {
          path: '/system/user/org',
          component: () => import('@/views/System/UserOrg.vue'),
          name: '职员权限管理',
          meta: {requiresAuth: true, alias: 'Admin/Admin/list'}
        }
        ]
      },
      {
        path: '/system/auth',
        component: () => import('@/views/System/Auth.vue'),
        name: '角色管理',
        meta: {requiresAuth: true, alias: 'Admin/Role/list'}
      },
      {
        path: '/system/logs',
        component: () => import('@/views/System/Logs.vue'),
        name: '日志管理',
        meta: {requiresAuth: true, alias: 'Admin/Log/record'}
      }
    ]
  },
  // 广告位
  {
    path: '/place',
    component: Main,
    name: '广告位',
    children: [
      {
        path: 'list',
        component: () => import('@/views/Place/List.vue'),
        name: '广告位列表',
        meta: {requiresAuth: true, alias: 'Admin/Place/list'}
      },
      {
        path: 'list/edit/:id',
        component: () => import('@/views/Place/Edit.vue'),
        name: '广告位编辑',
        meta: {requiresAuth: true, alias: 'Admin/Place/list'}
      },
      {
        path: 'list/add',
        component: () => import('@/views/Place/Add.vue'),
        name: '广告位新增',
        meta: {requiresAuth: true, alias: 'Admin/Place/list'}
      }
    ]
  },
  // 广告
  {
    path: '/ads',
    component: Main,
    name: '广告',
    children: [
      {
        path: 'list',
        component: () => import('@/views/Ads/List.vue'),
        name: '广告列表',
        meta: {requiresAuth: true, alias: 'Admin/Ads/list'}
      },
      {
        path: 'list/edit/:id',
        component: () => import('@/views/Ads/Edit.vue'),
        name: '广告编辑',
        meta: {requiresAuth: true, alias: 'Admin/Ads/list'}
      },
      {
        path: 'list/add',
        component: () => import('@/views/Ads/Add.vue'),
        name: '广告新增',
        meta: {requiresAuth: true, alias: 'Admin/Ads/list'}
      }
    ]
  },
  // 入会信息
  {
    path: '/user',
    component: Main,
    name: '入会须知',
    children: [
      {
        path: 'intro',
        component: () => import('@/views/Intro/Edit.vue'),
        name: '入会信息编辑',
        meta: {requiresAuth: true, alias: 'Admin/User/intro'}
      }
    ]
  },
  // 入会信息
  {
    path: '/user',
    component: Main,
    name: '协会简介',
    children: [
      {
        path: 'summary',
        component: () => import('@/views/Summary/Edit.vue'),
        name: '协会简介编辑',
        meta: {requiresAuth: true, alias: 'Admin/User/summary'}
      }
    ]
  },
  // 广告
  {
    path: '/canvass',
    component: Main,
    name: '民意调查',
    children: [
      {
        path: 'list',
        component: () => import('@/views/Canvass/List.vue'),
        name: '民意调查列表',
        meta: {requiresAuth: true, alias: 'Admin/Canvass/list'}
      },
      {
        path: 'list/edit/:id',
        component: () => import('@/views/Canvass/Edit.vue'),
        name: '民意调查编辑',
        meta: {requiresAuth: true, alias: 'Admin/Canvass/list'}
      },
      {
        path: 'list/add',
        component: () => import('@/views/Canvass/Add.vue'),
        name: '民意调查新增',
        meta: {requiresAuth: true, alias: 'Admin/Canvass/list'}
      },
      {
        path: 'list/member/:id',
        component: () => import('@/views/Canvass/Member.vue'),
        name: '民意调查参与人员',
        meta: {requiresAuth: true, alias: 'Admin/Canvass/list'}
      },
      {
        path: 'list/result/:id',
        component: () => import('@/views/Canvass/Result.vue'),
        name: '民意调查统计',
        meta: {requiresAuth: true, alias: 'Admin/Canvass/list'}
      }
    ]
  },
  // // 文章分类
  // {
  //   path: '/category',
  //   component: Main,
  //   name: '文章分类',
  //   children: [
  //     {
  //       path: 'list',
  //       component: () => import('@/views/Category/List.vue'),
  //       name: '文章分类列表',
  //       meta: {requiresAuth: true, alias: 'Admin/Category/list'}
  //     },
  //     {
  //       path: 'list/edit/:id',
  //       component: () => import('@/views/Category/Edit.vue'),
  //       name: '文章分类编辑',
  //       meta: {requiresAuth: true, alias: 'Admin/Category/list'}
  //     },
  //     {
  //       path: 'list/add',
  //       component: () => import('@/views/Category/Add.vue'),
  //       name: '文章分类新增',
  //       meta: {requiresAuth: true, alias: 'Admin/Category/list'}
  //     }
  //   ]
  // },
  // 文章分类
  {
    path: '/category',
    component: Main,
    name: '文章分类',
    children: [
      {
        path: 'list',
        component: () => import('@/views/Category/List.vue'),
        name: '文章分类列表',
        meta: {requiresAuth: true, alias: 'Admin/Category/list'}
      },
      {
        path: 'list/edit/:pid/:id',
        component: () => import('@/views/Category/Edit.vue'),
        name: '文章分类编辑',
        meta: {requiresAuth: true, alias: 'Admin/Category/list'}
      },
      {
        path: 'list/add/:pid/:type',
        component: () => import('@/views/Category/Add.vue'),
        name: '文章分类新增',
        meta: {requiresAuth: true, alias: 'Admin/Category/list'}
      }
    ]
  },
  // 文章列表
  {
    path: '/article',
    component: Main,
    name: '文章列表',
    children: [
      {
        path: 'list',
        component: () => import('@/views/Article/List.vue'),
        name: '文章列表',
        meta: {requiresAuth: true, alias: 'Admin/Article/list'}
      },
      {
        path: 'list/edit/:c_id/:id',
        component: () => import('@/views/Article/Edit.vue'),
        name: '文章列表编辑',
        meta: {requiresAuth: true, alias: 'Admin/Article/list'}
      },
      {
        path: 'list/add/:c_id',
        component: () => import('@/views/Article/Add.vue'),
        name: '文章列表新增',
        meta: {requiresAuth: true, alias: 'Admin/Article/list'}
      }
    ]
  },
  // 文档归类
  {
    path: '/sort',
    component: Main,
    name: '文档归类',
    children: [
      {
        path: 'list',
        component: () => import('@/views/Sort/List.vue'),
        name: '文档归类列表',
        meta: {requiresAuth: true, alias: 'Admin/Sort/list'}
      },
      {
        path: 'list/edit/:c_id/:id',
        component: () => import('@/views/Sort/Edit.vue'),
        name: '文档归类编辑',
        meta: {requiresAuth: true, alias: 'Admin/Sort/list'}
      },
      {
        path: 'list/add/:c_id',
        component: () => import('@/views/Sort/Add.vue'),
        name: '文档归类新增',
        meta: {requiresAuth: true, alias: 'Admin/Sort/list'}
      }
    ]
  },
  // 活动列表
  {
    path: '/active',
    component: Main,
    name: '活动列表',
    children: [
      {
        path: 'list',
        component: () => import('@/views/Active/List.vue'),
        name: '活动列表',
        meta: {requiresAuth: true, alias: 'Admin/Active/list'}
      },
      {
        path: 'list/edit/:id',
        component: () => import('@/views/Active/Edit.vue'),
        name: '活动列表编辑',
        meta: {requiresAuth: true, alias: 'Admin/Active/list'}
      },
      {
        path: 'list/add',
        component: () => import('@/views/Active/Add.vue'),
        name: '活动列表新增',
        meta: {requiresAuth: true, alias: 'Admin/Active/list'}
      },
      {
        path: 'list/enroll/:id',
        component: () => import('@/views/Active/Enroll.vue'),
        name: '活动列表活动报名',
        meta: {requiresAuth: true, alias: 'Admin/Active/list'}
      },
      {
        path: 'list/comment/:id',
        component: () => import('@/views/Active/Comment.vue'),
        name: '活动列表评论列表',
        meta: {requiresAuth: true, alias: 'Admin/Active/list'}
      }
    ]
  },
  // 入会管理
  {
    path: '/user',
    component: Main,
    name: '入会管理',
    children: [
      {
        path: 'list',
        component: () => import('@/views/User/List.vue'),
        name: '入会管理列表',
        meta: {requiresAuth: true, alias: 'Admin/User/list'}
      },
      {
        path: 'list/edit/:id',
        component: () => import('@/views/User/Edit.vue'),
        name: '入会管理编辑',
        meta: {requiresAuth: true, alias: 'Admin/User/list'}
      },
      {
        path: 'list/add',
        component: () => import('@/views/User/Add.vue'),
        name: '入会管理新增',
        meta: {requiresAuth: true, alias: 'Admin/User/list'}
      },
      {
        path: 'list/dlist/:uid',
        component: () => import('@/views/AssUser/List.vue'),
        name: '协会用户列表',
        meta: {requiresAuth: true, alias: 'Admin/User/list'}
      },
      {
        path: 'list/dlist/:uid/dedit/:id',
        component: () => import('@/views/AssUser/Edit.vue'),
        name: '协会用户编辑',
        meta: {requiresAuth: true, alias: 'Admin/User/list'}
      },
      {
        path: 'list/dlist/:uid/dadd',
        component: () => import('@/views/AssUser/Add.vue'),
        name: '协会用户新增',
        meta: {requiresAuth: true, alias: 'Admin/User/list'}
      }
    ]
  },
  // 产品管理
  {
    path: '/goods',
    component: Main,
    name: '产品管理',
    children: [
      {
        path: 'list',
        component: () => import('@/views/Goods/List.vue'),
        name: '产品管理列表',
        meta: {requiresAuth: true, alias: 'Admin/Goods/list'}
      },
      {
        path: 'list/edit/:id',
        component: () => import('@/views/Goods/Edit.vue'),
        name: '产品管理编辑',
        meta: {requiresAuth: true, alias: 'Admin/Goods/list'}
      },
      {
        path: 'list/add',
        component: () => import('@/views/Goods/Add.vue'),
        name: '产品管理新增',
        meta: {requiresAuth: true, alias: 'Admin/Goods/list'}
      }
    ]
  },
  // 岗位管理
  {
    path: '/job',
    component: Main,
    name: '岗位管理',
    children: [
      {
        path: 'list',
        component: () => import('@/views/Job/List.vue'),
        name: '岗位管理列表',
        meta: {requiresAuth: true, alias: 'Admin/Job/list'}
      },
      {
        path: 'list/edit/:id',
        component: () => import('@/views/Job/Edit.vue'),
        name: '岗位管理编辑',
        meta: {requiresAuth: true, alias: 'Admin/Job/list'}
      }
    ]
  },
  // 简历表
  {
    path: '/resume',
    component: Main,
    name: '简历表',
    children: [
      {
        path: 'list',
        component: () => import('@/views/Resume/List.vue'),
        name: '简历表列表',
        meta: {requiresAuth: true, alias: 'Admin/Resume/list'}
      },
      {
        path: 'list/edit/:id',
        component: () => import('@/views/Resume/Edit.vue'),
        name: '简历表编辑',
        meta: {requiresAuth: true, alias: 'Admin/Resume/list'}
      }
      // {
      //   path: 'list/add',
      //   component: () => import('@/views/Resume/Add.vue'),
      //   name: '简历表新增',
      //   meta: {requiresAuth: true, alias: 'Admin/Resume/list'}
      // }
    ]
  },
  // 现场招聘会
  {
    path: '/onsite',
    component: Main,
    name: '现场招聘会',
    children: [
      {
        path: 'list',
        component: () => import('@/views/Onsite/List.vue'),
        name: '现场招聘会列表',
        meta: {requiresAuth: true, alias: 'Admin/Onsite/list'}
      },
      {
        path: 'list/edit/:id',
        component: () => import('@/views/Onsite/Edit.vue'),
        name: '现场招聘会编辑',
        meta: {requiresAuth: true, alias: 'Admin/Onsite/list'}
      },
      {
        path: 'list/add',
        component: () => import('@/views/Onsite/Add.vue'),
        name: '现场招聘会新增',
        meta: {requiresAuth: true, alias: 'Admin/Onsite/list'}
      },
      {
        path: 'list/enterprise/:onsite_id',
        component: () => import('@/views/Enterprise/List.vue'),
        name: '参展单位列表',
        meta: {requiresAuth: true, alias: 'Admin/Onsite/list'}
      },
      {
        path: 'list/enterprise/:onsite_id/edit/:id',
        component: () => import('@/views/Enterprise/Edit.vue'),
        name: '参展单位编辑',
        meta: {requiresAuth: true, alias: 'Admin/Onsite/list'}
      },
      {
        path: 'list/enterprise/:onsite_id/add',
        component: () => import('@/views/Enterprise/Add.vue'),
        name: '参展单位新增',
        meta: {requiresAuth: true, alias: 'Admin/Onsite/list'}
      },
      {
        path: 'list/enterprise/:onsite_id/ejob/:eid',
        component: () => import('@/views/Ejob/List.vue'),
        name: '岗位设置列表',
        meta: {requiresAuth: true, alias: 'Admin/Onsite/list'}
      },
      {
        path: 'list/enterprise/:onsite_id/ejob/:eid/edit/:id',
        component: () => import('@/views/Ejob/Edit.vue'),
        name: '岗位设置编辑',
        meta: {requiresAuth: true, alias: 'Admin/Onsite/list'}
      },
      {
        path: 'list/enterprise/:onsite_id/ejob/:eid/add',
        component: () => import('@/views/Ejob/Add.vue'),
        name: '岗位设置新增',
        meta: {requiresAuth: true, alias: 'Admin/Onsite/list'}
      }
    ]
  },
  // // 协会用户
  // {
  //   path: '/duser',
  //   component: Main,
  //   name: '协会用户',
  //   children: [
  //     {
  //       path: 'list/:uid',
  //       component: () => import('@/views/AssUser/List.vue'),
  //       name: '协会用户列表',
  //       meta: {requiresAuth: true, alias: 'Admin/User/list'}
  //     },
  //     {
  //       path: 'list/edit/:uid/:id',
  //       component: () => import('@/views/AssUser/Edit.vue'),
  //       name: '协会用户编辑',
  //       meta: {requiresAuth: true, alias: 'Admin/User/list'}
  //     },
  //     {
  //       path: 'list/add/:uid',
  //       component: () => import('@/views/AssUser/Add.vue'),
  //       name: '协会用户新增',
  //       meta: {requiresAuth: true, alias: 'Admin/User/list'}
  //     }
  //   ]
  // },
  // 企业成员
  {
    path: '/unit',
    component: Main,
    name: '企业成员',
    children: [
      {
        path: 'list',
        component: () => import('@/views/Unit/List.vue'),
        name: '企业成员列表',
        meta: {requiresAuth: true, alias: 'Admin/Company/list'}
      },
      {
        path: 'list/edit/:id',
        component: () => import('@/views/Unit/Edit.vue'),
        name: '企业成员编辑',
        meta: {requiresAuth: true, alias: 'Admin/Company/list'}
      },
      {
        path: 'list/add',
        component: () => import('@/views/Unit/Add.vue'),
        name: '企业成员新增',
        meta: {requiresAuth: true, alias: 'Admin/Company/list'}
      }
    ]
  },
  // 图片管理
  {
    path: '/image',
    component: Main,
    name: '图片管理',
    children: [
      {
        path: 'list',
        component: () => import('@/views/Image/List.vue'),
        name: '图片管理分类列表',
        meta: {requiresAuth: true, alias: 'Admin/Image/list'}
      },
      {
        path: 'list/show/:id',
        component: () => import('@/views/Image/Show.vue'),
        name: '图片展示',
        meta: {requiresAuth: true, alias: 'Admin/Image/list'}
      }
    ]
  },
  // 菜单演示
  {
    path: '/demo1',
    component: Main,
    name: '演示菜单1',
    children: [
      {
        path: 'list',
        component: () => import('@/views/Model/List.vue'),
        name: '菜单列表1',
        meta: {requiresAuth: true, alias: 'Admin/Demo1/list'}
      },
      {
        path: 'list/edit/:id',
        component: () => import('@/views/Model/Edit.vue'),
        name: '菜单1编辑',
        meta: {requiresAuth: true, alias: 'Admin/Demo1/list'}
      },
      {
        path: 'list/add',
        component: () => import('@/views/Model/Add.vue'),
        name: '菜单1新增',
        meta: {requiresAuth: true, alias: 'Admin/Demo1/list'}
      }
    ]
  },
  // 个人中心
  {
    path: '/personal',
    component: Main,
    name: '个人中心',
    redirect: '/personal/data',
    children: [{
      path: 'data',
      component: () => import('@/views/Personal/Data.vue'),
      name: '个人资料'
    },
    {
      path: 'setting',
      component: () => import('@/views/Personal/Setting.vue'),
      name: '个人设置'
    }
    ]
  },
  // 404 页面跳转
  {
    path: '*',
    redirect: {path: '/'}
  }
]

export default routes
