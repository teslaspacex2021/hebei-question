<template>
  <div class="app-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">调</div>
        <span class="logo-text">调研管理</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :router="true"
        background-color="transparent"
        text-color="rgba(255,255,255,0.7)"
        active-text-color="#fff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>工作台</span>
        </el-menu-item>
        <el-menu-item index="/issues">
          <el-icon><Document /></el-icon>
          <span>问题管理</span>
        </el-menu-item>
        <el-menu-item index="/leader">
          <el-icon><View /></el-icon>
          <span>领导视窗</span>
        </el-menu-item>
        <el-menu-item index="/dept-board">
          <el-icon><OfficeBuilding /></el-icon>
          <span>部门看板</span>
        </el-menu-item>
        <el-menu-item index="/plan">
          <el-icon><Calendar /></el-icon>
          <span>调研计划</span>
        </el-menu-item>
        <el-sub-menu index="settings">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/settings/users">用户管理</el-menu-item>
          <el-menu-item index="/settings/roles">角色管理</el-menu-item>
          <el-menu-item index="/settings/org">组织架构</el-menu-item>
          <el-menu-item index="/settings/flow">流程配置</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </aside>

    <!-- 主内容区 -->
    <section class="main-area">
      <header class="top-header">
        <span class="page-title">{{ currentPageTitle }}</span>
        <div class="header-actions">
          <el-input
            v-model="globalSearch"
            placeholder="搜索问题..."
            :prefix-icon="Search"
            style="width: 220px"
            size="default"
            clearable
          />
          <el-badge :value="3" :max="99">
            <el-button :icon="Bell" circle size="default" />
          </el-badge>
          <el-dropdown>
            <el-button type="primary" size="default">
              段磊 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      <main class="content-area">
        <router-view />
      </main>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Bell, ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const globalSearch = ref('')

const activeMenu = computed(() => route.path)
const currentPageTitle = computed(() => route.meta?.title || '工作台')
</script>
