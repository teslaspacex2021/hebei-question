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

    <!-- 及时更新率 -->
    <div class="filter-bar" style="margin-bottom: 12px;">
      <span style="font-size: 13px; color: #666;">及时更新率：</span>
      <span style="font-size: 16px; font-weight: 700; color: #1890FF;">88.4%</span>
      <span class="rate-change down" style="font-size: 12px; margin-left: 4px;">▼ -11.6%</span>
      <div style="flex: 1;"></div>
      <span style="font-size: 12px; color: #999;">今日截止: <b style="color: #F5222D;">0</b></span>
      <el-divider direction="vertical" />
      <span style="font-size: 12px; color: #999;">今日新增: <b style="color: #D48806;">0</b></span>
      <el-divider direction="vertical" />
      <span style="font-size: 12px; color: #999;">今日完成: <b style="color: #52C41A;">0</b></span>
      <el-divider direction="vertical" />
      <span style="font-size: 12px; color: #999;">今日更新: <b style="color: #1890FF;">0</b></span>
    </div>

    <!-- 两栏布局：问题列表 + 图表 -->
    <el-row :gutter="12">
      <el-col :span="16">
        <div class="table-card">
          <div class="table-header">
            <span class="table-title">最新问题动态</span>
            <el-button type="primary" size="small" @click="$router.push('/issues')">查看全部</el-button>
          </div>
          <el-table
            :data="recentIssues"
            class="compact-table"
            size="small"
            :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: 600, padding: '8px 0' }"
          >
            <el-table-column prop="title" label="问题名称" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span v-if="row.supervised" class="supervise-badge">
                    <el-icon :size="12"><Warning /></el-icon>
                  </span>
                  <span>{{ row.title }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="categoryLabel" label="分类" width="100" />
            <el-table-column prop="flowNodeLabel" label="流程节点" width="90">
              <template #default="{ row }">
                <span class="flow-tag" :style="{ background: getFlowColor(row.flowNode) + '18', color: getFlowColor(row.flowNode) }">
                  {{ row.flowNodeLabel }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="进度" width="100">
              <template #default="{ row }">
                <el-progress :percentage="row.progress" :stroke-width="6" :show-text="true" style="width: 80px;" />
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <span :class="'status-tag status-' + row.status">{{ row.statusLabel }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="updateDate" label="更新日期" width="100" />
            <el-table-column prop="responsible" label="负责人" width="70" />
          </el-table>
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
            <span class="table-title">阶段总结</span>
          </div>
          <div style="padding: 12px 16px;">
            <div v-for="item in summaries" :key="item.id" style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0;">
              <div style="font-size: 13px; font-weight: 600; color: #333; margin-bottom: 4px;">{{ item.title }}</div>
              <div style="font-size: 12px; color: #999;">{{ item.department }} · {{ item.author }} · {{ item.createDate }}</div>
              <div style="font-size: 12px; color: #666; margin-top: 4px; line-height: 1.6;">{{ item.content }}</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { mockIssues, issueCategories, flowNodes, stageSummaries } from '../mock/data'

const chartRef = ref(null)
const summaries = ref(stageSummaries)

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

// 最近问题
const recentIssues = computed(() =>
  [...mockIssues].sort((a, b) => b.updateDate.localeCompare(a.updateDate)).slice(0, 10)
)

// 流程节点颜色
function getFlowColor(node) {
  const fn = flowNodes.find(f => f.value === node)
  return fn ? fn.color : '#909399'
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
})
</script>
