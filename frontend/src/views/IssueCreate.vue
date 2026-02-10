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
      </el-form>
    </div>

    <!-- 问题条目 -->
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

      <div v-for="(item, index) in form.issues" :key="index"
        style="background: #fafafa; border-radius: 6px; padding: 16px; margin-bottom: 12px; border: 1px solid #e8e8e8; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-weight: 600; color: #409EFF;">问题 {{ index + 1 }}</span>
          <el-button v-if="form.issues.length > 1" type="danger" link size="small" @click="removeIssueItem(index)">
            <el-icon><Delete /></el-icon> 删除
          </el-button>
        </div>
        <el-form label-width="110px" label-position="right" size="default">
          <el-row :gutter="12">
            <el-col :span="8">
              <el-form-item label="问题分类" required>
                <el-select v-model="item.category" placeholder="选择分类" style="width: 100%;">
                  <el-option v-for="c in categories" :key="c.value" :label="c.label" :value="c.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="主要答复部门" required>
                <el-select v-model="item.mainDept" placeholder="选择部门" style="width: 100%;">
                  <el-option v-for="d in departments" :key="d.value" :label="d.label" :value="d.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="期望答复时间" required>
                <el-date-picker v-model="item.expectedDate" type="date" placeholder="选择日期" style="width: 100%;" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="问题内容" required>
            <el-input v-model="item.content" type="textarea" :rows="2" placeholder="请输入问题内容" />
          </el-form-item>
          <el-row :gutter="12">
            <el-col :span="12">
              <el-form-item label="其他配合部门">
                <el-select v-model="item.otherDepts" multiple placeholder="选择部门" style="width: 100%;">
                  <el-option v-for="d in departments" :key="d.value" :label="d.label" :value="d.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
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
const form = reactive({
  startDate: '',
  endDate: '',
  location: [],
  leader: '',
  issues: [
    { category: '', content: '', mainDept: '', otherDepts: [], expectedDate: '' },
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

function addIssueItem() {
  form.issues.push({ category: '', content: '', mainDept: '', otherDepts: [], expectedDate: '' })
}

function removeIssueItem(index) {
  form.issues.splice(index, 1)
}

function downloadTemplate() {
  ElMessage.success('模板下载中...')
}

function handleSubmit() {
  ElMessage.success('问题已提交，进入审批流程')
}
</script>
