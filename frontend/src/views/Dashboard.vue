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

    <!-- 待办模块 -->
    <div class="table-card">
      <div class="table-header todo-header">
        <el-tabs v-model="todoTab" class="todo-tabs">
          <el-tab-pane name="todo">
            <template #label>
              <span>待办</span>
              <el-badge
                v-if="personalTodos.length > 0"
                :value="personalTodos.length"
                class="todo-tab-badge"
                type="danger"
              />
            </template>
          </el-tab-pane>
          <el-tab-pane name="done">
            <template #label>
              <span>已办</span>
              <el-badge
                v-if="personalDone.length > 0"
                :value="personalDone.length"
                class="todo-tab-badge"
                type="info"
              />
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
      <el-table
        v-if="currentTodoList.length > 0"
        :data="pagedCurrentTodoList"
        class="compact-table todo-table"
        size="small"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: 600, padding: '8px 0' }"
        @row-click="handleTodo"
      >
        <el-table-column :label="todoTab === 'done' ? '已办事项' : '待办事项'" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="todo-title-link">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="typeLabel" label="流程类型" width="110" />
        <el-table-column prop="batch" label="所属调研批次" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span :style="{ color: row.batch && row.batch !== '—' ? '#595959' : '#bfbfbf' }">{{ row.batch || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="currentStage" label="当前环节" min-width="130" show-overflow-tooltip />
        <el-table-column prop="time" :label="todoTab === 'done' ? '处理时间' : '到达时间'" width="110" />
      </el-table>
      <div v-if="currentTodoList.length > 0" class="pagination-bar">
        <span class="total-text">共 {{ currentTotal }} 条</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="currentPageSize"
          :page-sizes="[10, 20, 50]"
          :total="currentTotal"
          layout="sizes, prev, pager, next"
          size="small"
        />
      </div>
      <el-empty
        v-else
        :description="todoTab === 'done' ? '暂无已办' : '暂无待办'"
        :image-size="60"
        style="padding: 24px;"
      />
    </div>

    <!-- 调研纠错处理 -->
    <el-dialog
      v-model="correctionHandleVisible"
      title="调研纠错处理"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div v-if="correctionHandleTarget" class="correction-handle-body">
        <div class="correction-issue-ref">
          <span class="correction-issue-ref__label">调研问题单据</span>
          <div class="correction-issue-ref__content">
            <el-button type="primary" link @click="goCorrectionIssueDetail">
              {{ correctionHandleTarget.issueId }}
            </el-button>
            <span class="correction-issue-ref__title">{{ correctionHandleTarget.issueTitle }}</span>
          </div>
        </div>
        <div v-if="correctionHandleTarget.feedback" class="correction-feedback-hint">
          纠错说明：{{ correctionHandleTarget.feedback }}
        </div>
        <el-form label-width="100px" size="default" style="margin-top: 12px;">
          <el-form-item label="原主办部门">
            <span style="font-size: 13px; color: #666;">{{ correctionHandleTarget.originalDept || '—' }}</span>
          </el-form-item>
          <el-form-item label="修正后部门" required>
            <el-select
              v-model="correctionCorrectedDept"
              placeholder="请选择修正后的部门"
              filterable
              style="width: 100%;"
            >
              <el-option
                v-for="d in departments"
                :key="d.value"
                :label="d.label"
                :value="d.label"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="correctionHandleVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCorrectionHandle">确认修正</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  mockIssues,
  planTodos,
  currentUser,
  supervisionOrders,
  issueOrganizes,
  issueCorrectionTodos,
  departments,
  getBatchNameByIssueId,
} from '../mock/data'

const router = useRouter()
const processedCorrectionIds = ref(new Set())
const correctionProcessTimes = ref({})
const correctionHandleVisible = ref(false)
const correctionHandleTarget = ref(null)
const correctionCorrectedDept = ref('')
const todoTab = ref('todo')
const todoPage = ref(1)
const todoPageSize = ref(10)
const donePage = ref(1)
const donePageSize = ref(10)

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
        batch: '—',
        time: t.createDate,
        link: '/dept-board',
      })
      seen.add(t.id)
    })

  mockIssues.forEach(issue => {
    const isParentResponsible = issue.responsible === currentUser.name
    const batchName = getBatchNameByIssueId(issue.id) || '—'

    if (isParentResponsible && activeStatuses.includes(issue.status) && !seen.has(issue.id)) {
      todos.push({
        id: issue.id,
        title: issue.title,
        type: 'issue',
        typeLabel: '调研问题处理',
        currentStage: issue.flowNodeLabel || '—',
        status: issue.status,
        statusLabel: issue.statusLabel,
        batch: batchName,
        time: issue.updateDate,
        link: `/issues/${issue.id}`,
      })
      seen.add(issue.id)
    }

    issue.subIssues?.forEach(sub => {
      if (isParentResponsible) return

      const isHandler = sub.handler?.includes(currentUser.name)
      const needUpdate = sub.collaborators?.some(c => c.name === currentUser.name && !c.hasUpdated)
      if ((isHandler || needUpdate) && activeStatuses.includes(sub.status) && !seen.has(sub.id)) {
        const collaborator = sub.collaborators?.find(c => c.name === currentUser.name)
        todos.push({
          id: sub.id,
          title: `${issue.title} - ${sub.title}`,
          type: 'issue',
          typeLabel: '调研问题处理',
          currentStage: issue.flowNodeLabel || '—',
          status: sub.status,
          statusLabel: sub.statusLabel,
          batch: batchName,
          time: collaborator?.updateDate || issue.updateDate,
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
        batch: getBatchNameByIssueId(o.issueId) || '—',
        time: o.createDate,
        link: `/issues/${o.issueId}`,
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
        batch: '—',
        time: item.createDate,
        link: '/dept-board',
      })
      seen.add(item.id)
    })

  issueCorrectionTodos
    .filter(
      item =>
        item.handler === currentUser.name &&
        ['pending', 'in_progress', 'overdue'].includes(item.status) &&
        !processedCorrectionIds.value.has(item.id),
    )
    .forEach(item => {
      if (seen.has(item.id)) return
      const relatedIssue = mockIssues.find(i => i.id === item.issueId)
      todos.push({
        id: item.id,
        title: `纠错：${item.issueTitle}`,
        type: 'correction',
        typeLabel: '调研纠错处理',
        currentStage: item.currentStage || '发起人纠错处理',
        status: item.status,
        statusLabel: item.statusLabel || '待处理',
        batch: getBatchNameByIssueId(item.issueId) || '—',
        issueId: item.issueId,
        issueTitle: item.issueTitle,
        originalDept: relatedIssue?.department || item.originalDept || '—',
        feedback: item.feedback || '',
        time: item.createDate,
        link: `/issues/${item.issueId}`,
      })
      seen.add(item.id)
    })

  return todos
})

const personalDone = computed(() => {
  const dones = []
  const seen = new Set()

  planTodos
    .filter(t => t.department === currentUser.department && t.status === 'completed')
    .forEach(t => {
      dones.push({
        id: t.id,
        title: t.title,
        type: 'plan',
        typeLabel: '调研计划',
        currentStage: '已完成',
        status: t.status,
        statusLabel: t.statusLabel,
        batch: '—',
        time: t.submitDate || t.createDate,
        link: '/dept-board',
      })
      seen.add(t.id)
    })

  mockIssues.forEach(issue => {
    const isParentResponsible = issue.responsible === currentUser.name
    const batchName = getBatchNameByIssueId(issue.id) || '—'
    if (isParentResponsible && issue.status === 'completed' && !seen.has(issue.id)) {
      dones.push({
        id: issue.id,
        title: issue.title,
        type: 'issue',
        typeLabel: '调研问题处理',
        currentStage: issue.flowNodeLabel || '已办结',
        status: issue.status,
        statusLabel: issue.statusLabel,
        batch: batchName,
        time: issue.updateDate,
        link: `/issues/${issue.id}`,
      })
      seen.add(issue.id)
    }

    issue.subIssues?.forEach(sub => {
      if (isParentResponsible) return
      const isHandler = sub.handler?.includes(currentUser.name)
      if (isHandler && sub.status === 'completed' && !seen.has(sub.id)) {
        dones.push({
          id: sub.id,
          title: `${issue.title} - ${sub.title}`,
          type: 'issue',
          typeLabel: '调研问题处理',
          currentStage: issue.flowNodeLabel || '已办结',
          status: sub.status,
          statusLabel: sub.statusLabel,
          batch: batchName,
          time: issue.updateDate,
          link: `/issues/${issue.id}`,
        })
        seen.add(sub.id)
      }
    })
  })

  supervisionOrders
    .filter(o => o.targetDept === currentUser.department && o.status === 'completed')
    .forEach(o => {
      if (seen.has(o.id)) return
      dones.push({
        id: o.id,
        title: `督办：${o.issueTitle}`,
        type: 'supervision',
        typeLabel: '领导督办',
        currentStage: o.flowNodeLabel || '已办结',
        status: 'completed',
        statusLabel: o.statusLabel || '已完成',
        batch: getBatchNameByIssueId(o.issueId) || '—',
        time: o.completeDate || o.createDate,
        link: `/issues/${o.issueId}`,
      })
      seen.add(o.id)
    })

  issueOrganizes
    .filter(item => item.department === currentUser.department && item.status !== 'pending')
    .forEach(item => {
      if (seen.has(item.id)) return
      dones.push({
        id: item.id,
        title: `问题整理：${item.id}`,
        type: 'organize',
        typeLabel: '部门问题整理',
        currentStage: item.statusLabel || '已审批',
        status: item.status,
        statusLabel: item.statusLabel || '已审批',
        batch: '—',
        time: item.approveDate || item.createDate,
        link: '/dept-board',
      })
      seen.add(item.id)
    })

  issueCorrectionTodos
    .filter(
      item =>
        item.handler === currentUser.name &&
        (item.status === 'completed' || processedCorrectionIds.value.has(item.id)),
    )
    .forEach(item => {
      if (seen.has(item.id)) return
      dones.push({
        id: item.id,
        title: `纠错：${item.issueTitle}`,
        type: 'correction',
        typeLabel: '调研纠错处理',
        currentStage: '已处理',
        status: 'completed',
        statusLabel: '已处理',
        batch: getBatchNameByIssueId(item.issueId) || '—',
        issueId: item.issueId,
        time: correctionProcessTimes.value[item.id] || item.processDate || item.createDate,
        link: `/issues/${item.issueId}`,
      })
      seen.add(item.id)
    })

  return dones.sort((a, b) => String(b.time || '').localeCompare(String(a.time || '')))
})

const currentTodoList = computed(() =>
  todoTab.value === 'done' ? personalDone.value : personalTodos.value,
)

const currentTotal = computed(() =>
  todoTab.value === 'done' ? personalDone.value.length : personalTodos.value.length,
)

const currentPage = computed({
  get: () => (todoTab.value === 'done' ? donePage.value : todoPage.value),
  set: (v) => {
    if (todoTab.value === 'done') donePage.value = v
    else todoPage.value = v
  },
})

const currentPageSize = computed({
  get: () => (todoTab.value === 'done' ? donePageSize.value : todoPageSize.value),
  set: (v) => {
    if (todoTab.value === 'done') donePageSize.value = v
    else todoPageSize.value = v
  },
})

const pagedCurrentTodoList = computed(() => {
  const page = currentPage.value
  const size = currentPageSize.value
  const start = (page - 1) * size
  return currentTodoList.value.slice(start, start + size)
})

function handleTodo(todo) {
  if (!todo) return
  if (todoTab.value === 'todo' && todo.type === 'correction') {
    openCorrectionHandleDialog(todo)
    return
  }
  if (todo.link) router.push(todo.link)
}

function openCorrectionHandleDialog(todo) {
  correctionHandleTarget.value = { ...todo }
  correctionCorrectedDept.value = todo.originalDept && todo.originalDept !== '—' ? todo.originalDept : ''
  correctionHandleVisible.value = true
}

function goCorrectionIssueDetail() {
  const id = correctionHandleTarget.value?.issueId
  if (id) router.push(`/issues/${id}`)
}

function submitCorrectionHandle() {
  if (!correctionCorrectedDept.value) {
    ElMessage.warning('请选择修正后的部门')
    return
  }
  const target = correctionHandleTarget.value
  if (!target) return
  if (correctionCorrectedDept.value === target.originalDept) {
    ElMessage.warning('修正后部门不能与原主办部门相同')
    return
  }
  processedCorrectionIds.value.add(target.id)
  correctionProcessTimes.value[target.id] = new Date().toISOString().split('T')[0]
  ElMessage.success(
    `已提交纠错：${target.issueTitle} 主办部门调整为「${correctionCorrectedDept.value}」`,
  )
  correctionHandleVisible.value = false
  correctionHandleTarget.value = null
  correctionCorrectedDept.value = ''
}

</script>

<style scoped>
.correction-handle-body {
  font-size: 13px;
}
.correction-issue-ref {
  background: #f6f8fa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 12px 14px;
}
.correction-issue-ref__label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
}
.correction-issue-ref__content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.correction-issue-ref__title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.correction-feedback-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #ad6800;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
  padding: 8px 10px;
  line-height: 1.5;
}
.todo-header {
  padding: 0 16px;
  border-bottom: none;
}
.todo-tabs {
  width: 100%;
}
.todo-tabs :deep(.el-tabs__header) {
  margin: 0;
}
.todo-tabs :deep(.el-tabs__item) {
  font-weight: 600;
  font-size: 14px;
  height: 38px;
  line-height: 38px;
}
.todo-tab-badge {
  margin-left: 6px;
}
.todo-tab-badge :deep(.el-badge__content) {
  height: 16px;
  line-height: 14px;
  padding: 0 5px;
  font-size: 11px;
  border: none;
}
.todo-table :deep(.el-table__row) {
  cursor: pointer;
}
.todo-title-link {
  color: #1f1f1f;
}
.todo-table :deep(.el-table__row:hover) .todo-title-link {
  color: #1890ff;
}
</style>
