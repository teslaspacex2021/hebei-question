<template>
  <div class="issue-form-editor">
    <div class="form-card">
      <div class="form-section-title">{{ isDaily ? '基本信息' : '调研信息' }}</div>
      <el-form :model="form" label-width="120px" label-position="right" size="default">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="isDaily ? '开始时间' : '调研开始时间'" required>
              <el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="isDaily ? '结束时间' : '调研结束时间'" required>
              <el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="isDaily ? '问题地点' : '调研地点'" required>
              <el-cascader
                v-model="form.location"
                :options="locationOptions"
                placeholder="选择省/市/区县"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="isDaily ? '发起领导/部门' : '调研领导/部门'" required>
              <el-select v-model="form.leader" placeholder="请选择" style="width: 100%;">
                <el-option label="张总" value="张总" />
                <el-option label="李总" value="李总" />
                <el-option label="王总" value="王总" />
                <el-option label="市场经营部" value="市场经营部" />
                <el-option label="网络运维部" value="网络运维部" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="!isDaily" :gutter="16">
          <el-col :span="24">
            <el-form-item label="调研批次标题" required>
              <el-input v-model="form.batchTitle" placeholder="例如：2026年1月张总石家庄调研" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="form-card">
      <div class="issue-form-toolbar">
        <div class="form-section-title issue-form-toolbar__title">{{ isDaily ? '日常问题' : '问题填报' }}</div>
        <div v-if="!isDaily" class="issue-form-toolbar__actions">
          <el-button size="small" @click="downloadTemplate">
            <el-icon><Download /></el-icon> 下载模板
          </el-button>
          <el-upload action="#" :auto-upload="false" :show-file-list="false">
            <el-button size="small">
              <el-icon><Upload /></el-icon> Excel导入
            </el-button>
          </el-upload>
          <el-button type="primary" size="small" @click="addIssueItem">
            <el-icon><Plus /></el-icon> 新增问题
          </el-button>
        </div>
        <p v-else class="issue-form-daily-hint">每次发起仅可填报一条日常问题</p>
      </div>

      <el-table
        :data="form.issues"
        border
        size="default"
        :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 600, padding: '10px 0' }"
        row-key="__key"
      >
        <el-table-column v-if="!isDaily" label="问题状态" width="170" align="center">
          <template #default="{ row }">
            <el-select v-model="row.resolved" placeholder="选择状态" style="width: 140px;" @change="onResolvedChange(row)">
              <el-option :value="false" label="未解决（进入流程）" />
              <el-option :value="true" label="已解决（不走流程）" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column v-if="!isDaily" label="问题分类" width="140">
          <template #default="{ row }">
            <el-select v-model="row.category" placeholder="选择分类" style="width: 120px;" :disabled="row.resolved">
              <el-option v-for="c in categories" :key="c.value" :label="c.label" :value="c.value" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="问题内容" min-width="220">
          <template #default="{ row }">
            <el-input v-model="row.content" type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" :placeholder="row.resolved ? '请简要描述问题' : '请输入问题内容'" />
          </template>
        </el-table-column>
        <el-table-column label="主要答复部门" width="140">
          <template #default="{ row }">
            <el-select v-if="isDaily || !row.resolved" v-model="row.mainDept" placeholder="选择部门" style="width: 120px;">
              <el-option v-for="d in departments" :key="d.value" :label="d.label" :value="d.value" />
            </el-select>
            <span v-else style="color: #999; font-size: 12px;">—</span>
          </template>
        </el-table-column>
        <el-table-column label="配合部门" width="160">
          <template #default="{ row }">
            <el-select v-if="isDaily || !row.resolved" v-model="row.otherDepts" multiple collapse-tags placeholder="选择" style="width: 140px;">
              <el-option v-for="d in departments" :key="d.value" :label="d.label" :value="d.value" />
            </el-select>
            <span v-else style="color: #999; font-size: 12px;">—</span>
          </template>
        </el-table-column>
        <el-table-column label="期望答复时间" width="160">
          <template #default="{ row }">
            <el-date-picker v-if="isDaily || !row.resolved" v-model="row.expectedDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 140px;" />
            <span v-else style="color: #999; font-size: 12px;">—</span>
          </template>
        </el-table-column>
        <el-table-column v-if="!isDaily" label="解决说明" min-width="180">
          <template #default="{ row }">
            <el-input v-if="row.resolved" v-model="row.resolvedRemark" type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" placeholder="请输入解决说明" />
            <span v-else style="color: #999; font-size: 12px;">—</span>
          </template>
        </el-table-column>
        <el-table-column v-if="!isDaily" label="操作" width="60" align="center" fixed="right">
          <template #default="{ $index }">
            <el-button v-if="form.issues.length > 1" type="danger" link size="small" @click="removeIssueItem($index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="issue-form-footer">
      <el-button size="large" @click="emit('cancel')">取消</el-button>
      <el-button size="large" @click="handleSaveDraft">
        <el-icon v-if="showDraftIcon"><DocumentChecked /></el-icon> 保存草稿
      </el-button>
      <el-button type="primary" size="large" @click="handleSubmit">
        <el-icon><Check /></el-icon> {{ submitLabel }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Upload, Plus, Delete, Check, DocumentChecked } from '@element-plus/icons-vue'
