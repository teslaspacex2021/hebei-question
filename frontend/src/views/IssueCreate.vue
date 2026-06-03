<template>
  <div class="form-page">
    <IssueFormEditor
      @cancel="$router.back()"
      @save-draft="onSaveDraft"
      @submit="onSubmit"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import IssueFormEditor from '../components/IssueFormEditor.vue'
import { mockIssues, currentUser, getFlowNodeLabel } from '../mock/data'

const router = useRouter()

function onSaveDraft(patch) {
  const id = `DY${Date.now()}`
  mockIssues.push({
    id,
    title: patch.title,
    category: patch.category,
    categoryLabel: patch.categoryLabel,
    flowNode: 'initiate',
    flowNodeLabel: getFlowNodeLabel('initiate'),
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
    expectedComplete: patch.expectedComplete,
    pinned: false,
    resolved: patch.resolved,
    subIssues: patch.subIssues,
  })
  ElMessage.success('草稿已保存')
  router.push('/dashboard')
}

function onSubmit(patch) {
  const unresolvedCount = patch.subIssues?.length || 0
  const resolvedOnly = patch.resolved && unresolvedCount === 0

  if (resolvedOnly) {
    ElMessage.success('已解决问题已录入，无需流程审批')
  } else {
    ElMessage.success(`问题已提交：${unresolvedCount || 1}条进入审批流程`)
  }
  router.push('/issues')
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
