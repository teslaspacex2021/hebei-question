<template>
  <div class="form-page" v-if="issue">
    <!-- 顶部操作栏 -->
    <div class="filter-bar" style="margin-bottom: 12px;">
      <el-button @click="$router.back()" size="default">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
      <span style="font-size: 15px; font-weight: 600; color: #333; margin-left: 8px;">{{ issue.title }}</span>
      <el-tag v-if="issue.pinned" type="danger" size="small" style="margin-left: 8px;">置顶</el-tag>
      <div style="flex: 1;"></div>
      <el-button type="primary" size="default" @click="openProgressDialog">
        <el-icon><EditPen /></el-icon> 更新进展
      </el-button>
    </div>

    <!-- 流程进度 -->
    <div class="form-card">
      <div class="form-section-title">流程进度</div>
      <div class="flow-chart-container">
        <div v-for="(node, idx) in allFlowNodes" :key="node.value" class="flow-node-wrapper">
          <div :class="['flow-node-circle', getNodeStatus(node.value, issue.flowNode)]">
            <span class="flow-node-idx">{{ idx + 1 }}</span>
          </div>
          <div class="flow-node-label" :class="{ active: node.value === issue.flowNode }">{{ node.label }}</div>
          <div v-if="idx < allFlowNodes.length - 1" :class="['flow-node-line', { done: isNodeDone(node.value, issue.flowNode) }]"></div>
        </div>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="form-card">
      <div class="form-section-title">基本信息</div>
      <el-row :gutter="16">
        <el-col :span="12">
          <div class="detail-item"><span class="detail-label">问题编号</span><span class="detail-value">{{ issue.id }}</span></div>
          <div class="detail-item"><span class="detail-label">问题分类</span><span class="detail-value">{{ issue.categoryLabel }}</span></div>
          <div class="detail-item"><span class="detail-label">所属部门</span><span class="detail-value">{{ issue.department }}</span></div>
          <div class="detail-item"><span class="detail-label">负责人（主办）</span><span class="detail-value">{{ issue.responsible }}</span></div>
          <div class="detail-item"><span class="detail-label">当前处理人</span><span class="detail-value">{{ issue.handler || '—' }}</span></div>
        </el-col>
        <el-col :span="12">
          <div class="detail-item"><span class="detail-label">当前状态</span><span class="detail-value"><span :class="'status-tag status-' + issue.status">{{ issue.statusLabel }}</span></span></div>
          <div class="detail-item"><span class="detail-label">流程节点</span><span class="detail-value">{{ issue.flowNodeLabel }}</span></div>
          <div class="detail-item"><span class="detail-label">调研日期</span><span class="detail-value">{{ issue.surveyDate }}</span></div>
          <div class="detail-item"><span class="detail-label">调研地点</span><span class="detail-value">{{ issue.surveyLocation }}</span></div>
          <div class="detail-item">
            <span class="detail-label">截止日期</span>
            <span class="detail-value" :style="{ color: isDeadlineNear ? '#F5222D' : '' }">
              {{ issue.deadline }}
              <span v-if="issue.delayedDeadline" style="color: #E6A23C; margin-left: 8px;">
                (已延期至 {{ issue.delayedDeadline }})
              </span>
            </span>
          </div>
        </el-col>
      </el-row>
      <div class="detail-item" style="margin-top: 4px;">
        <span class="detail-label">进度</span>
        <span class="detail-value"><el-progress :percentage="issue.progress" :stroke-width="10" style="width: 400px;" /></span>
      </div>
      <div class="detail-item" v-if="issue.replyContent">
        <span class="detail-label">答复内容</span>
        <span class="detail-value">{{ issue.replyContent }}</span>
      </div>
      <div class="detail-item" v-if="issue.satisfaction > 0">
        <span class="detail-label">满意度</span>
        <span class="detail-value"><el-rate v-model="issue.satisfaction" disabled /></span>
      </div>
      <div class="detail-item" v-if="issue.supervised">
        <span class="detail-label">督办状态</span>
        <span class="detail-value supervise-badge"><el-icon><Warning /></el-icon> 已被督办</span>
      </div>
    </div>

    <!-- 子问题处理情况 -->
    <div class="form-card" v-if="issue.subIssues && issue.subIssues.length > 0">
      <div class="form-section-title">子问题处理情况</div>
      <el-table
        :data="issue.subIssues"
        class="compact-table"
        size="small"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: 600, padding: '8px 0' }"
      >
        <el-table-column prop="id" label="子问题编号" width="160" />
        <el-table-column prop="title" label="子问题名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="handler" label="处理人" width="90" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <span :class="'status-tag status-' + row.status">{{ row.statusLabel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="进度" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="6" style="width: 90px;" />
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止日期" width="110" />
      </el-table>
    </div>

    <!-- 进展更新记录 -->
    <div class="form-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div class="form-section-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">进展更新记录</div>
        <el-button type="primary" size="small" @click="openProgressDialog">
          <el-icon><EditPen /></el-icon> 更新进展
        </el-button>
      </div>
      <el-timeline v-if="currentLogs.length > 0">
        <el-timeline-item
          v-for="log in currentLogs"
          :key="log.id"
          :timestamp="log.date"
          placement="top"
          :color="log.updateType === 'proactive' ? '#409EFF' : '#67C23A'"
        >
          <div style="background: #f6f8fa; padding: 10px 14px; border-radius: 6px; border: 1px solid #e8e8e8;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 13px; font-weight: 600; color: #333;">{{ log.user }}</span>
                <el-tag v-if="log.updateType === 'proactive'" type="primary" size="small">主动更新</el-tag>
                <el-tag v-else type="success" size="small">例行更新</el-tag>
              </div>
              <span style="font-size: 12px; color: #999;">进度: {{ log.progress }}%</span>
            </div>
            <div style="font-size: 13px; color: #666; line-height: 1.6;">{{ log.content }}</div>
          </div>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无进展更新记录" :image-size="60" />
    </div>

    <!-- 更新进展弹框 -->
    <el-dialog v-model="progressDialogVisible" title="更新进展" width="560px" :close-on-click-modal="false">
      <div style="background: #f6f8fa; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px;">
        <div style="font-size: 13px; color: #333; font-weight: 600;">{{ issue.title }}</div>
        <div style="font-size: 12px; color: #999; margin-top: 4px;">{{ issue.id }} | {{ issue.department }}</div>
      </div>
      <el-form label-width="90px" size="default">
        <el-form-item label="当前进度" required>
          <el-slider v-model="progressForm.progress" :min="0" :max="100" show-input style="padding-right: 20px;" />
        </el-form-item>
        <el-form-item label="进展描述" required>
          <el-input v-model="progressForm.content" type="textarea" :rows="4" placeholder="请输入进展描述内容..." />
        </el-form-item>
        <el-form-item label="问题状态">
          <el-radio-group v-model="progressForm.status">
            <el-radio value="in_progress">解决中</el-radio>
            <el-radio value="completed">已完成</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- 如果到了截止时间未完成，支持延期 -->
        <el-form-item v-if="isOverdue && progressForm.status !== 'completed' && !issue.delayedDeadline" label="延期时间">
          <el-date-picker v-model="progressForm.delayedDeadline" type="date" placeholder="选择新的截止日期" style="width: 100%;" />
          <div style="font-size: 11px; color: #E6A23C; margin-top: 4px;">已超截止时间，可申请延期（仅支持修改一次）</div>
        </el-form-item>
        <el-form-item v-if="issue.delayedDeadline" label="延期信息">
          <span style="color: #E6A23C;">已延期至 {{ issue.delayedDeadline }}（不可再次修改）</span>
        </el-form-item>
        <el-form-item label="更新类型">
          <el-radio-group v-model="progressForm.updateType">
            <el-radio value="proactive">主动更新</el-radio>
            <el-radio value="routine">例行更新</el-radio>
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

  <div v-else style="text-align: center; padding: 100px;">
    <el-empty description="问题不存在" />
    <el-button type="primary" @click="$router.push('/issues')">返回问题列表</el-button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, EditPen, Upload, Warning } from '@element-plus/icons-vue'
