<template>
  <div>
    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: #E6F7FF; color: #1890FF;">
          <el-icon :size="22"><Document /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value" style="color: #1890FF;">{{ allIssues.length }}</div>
          <div class="stat-label">全量问题</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #FFF7E6; color: #D48806;">
          <el-icon :size="22"><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value" style="color: #D48806;">{{ inProgressIssues.length }}</div>
          <div class="stat-label">办理中</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #FFF1F0; color: #F5222D;">
          <el-icon :size="22"><Warning /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value" style="color: #F5222D;">{{ svOrders.length }}</div>
          <div class="stat-label">督办中</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #F6FFED; color: #52C41A;">
          <el-icon :size="22"><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value" style="color: #52C41A;">{{ completedRate }}%</div>
          <div class="stat-label">完成率</div>
        </div>
      </div>
    </div>

    <!-- 视图切换 + 搜索操作栏 -->
    <div class="filter-bar" style="gap: 12px;">
      <el-radio-group v-model="viewMode" size="default">
        <el-radio-button value="detail">按明细问题</el-radio-button>
        <el-radio-button value="batch">按调研批次</el-radio-button>
        <el-radio-button value="supervision">督办单</el-radio-button>
      </el-radio-group>
      <el-divider direction="vertical" />
      <el-input v-model="searchText" placeholder="搜索问题关键词" :prefix-icon="Search" style="width: 180px;" size="default" clearable />
      <el-select v-model="filterCategory" placeholder="问题分类" size="default" clearable style="width: 120px;">
        <el-option v-for="c in categories" :key="c.value" :label="c.label" :value="c.value" />
      </el-select>
      <el-select v-model="filterDept" placeholder="部门" size="default" clearable style="width: 120px;">
        <el-option v-for="d in departments" :key="d.value" :label="d.label" :value="d.value" />
      </el-select>
      <div style="flex: 1;"></div>
      <el-button type="warning" size="default" @click="showAISummary = true">
        <el-icon><MagicStick /></el-icon> AI总结
      </el-button>
      <el-button size="default" @click="handleExport">
        <el-icon><Download /></el-icon> 导出
      </el-button>
    </div>

    <!-- 分部门查看入口 -->
    <div class="filter-bar" style="gap: 8px; padding: 8px 16px;">
      <span style="font-size: 12px; color: #999; margin-right: 4px;">分部门查看：</span>
      <el-button v-for="dept in topDepts" :key="dept"
        :type="filterDeptQuick === dept ? 'primary' : ''"
        size="small" round
        @click="filterDeptQuick = filterDeptQuick === dept ? '' : dept"
      >{{ dept }}</el-button>
    </div>

    <!-- ========== 按明细问题视图 ========== -->
    <template v-if="viewMode === 'detail'">
      <div class="table-card">
        <div class="table-header">
          <span class="table-title">全量问题（按更新时间排序）</span>
          <span style="font-size: 12px; color: #999;">共 {{ filteredIssues.length }} 条</span>
        </div>
        <el-table
          :data="filteredIssues"
          class="compact-table"
          size="small"
          :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: 600, padding: '8px 0' }"
        >
          <el-table-column prop="title" label="问题名称" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <div style="display: flex; align-items: center; gap: 6px;">
                <el-icon v-if="row.supervised" :size="14" style="color: #F56C6C;"><Warning /></el-icon>
                <span>{{ row.title }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="categoryLabel" label="分类" width="100" />
          <el-table-column prop="department" label="答复部门" width="100" />
          <el-table-column label="流程节点" width="100">
            <template #default="{ row }">
              <span class="flow-tag" :style="{ background: getFlowColor(row.flowNode) + '18', color: getFlowColor(row.flowNode) }">
                {{ row.flowNodeLabel }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="进度" width="100">
            <template #default="{ row }">
              <el-progress :percentage="row.progress" :stroke-width="6" style="width: 80px;" />
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <span :class="'status-tag status-' + row.status">{{ row.statusLabel }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="updateDate" label="更新日期" width="100" sortable />
          <el-table-column prop="responsible" label="负责人" width="70" />
          <el-table-column prop="surveyLocation" label="调研地点" width="80" />
          <el-table-column label="满意度" width="80">
            <template #default="{ row }">
              <span v-if="row.satisfaction > 0" style="color: #D48806;">{{ row.satisfaction }}★</span>
              <span v-else style="color: #ccc;">—</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <div class="action-btns">
                <el-button type="warning" link size="small"
                  v-if="row.status !== 'completed'"
                  @click="handleSupervise(row)">督办</el-button>
                <el-button type="primary" link size="small">详情</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-bar">
          <span class="total-text">共 {{ filteredIssues.length }} 条</span>
          <el-pagination :total="filteredIssues.length" :page-size="20" layout="prev, pager, next" size="small" />
        </div>
      </div>
    </template>

    <!-- ========== 按调研批次视图 ========== -->
    <template v-if="viewMode === 'batch'">
      <div class="table-card" style="padding: 16px;">
        <div v-for="batch in filteredBatches" :key="batch.id" class="batch-card" @click="expandBatch = expandBatch === batch.id ? '' : batch.id">
          <div class="batch-header">
            <span class="batch-title">{{ batch.name }}</span>
            <el-tag size="small" :type="batch.completedCount === batch.issueCount ? 'success' : 'warning'">
              {{ batch.completedCount }}/{{ batch.issueCount }} 完成
            </el-tag>
          </div>
          <div class="batch-meta">
            <span>调研领导：{{ batch.leader }}</span>
            <span>时间：{{ batch.startDate }} ~ {{ batch.endDate }}</span>
            <span>地点：{{ batch.location }}</span>
          </div>
          <div class="batch-progress">
            <el-progress
              :percentage="batch.issueCount > 0 ? Math.round(batch.completedCount / batch.issueCount * 100) : 0"
              :stroke-width="8"
              style="flex: 1;"
            />
          </div>
          <!-- 展开显示该批次问题 -->
          <div v-if="expandBatch === batch.id" style="margin-top: 12px; border-top: 1px solid #f0f0f0; padding-top: 12px;">
            <el-table :data="getBatchIssues(batch.issueIds)" size="small" class="compact-table"
              :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: 600, padding: '6px 0' }">
              <el-table-column prop="title" label="问题名称" min-width="200" show-overflow-tooltip />
              <el-table-column prop="categoryLabel" label="分类" width="100" />
              <el-table-column prop="department" label="答复部门" width="100" />
              <el-table-column label="状态" width="80">
                <template #default="{ row }">
                  <span :class="'status-tag status-' + row.status">{{ row.statusLabel }}</span>
                </template>
              </el-table-column>
              <el-table-column label="进度" width="100">
                <template #default="{ row }">
                  <el-progress :percentage="row.progress" :stroke-width="6" style="width: 80px;" />
                </template>
              </el-table-column>
              <el-table-column prop="responsible" label="负责人" width="70" />
              <el-table-column label="操作" width="80">
                <template #default="{ row }">
                  <el-button type="warning" link size="small" v-if="row.status !== 'completed'" @click.stop="handleSupervise(row)">督办</el-button>
                  <el-button type="primary" link size="small" v-else>详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </template>

    <!-- ========== 督办单视图 ========== -->
    <template v-if="viewMode === 'supervision'">
      <div class="table-card" style="padding: 16px;">
        <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 14px; font-weight: 600; color: #333;">督办单列表</span>
          <span style="font-size: 12px; color: #999;">共 {{ svOrders.length }} 条督办</span>
        </div>
        <div v-for="order in svOrders" :key="order.id" class="supervision-card">
          <div class="sv-header">
            <span class="sv-title">{{ order.issueTitle }}</span>
            <el-tag type="danger" size="small">{{ order.statusLabel }}</el-tag>
          </div>
          <div class="sv-meta">
            <span>督办编号：{{ order.id }}</span>
            <span>关联问题：{{ order.issueId }}</span>
            <span>督办领导：{{ order.leader }}</span>
            <span>目标部门：{{ order.targetDept }}</span>
          </div>
          <div class="sv-meta">
            <span>发起日期：{{ order.createDate }}</span>
            <span>要求完成：{{ order.deadline }}</span>
            <span>当前节点：{{ order.flowNodeLabel }}</span>
          </div>
          <div class="sv-reason">
            <b>督办原因：</b>{{ order.reason }}
          </div>
          <!-- 督办流程图 -->
          <div style="margin-top: 12px;">
            <div style="font-size: 12px; color: #999; margin-bottom: 8px;">督办流程：领导 → 对应部门主任 → 一级办理 → 二级办理 → 接单部门主任 → 领导</div>
            <div class="flow-chart-container" style="padding: 8px 0;">
              <div v-for="(node, idx) in svFlowNodes" :key="node.value" class="flow-node-wrapper">
                <div :class="['flow-node-circle', getSvNodeStatus(node.value, order.flowNode)]" style="width: 26px; height: 26px;">
                  <span class="flow-node-idx" style="font-size: 10px;">{{ idx + 1 }}</span>
                </div>
                <div class="flow-node-label" :style="{ fontSize: '10px' }">{{ node.label }}</div>
                <div v-if="idx < svFlowNodes.length - 1" :class="['flow-node-line', { done: isSvNodeDone(node.value, order.flowNode) }]" style="top: 13px;"></div>
              </div>
            </div>
          </div>
          <!-- 督办记录 -->
          <div style="margin-top: 10px; border-top: 1px solid #f5f5f5; padding-top: 10px;">
            <div style="font-size: 12px; font-weight: 600; color: #666; margin-bottom: 6px;">处理记录</div>
            <div v-for="(log, idx) in order.logs" :key="idx" style="display: flex; gap: 8px; font-size: 12px; color: #666; margin-bottom: 4px;">
              <span style="color: #999; min-width: 130px;">{{ log.date }}</span>
              <span style="font-weight: 500; min-width: 50px;">{{ log.user }}</span>
              <span>{{ log.content }}</span>
            </div>
          </div>
        </div>
        <el-empty v-if="svOrders.length === 0" description="暂无督办单" />
      </div>
    </template>

    <!-- 阶段总结 -->
    <div class="table-card" style="margin-top: 12px;">
      <div class="table-header">
        <span class="table-title">阶段性调研问题总结</span>
      </div>
      <div style="padding: 12px 16px;">
        <div v-for="item in summaries" :key="item.id"
          style="padding: 12px; margin-bottom: 8px; background: #fafafa; border-radius: 4px; border: 1px solid #f0f0f0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 14px; font-weight: 600;">{{ item.title }}</span>
            <el-tag size="small">{{ item.period }}</el-tag>
          </div>
          <div style="font-size: 12px; color: #999; margin-bottom: 6px;">{{ item.department }} · {{ item.author }} · {{ item.createDate }}</div>
          <div style="font-size: 13px; color: #666; line-height: 1.6;">{{ item.content }}</div>
        </div>
      </div>
    </div>

    <!-- AI总结弹窗 -->
    <el-dialog v-model="showAISummary" title="AI智能总结" width="600px">
      <div style="margin-bottom: 16px;">
        <el-form :inline="true" size="default">
          <el-form-item label="时间范围">
            <el-date-picker v-model="aiDateRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="aiCategory" placeholder="全部" clearable>
              <el-option v-for="c in categories" :key="c.value" :label="c.label" :value="c.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="generateAISummary">生成总结</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div v-if="aiResult" style="background: #f6f8fa; padding: 16px; border-radius: 6px; line-height: 1.8; font-size: 13px;">
        <p><b>问题概览：</b>所选范围内共有 18 个调研问题，涉及 7 个分类，10 个部门。</p>
        <p><b>完成情况：</b>已完成 11 个（61.1%），解决中 5 个（27.8%），待处理 2 个（11.1%）。</p>
        <p><b>高频问题：</b>后端技术类问题最多（7个），其次是经营业务类（3个）和客户服务类（2个）。</p>
        <p><b>重点关注：</b>邯郸地区渠道合作伙伴激励政策、承德基站电力保障问题已被督办，需加速推进。</p>
        <p><b>建议：</b>建议加强网络运维部和客户服务部的问题处理能力，当前超期率偏高。</p>
      </div>
      <div v-else style="text-align: center; padding: 40px; color: #999;">
        请选择时间范围后点击"生成总结"
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Download, MagicStick } from '@element-plus/icons-vue'
import {
  mockIssues, issueCategories, departments, flowNodes, stageSummaries,
  supervisionOrders as svOrdersData, surveyBatches
} from '../mock/data'

const viewMode = ref('detail')
const searchText = ref('')
const filterCategory = ref('')
const filterDept = ref('')
const filterDeptQuick = ref('')
const dateRange = ref(null)
const showAISummary = ref(false)
const aiDateRange = ref(null)
const aiCategory = ref('')
const aiResult = ref(false)
const expandBatch = ref('')

const categories = issueCategories
const summaries = stageSummaries
const svOrders = ref(svOrdersData)
const topDepts = ['网络运维部', '信息技术部', '客户服务部', '市场经营部', '战略发展部', '安全保卫部', '人力资源部', '行政后勤部']

// 督办流程节点
const svFlowNodes = [
  { value: 'leader', label: '领导发起' },
  { value: 'dept_director', label: '部门主任' },
  { value: 'level1', label: '一级办理' },
  { value: 'level2', label: '二级办理' },
  { value: 'accept_confirm', label: '接单部门主任' },
  { value: 'leader_confirm', label: '领导确认' },
]
const svNodeOrder = ['leader', 'dept_director', 'level1', 'level2', 'accept_confirm', 'leader_confirm']

function getSvNodeStatus(nodeValue, currentNode) {
  const currentIdx = svNodeOrder.indexOf(currentNode)
  const nodeIdx = svNodeOrder.indexOf(nodeValue)
  if (nodeIdx < currentIdx) return 'done'
  if (nodeIdx === currentIdx) return 'current'
  return 'pending'
}

function isSvNodeDone(nodeValue, currentNode) {
  return svNodeOrder.indexOf(nodeValue) < svNodeOrder.indexOf(currentNode)
}

const allIssues = computed(() => [...mockIssues].sort((a, b) => b.updateDate.localeCompare(a.updateDate)))
const inProgressIssues = computed(() => allIssues.value.filter(i => i.status === 'in_progress'))
const completedRate = computed(() => {
  const total = allIssues.value.length
  const completed = allIssues.value.filter(i => i.status === 'completed').length
  return total ? Math.round(completed / total * 100) : 0
})

const filteredIssues = computed(() => {
  let list = allIssues.value
  if (searchText.value) list = list.filter(i => i.title.includes(searchText.value))
  if (filterCategory.value) list = list.filter(i => i.category === filterCategory.value)
  if (filterDept.value) {
    const deptLabel = departments.find(d => d.value === filterDept.value)?.label
    list = list.filter(i => i.department === deptLabel)
  }
  if (filterDeptQuick.value) list = list.filter(i => i.department === filterDeptQuick.value)
  return list
})

const filteredBatches = computed(() => {
  let list = [...surveyBatches]
  if (searchText.value) list = list.filter(b => b.name.includes(searchText.value) || b.location.includes(searchText.value))
  return list.sort((a, b) => b.startDate.localeCompare(a.startDate))
})

function getBatchIssues(issueIds) {
  return issueIds.map(id => mockIssues.find(i => i.id === id)).filter(Boolean)
}

function getFlowColor(node) {
  const fn = flowNodes.find(f => f.value === node)
  return fn ? fn.color : '#909399'
}

function handleSupervise(row) {
  ElMessage.warning(`已对"${row.title}"发起督办`)
}

function handleExport() {
  ElMessage.success('导出中...')
}

function generateAISummary() {
  aiResult.value = true
}
</script>
