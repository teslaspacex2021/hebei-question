<template>
  <div>
    <!-- 组织筛选 -->
    <div class="filter-bar" style="margin-bottom: 12px;">
      <span style="font-size: 13px; font-weight: 600; color: #333; margin-right: 8px;">部门看板</span>
      <el-cascader
        v-model="selectedOrg"
        :options="orgOptions"
        :props="{ checkStrictly: true, expandTrigger: 'hover' }"
        placeholder="组织筛选"
        size="default"
        clearable
        style="width: 240px;"
        @change="onOrgChange"
      />
      <div style="flex: 1;"></div>
      <el-radio-group v-model="viewMode" size="default">
        <el-radio-button value="todo">调研计划待办</el-radio-button>
        <el-radio-button value="detail">明细视图</el-radio-button>
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

    <!-- 调研计划待办 -->
    <div v-if="viewMode === 'todo'">
      <div class="table-card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span style="font-size: 14px; font-weight: 600; color: #333;">调研计划待办</span>
          <span style="font-size: 12px; color: #999;">系统每年1月1日自动为每个部门发起2条待办</span>
        </div>
        <div v-if="deptPlanTodos.length > 0">
          <div v-for="todo in deptPlanTodos" :key="todo.id"
            style="background: #fafafa; border-radius: 8px; padding: 16px; margin-bottom: 12px; border: 1px solid #e8e8e8;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <el-icon v-if="todo.status === 'pending'" :size="18" style="color: #D48806;"><Clock /></el-icon>
                <el-icon v-else :size="18" style="color: #52C41A;"><CircleCheck /></el-icon>
                <span style="font-size: 14px; font-weight: 600; color: #333;">{{ todo.title }}</span>
              </div>
              <el-tag :type="todo.status === 'completed' ? 'success' : 'warning'" size="small">{{ todo.statusLabel }}</el-tag>
            </div>
            <div style="font-size: 12px; color: #999; margin-bottom: 8px;">
              待办编号：{{ todo.id }} | 部门：{{ todo.department }} | 创建日期：{{ todo.createDate }}
              <span v-if="todo.submitDate"> | 提交日期：{{ todo.submitDate }}</span>
            </div>
            <div v-if="todo.status === 'completed'" style="font-size: 13px; color: #666; background: #f0f9eb; padding: 8px 12px; border-radius: 4px; margin-bottom: 8px;">
              {{ todo.content }}
            </div>
            <el-button v-if="todo.status === 'pending'" type="primary" size="small" @click="openTodoDialog(todo)">
              <el-icon><EditPen /></el-icon> 处理
            </el-button>
          </div>
        </div>
        <el-empty v-else description="当前部门暂无待办" :image-size="60" />
      </div>
    </div>

    <!-- 待办处理弹框 -->
    <el-dialog v-model="todoDialogVisible" title="调研计划待办填报" width="560px" :close-on-click-modal="false">
      <div v-if="currentTodo" style="background: #f6f8fa; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px;">
        <div style="font-size: 13px; color: #333; font-weight: 600;">{{ currentTodo.title }}</div>
        <div style="font-size: 12px; color: #999; margin-top: 4px;">{{ currentTodo.id }} | {{ currentTodo.department }}</div>
      </div>
      <el-form label-width="100px" size="default">
        <el-form-item label="填报内容" required>
          <el-input v-model="todoForm.content" type="textarea" :rows="5" placeholder="请输入调研计划相关内容..." />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload action="#" :auto-upload="false" :limit="5">
            <el-button size="small"><el-icon><Upload /></el-icon> 上传附件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="todoDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTodo">提交</el-button>
      </template>
    </el-dialog>

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
import { ElMessage } from 'element-plus'
import { mockIssues, deptStats, organizations, planTodos } from '../mock/data'
import { Download, Upload, EditPen, Clock, CircleCheck } from '@element-plus/icons-vue'

const selectedOrg = ref(['province', 'it'])
const selectedDept = ref('信息技术部')
const viewMode = ref('todo')
const showOnlyVisible = ref(false)
const deptChartRef = ref(null)
const satisfactionChartRef = ref(null)

// 待办相关
const todoDialogVisible = ref(false)
const currentTodo = ref(null)
const todoForm = ref({ content: '' })
const localPlanTodos = ref([...planTodos])

const orgOptions = organizations.map(org => ({
  value: org.value,
  label: org.label,
  children: org.children?.map(c => ({ value: c.value, label: c.label })),
}))

function onOrgChange(val) {
  if (val && val.length === 2) {
    const org = organizations.find(o => o.value === val[0])
    const dept = org?.children?.find(c => c.value === val[1])
    if (dept) selectedDept.value = dept.label
  } else if (val && val.length === 1) {
    selectedDept.value = ''
  }
}

const allDeptStats = ref(deptStats)

const currentDeptStats = computed(() => deptStats.find(d => d.dept === selectedDept.value))

// 当前部门的调研计划待办
const deptPlanTodos = computed(() => {
  if (!selectedDept.value) return localPlanTodos.value
  return localPlanTodos.value.filter(t => t.department === selectedDept.value)
})

function openTodoDialog(todo) {
  currentTodo.value = todo
  todoForm.value = { content: '' }
  todoDialogVisible.value = true
}

function submitTodo() {
  if (!todoForm.value.content) {
    ElMessage.warning('请输入填报内容')
    return
  }
  const idx = localPlanTodos.value.findIndex(t => t.id === currentTodo.value.id)
  if (idx !== -1) {
    localPlanTodos.value[idx] = {
      ...localPlanTodos.value[idx],
      status: 'completed',
      statusLabel: '已完成',
      content: todoForm.value.content,
      submitDate: new Date().toISOString().split('T')[0],
    }
  }
  ElMessage.success('待办已提交')
  todoDialogVisible.value = false
}

const deptIssues = computed(() => {
  if (!selectedDept.value) {
    return mockIssues.map(i => ({ ...i, provinceVisible: i.status === 'completed' }))
  }
  return mockIssues.filter(i => i.department === selectedDept.value)
    .map(i => ({ ...i, provinceVisible: i.status === 'completed' }))
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
