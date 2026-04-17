import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: '工作台' }
  },
  {
    path: '/issues',
    name: 'Issues',
    component: () => import('../views/IssueList.vue'),
    meta: { title: '问题管理' }
  },
  {
    path: '/issues/create',
    name: 'IssueCreate',
    component: () => import('../views/IssueCreate.vue'),
    meta: { title: '新建问题' }
  },
  {
    path: '/issues/:id',
    name: 'IssueDetail',
    component: () => import('../views/IssueDetail.vue'),
    meta: { title: '问题详情' }
  },
  {
    path: '/leader',
    name: 'LeaderView',
    component: () => import('../views/LeaderView.vue'),
    meta: { title: '领导视窗' }
  },
  {
    path: '/dept-board',
    name: 'DeptBoard',
    component: () => import('../views/DeptBoard.vue'),
    meta: { title: '部门看板' }
  },
  {
    path: '/dept-board/issue-organize/create',
    name: 'IssueOrganizeCreate',
    component: () => import('../views/IssueOrganizeCreate.vue'),
    meta: { title: '新增问题整理' }
  },
  {
    path: '/dept-board/issue-organize/:id',
    name: 'IssueOrganizeDetail',
    component: () => import('../views/IssueOrganizeDetail.vue'),
    meta: { title: '问题整理详情' }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
