<template>
  <div class="app-layout">
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
          <span class="menu-item-label">
            <span class="menu-item-text">工作台</span>
            <span v-if="personalTodoCount > 0" class="menu-todo-count">
              {{ personalTodoCount > 99 ? '99+' : personalTodoCount }}
            </span>
          </span>
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
      </el-menu>
    </aside>

    <section class="main-area">
      <header class="top-header">
        <span class="page-title">{{ currentPageTitle }}</span>
        <div class="header-actions">
          <el-dropdown>
            <el-button type="primary" size="default">
              {{ currentUser.name }} <el-icon class="el-icon--right"><ArrowDown /></el-icon>
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import {
  mockIssues,
  planTodos,
  supervisionOrders,
  issueOrganizes,
  issueCorrectionTodos,
  progressUpdateTodos,
  currentUser,
} from './mock/data'

const route = useRoute()

const activeMenu = computed(() => route.path)
const currentPageTitle = computed(() => route.meta?.title || '工作台')

/** 当前用户的待办数量（与工作台「待办」一致） */
const personalTodoCount = computed(() => {
  const seen = new Set()
  let count = 0
  const activeStatuses = ['pending', 'in_progress', 'overdue']

  planTodos
    .filter(t => t.department === currentUser.department && t.status === 'pending')
    .forEach(t => {
      if (!seen.has(t.id)) {
        seen.add(t.id)
        count += 1
      }
    })

  mockIssues.forEach(issue => {
    const isParentResponsible = issue.responsible === currentUser.name
    const isDaily = issue.issueType === 'daily'

    if (isParentResponsible && activeStatuses.includes(issue.status) && !seen.has(issue.id)) {
      seen.add(issue.id)
      count += 1
    }

    if (isDaily) {
      if (!isParentResponsible) {
        const isHandler = issue.handler?.includes(currentUser.name)
        if (isHandler && activeStatuses.includes(issue.status) && !seen.has(issue.id)) {
          seen.add(issue.id)
          count += 1
        }
      }
      issue.subIssues?.forEach(sub => {
        if (isParentResponsible) return
        const isHandler = sub.handler?.includes(currentUser.name)
        const needUpdate = sub.collaborators?.some(c => c.name === currentUser.name && !c.hasUpdated)
        if ((isHandler || needUpdate) && activeStatuses.includes(sub.status) && !seen.has(sub.id)) {
          seen.add(sub.id)
          count += 1
        }
      })
      return
    }

    issue.subIssues?.forEach(sub => {
      if (isParentResponsible) return
      const isHandler = sub.handler?.includes(currentUser.name)
      const needUpdate = sub.collaborators?.some(c => c.name === currentUser.name && !c.hasUpdated)
      if ((isHandler || needUpdate) && activeStatuses.includes(sub.status) && !seen.has(sub.id)) {
        seen.add(sub.id)
        count += 1
      }
    })
  })

  supervisionOrders
    .filter(o => o.targetDept === currentUser.department && o.status !== 'completed')
    .forEach(o => {
      if (!seen.has(o.id)) {
        seen.add(o.id)
        count += 1
      }
    })

  issueOrganizes
    .filter(item => item.department === currentUser.department && item.status === 'pending')
    .forEach(item => {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        count += 1
      }
    })

  issueCorrectionTodos
    .filter(item => item.handler === currentUser.name && ['pending', 'in_progress', 'overdue'].includes(item.status))
    .forEach(item => {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        count += 1
      }
    })

  progressUpdateTodos
    .filter(
      item =>
        item.handler === currentUser.name &&
        item.status === 'pending' &&
        (mockIssues.find(i => i.id === item.issueId)?.issueType || 'survey') === 'survey',
    )
    .forEach(item => {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        count += 1
      }
    })

  return count
})
</script>
