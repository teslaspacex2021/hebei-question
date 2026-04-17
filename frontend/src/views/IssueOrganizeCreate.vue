<template>
  <div class="form-page">
    <div class="filter-bar" style="margin-bottom: 12px;">
      <el-button @click="$router.back()" size="default">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
      <span style="font-size: 15px; font-weight: 600; color: #333; margin-left: 8px;">新增问题整理</span>
    </div>

    <div class="form-card">
      <div class="form-section-title">基本信息</div>
      <el-form :model="form" label-width="100px" label-position="right" size="default">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="填报人" required>
              <el-input v-model="form.reporter" placeholder="请输入填报人" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="部门" required>
              <el-select v-model="form.department" placeholder="选择部门" style="width: 100%;">
                <el-option v-for="d in departments" :key="d.value" :label="d.label" :value="d.label" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="填报时间" required>
              <el-date-picker v-model="form.createDate" type="date" placeholder="选择日期" style="width: 100%;" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="form-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div class="form-section-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">问题列表</div>
        <el-button type="primary" size="small" @click="addIssueRow">
          <el-icon><Plus /></el-icon> 添加问题
        </el-button>
      </div>
      <el-table
        :data="form.issues"
        border
        size="default"
        :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 600, padding: '10px 0' }"
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
            <el-button v-if="form.issues.length > 1" type="danger" link size="small" @click="removeIssueRow($index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div style="display: flex; justify-content: center; gap: 12px; margin-top: 16px;">
      <el-button size="large" @click="$router.back()">取消</el-button>
      <el-button type="primary" size="large" @click="handleSubmit">
        <el-icon><Check /></el-icon> 提交申请
      </el-button>
    </div>

    <!-- 提交后流程提示 -->
    <el-dialog v-model="submitSuccessVisible" title="提交成功" width="420px" :close-on-click-modal="false">
      <div style="text-align: center; padding: 20px 0;">
        <el-icon :size="48" style="color: #67C23A;"><CircleCheck /></el-icon>
        <div style="font-size: 16px; font-weight: 600; color: #333; margin-top: 12px;">问题整理已提交</div>
        <div style="font-size: 13px; color: #999; margin-top: 8px;">审批流程：申请人 → 部门主任审批 → 结束</div>
      </div>
      <template #footer>
        <el-button type="primary" @click="goBack">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus, Delete, Check, CircleCheck } from '@element-plus/icons-vue'
import { departments } from '../mock/data'

const router = useRouter()
const submitSuccessVisible = ref(false)

const form = reactive({
  reporter: '段磊',
  department: '信息技术部',
  createDate: new Date().toISOString().split('T')[0],
  issues: [
    { title: '', description: '', result: '' },
  ],
})

function addIssueRow() {
  form.issues.push({ title: '', description: '', result: '' })
}

function removeIssueRow(index) {
  form.issues.splice(index, 1)
}

function handleSubmit() {
  if (!form.reporter || !form.department || !form.createDate) {
    ElMessage.warning('请填写完整的基本信息')
    return
  }
  const hasEmpty = form.issues.some(i => !i.title || !i.description)
  if (hasEmpty) {
    ElMessage.warning('请填写每条问题的标题和描述')
    return
  }
  submitSuccessVisible.value = true
}

function goBack() {
  submitSuccessVisible.value = false
  router.push('/dept-board')
}
</script>
