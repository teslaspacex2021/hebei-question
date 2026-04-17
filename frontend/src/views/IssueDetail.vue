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
      <!-- 提交下一步约束提示 -->
      <div v-if="hasSubIssues && !allCollaboratorsUpdated" style="margin-top: 12px; background: #FFF7E6; border: 1px solid #FFE58F; border-radius: 6px; padding: 10px 14px; display: flex; align-items: center; gap: 8px;">
        <el-icon style="color: #FAAD14;"><WarningFilled /></el-icon>
        <span style="font-size: 13px; color: #D48806;">提示：所有子问题的协同处理人均需更新进展后，才可继续提交下一步处理。当前还有 {{ pendingCollaboratorsCount }} 位处理人未更新进展。</span>
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

    <!-- 子问题处理情况（增强版：含协同处理人） -->
    <div class="form-card" v-if="hasSubIssues">
      <div class="form-section-title">子问题处理情况</div>
      <div v-for="(sub, subIdx) in issue.subIssues" :key="sub.id"
        style="background: #fafafa; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #e8e8e8;">
        <!-- 子问题头部 -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 600; color: #409EFF; font-size: 14px;">{{ sub.id }}</span>
            <span style="font-weight: 600; color: #333;">{{ sub.title }}</span>
            <span :class="'status-tag status-' + sub.status">{{ sub.statusLabel }}</span>
          </div>
          <el-progress :percentage="sub.progress" :stroke-width="6" style="width: 120px;" />
        </div>

        <el-row :gutter="16" style="margin-bottom: 12px;">
          <el-col :span="6">
            <span style="font-size: 12px; color: #999;">处理人：</span>
            <span style="font-size: 13px; color: #333;">{{ sub.handler }}</span>
          </el-col>
          <el-col :span="6">
            <span style="font-size: 12px; color: #999;">截止日期：</span>
            <span style="font-size: 13px; color: #333;">{{ sub.deadline }}</span>
          </el-col>
          <el-col :span="6">
            <span style="font-size: 12px; color: #999;">主办部门：</span>
            <span style="font-size: 13px; color: #333;">{{ sub.mainDept || '—' }}</span>
          </el-col>
          <el-col :span="6">
            <span style="font-size: 12px; color: #999;">配合部门：</span>
            <span style="font-size: 13px; color: #333;">{{ sub.assistDepts?.length > 0 ? sub.assistDepts.join('、') : '—' }}</span>
          </el-col>
        </el-row>

        <!-- 协同处理人列表 -->
        <div style="margin-top: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 13px; font-weight: 600; color: #666;">协同处理人</span>
            <el-button type="primary" link size="small" @click="openAddCollaboratorDialog(subIdx)">
              <el-icon><Plus /></el-icon> 添加协同处理人
            </el-button>
          </div>
          <el-table
            v-if="sub.collaborators && sub.collaborators.length > 0"
            :data="sub.collaborators"
            size="small"
            :header-cell-style="{ background: '#f0f2f5', color: '#333', fontWeight: 600, padding: '6px 0' }"
          >
            <el-table-column prop="name" label="姓名" width="90" />
            <el-table-column prop="dept" label="部门" width="110" />
            <el-table-column label="角色" width="80">
              <template #default="{ row }">
                <el-tag :type="row.role === 'main' ? 'primary' : 'info'" size="small">
                  {{ row.role === 'main' ? '主办' : '协办' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="进展更新" min-width="200">
              <template #default="{ row }">
                <div v-if="row.hasUpdated">
                  <span style="font-size: 12px; color: #333;">{{ row.updateContent }}</span>
                  <div style="font-size: 11px; color: #999; margin-top: 2px;">{{ row.updateDate }}</div>
                </div>
                <span v-else style="color: #E6A23C; font-size: 12px;">
                  <el-icon><WarningFilled /></el-icon> 待更新进展
                </span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="row.hasUpdated ? 'success' : 'warning'" size="small">
                  {{ row.hasUpdated ? '已更新' : '待更新' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="90" align="center">
              <template #default="{ row }">
                <el-button v-if="!row.hasUpdated" type="primary" link size="small" @click="openCollaboratorUpdateDialog(subIdx, row)">
                  更新
                </el-button>
                <span v-else style="color: #67C23A; font-size: 12px;">
                  <el-icon><CircleCheck /></el-icon>
                </span>
              </template>
            </el-table-column>
          </el-table>
          <div v-else style="text-align: center; padding: 12px; color: #999; font-size: 12px;">暂无协同处理人</div>

          <!-- 全部更新完成提示 -->
          <div v-if="isSubIssueAllUpdated(sub)" style="margin-top: 8px; background: #F6FFED; border: 1px solid #B7EB8F; border-radius: 4px; padding: 6px 12px; display: flex; align-items: center; gap: 6px;">
            <el-icon style="color: #52C41A;"><CircleCheck /></el-icon>
            <span style="font-size: 12px; color: #52C41A;">所有协同处理人已完成进展更新</span>
          </div>
          <div v-else-if="sub.collaborators && sub.collaborators.length > 0" style="margin-top: 8px; background: #FFFBE6; border: 1px solid #FFE58F; border-radius: 4px; padding: 6px 12px; display: flex; align-items: center; gap: 6px;">
            <el-icon style="color: #FAAD14;"><WarningFilled /></el-icon>
            <span style="font-size: 12px; color: #D48806;">
              还有 {{ sub.collaborators.filter(c => !c.hasUpdated).length }} 位处理人未更新进展，无法提交下一步
            </span>
          </div>
        </div>
      </div>
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
      <!-- 未全部更新时提示 -->
      <div v-if="hasSubIssues && !allCollaboratorsUpdated" style="background: #FFF7E6; border: 1px solid #FFE58F; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        <el-icon style="color: #FAAD14;"><WarningFilled /></el-icon>
        <span style="font-size: 12px; color: #D48806;">注意：仍有协同处理人未更新进展，当前仅可更新个人进展，无法提交到下一步流程节点。</span>
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

    <!-- 添加协同处理人弹框 -->
    <el-dialog v-model="addCollaboratorVisible" title="添加协同处理人" width="480px" :close-on-click-modal="false">
      <div v-if="currentSubIssueIdx !== null" style="background: #f6f8fa; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px;">
        <div style="font-size: 13px; color: #333; font-weight: 600;">{{ issue.subIssues[currentSubIssueIdx]?.title }}</div>
        <div style="font-size: 12px; color: #999; margin-top: 4px;">{{ issue.subIssues[currentSubIssueIdx]?.id }}</div>
      </div>
      <el-form label-width="80px" size="default">
        <el-form-item label="姓名" required>
          <el-input v-model="collaboratorForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="部门" required>
          <el-select v-model="collaboratorForm.dept" placeholder="选择部门" style="width: 100%;">
            <el-option v-for="d in deptList" :key="d.value" :label="d.label" :value="d.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" required>
          <el-radio-group v-model="collaboratorForm.role">
            <el-radio value="main">主办</el-radio>
            <el-radio value="assist">协办</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addCollaboratorVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddCollaborator">确定添加</el-button>
      </template>
    </el-dialog>

    <!-- 协同处理人更新进展弹框 -->
    <el-dialog v-model="collaboratorUpdateVisible" title="更新协同进展" width="480px" :close-on-click-modal="false">
      <div v-if="currentCollaborator" style="background: #f6f8fa; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px;">
        <div style="font-size: 13px; color: #333; font-weight: 600;">{{ currentCollaborator.name }} - {{ currentCollaborator.dept }}</div>
        <div style="font-size: 12px; color: #999; margin-top: 4px;">
          角色：{{ currentCollaborator.role === 'main' ? '主办' : '协办' }}
        </div>
      </div>
      <el-form label-width="80px" size="default">
        <el-form-item label="进展内容" required>
          <el-input v-model="collaboratorUpdateForm.content" type="textarea" :rows="4" placeholder="请输入进展更新内容..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="collaboratorUpdateVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCollaboratorUpdate">确认更新</el-button>
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
import { ArrowLeft, EditPen, Upload, Warning, Plus, CircleCheck, WarningFilled } from '@element-plus/icons-vue'
import { mockIssues, progressLogs, departments } from '../mock/data'

const route = useRoute()
const issueId = route.params.id
const deptList = departments

const issue = ref(null)
const found = mockIssues.find(i => i.id === issueId)
if (found) {
  issue.value = JSON.parse(JSON.stringify(found))
}

const hasSubIssues = computed(() => issue.value?.subIssues?.length > 0)

const allCollaboratorsUpdated = computed(() => {
  if (!issue.value?.subIssues) return true
  return issue.value.subIssues.every(sub =>
    !sub.collaborators || sub.collaborators.length === 0 || sub.collaborators.every(c => c.hasUpdated)
  )
})

const pendingCollaboratorsCount = computed(() => {
  if (!issue.value?.subIssues) return 0
  return issue.value.subIssues.reduce((count, sub) => {
    if (!sub.collaborators) return count
    return count + sub.collaborators.filter(c => !c.hasUpdated).length
  }, 0)
})

function isSubIssueAllUpdated(sub) {
  if (!sub.collaborators || sub.collaborators.length === 0) return false
  return sub.collaborators.every(c => c.hasUpdated)
}

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

const localLogs = ref([])
const currentLogs = computed(() => {
  const original = progressLogs[issueId] || []
  const withType = original.map(log => ({
    ...log,
    updateType: log.updateType || 'routine',
  }))
  return [...localLogs.value, ...withType]
})

// ===== 进展更新 =====
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
  if (progressForm.value.delayedDeadline && !issue.value.delayedDeadline) {
    const dateStr = new Date(progressForm.value.delayedDeadline).toISOString().split('T')[0]
    issue.value.delayedDeadline = dateStr
  }
  if (progressForm.value.status === 'completed') {
    if (hasSubIssues.value && !allCollaboratorsUpdated.value) {
      ElMessage.warning('所有协同处理人需先更新进展，才能标记为已完成')
      return
    }
    issue.value.status = 'completed'
    issue.value.statusLabel = '已完成'
    issue.value.progress = 100
  } else {
    issue.value.progress = progressForm.value.progress
  }
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

// ===== 添加协同处理人 =====
const addCollaboratorVisible = ref(false)
const currentSubIssueIdx = ref(null)
const collaboratorForm = ref({ name: '', dept: '', role: 'assist' })

function openAddCollaboratorDialog(subIdx) {
  currentSubIssueIdx.value = subIdx
  collaboratorForm.value = { name: '', dept: '', role: 'assist' }
  addCollaboratorVisible.value = true
}

function submitAddCollaborator() {
  if (!collaboratorForm.value.name || !collaboratorForm.value.dept) {
    ElMessage.warning('请填写姓名和部门')
    return
  }
  const sub = issue.value.subIssues[currentSubIssueIdx.value]
  if (!sub.collaborators) sub.collaborators = []
  sub.collaborators.push({
    id: 'c' + Date.now(),
    name: collaboratorForm.value.name,
    dept: collaboratorForm.value.dept,
    role: collaboratorForm.value.role,
    hasUpdated: false,
    updateContent: '',
    updateDate: '',
  })
  ElMessage.success(`已添加协同处理人：${collaboratorForm.value.name}`)
  addCollaboratorVisible.value = false
}

// ===== 协同处理人更新进展 =====
const collaboratorUpdateVisible = ref(false)
const currentCollaborator = ref(null)
const currentCollaboratorSubIdx = ref(null)
const collaboratorUpdateForm = ref({ content: '' })

function openCollaboratorUpdateDialog(subIdx, collaborator) {
  currentCollaboratorSubIdx.value = subIdx
  currentCollaborator.value = collaborator
  collaboratorUpdateForm.value = { content: '' }
  collaboratorUpdateVisible.value = true
}

function submitCollaboratorUpdate() {
  if (!collaboratorUpdateForm.value.content) {
    ElMessage.warning('请输入进展内容')
    return
  }
  const sub = issue.value.subIssues[currentCollaboratorSubIdx.value]
  const col = sub.collaborators.find(c => c.id === currentCollaborator.value.id)
  if (col) {
    col.hasUpdated = true
    col.updateContent = collaboratorUpdateForm.value.content
    col.updateDate = new Date().toISOString().split('T')[0]
  }
  ElMessage.success(`${currentCollaborator.value.name} 的进展已更新`)
  collaboratorUpdateVisible.value = false

  if (isSubIssueAllUpdated(sub)) {
    ElMessage.success(`子问题 ${sub.id} 的所有协同处理人已完成进展更新`)
  }
}
</script>
