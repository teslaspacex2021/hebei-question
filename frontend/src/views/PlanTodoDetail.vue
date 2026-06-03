<template>
  <div class="form-page" v-if="todo">
    <div class="filter-bar" style="margin-bottom: 12px;">
      <el-button @click="$router.back()" size="default">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
      <span style="font-size: 15px; font-weight: 600; color: #333; margin-left: 8px;">{{ todo.title }}</span>
      <div style="flex: 1;"></div>
      <el-tag :type="todo.status === 'completed' ? 'success' : 'warning'" size="default">
        {{ todo.statusLabel }}
      </el-tag>
    </div>

    <div class="form-card">
      <div class="form-section-title">基本信息</div>
      <el-row :gutter="16">
        <el-col :span="12">
          <div class="detail-item">
            <span class="detail-label">待办编号</span>
            <span class="detail-value">{{ todo.id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">所属部门</span>
            <span class="detail-value">{{ todo.department }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="detail-item">
            <span class="detail-label">创建日期</span>
            <span class="detail-value">{{ todo.createDate }}</span>
          </div>
          <div class="detail-item" v-if="todo.submitDate">
            <span class="detail-label">提交日期</span>
            <span class="detail-value">{{ todo.submitDate }}</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="form-card">
      <div class="form-section-title">{{ isPending ? '计划填报' : '填报内容' }}</div>
      <p v-if="isPending" style="font-size: 12px; color: #999; margin: 0 0 14px;">
        请填写本部门调研计划相关内容，确认无误后提交。
      </p>
      <el-form label-width="100px" size="default">
        <el-form-item label="填报内容" :required="isPending">
          <el-input
            v-model="formContent"
            type="textarea"
            :rows="6"
            :readonly="!isPending"
            placeholder="请输入调研计划相关内容..."
          />
        </el-form-item>
        <el-form-item v-if="isPending" label="附件">
          <el-upload action="#" :auto-upload="false" :limit="5">
            <el-button size="small"><el-icon><Upload /></el-icon> 上传附件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div v-if="isPending" style="display: flex; justify-content: center; gap: 12px; padding: 8px 0 2px;">
        <el-button size="large" @click="$router.back()" style="min-width: 120px;">取消</el-button>
        <el-button type="primary" size="large" @click="submitTodo" style="min-width: 160px;">提交</el-button>
      </div>
    </div>
  </div>

  <div v-else style="text-align: center; padding: 100px;">
    <el-empty description="待办不存在" />
    <el-button type="primary" @click="$router.push('/dashboard')">返回工作台</el-button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Upload } from '@element-plus/icons-vue'
import { planTodos } from '../mock/data'

const route = useRoute()
const router = useRouter()
const todoId = route.params.id

const found = planTodos.find(t => t.id === todoId)
const todo = ref(found ? { ...found } : null)
const formContent = ref(found?.content || '')

const isPending = computed(() => todo.value?.status === 'pending')

function submitTodo() {
  if (!formContent.value?.trim()) {
    ElMessage.warning('请输入填报内容')
    return
  }
  const idx = planTodos.findIndex(t => t.id === todoId)
  if (idx === -1) return

  const updated = {
    ...planTodos[idx],
    status: 'completed',
    statusLabel: '已完成',
    content: formContent.value.trim(),
    submitDate: new Date().toISOString().split('T')[0],
  }
  planTodos[idx] = updated
  todo.value = { ...updated }
  ElMessage.success('待办已提交')
  router.push('/dashboard')
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
