<template>
  <div>
    <!-- 部门选择 -->
    <div class="filter-bar" style="margin-bottom: 12px;">
      <span style="font-size: 13px; font-weight: 600; color: #333; margin-right: 8px;">部门看板</span>
      <el-select v-model="selectedDept" placeholder="选择部门" size="default" style="width: 160px;">
        <el-option v-for="d in deptOptions" :key="d" :label="d" :value="d" />
      </el-select>
      <div style="flex: 1;"></div>
      <el-radio-group v-model="viewMode" size="default">
        <el-radio-button value="detail">明细视图</el-radio-button>
        <el-radio-button value="summary">阶段总结</el-radio-button>
        <el-radio-button value="stats">统计概览</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 部门统计卡片 -->
    <div class="stats-row" v-if="currentDeptStats">
      <div class="stat-card">
        <div class="stat-info" style="text-align: center; width: 100%;">
          <div class="stat-value" style="color: #1890FF;">{{ currentDeptStats.total }}</div>
          <div class="stat-label">问题总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-info" style="text-align: center; width: 100%;">
          <div class="stat-value" style="color: #D48806;">{{ currentDeptStats.pending }}</div>
          <div class="stat-label">待处理</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-info" style="text-align: center; width: 100%;">
          <div class="stat-value" style="color: #1890FF;">{{ currentDeptStats.inProgress }}</div>
          <div class="stat-label">解决中</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-info" style="text-align: center; width: 100%;">
          <div class="stat-value" style="color: #52C41A;">{{ currentDeptStats.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-info" style="text-align: center; width: 100%;">
          <div class="stat-value" style="color: #F5222D;">{{ currentDeptStats.overdue }}</div>
          <div class="stat-label">已超期</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-info" style="text-align: center; width: 100%;">
          <div class="stat-value" style="color: #D48806;">{{ currentDeptStats.satisfaction || '—' }}</div>
          <div class="stat-label">满意度</div>
        </div>
      </div>
    </div>

    <!-- 明细视图 -->
    <div v-if="viewMode === 'detail'" class="table-card">
      <div class="table-header">
        <span class="table-title">{{ selectedDept }} - 问题明细</span>
        <div style="display: flex; gap: 8px;">
          <el-checkbox v-model="showOnlyVisible">仅显示全省可见</el-checkbox>
          <el-button size="small">
            <el-icon><Download /></el-icon> 导出
          </el-button>
        </div>
      </div>
      <el-table
        :data="deptIssues"
        class="compact-table"
        size="small"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: 600, padding: '8px 0' }"
      >
        <el-table-column prop="title" label="问题名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 6px;">
              <el-icon v-if="row.supervised" :size="14" style="color: #F56C6C;"><Warning /></el-icon>
              <span>{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="categoryLabel" label="分类" width="100" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <span :class="'status-tag status-' + row.status">{{ row.statusLabel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="进度" width="100">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="6" style="width: 80px;" />
          </template>
        </el-table-column>
        <el-table-column prop="responsible" label="负责人" width="70" />
        <el-table-column label="答复内容" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.replyContent || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="满意度" width="90">
          <template #default="{ row }">
            <el-rate v-if="row.satisfaction > 0" v-model="row.satisfaction" disabled :max="5" size="small" />
            <span v-else style="color: #ccc;">—</span>
          </template>
        </el-table-column>
        <el-table-column label="督办" width="60">
          <template #default="{ row }">
            <el-tag v-if="row.supervised" type="danger" size="small">是</el-tag>
            <span v-else style="color: #ccc;">—</span>
          </template>
        </el-table-column>
        <el-table-column label="全省可见" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.provinceVisible" size="small" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 阶段总结 -->
    <div v-if="viewMode === 'summary'">
      <div class="filter-bar" style="margin-bottom: 12px;">
        <el-radio-group v-model="summaryPeriod" size="default">
          <el-radio-button value="q1">一季度</el-radio-button>
          <el-radio-button value="h1">上半年</el-radio-button>
          <el-radio-button value="q3">三季度</el-radio-button>
          <el-radio-button value="full">全年</el-radio-button>
        </el-radio-group>
        <div style="flex: 1;"></div>
        <el-button type="primary" size="default">
          <el-icon><Upload /></el-icon> 上传阶段总结
        </el-button>
      </div>
      <div class="table-card" style="padding: 20px;">
        <div style="text-align: center; padding: 40px;">
          <el-icon :size="48" style="color: #ddd; margin-bottom: 12px;"><Document /></el-icon>
          <p style="color: #999; font-size: 14px;">{{ selectedDept }} - {{ periodLabels[summaryPeriod] }}总结</p>
          <p style="color: #666; font-size: 13px; line-height: 1.8; max-width: 600px; margin: 12px auto;">
            本阶段共接收调研问题 {{ currentDeptStats?.total || 0 }} 个，
            已完成 {{ currentDeptStats?.completed || 0 }} 个，
            完成率 {{ completionRate }}%。
            平均满意度 {{ currentDeptStats?.satisfaction || '暂无' }}。
            {{ currentDeptStats?.overdue > 0 ? '存在 ' + currentDeptStats.overdue + ' 个超期问题需要关注。' : '无超期问题。' }}
          </p>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div v-if="viewMode === 'stats'">
      <el-row :gutter="12">
        <el-col :span="12">
          <div class="table-card" style="margin-bottom: 12px;">
            <div class="table-header">
              <span class="table-title">各部门问题数量</span>
            </div>
            <div ref="deptChartRef" class="chart-container"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="table-card" style="margin-bottom: 12px;">
            <div class="table-header">
              <span class="table-title">各部门满意度</span>
            </div>
            <div ref="satisfactionChartRef" class="chart-container"></div>
          </div>
        </el-col>
      </el-row>
      <!-- 所有部门概览 -->
      <div class="board-grid">
        <div v-for="dept in allDeptStats" :key="dept.dept" class="board-card">
          <div class="card-title">{{ dept.dept }}</div>
          <div class="card-stats">
            <div class="card-stat-item">
              <div class="card-stat-value" style="color: #1890FF;">{{ dept.total }}</div>
              <div class="card-stat-label">总数</div>
            </div>
            <div class="card-stat-item">
              <div class="card-stat-value" style="color: #D48806;">{{ dept.pending }}</div>
              <div class="card-stat-label">待处理</div>
            </div>
            <div class="card-stat-item">
              <div class="card-stat-value" style="color: #52C41A;">{{ dept.completed }}</div>
              <div class="card-stat-label">已完成</div>
            </div>
            <div class="card-stat-item">
              <div class="card-stat-value" style="color: #F5222D;">{{ dept.overdue }}</div>
              <div class="card-stat-label">超期</div>
            </div>
          </div>
          <el-progress :percentage="dept.total > 0 ? Math.round(dept.completed / dept.total * 100) : 0" :stroke-width="6" />
          <div style="display: flex; justify-content: space-between; margin-top: 8px;">
            <span style="font-size: 11px; color: #999;">满意度</span>
            <span style="font-size: 13px; font-weight: 600; color: #D48806;">{{ dept.satisfaction || '—' }}★</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import * as echarts from 'echarts'
import { mockIssues, deptStats } from '../mock/data'
import { Download, Upload } from '@element-plus/icons-vue'

const selectedDept = ref('信息技术部')
const viewMode = ref('detail')
const showOnlyVisible = ref(false)
const summaryPeriod = ref('q1')
const deptChartRef = ref(null)
const satisfactionChartRef = ref(null)

const deptOptions = deptStats.map(d => d.dept)
const allDeptStats = ref(deptStats)

const periodLabels = { q1: '一季度', h1: '上半年', q3: '三季度', full: '全年' }

const currentDeptStats = computed(() => deptStats.find(d => d.dept === selectedDept.value))

const deptIssues = computed(() => {
  let list = mockIssues.filter(i => i.department === selectedDept.value)
    .map(i => ({ ...i, provinceVisible: i.status === 'completed' }))
  return list
})

const completionRate = computed(() => {
  const s = currentDeptStats.value
  if (!s || !s.total) return 0
  return Math.round(s.completed / s.total * 100)
})

// 图表初始化
function initCharts() {
  if (!deptChartRef.value || !satisfactionChartRef.value) return

  const chart1 = echarts.init(deptChartRef.value)
  chart1.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 80, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: deptStats.map(d => d.dept), axisLabel: { fontSize: 11 } },
    series: [
      { name: '已完成', type: 'bar', stack: 'total', data: deptStats.map(d => d.completed), itemStyle: { color: '#67C23A' } },
      { name: '解决中', type: 'bar', stack: 'total', data: deptStats.map(d => d.inProgress), itemStyle: { color: '#409EFF' } },
      { name: '待处理', type: 'bar', stack: 'total', data: deptStats.map(d => d.pending), itemStyle: { color: '#E6A23C' } },
      { name: '超期', type: 'bar', stack: 'total', data: deptStats.map(d => d.overdue), itemStyle: { color: '#F56C6C' } },
    ],
  })

  const chart2 = echarts.init(satisfactionChartRef.value)
  const validDepts = deptStats.filter(d => d.satisfaction > 0)
  chart2.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 80, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'value', max: 5 },
    yAxis: { type: 'category', data: validDepts.map(d => d.dept), axisLabel: { fontSize: 11 } },
    series: [{
      type: 'bar',
      data: validDepts.map(d => d.satisfaction),
      itemStyle: {
        color: (params) => {
          const v = params.value
          if (v >= 4.5) return '#67C23A'
          if (v >= 4) return '#409EFF'
          if (v >= 3) return '#E6A23C'
          return '#F56C6C'
        }
      },
      label: { show: true, position: 'right', fontSize: 11 },
    }],
  })

  window.addEventListener('resize', () => { chart1.resize(); chart2.resize() })
}

watch(viewMode, async (val) => {
  if (val === 'stats') {
    await nextTick()
    initCharts()
  }
})

onMounted(async () => {
  if (viewMode.value === 'stats') {
    await nextTick()
    initCharts()
  }
})
</script>
