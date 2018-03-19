<template>
  <section style="padding-top: 20px">

    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane v-for="(item, index) in subMenu"
                   :label="item.label"
                   :name="item.name"
                   :key="index"></el-tab-pane>
    </el-tabs>
    <transition name="fade" mode="out-in">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </transition>

  </section>
</template>

<script>
  export default {
    data () {
      return {
        subMenu: [
          {
            label: '职员列表',
            name: '/system/user/index'
          },
          {
            label: '职员权限管理',
            name: '/system/user/org'
          }
        ]
      }
    },
    computed: {
      activeName: {
        get () {
          return this.$route.fullPath
        },
        set () {
          // do nothing
        }
      }
    },
    methods: {
      handleClick (tab, event) {
        // 切换路由
        this.$router.push(tab.name)
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>