import { mockIssues, progressLogs } from '../mock/data'

const route = useRoute()
const issueId = route.params.id

// 找到问题数据
const issue = ref(null)
const found = mockIssues.find(i => i.id === issueId)
if (found) {
  issue.value = { ...found }
}

// 流程节点
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

const nodeOrder = ['initiate', 'dept_review', 'accept_review', 'level1', 'level2', 'accept_confirm', 'initiator_confirm', 'completed']

function getNodeStatus(nodeValue, currentNode) {
  const currentIdx = nodeOrder.indexOf(currentNode)
  const nodeIdx = nodeOrder.indexOf(nodeValue)
  if (nodeIdx < currentIdx) return 'done'
  if (nodeIdx === currentIdx) return 'current'
  return 'pending'
}

function isNodeDone(nodeValue, currentNode) {
  return nodeOrder.indexOf(nodeValue) < nodeOrder.indexOf(currentNode)
}

const isDeadlineNear = computed(() => {
  if (!issue.value || issue.value.status === 'completed') return false
  const deadline = issue.value.delayedDeadline || issue.value.deadline
  const diff = new Date(deadline) - new Date()
  return diff < 7 * 24 * 60 * 60 * 1000
})

const isOverdue = computed(() => {
  if (!issue.value || issue.value.status === 'completed') return false
  return new Date(issue.value.deadline) < new Date()
})

// 进展记录，增加 updateType 区分
const localLogs = ref([])
const currentLogs = computed(() => {
  const original = progressLogs[issueId] || []
  const withType = original.map(log => ({
    ...log,
    updateType: log.updateType || 'routine',
  }))
  return [...localLogs.value, ...withType]
})

// 进展更新表单
const progressDialogVisible = ref(false)
const progressForm = ref({
  progress: 0,
  content: '',
  status: 'in_progress',
  updateType: 'proactive',
  delayedDeadline: null,
})

function openProgressDialog() {
  progressForm.value = {
    progress: issue.value?.progress || 0,
    content: '',
    status: issue.value?.status === 'completed' ? 'completed' : 'in_progress',
    updateType: 'proactive',
    delayedDeadline: null,
  }
  progressDialogVisible.value = true
}

function submitProgress() {
  if (!progressForm.value.content) {
    ElMessage.warning('请输入进展描述')
    return
  }
  // 处理延期
  if (progressForm.value.delayedDeadline && !issue.value.delayedDeadline) {
    const dateStr = new Date(progressForm.value.delayedDeadline).toISOString().split('T')[0]
    issue.value.delayedDeadline = dateStr
  }
  // 更新问题状态
  if (progressForm.value.status === 'completed') {
    issue.value.status = 'completed'
    issue.value.statusLabel = '已完成'
    issue.value.progress = 100
  } else {
    issue.value.progress = progressForm.value.progress
  }
  // 添加进展记录
  localLogs.value.unshift({
    id: Date.now(),
    date: new Date().toLocaleString('zh-CN'),
    user: '段磊',
    content: progressForm.value.content,
    progress: progressForm.value.status === 'completed' ? 100 : progressForm.value.progress,
    updateType: progressForm.value.updateType,
  })
  ElMessage.success('进展已更新')
  progressDialogVisible.value = false
}
</script>
