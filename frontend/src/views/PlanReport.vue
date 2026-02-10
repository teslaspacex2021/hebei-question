<template>
  <div>
    <div class="filter-bar" style="margin-bottom: 12px;">
      <span style="font-size: 14px; font-weight: 600; color: #333;">调研计划管理</span>
      <div style="flex: 1;"></div>
      <el-button type="primary" size="default" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon> 新建调研计划
      </el-button>
    </div>

    <!-- 计划列表 -->
    <div class="table-card">
      <el-table
        :data="plans"
        class="compact-table"
        size="small"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: 600, padding: '8px 0' }"
      >
        <el-table-column prop="id" label="计划编号" width="130" />
        <el-table-column prop="department" label="发起部门" width="120" />
        <el-table-column prop="initiator" label="发起人" width="80" />
        <el-table-column prop="startTime" label="开始时间" width="130" />
        <el-table-column prop="endTime" label="结束时间" width="130" />
        <el-table-column label="行程地点" min-width="160">
          <template #default="{ row }">
            <el-tag v-for="loc in row.locations" :key="loc" size="small" style="margin: 2px;">{{ loc }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="leaderLevel" label="省公司人员级别" width="130" />
        <el-table-column prop="companionLevel" label="陪同人员级别" width="130" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'approved' ? 'success' : 'warning'" size="small">
              {{ row.statusLabel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createDate" label="创建日期" width="100" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small">查看</el-button>
            <el-button v-if="row.status === 'pending'" type="success" link size="small">审核</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新建计划弹窗 -->
    <el-dialog v-model="showCreateDialog" title="新建调研计划" width="650px">
      <el-form :model="planForm" label-width="140px" label-position="right" size="default">
        <el-form-item label="开始时间" required>
          <el-col :span="14">
            <el-date-picker v-model="planForm.startDate" type="date" placeholder="选择日期" style="width: 100%;" />
          </el-col>
          <el-col :span="1" style="text-align: center;">-</el-col>
          <el-col :span="8">
            <el-select v-model="planForm.startPeriod" placeholder="上/下午" style="width: 100%;">
              <el-option label="上午" value="上午" />
              <el-option label="下午" value="下午" />
            </el-select>
          </el-col>
        </el-form-item>
        <el-form-item label="结束时间" required>
          <el-col :span="14">
            <el-date-picker v-model="planForm.endDate" type="date" placeholder="选择日期" style="width: 100%;" />
          </el-col>
          <el-col :span="1" style="text-align: center;">-</el-col>
          <el-col :span="8">
            <el-select v-model="planForm.endPeriod" placeholder="上/下午" style="width: 100%;">
              <el-option label="上午" value="上午" />
              <el-option label="下午" value="下午" />
            </el-select>
          </el-col>
        </el-form-item>
        <el-form-item label="行程地点" required>
          <div v-for="(loc, i) in planForm.locations" :key="i" style="display: flex; gap: 8px; margin-bottom: 8px; width: 100%;">
            <el-cascader
              v-model="planForm.locations[i]"
              :options="locationOptions"
              placeholder="选择省/市/区县"
              style="flex: 1;"
            />
            <el-button v-if="planForm.locations.length > 1" type="danger" :icon="Delete" circle size="small" @click="planForm.locations.splice(i, 1)" />
          </div>
          <el-button type="primary" link size="small" @click="planForm.locations.push([])">
            <el-icon><Plus /></el-icon> 添加行程
          </el-button>
        </el-form-item>
        <el-form-item label="省公司人员级别（最高）" required>
          <el-select v-model="planForm.leaderLevel" placeholder="选择级别" style="width: 100%;">
            <el-option label="公司总经理" value="公司总经理" />
            <el-option label="公司副总经理" value="公司副总经理" />
            <el-option label="部门主任" value="部门主任" />
            <el-option label="部门副主任" value="部门副主任" />
            <el-option label="主管" value="主管" />
          </el-select>
        </el-form-item>
        <el-form-item label="陪同人员级别（最高）" required>
          <el-select v-model="planForm.companionLevel" placeholder="选择级别" style="width: 100%;">
            <el-option label="市公司总经理" value="市公司总经理" />
            <el-option label="市公司副总经理" value="市公司副总经理" />
            <el-option label="市公司部门主任" value="市公司部门主任" />
            <el-option label="县公司经理" value="县公司经理" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitPlan">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { mockPlans } from '../mock/data'

const plans = ref(mockPlans)
const showCreateDialog = ref(false)

const planForm = reactive({
  startDate: '',
  startPeriod: '上午',
  endDate: '',
  endPeriod: '下午',
  locations: [[]],
  leaderLevel: '',
  companionLevel: '',
})

const locationOptions = [
  {
    value: 'hebei', label: '河北省', children: [
      { value: 'sjz', label: '石家庄市', children: [
        { value: 'zd', label: '正定县' }, { value: 'gc', label: '藁城区' },
      ]},
      { value: 'bd', label: '保定市' },
      { value: 'ts', label: '唐山市', children: [
        { value: 'qa', label: '迁安市' },
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

function handleSubmitPlan() {
  ElMessage.success('调研计划已提交，等待审核')
  showCreateDialog.value = false
}
</script>
