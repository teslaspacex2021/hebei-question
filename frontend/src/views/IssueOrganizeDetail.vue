<template>
  <div class="form-page" v-if="organizeData">
    <div class="filter-bar" style="margin-bottom: 12px;">
      <el-button @click="$router.back()" size="default">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
      <span style="font-size: 15px; font-weight: 600; color: #333; margin-left: 8px;">问题整理详情 - {{ organizeData.id }}</span>
      <div style="flex: 1;"></div>
      <el-tag :type="organizeData.status === 'approved' ? 'success' : organizeData.status === 'rejected' ? 'danger' : 'warning'" size="default">
        {{ organizeData.statusLabel }}
      </el-tag>
    </div>

    <!-- 审批流程 -->
    <div class="form-card">
      <div class="form-section-title">审批流程</div>
      <div class="flow-chart-container">
        <div v-for="(node, idx) in approvalNodes" :key="node.value" class="flow-node-wrapper">
          <div :class="['flow-node-circle', getApprovalNodeStatus(node.value)]">
            <span class="flow-node-idx">{{ idx + 1 }}</span>
          </div>
          <div class="flow-node-label" :class="{ active: isCurrentApprovalNode(node.value) }">{{ node.label }}</div>
          <div v-if="idx < approvalNodes.length - 1" :class="['flow-node-line', { done: isApprovalNodeDone(node.value) }]"></div>
        </div>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="form-card">
      <div class="form-section-title">基本信息</div>
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="detail-item"><span class="detail-label">填报人</span><span class="detail-value">{{ organizeData.reporter }}</span></div>
        </el-col>
        <el-col :span="8">
          <div class="detail-item"><span class="detail-label">部门</span><span class="detail-value">{{ organizeData.department }}</span></div>
        </el-col>
        <el-col :span="8">
          <div class="detail-item"><span class="detail-label">创建日期</span><span class="detail-value">{{ organizeData.createDate }}</span></div>
        </el-col>
      </el-row>
      <el-row :gutter="16" v-if="organizeData.approver">
        <el-col :span="8">
          <div class="detail-item"><span class="detail-label">审批人</span><span class="detail-value">{{ organizeData.approver }}</span></div>
        </el-col>
        <el-col :span="8">
          <div class="detail-item"><span class="detail-label">审批日期</span><span class="detail-value">{{ organizeData.approveDate }}</span></div>
        </el-col>
      </el-row>
    </div>

    <!-- 问题列表 -->
    <div class="form-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div class="form-section-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">问题列表</div>
        <el-button v-if="isEditing" type="primary" size="small" @click="addIssueRow">
          <el-icon><Plus /></el-icon> 添加问题
        </el-button>
        <el-button v-if="organizeData.status === 'pending' && !isEditing" size="small" @click="startEdit">
          <el-icon><EditPen /></el-icon> 修改
        </el-button>
      </div>

      <!-- 查看模式 -->
      <el-table
        v-if="!isEditing"
        :data="organizeData.issues"
        border
        size="small"
        :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 600, padding: '8px 0' }"
      >
        <el-table-column prop="seq" label="序号" width="70" align="center" />
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="description" label="问题描述" min-width="240" show-overflow-tooltip />
        <el-table-column prop="result" label="处理结果" min-width="200" show-overflow-tooltip />
      </el-table>

      <!-- 编辑模式 -->
      <el-table
        v-if="isEditing"
        :data="editForm.issues"
        border
        size="default"
        :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 600, padding: '8px 0' }"
      >
        <el-table-column label="序号" width="70" align="center">
          <template #default="{ $index }">{{ $index + 1 }}</template>
        </el-table-column>
        <el-table-column label="标题" min-width="160">
          <template #default="{ row }">
            <el-input v-model="row.title" placeholder="请输入标题" />
          </template>
        </el-table-column>
        <el-table-column label="问题描述" min-width="240">
          <template #default="{ row }">
            <el-input v-model="row.description" type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" placeholder="请输入问题描述" />
          </template>
        </el-table-column>
        <el-table-column label="处理结果" min-width="200">
          <template #default="{ row }">
            <el-input v-model="row.result" type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" placeholder="请输入处理结果" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="70" align="center">
          <template #default="{ $index }">
            <el-button v-if="editForm.issues.length > 1" type="danger" link size="small" @click="removeIssueRow($index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="isEditing" style="display: flex; justify-content: center; gap: 12px; margin-top: 16px;">
        <el-button @click="cancelEdit">取消编辑</el-button>
        <el-button type="primary" @click="saveEdit">保存修改</el-button>
      </div>
    </div>

    <!-- 审批操作（仅待审批状态） -->
    <div v-if="organizeData.status === 'pending'" class="form-card" style="text-align: center; padding: 24px;">
      <div style="font-size: 13px; color: #999; margin-bottom: 12px;">审批流程：申请人 → 部门主任审批 → 结束</div>
      <el-button type="success" size="large" @click="handleApprove('approved')">
        <el-icon><Check /></el-icon> 审批通过
      </el-button>
      <el-button type="danger" size="large" @click="handleApprove('rejected')">
        <el-icon><Close /></el-icon> 审批驳回
      </el-button>
    </div>
  </div>

  <div v-else style="text-align: center; padding: 100px;">
    <el-empty description="记录不存在" />
    <el-button type="primary" @click="$router.push('/dept-board')">返回部门看板</el-button>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus, Delete, EditPen, Check, Close } from '@element-plus/icons-vue'
