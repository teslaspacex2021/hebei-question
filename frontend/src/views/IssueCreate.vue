<template>
  <div class="form-page">
    <IssueFormEditor
      :issue-type="issueType"
      @cancel="$router.back()"
      @save-draft="onSaveDraft"
      @submit="onSubmit"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import IssueFormEditor from '../components/IssueFormEditor.vue'
import { mockIssues, currentUser, getFlowNodeLabel, getFirstFlowNodeAfterSubmit } from '../mock/data'

const route = useRoute()
const router = useRouter()

const issueType = ref(route.query.type === 'daily' ? 'daily' : 'survey')

watch(
  () => route.query.type,
  (type) => {
    if (type === 'daily' || type === 'survey') {
      issueType.value = type
    }
  },
)

function buildIssueId(type) {
  const prefix = type === 'daily' ? 'RC' : 'DY'
  return `${prefix}${Date.now()}`
}

function onSaveDraft(patch) {
  const type = patch.issueType || issueType.value
  const id = buildIssueId(type)
  mockIssues.push({
    id,
    issueType: type,
    title: patch.title,
    category: patch.category,
    categoryLabel: patch.categoryLabel,
    flowNode: 'initiate',
    flowNodeLabel: getFlowNodeLabel('initiate', type),
    progress: 0,
    status: 'draft',
    statusLabel: '草稿',
    description: patch.description,
    updateDate: patch.updateDate,
    responsible: currentUser.name,
    handler: '',
    deadline: patch.deadline,
    department: patch.department,
    surveyDate: patch.surveyDate,
    surveyLocation: patch.surveyLocation,
    leader: patch.leader,
    batchTitle: patch.batchTitle,
    satisfaction: 0,
    supervised: false,
    replyContent: patch.replyContent,
    remark: patch.remark || '',
    expectedComplete: patch.expectedComplete,
    pinned: false,
    resolved: patch.resolved,
    subIssues: patch.subIssues,
  })
  ElMessage.success('草稿已保存')
  router.push('/dashboard')
}

function onSubmit(patch) {
  const type = patch.issueType || issueType.value
  const unresolvedCount = patch.subIssues?.length || 0
  const resolvedOnly = patch.resolved && unresolvedCount === 0
  const firstNode = getFirstFlowNodeAfterSubmit(type)

  mockIssues.push({
    id: buildIssueId(type),
    issueType: type,
    title: patch.title,
    category: patch.category,
    categoryLabel: patch.categoryLabel,
    flowNode: resolvedOnly ? 'completed' : firstNode,
    flowNodeLabel: getFlowNodeLabel(resolvedOnly ? 'completed' : firstNode, type),
    progress: resolvedOnly ? 100 : 0,
    status: resolvedOnly ? 'completed' : 'pending',
    statusLabel: resolvedOnly ? '已完成' : '待处理',
    description: patch.description,
    updateDate: patch.updateDate,
    responsible: currentUser.name,
    handler: '',
    deadline: patch.deadline,
    department: patch.department,
    surveyDate: patch.surveyDate || '',
    surveyLocation: patch.surveyLocation || '',
    leader: patch.leader || '',
    batchTitle: patch.batchTitle,
    satisfaction: 0,
    supervised: false,
    replyContent: patch.replyContent,
    remark: patch.remark || '',
    expectedComplete: patch.expectedComplete,
    pinned: false,
    resolved: patch.resolved,
    subIssues: patch.subIssues?.map(sub => ({
      ...sub,
      status: resolvedOnly ? 'completed' : 'pending',
      statusLabel: resolvedOnly ? '已完成' : '待处理',
    })) || [],
  })

  if (resolvedOnly) {
    ElMessage.success('已解决问题已录入，无需流程审批')
  } else {
    ElMessage.success(`${type === 'daily' ? '日常' : '调研'}问题已提交：${unresolvedCount || 1}条进入审批流程`)
  }
  router.push(type === 'daily' ? '/issues?tab=daily' : '/issues')
}
</script>

<style scoped>
.form-page {
  max-width: none;
  width: 100%;
  margin: 0;
  padding: 0 4px;
}
</style>
