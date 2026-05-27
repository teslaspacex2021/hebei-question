<template>
  <div>
    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: #E6F7FF; color: #1890FF;">
          <el-icon :size="22"><Document /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value" style="color: #1890FF;">{{ totalIssues }}</div>
          <div class="stat-label">全部问题</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #FFF7E6; color: #D48806;">
          <el-icon :size="22"><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value" style="color: #D48806;">{{ pendingCount }}</div>
          <div class="stat-label">待处理</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #E6F7FF; color: #1890FF;">
          <el-icon :size="22"><Loading /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value" style="color: #1890FF;">{{ inProgressCount }}</div>
          <div class="stat-label">解决中</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #F6FFED; color: #52C41A;">
          <el-icon :size="22"><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value" style="color: #52C41A;">{{ completedCount }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #FFF1F0; color: #F5222D;">
          <el-icon :size="22"><WarningFilled /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value" style="color: #F5222D;">{{ overdueCount }}</div>
          <div class="stat-label">已超期</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #F0E6FF; color: #722ED1;">
          <el-icon :size="22"><StarFilled /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value" style="color: #722ED1;">{{ avgSatisfaction }}</div>
          <div class="stat-label">平均满意度</div>
        </div>
      </div>
    </div>

    <!-- 两栏布局：待办 + 图表 -->
    <el-row :gutter="12">
      <el-col :span="16">
        <div class="table-card">
          <div class="table-header">
            <span class="table-title">待办</span>
          </div>
          <el-table
            v-if="personalTodos.length > 0"
            :data="personalTodos"
            class="compact-table"
            size="small"
            :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: 600, padding: '8px 0' }"
          >
            <el-table-column prop="title" label="待办事项" min-width="220" show-overflow-tooltip />
            <el-table-column prop="typeLabel" label="流程类型" width="110" />
            <el-table-column prop="currentStage" label="当前环节" min-width="130" show-overflow-tooltip />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <span :class="'status-tag status-' + row.status">{{ row.statusLabel }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="date" label="截止日期" width="110" />
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleTodo(row)">处理</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无待办" :image-size="60" style="padding: 24px;" />
        </div>
      </el-col>
      <el-col :span="8">
        <div class="table-card" style="margin-bottom: 12px;">
          <div class="table-header">
            <span class="table-title">问题分类分布</span>
          </div>
          <div ref="chartRef" class="chart-container" style="height: 250px;"></div>
        </div>
        <div class="table-card">
          <div class="table-header">
            <span class="table-title">各部门完成率</span>
          </div>
          <div ref="deptBarRef" class="chart-container" style="height: 250px;"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { mockIssues, deptStats, planTodos, currentUser, supervisionOrders, issueOrganizes, issueCorrectionTodos } from '../mock/data'

const router = useRouter()
const chartRef = ref(null)
const deptBarRef = ref(null)

// 统计数据
const totalIssues = computed(() => mockIssues.length)
const pendingCount = computed(() => mockIssues.filter(i => i.status === 'pending').length)
const inProgressCount = computed(() => mockIssues.filter(i => i.status === 'in_progress').length)
const completedCount = computed(() => mockIssues.filter(i => i.status === 'completed').length)
const overdueCount = computed(() => mockIssues.filter(i => i.status === 'overdue').length)
const avgSatisfaction = computed(() => {
  const rated = mockIssues.filter(i => i.satisfaction > 0)
  if (rated.length === 0) return '—'
  return (rated.reduce((s, i) => s + i.satisfaction, 0) / rated.length).toFixed(1)
})

const personalTodos = computed(() => {
  const todos = []
  const seen = new Set()
  const activeStatuses = ['pending', 'in_progress', 'overdue']

  planTodos
    .filter(t => t.department === currentUser.department && t.status === 'pending')
    .forEach(t => {
      todos.push({
        id: t.id,
        title: t.title,
        type: 'plan',
        typeLabel: '调研计划',
        currentStage: '计划填报',
        status: t.status,
        statusLabel: t.statusLabel,
        date: t.createDate,
        link: '/dept-board',
      })
      seen.add(t.id)
    })

  mockIssues.forEach(issue => {
    const isParentResponsible = issue.responsible === currentUser.name

    if (isParentResponsible && activeStatuses.includes(issue.status) && !seen.has(issue.id)) {
      todos.push({
        id: issue.id,
        title: issue.title,
        type: 'issue',
        typeLabel: '调研问题处理',
        currentStage: issue.flowNodeLabel || '—',
        status: issue.status,
        statusLabel: issue.statusLabel,
        date: issue.deadline || issue.updateDate,
        link: `/issues/${issue.id}`,
      })
      seen.add(issue.id)
    }

    issue.subIssues?.forEach(sub => {
      if (isParentResponsible) return

      const isHandler = sub.handler?.includes(currentUser.name)
      const needUpdate = sub.collaborators?.some(c => c.name === currentUser.name && !c.hasUpdated)
      if ((isHandler || needUpdate) && activeStatuses.includes(sub.status) && !seen.has(sub.id)) {
        todos.push({
          id: sub.id,
          title: `${issue.title} - ${sub.title}`,
          type: 'issue',
          typeLabel: '调研问题处理',
          currentStage: issue.flowNodeLabel || '—',
          status: sub.status,
          statusLabel: sub.statusLabel,
          date: sub.deadline || issue.deadline || issue.updateDate,
          link: `/issues/${issue.id}`,
        })
        seen.add(sub.id)
      }
    })
  })

  supervisionOrders
    .filter(o => o.targetDept === currentUser.department && o.status !== 'completed')
    .forEach(o => {
      if (seen.has(o.id)) return
      todos.push({
        id: o.id,
        title: `督办：${o.issueTitle}`,
        type: 'supervision',
        typeLabel: '领导督办',
        currentStage: o.flowNodeLabel || '—',
        status: o.status === 'in_progress' ? 'in_progress' : 'pending',
        statusLabel: o.statusLabel || '督办中',
        date: o.deadline || o.createDate,
        link: '/leader',
      })
      seen.add(o.id)
    })

  issueOrganizes
    .filter(item => item.department === currentUser.department && item.status === 'pending')
    .forEach(item => {
      if (seen.has(item.id)) return
      todos.push({
        id: item.id,
        title: `问题整理：${item.id}`,
        type: 'organize',
        typeLabel: '部门问题整理',
        currentStage: '待部门主任审批',
        status: 'pending',
        statusLabel: item.statusLabel || '待审批',
        date: item.createDate,
        link: '/dept-board',
      })
      seen.add(item.id)
    })

  issueCorrectionTodos
    .filter(item => item.handler === currentUser.name && ['pending', 'in_progress', 'overdue'].includes(item.status))
    .forEach(item => {
      if (seen.has(item.id)) return
      todos.push({
        id: item.id,
        title: `纠错：${item.issueTitle}`,
        type: 'correction',
        typeLabel: '调研纠错处理',
        currentStage: item.currentStage || '发起人纠错处理',
        status: item.status,
        statusLabel: item.statusLabel || '待处理',
        date: item.deadline || item.createDate,
        link: `/issues/${item.issueId}`,
      })
      seen.add(item.id)
    })

  return todos
})

function handleTodo(todo) {
  router.push(todo.link)
}

// 图表
onMounted(async () => {
  await nextTick()
  if (!chartRef.value) return
  const chart = echarts.init(chartRef.value)
  const categoryCount = {}
  mockIssues.forEach(i => {
    categoryCount[i.categoryLabel] = (categoryCount[i.categoryLabel] || 0) + 1
  })
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['35%', '60%'],
      center: ['50%', '42%'],
      data: Object.entries(categoryCount).map(([name, value]) => ({ name, value })),
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 13 } },
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
    }],
    color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#722ED1', '#13C2C2'],
  })
  window.addEventListener('resize', () => chart.resize())

  if (deptBarRef.value) {
    const chart2 = echarts.init(deptBarRef.value)
    const topDepts = deptStats.slice(0, 8)
    chart2.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 80, right: 20, top: 10, bottom: 30 },
      xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      yAxis: { type: 'category', data: topDepts.map(d => d.dept), axisLabel: { fontSize: 11 } },
      series: [{
        type: 'bar',
        data: topDepts.map(d => d.total > 0 ? Math.round(d.completed / d.total * 100) : 0),
        itemStyle: {
          color: (params) => params.value >= 80 ? '#67C23A' : params.value >= 50 ? '#409EFF' : '#F56C6C',
        },
        label: { show: true, position: 'right', fontSize: 11, formatter: '{c}%' },
        barWidth: 14,
      }],
    })
    window.addEventListener('resize', () => chart2.resize())
  }
})
</script>