import { issueOrganizes } from '../mock/data'

const route = useRoute()
const organizeId = route.params.id

const found = issueOrganizes.find(o => o.id === organizeId)
const organizeData = ref(found ? { ...found, issues: found.issues.map(i => ({ ...i })) } : null)
const isEditing = ref(false)
const editForm = reactive({ issues: [] })

const approvalNodes = [
  { value: 'submit', label: '申请人提交' },
  { value: 'dept_director', label: '部门主任审批' },
  { value: 'done', label: '结束' },
]

function getApprovalNodeStatus(nodeValue) {
  if (!organizeData.value) return 'pending'
  const status = organizeData.value.status
  if (status === 'approved') return 'done'
  if (status === 'rejected') {
    if (nodeValue === 'submit') return 'done'
    if (nodeValue === 'dept_director') return 'current'
    return 'pending'
  }
  if (nodeValue === 'submit') return 'done'
  if (nodeValue === 'dept_director') return 'current'
  return 'pending'
}

function isCurrentApprovalNode(nodeValue) {
  if (!organizeData.value) return false
  const status = organizeData.value.status
  if (status === 'approved') return nodeValue === 'done'
  return nodeValue === 'dept_director'
}

function isApprovalNodeDone(nodeValue) {
  if (!organizeData.value) return false
  const status = organizeData.value.status
  if (status === 'approved') return true
  return nodeValue === 'submit'
}

function addIssueRow() {
  editForm.issues.push({ title: '', description: '', result: '' })
}

function removeIssueRow(index) {
  editForm.issues.splice(index, 1)
}

function cancelEdit() {
  isEditing.value = false
}

function saveEdit() {
  const hasEmpty = editForm.issues.some(i => !i.title || !i.description)
  if (hasEmpty) {
    ElMessage.warning('请填写每条问题的标题和描述')
    return
  }
  organizeData.value.issues = editForm.issues.map((item, idx) => ({
    seq: idx + 1,
    title: item.title,
    description: item.description,
    result: item.result,
  }))
  isEditing.value = false
  ElMessage.success('修改已保存')
}

function handleApprove(result) {
  if (result === 'approved') {
    organizeData.value.status = 'approved'
    organizeData.value.statusLabel = '已通过'
    organizeData.value.approver = '段磊（部门主任）'
    organizeData.value.approveDate = new Date().toISOString().split('T')[0]
    ElMessage.success('审批已通过')
  } else {
    organizeData.value.status = 'rejected'
    organizeData.value.statusLabel = '已驳回'
    organizeData.value.approver = '段磊（部门主任）'
    organizeData.value.approveDate = new Date().toISOString().split('T')[0]
    ElMessage.warning('已驳回')
  }
}

if (isEditing.value || organizeData.value?.status === 'pending') {
  editForm.issues = organizeData.value ? organizeData.value.issues.map(i => ({ ...i })) : []
}

function startEdit() {
  editForm.issues = organizeData.value.issues.map(i => ({ ...i }))
  isEditing.value = true
}
</script>