import { issueCategories, departments } from '../mock/data'
import {
  createEmptyIssueRow,
  createEmptySurveyForm,
  issueToSurveyForm,
  surveyFormToIssuePatch,
  validateSurveyForm,
} from '../utils/issueSurveyForm'

const props = defineProps({
  issue: { type: Object, default: null },
  issueType: { type: String, default: 'survey' },
  submitLabel: { type: String, default: '提交' },
  showDraftIcon: { type: Boolean, default: false },
})

const isDaily = computed(() => props.issueType === 'daily' || props.issue?.issueType === 'daily')

const emit = defineEmits(['cancel', 'save-draft', 'submit'])

const categories = issueCategories
const locationOptions = [
  {
    value: 'hebei', label: '河北省', children: [
      { value: 'sjz', label: '石家庄市', children: [
        { value: 'zd', label: '正定县' }, { value: 'gx', label: '藁城区' }, { value: 'lt', label: '栾城区' },
      ]},
      { value: 'bd', label: '保定市', children: [
        { value: 'lx', label: '莲池区' }, { value: 'jx', label: '竞秀区' },
      ]},
      { value: 'ts', label: '唐山市', children: [
        { value: 'lb', label: '路北区' }, { value: 'qa', label: '迁安市' },
      ]},
      { value: 'hd', label: '邯郸市' },
      { value: 'cd', label: '承德市' },
      { value: 'lf', label: '廊坊市' },
      { value: 'cz', label: '沧州市' },
      { value: 'xt', label: '邢台市' },
      { value: 'qhd', label: '秦皇岛市' },
      { value: 'zjk', label: '张家口市' },
      { value: 'hs', label: '衡水市' },
      { value: 'xa', label: '雄安新区' },
    ],
  },
]

const form = reactive(createEmptySurveyForm())

function resetFormFromIssue(issue) {
  const next = issue ? issueToSurveyForm(issue, locationOptions) : createEmptySurveyForm()
  Object.assign(form, next)
}

watch(
  () => props.issue,
  (issue) => resetFormFromIssue(issue),
  { immediate: true, deep: true },
)

watch(
  () => isDaily.value,
  (daily) => {
    if (!daily) return
    if (form.issues.length > 1) {
      form.issues.splice(1)
    }
    if (!form.issues.length) {
      form.issues.push(createEmptyIssueRow())
    }
  },
)

function onResolvedChange(row) {
  if (row.resolved) {
    row.category = ''
    row.mainDept = ''
    row.otherDepts = []
    row.expectedDate = ''
  } else {
    row.resolvedRemark = ''
  }
}

function addIssueItem() {
  if (isDaily.value) {
    ElMessage.warning('日常问题每次仅可填报一条')
    return
  }
  form.issues.push(createEmptyIssueRow())
}

function removeIssueItem(index) {
  form.issues.splice(index, 1)
}

function downloadTemplate() {
  ElMessage.success('模板下载中...')
}

function buildPayload() {
  return surveyFormToIssuePatch(form, locationOptions, props.issue, isDaily.value ? 'daily' : 'survey')
}

function handleSaveDraft() {
  const hasContent = form.issues.some(i => i.content?.trim())
  if (isDaily.value) {
    if (!hasContent) {
      ElMessage.warning('请至少填写一条问题内容')
      return
    }
  } else if (!form.batchTitle?.trim() && !hasContent) {
    ElMessage.warning('请至少填写调研批次标题或问题内容')
    return
  }
  emit('save-draft', buildPayload())
}

function handleSubmit() {
  const error = validateSurveyForm(form, isDaily.value ? 'daily' : 'survey')
  if (error) {
    ElMessage.warning(error)
    return
  }
  emit('submit', buildPayload())
}

defineExpose({ form, buildPayload })
</script>

<style scoped>
.issue-form-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}
.issue-form-toolbar__title {
  margin-bottom: 0;
  border-bottom: none;
  padding-bottom: 0;
}
.issue-form-toolbar__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.issue-form-daily-hint {
  margin: 0;
  font-size: 12px;
  color: #999;
}
.issue-form-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}
</style>
