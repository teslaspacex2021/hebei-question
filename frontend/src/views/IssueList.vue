<template>
  <div>
    <!-- 统计卡片（与工作台一致，按问题状态） -->
    <div class="stats-row">
      <div class="stat-card" style="cursor: pointer;" @click="activeTab = 'all'">
        <div class="stat-icon" style="background: #E6F7FF; color: #1890FF;">
          <el-icon :size="22"><Document /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value" style="color: #1890FF;">{{ totalCount }}</div>
          <div class="stat-label">全部问题</div>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;" @click="activeTab = 'pending'">
        <div class="stat-icon" style="background: #FFF7E6; color: #D48806;">
          <el-icon :size="22"><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value" style="color: #D48806;">{{ pendingAcceptCount }}</div>
          <div class="stat-label">待处理</div>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;" @click="activeTab = 'in_progress'">
        <div class="stat-icon" style="background: #E6F7FF; color: #1890FF;">
          <el-icon :size="22"><Loading /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value" style="color: #1890FF;">{{ inProgressCount }}</div>
          <div class="stat-label">解决中</div>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;" @click="activeTab = 'completed'">
        <div class="stat-icon" style="background: #F6FFED; color: #52C41A;">
          <el-icon :size="22"><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value" style="color: #52C41A;">{{ completedCount }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;">
        <div class="stat-icon" style="background: #FFF1F0; color: #F5222D;">
          <el-icon :size="22"><WarningFilled /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value" style="color: #F5222D;">{{ overdueCount }}</div>
          <div class="stat-label">已超期</div>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;">
        <div class="stat-icon" style="background: #F0E6FF; color: #722ED1;">
          <el-icon :size="22"><StarFilled /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value" style="color: #722ED1;">{{ avgSatisfaction }}</div>
          <div class="stat-label">平均满意度</div>
        </div>
      </div>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="filter-bar">
      <el-input v-model="searchText" placeholder="输入标题关键字" :prefix-icon="Search" style="width: 220px;" size="default" clearable />
      <div style="flex: 1;"></div>
      <span style="font-size: 12px; color: #999; margin-right: 8px;">排序：更新日期-升序</span>
      <el-button size="default" :icon="Filter">筛选</el-button>
      <el-button size="default" :icon="Setting">字段配置</el-button>
      <el-button type="primary" size="default" @click="$router.push('/issues/create')">
        <el-icon><Plus /></el-icon> 新建问题
      </el-button>
    </div>

    <!-- 数据表格 -->
    <div class="table-card">
      <el-table
        :data="filteredIssues"
        class="compact-table"
        size="small"
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: 600, padding: '8px 0' }"
        @row-click="showDetail"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div style="padding: 12px 20px;">
              <div class="detail-item">
                <span class="detail-label">问题编号：</span>
                <span class="detail-value">{{ row.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">调研日期：</span>
                <span class="detail-value">{{ row.surveyDate }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">调研地点：</span>
                <span class="detail-value">{{ row.surveyLocation }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">调研领导：</span>
                <span class="detail-value">{{ row.leader }}</span>
              </div>
              <div class="detail-item" v-if="row.replyContent">
                <span class="detail-label">答复内容：</span>
                <span class="detail-value">{{ row.replyContent }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="问题名称" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 6px;">
              <el-icon v-if="row.pinned" :size="14" style="color: #E6A23C;" title="置顶"><Top /></el-icon>
              <el-icon v-if="row.supervised" :size="14" style="color: #F56C6C;"><Warning /></el-icon>
              <span style="cursor: pointer; color: #333;">{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="流程节点" width="100">
          <template #default="{ row }">
            <span class="flow-tag" :style="{
              background: getFlowColor(row.flowNode) + '18',
              color: getFlowColor(row.flowNode)
            }">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px;"
                :style="{ background: getFlowColor(row.flowNode) }"></span>
              {{ row.flowNodeLabel }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="进度" width="90">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="6" :show-text="true" style="width: 70px;" />
          </template>
        </el-table-column>
        <el-table-column label="进展状态" width="80">
          <template #default="{ row }">
            <span :class="'status-tag status-' + row.status">{{ row.statusLabel }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="进展描述" min-width="100" show-overflow-tooltip />
        <el-table-column prop="updateDate" label="更新日期" width="100" sortable>
          <template #default="{ row }">
            <span :style="{ color: isOverdue(row) ? '#F5222D' : '#333' }">{{ row.updateDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="responsible" label="负责人" width="70" />
        <el-table-column prop="handler" label="当前处理人" width="90" show-overflow-tooltip />
        <el-table-column prop="deadline" label="截止日期" width="100">
          <template #default="{ row }">
            <span :style="{ color: isDeadlineNear(row) ? '#F5222D' : '#333' }">{{ row.deadline }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="action-btns" style="gap: 2px; flex-wrap: nowrap;">
              <el-button
                type="primary"
                link
                size="small"
                @click.stop="handleCommand('detail', row)"
              >详情</el-button>
              <el-button
                v-if="row.status === 'draft'"
                type="primary"
                link
                size="small"
                @click.stop="handleCommand('edit', row)"
              >编辑</el-button>
              <el-button
                type="warning"
                link
                size="small"
                @click.stop="handleCommand('pin', row)"
              >{{ row.pinned ? '取消置顶' : '置顶' }}</el-button>
              <el-button
                v-if="row.status === 'draft'"
                type="danger"
                link
                size="small"
                @click.stop="handleCommand('delete', row)"
              >删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-bar">
        <span class="total-text">共问题 {{ filteredIssues.length }} 条</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :total="filteredIssues.length"
          layout="sizes, prev, pager, next"
          size="small"
        />
      </div>
    </div>

    <!-- 更新进展弹框 -->
    <el-dialog v-model="progressDialogVisible" title="更新进展" width="560px" :close-on-click-modal="false">
      <div v-if="progressForm.issue" style="background: #f6f8fa; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px;">
        <div style="font-size: 13px; color: #333; font-weight: 600;">{{ progressForm.issue.title }}</div>
        <div style="font-size: 12px; color: #999; margin-top: 4px;">{{ progressForm.issue.id }} | {{ progressForm.issue.department }}</div>
      </div>
      <el-form label-width="90px" size="default">
        <el-form-item label="当前进度" required>
          <el-slider v-model="progressForm.progress" :min="0" :max="100" show-input style="padding-right: 20px;" />
        </el-form-item>
        <el-form-item label="进展描述" required>
          <el-input v-model="progressForm.content" type="textarea" :rows="4" placeholder="请输入进展描述内容..." />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload action="#" :auto-upload="false" :limit="5">
            <el-button size="small"><el-icon><Upload /></el-icon> 上传附件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="progressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProgress">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Filter, Setting, Plus, MoreFilled, EditPen, Upload, Top } from '@element-plus/icons-vue'
import { mockIssues, flowNodes, progressLogs } from '../mock/data'

const router = useRouter()
const activeTab = ref('all')
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const progressDialogVisible = ref(false)
const localIssues = ref([...mockIssues])

// 进展更新表单
const progressForm = ref({
  issue: null,
  progress: 0,
  content: '',
})

const filteredIssues = computed(() => {
  let list = [...localIssues.value]
  if (activeTab.value === 'pending') {
    list = list.filter(i => i.status === 'pending')
  } else if (activeTab.value === 'in_progress') {
    list = list.filter(i => i.status === 'in_progress')
  } else if (activeTab.value === 'completed') {
    list = list.filter(i => i.status === 'completed')
  } else if (activeTab.value === 'supervised') {
    list = list.filter(i => i.supervised)
  }
  if (searchText.value) {
    list = list.filter(i => i.title.includes(searchText.value))
  }
  // 置顶问题排在前面
  return list.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return b.updateDate.localeCompare(a.updateDate)
  })
})

const totalCount = computed(() => localIssues.value.length)
const pendingAcceptCount = computed(() => localIssues.value.filter(i => i.status === 'pending').length)
const inProgressCount = computed(() => localIssues.value.filter(i => i.status === 'in_progress').length)
const completedCount = computed(() => localIssues.value.filter(i => i.status === 'completed').length)
const overdueCount = computed(() => localIssues.value.filter(i => i.status === 'overdue').length)
const supervisedCount = computed(() => localIssues.value.filter(i => i.supervised).length)
const avgSatisfaction = computed(() => {
  const rated = localIssues.value.filter(i => i.satisfaction > 0)
  if (rated.length === 0) return '—'
  return (rated.reduce((s, i) => s + i.satisfaction, 0) / rated.length).toFixed(1)
})

function getFlowColor(node) {
  const fn = flowNodes.find(f => f.value === node)
  return fn ? fn.color : '#909399'
}

function isOverdue(row) {
  return row.status !== 'completed' && new Date(row.deadline) < new Date()
}

function isDeadlineNear(row) {
  if (row.status === 'completed') return false
  const diff = new Date(row.deadline) - new Date()
  return diff < 7 * 24 * 60 * 60 * 1000 && diff > 0
}

function showDetail(row) {
  router.push(`/issues/${row.id}`)
}

function handleCommand(cmd, row) {
  if (cmd === 'detail') {
    showDetail(row)
  } else if (cmd === 'edit') {
    // 暂以详情页作为编辑入口
    showDetail(row)
  } else if (cmd === 'pin') {
    const idx = localIssues.value.findIndex(i => i.id === row.id)
    if (idx !== -1) {
      localIssues.value[idx] = { ...localIssues.value[idx], pinned: !localIssues.value[idx].pinned }
      ElMessage.success(localIssues.value[idx].pinned ? '已置顶' : '已取消置顶')
    }
  } else if (cmd === 'delete') {
    if (row.status !== 'draft') {
      ElMessage.warning('仅草稿状态的问题可以删除')
      return
    }
    const idx = localIssues.value.findIndex(i => i.id === row.id)
    if (idx !== -1) {
      localIssues.value.splice(idx, 1)
      ElMessage.success(`已删除草稿问题「${row.title}」`)
    }
  }
}

function openProgressDialog(row) {
  progressForm.value = {
    issue: row,
    progress: row.progress,
    content: '',
  }
  progressDialogVisible.value = true
}

function submitProgress() {
  if (!progressForm.value.content) {
    ElMessage.warning('请输入进展描述')
    return
  }
  const issue = progressForm.value.issue
  const idx = localIssues.value.findIndex(i => i.id === issue.id)
  if (idx !== -1) {
    localIssues.value[idx] = {
      ...localIssues.value[idx],
      progress: progressForm.value.progress,
      updateDate: new Date().toISOString().split('T')[0],
    }
  }
  ElMessage.success('进展已更新')
  progressDialogVisible.value = false
}
</script>
