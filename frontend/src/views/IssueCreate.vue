<template>
  <div class="form-page">
    <!-- 调研信息 -->
    <div class="form-card">
      <div class="form-section-title">调研信息</div>
      <el-form :model="form" label-width="120px" label-position="right" size="default">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="调研开始时间" required>
              <el-date-picker v-model="form.startDate" type="date" placeholder="选择日期" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="调研结束时间" required>
              <el-date-picker v-model="form.endDate" type="date" placeholder="选择日期" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="调研地点" required>
              <el-cascader
                v-model="form.location"
                :options="locationOptions"
                placeholder="选择省/市/区县"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="调研领导/部门" required>
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
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="调研批次标题">
              <el-input
                v-model="form.batchTitle"
                placeholder="例如：2026年1月张总石家庄调研"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 问题填报（表格样式） -->
    <div class="form-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div class="form-section-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">问题填报</div>
        <div style="display: flex; gap: 8px;">
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
      </div>

      <el-table
        :data="form.issues"
        border
        size="default"
        :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 600, padding: '10px 0' }"
        row-key="__key"
      >
        <el-table-column label="问题状态" width="170" align="center">
          <template #default="{ row }">
            <el-select v-model="row.resolved" placeholder="选择状态" style="width: 140px;" @change="onResolvedChange(row)">
              <el-option :value="false" label="未解决（进入流程）" />
              <el-option :value="true" label="已解决（不走流程）" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="问题分类" width="140">
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
            <el-select v-if="!row.resolved" v-model="row.mainDept" placeholder="选择部门" style="width: 120px;">
              <el-option v-for="d in departments" :key="d.value" :label="d.label" :value="d.value" />
            </el-select>
            <span v-else style="color: #999; font-size: 12px;">—</span>
          </template>
        </el-table-column>
        <el-table-column label="配合部门" width="160">
          <template #default="{ row }">
            <el-select v-if="!row.resolved" v-model="row.otherDepts" multiple collapse-tags placeholder="选择" style="width: 140px;">
              <el-option v-for="d in departments" :key="d.value" :label="d.label" :value="d.value" />
            </el-select>
            <span v-else style="color: #999; font-size: 12px;">—</span>
          </template>
        </el-table-column>
        <el-table-column label="期望答复时间" width="160">
          <template #default="{ row }">
            <el-date-picker v-if="!row.resolved" v-model="row.expectedDate" type="date" placeholder="选择日期" style="width: 140px;" />
            <span v-else style="color: #999; font-size: 12px;">—</span>
          </template>
        </el-table-column>
        <el-table-column label="解决说明" min-width="180">
          <template #default="{ row }">
            <el-input v-if="row.resolved" v-model="row.resolvedRemark" type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" placeholder="请输入解决说明" />
            <span v-else style="color: #999; font-size: 12px;">—</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="60" align="center" fixed="right">
          <template #default="{ $index }">
            <el-button v-if="form.issues.length > 1" type="danger" link size="small" @click="removeIssueItem($index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 提交按钮 -->
    <div style="display: flex; justify-content: center; gap: 12px; margin-top: 16px;">
      <el-button size="large" @click="$router.back()">取消</el-button>
      <el-button size="large">保存草稿</el-button>
      <el-button type="primary" size="large" @click="handleSubmit">
        <el-icon><Check /></el-icon> 提交
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Upload, Plus, Delete, Check } from '@element-plus/icons-vue'
import { issueCategories, departments } from '../mock/data'

const categories = issueCategories
let keyCounter = 1

const form = reactive({
  startDate: '',
  endDate: '',
  location: [],
  leader: '',
  batchTitle: '',
  issues: [
    { __key: keyCounter++, resolved: false, category: '', content: '', mainDept: '', otherDepts: [], expectedDate: '', resolvedRemark: '' },
  ],
})

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
    ]
  }
]

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
  form.issues.push({ __key: keyCounter++, resolved: false, category: '', content: '', mainDept: '', otherDepts: [], expectedDate: '', resolvedRemark: '' })
}

function removeIssueItem(index) {
  form.issues.splice(index, 1)
}

function downloadTemplate() {
  ElMessage.success('模板下载中...')
}

function handleSubmit() {
  const resolvedIssues = form.issues.filter(i => i.resolved)
  const unresolvedIssues = form.issues.filter(i => !i.resolved)

  for (const item of resolvedIssues) {
    if (!item.content) {
      ElMessage.warning('已解决的问题请填写问题内容')
      return
    }
    if (!item.resolvedRemark) {
      ElMessage.warning('已解决的问题请填写解决说明')
      return
    }
  }

  for (const item of unresolvedIssues) {
    if (!item.category || !item.content || !item.mainDept || !item.expectedDate) {
      ElMessage.warning('未解决的问题请填写完整信息（分类、内容、主要答复部门、期望答复时间）')
      return
    }
  }

  if (resolvedIssues.length > 0 && unresolvedIssues.length === 0) {
    ElMessage.success('已解决问题已录入，无需流程审批')
  } else if (unresolvedIssues.length > 0) {
    ElMessage.success(`问题已提交：${unresolvedIssues.length}条进入审批流程${resolvedIssues.length > 0 ? `，${resolvedIssues.length}条已解决直接录入` : ''}`)
  }
}
</script>
