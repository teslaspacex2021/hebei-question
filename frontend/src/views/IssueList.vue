<template>
  <div>
    <!-- Tab 过滤 -->
    <div class="filter-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab-item', { active: activeTab === tab.value }]"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </div>
      <div style="flex: 1;"></div>
      <div class="update-rate" style="padding: 6px 14px;">
        <span>及时更新率：</span>
        <span class="rate-value" style="color: #1890FF;">88.4%</span>
        <span class="rate-change down">▼ -11.6%</span>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card" style="cursor: pointer;" @click="activeTab = 'all'">
        <div class="stat-info" style="text-align: center; width: 100%;">
          <div class="stat-value" style="color: #1890FF; font-size: 26px;">{{ totalCount }}</div>
          <div class="stat-label">全部</div>
          <div style="font-size: 11px; color: #999; margin-top: 2px;">待接受 {{ pendingAcceptCount }} 进行中 {{ inProgressCount }}</div>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;" @click="activeTab = 'completed'">
        <div class="stat-info" style="text-align: center; width: 100%;">
          <div class="stat-value" style="color: #52C41A; font-size: 26px;">{{ completedCount }}</div>
          <div class="stat-label">已完结</div>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;">
        <div class="stat-info" style="text-align: center; width: 100%;">
          <div class="stat-value" style="color: #F5222D; font-size: 26px;">{{ overdueCount }}</div>
          <div class="stat-label">已超期</div>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;">
        <div class="stat-info" style="text-align: center; width: 100%;">
          <div class="stat-value" style="color: #D48806; font-size: 26px;">0</div>
          <div class="stat-label">逾期更新</div>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;">
        <div class="stat-info" style="text-align: center; width: 100%;">
          <div class="stat-value" style="color: #722ED1; font-size: 26px;">{{ supervisedCount }}</div>
          <div class="stat-label">超期未更新</div>
        </div>
      </div>
    </div>

    <!-- 搜索和操作栏 -->
    <div class="filter-bar">
      <el-input v-model="searchText" placeholder="输入标题关键字" :prefix-icon="Search" style="width: 220px;" size="default" clearable />
      <el-select v-model="filterDept" placeholder="负责人" size="default" clearable style="width: 120px;">
        <el-option v-for="d in responsibleList" :key="d" :label="d" :value="d" />
      </el-select>
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
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button
                v-if="row.status !== 'completed'"
                type="primary"
                link
                size="small"
                @click.stop="openProgressDialog(row)"
              >更新进展</el-button>
              <el-button
                v-else
                type="success"
                link
                size="small"
              >重启</el-button>
              <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, row)">
                <el-button link size="small" @click.stop>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="detail">查看详情</el-dropdown-item>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item v-if="row.status !== 'completed'" command="supervise">督办</el-dropdown-item>
                    <el-dropdown-item divided command="delete" style="color: #F56C6C;">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
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

    <!-- ========== 问题详情抽屉（加宽+流程图+进展记录） ========== -->
    <el-drawer v-model="detailVisible" :title="currentIssue?.title" size="720px" :destroy-on-close="true">
      <template v-if="currentIssue">
        <!-- 流程图 -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #409EFF;">流程进度</div>
          <div class="flow-chart-container">
            <div v-for="(node, idx) in allFlowNodes" :key="node.value" class="flow-node-wrapper">
              <div :class="['flow-node-circle', getNodeStatus(node.value, currentIssue.flowNode)]">
                <span class="flow-node-idx">{{ idx + 1 }}</span>
              </div>
              <div class="flow-node-label" :class="{ active: node.value === currentIssue.flowNode }">{{ node.label }}</div>
              <div v-if="idx < allFlowNodes.length - 1" :class="['flow-node-line', { done: isNodeDone(node.value, currentIssue.flowNode) }]"></div>
            </div>
          </div>
        </div>

        <!-- 基本信息 -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #409EFF;">基本信息</div>
          <el-row :gutter="16">
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">问题编号</span><span class="detail-value">{{ currentIssue.id }}</span></div>
              <div class="detail-item"><span class="detail-label">问题分类</span><span class="detail-value">{{ currentIssue.categoryLabel }}</span></div>
              <div class="detail-item"><span class="detail-label">所属部门</span><span class="detail-value">{{ currentIssue.department }}</span></div>
              <div class="detail-item"><span class="detail-label">负责人</span><span class="detail-value">{{ currentIssue.responsible }}</span></div>
              <div class="detail-item"><span class="detail-label">当前处理人</span><span class="detail-value">{{ currentIssue.handler || '—' }}</span></div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">当前状态</span><span class="detail-value"><span :class="'status-tag status-' + currentIssue.status">{{ currentIssue.statusLabel }}</span></span></div>
              <div class="detail-item"><span class="detail-label">流程节点</span><span class="detail-value">{{ currentIssue.flowNodeLabel }}</span></div>
              <div class="detail-item"><span class="detail-label">调研日期</span><span class="detail-value">{{ currentIssue.surveyDate }}</span></div>
              <div class="detail-item"><span class="detail-label">调研地点</span><span class="detail-value">{{ currentIssue.surveyLocation }}</span></div>
              <div class="detail-item"><span class="detail-label">截止日期</span><span class="detail-value" :style="{ color: isDeadlineNear(currentIssue) ? '#F5222D' : '' }">{{ currentIssue.deadline }}</span></div>
            </el-col>
          </el-row>
          <div class="detail-item" style="margin-top: 4px;">
            <span class="detail-label">进度</span>
            <span class="detail-value"><el-progress :percentage="currentIssue.progress" :stroke-width="10" style="width: 300px;" /></span>
          </div>
          <div class="detail-item" v-if="currentIssue.replyContent">
            <span class="detail-label">答复内容</span>
            <span class="detail-value">{{ currentIssue.replyContent }}</span>
          </div>
          <div class="detail-item" v-if="currentIssue.satisfaction > 0">
            <span class="detail-label">满意度</span>
            <span class="detail-value"><el-rate v-model="currentIssue.satisfaction" disabled /></span>
          </div>
          <div class="detail-item" v-if="currentIssue.supervised">
            <span class="detail-label">督办状态</span>
            <span class="detail-value supervise-badge"><el-icon><Warning /></el-icon> 已被督办</span>
          </div>
        </div>

        <!-- 进展更新记录 -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #409EFF;">
            <span style="font-size: 14px; font-weight: 600; color: #333;">进展更新记录</span>
            <el-button v-if="currentIssue.status !== 'completed'" type="primary" size="small" @click="openProgressDialog(currentIssue)">
              <el-icon><EditPen /></el-icon> 更新进展
            </el-button>
          </div>
          <el-timeline v-if="currentLogs.length > 0">
            <el-timeline-item
              v-for="log in currentLogs"
              :key="log.id"
              :timestamp="log.date"
              placement="top"
              :color="'#409EFF'"
            >
              <div style="background: #f6f8fa; padding: 10px 14px; border-radius: 6px; border: 1px solid #e8e8e8;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="font-size: 13px; font-weight: 600; color: #333;">{{ log.user }}</span>
                  <span style="font-size: 12px; color: #999;">进度: {{ log.progress }}%</span>
                </div>
                <div style="font-size: 13px; color: #666; line-height: 1.6;">{{ log.content }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无进展更新记录" :image-size="60" />
        </div>
      </template>
    </el-drawer>

    <!-- ========== 更新进展弹框 ========== -->
    <el-dialog v-model="progressDialogVisible" title="更新进展" width="520px" :close-on-click-modal="false">
      <div v-if="progressForm.issue" style="background: #f6f8fa; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px;">
        <div style="font-size: 13px; color: #333; font-weight: 600;">{{ progressForm.issue.title }}</div>
        <div style="font-size: 12px; color: #999; margin-top: 4px;">{{ progressForm.issue.id }} · {{ progressForm.issue.department }}</div>
      </div>
      <el-form label-width="80px" size="default">
        <el-form-item label="当前进度" required>
          <el-slider v-model="progressForm.progress" :min="0" :max="100" show-input style="padding-right: 20px;" />
        </el-form-item>
        <el-form-item label="进展描述" required>
          <el-input v-model="progressForm.content" type="textarea" :rows="4" placeholder="请输入进展描述内容..." />
        </el-form-item>
        <el-form-item label="进展状态">
          <el-radio-group v-model="progressForm.status">
            <el-radio value="in_progress">解决中</el-radio>
            <el-radio value="completed">已完成</el-radio>
          </el-radio-group>
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
import { ElMessage } from 'element-plus'
import { Search, Filter, Setting, Plus, MoreFilled, EditPen, Upload } from '@element-plus/icons-vue'
import { mockIssues, flowNodes, progressLogs } from '../mock/data'

const activeTab = ref('all')
const searchText = ref('')
const filterDept = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const detailVisible = ref(false)
const currentIssue = ref(null)
const progressDialogVisible = ref(false)

// 完整流程节点列表
const allFlowNodes = [
  { value: 'initiate', label: '发起' },
  { value: 'dept_review', label: '部门主任审核' },
  { value: 'accept_review', label: '接单部门审核' },
  { value: 'level1', label: '一级办理(副主任)' },
  { value: 'level2', label: '二级办理(主管)' },
  { value: 'accept_confirm', label: '接单部门确认' },
  { value: 'initiator_confirm', label: '发起人确认' },
  { value: 'completed', label: '已完结' },
]

// 进展更新表单
const progressForm = ref({
  issue: null,
  progress: 0,
  content: '',
  status: 'in_progress',
})

const tabs = [
  { value: 'all', label: '全部' },
  { value: 'mine', label: '我负责的' },
  { value: 'handle', label: '我处理的' },
  { value: 'created', label: '我创建的' },
  { value: 'watched', label: '我关注的' },
]

const responsibleList = computed(() => [...new Set(mockIssues.map(i => i.responsible))])

const filteredIssues = computed(() => {
  let list = [...mockIssues]
  if (activeTab.value === 'completed') {
    list = list.filter(i => i.status === 'completed')
  } else if (activeTab.value === 'mine') {
    list = list.filter(i => i.responsible === '段磊')
  }
  if (searchText.value) {
    list = list.filter(i => i.title.includes(searchText.value))
  }
  if (filterDept.value) {
    list = list.filter(i => i.responsible === filterDept.value)
  }
  return list.sort((a, b) => b.updateDate.localeCompare(a.updateDate))
})

const totalCount = computed(() => mockIssues.length)
const pendingAcceptCount = computed(() => mockIssues.filter(i => i.status === 'pending').length)
const inProgressCount = computed(() => mockIssues.filter(i => i.status === 'in_progress').length)
const completedCount = computed(() => mockIssues.filter(i => i.status === 'completed').length)
const overdueCount = computed(() => mockIssues.filter(i => i.status === 'overdue').length)
const supervisedCount = computed(() => mockIssues.filter(i => i.supervised).length)

// 当前问题的进展记录
const currentLogs = computed(() => {
  if (!currentIssue.value) return []
  return progressLogs[currentIssue.value.id] || []
})

function getFlowColor(node) {
  const fn = flowNodes.find(f => f.value === node)
  return fn ? fn.color : '#909399'
}

// 流程节点状态
const nodeOrder = ['initiate', 'dept_review', 'accept_review', 'level1', 'level2', 'accept_confirm', 'initiator_confirm', 'completed']

function getNodeStatus(nodeValue, currentNode) {
  const currentIdx = nodeOrder.indexOf(currentNode)
  const nodeIdx = nodeOrder.indexOf(nodeValue)
  if (nodeIdx < currentIdx) return 'done'
  if (nodeIdx === currentIdx) return 'current'
  return 'pending'
}

function isNodeDone(nodeValue, currentNode) {
  const currentIdx = nodeOrder.indexOf(currentNode)
  const nodeIdx = nodeOrder.indexOf(nodeValue)
  return nodeIdx < currentIdx
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
  currentIssue.value = { ...row }
  detailVisible.value = true
}

function handleCommand(cmd, row) {
  if (cmd === 'detail') {
    showDetail(row)
  } else if (cmd === 'supervise') {
    ElMessage.warning(`已对"${row.title}"发起督办`)
  }
}

function openProgressDialog(row) {
  progressForm.value = {
    issue: row,
    progress: row.progress,
    content: '',
    status: 'in_progress',
  }
  progressDialogVisible.value = true
}

function submitProgress() {
  if (!progressForm.value.content) {
    ElMessage.warning('请输入进展描述')
    return
  }
  ElMessage.success('进展已更新')
  progressDialogVisible.value = false
}
</script>
