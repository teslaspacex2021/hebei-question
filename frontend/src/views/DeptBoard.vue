<template>
  <div>
    <!-- 组织筛选 -->
    <div class="filter-bar" style="margin-bottom: 12px;">
      <span style="font-size: 13px; font-weight: 600; color: #333; margin-right: 8px;">部门看板</span>
      <el-cascader
        v-model="selectedOrg"
        :options="orgOptions"
        :props="{ checkStrictly: true, expandTrigger: 'hover' }"
        placeholder="组织筛选"
        size="default"
        clearable
        style="width: 240px;"
        @change="onOrgChange"
      />
      <div style="flex: 1;"></div>
      <el-radio-group v-model="viewMode" size="default">
        <el-radio-button value="organize">问题整理</el-radio-button>
        <el-radio-button value="detail">明细视图</el-radio-button>
        <el-radio-button value="stats">统计概览</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 部门统计卡片（根据当前tab动态计算） -->
    <div class="stats-row" v-if="statsItems.length">
      <div class="stat-card" v-for="stat in statsItems" :key="stat.label">
        <div class="stat-info" style="text-align: center; width: 100%;">
          <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- 明细视图 -->
    <div v-if="viewMode === 'detail'" class="table-card">
      <div class="table-header">
        <span class="table-title">{{ selectedDept }} - 问题明细</span>
        <div style="display: flex; gap: 8px;">
          <el-checkbox v-model="showOnlyVisible">仅显示全省可见</el-checkbox>
          <el-button size="small">
            <el-icon><Download /></el-icon> 导出
          </el-button>
        </div>
      </div>
      <el-table
        :data="deptIssues"
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
        <el-table-column label="答复内容" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.replyContent || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="满意度" width="90">
          <template #default="{ row }">
            <el-rate v-if="row.satisfaction > 0" v-model="row.satisfaction" disabled :max="5" size="small" />
            <span v-else style="color: #ccc;">—</span>
          </template>
        </el-table-column>
        <el-table-column label="督办" width="60">
          <template #default="{ row }">
            <el-tag v-if="row.supervised" type="danger" size="small">是</el-tag>
            <span v-else style="color: #ccc;">—</span>
          </template>
        </el-table-column>
        <el-table-column label="全省可见" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.provinceVisible" size="small" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 问题整理 -->
    <div v-if="viewMode === 'organize'">
      <div class="table-card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span style="font-size: 14px; font-weight: 600; color: #333;">问题整理</span>
          <el-button type="primary" size="small" @click="$router.push('/dept-board/issue-organize/create')">
            <el-icon><Plus /></el-icon> 新增问题整理
          </el-button>
        </div>
        <div v-if="deptOrganizes.length > 0">
          <div v-for="item in deptOrganizes" :key="item.id"
            style="background: #fafafa; border-radius: 8px; padding: 16px; margin-bottom: 12px; border: 1px solid #e8e8e8; cursor: pointer;"
            @click="$router.push('/dept-board/issue-organize/' + item.id)">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <el-icon :size="18" style="color: #409EFF;"><Memo /></el-icon>
                <span style="font-size: 14px; font-weight: 600; color: #333;">问题整理 - {{ item.id }}</span>
              </div>
              <el-tag :type="item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'" size="small">{{ item.statusLabel }}</el-tag>
            </div>
            <div style="font-size: 12px; color: #999; margin-bottom: 8px;">
              填报人：{{ item.reporter }} | 部门：{{ item.department }} | 创建日期：{{ item.createDate }} | 问题数：{{ item.issues.length }}
              <span v-if="item.approveDate"> | 审批日期：{{ item.approveDate }}</span>
            </div>
            <el-table
              :data="item.issues"
              class="compact-table"
              size="small"
              :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 600, padding: '6px 0' }"
              style="margin-top: 8px;"
            >
              <el-table-column prop="seq" label="序号" width="60" align="center" />
              <el-table-column prop="title" label="标题" min-width="140" show-overflow-tooltip />
              <el-table-column prop="description" label="问题描述" min-width="200" show-overflow-tooltip />
              <el-table-column prop="result" label="处理结果" min-width="180" show-overflow-tooltip />
            </el-table>
          </div>
        </div>
        <el-empty v-else description="暂无问题整理记录" :image-size="60" />
      </div>
    </div>

    <!-- 统计概览 -->
    <div v-if="viewMode === 'stats'">
      <el-row :gutter="12">
        <el-col :span="8" v-for="rank in rankCards" :key="rank.key">
          <div class="rank-card">
            <div class="rank-card-header">
              <span class="rank-card-title">
                <el-icon :size="16" :style="{ color: rank.color }"><component :is="rank.icon" /></el-icon>
                {{ rank.title }}
              </span>
              <el-button type="primary" link size="small" @click="openMoreDialog(rank.key)">
                查看更多 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
            <div class="rank-list">
              <div
                v-for="(item, idx) in rank.topList"
                :key="item.dept"
                class="rank-item"
              >
                <span class="rank-no" :class="'rank-no-' + (idx + 1)">{{ idx + 1 }}</span>
                <span class="rank-dept">{{ item.dept }}</span>
                <div class="rank-bar-wrap">
                  <div
                    class="rank-bar"
                    :style="{ width: rank.barWidth(item) + '%', background: rank.color }"
                  ></div>
                </div>
                <span class="rank-value" :style="{ color: rank.color }">{{ rank.format(item) }}</span>
              </div>
              <el-empty v-if="!rank.topList.length" description="暂无数据" :image-size="40" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 全部部门数据弹框 -->
    <el-dialog v-model="moreDialogVisible" :title="moreDialogTitle" width="880px" :close-on-click-modal="false">
      <el-table
        :data="moreDialogData"
        class="compact-table"
        size="small"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: 600 }"
        :default-sort="moreDialogSort"
        max-height="520"
        stripe
      >
        <el-table-column type="index" label="排名" width="70" align="center">
          <template #default="{ $index }">
            <span class="rank-no" :class="'rank-no-' + ($index + 1)" v-if="$index < 3">{{ $index + 1 }}</span>
            <span v-else style="color: #999;">{{ $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="dept" label="部门" min-width="140" />
        <el-table-column prop="raised" label="提出问题数" width="120" align="center" sortable />
        <el-table-column prop="handled" label="处理问题数" width="120" align="center" sortable />
        <el-table-column prop="completed" label="已完成数" width="100" align="center" sortable />
        <el-table-column label="完成率" width="140" align="center" sortable :sort-by="row => row.completionRate">
          <template #default="{ row }">
            <el-progress
              :percentage="row.completionRate"
              :stroke-width="8"
              :status="row.completionRate >= 80 ? 'success' : row.completionRate >= 50 ? '' : 'warning'"
              style="width: 110px;"
            />
          </template>
        </el-table-column>
        <el-table-column label="平均满意度" width="130" align="center" sortable :sort-by="row => row.satisfaction">
          <template #default="{ row }">
            <span v-if="row.satisfaction > 0" style="color: #D48806; font-weight: 600;">{{ row.satisfaction.toFixed(1) }} ★</span>
            <span v-else style="color: #ccc;">—</span>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="moreDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { mockIssues, deptStats, organizations, issueOrganizes, getIssueInitiatorDept, departments } from '../mock/data'
import {
  Download, Plus, Memo,
  Warning, ArrowRight, EditPen as EditPenIcon, Document, Star,
} from '@element-plus/icons-vue'

const selectedOrg = ref(['province', 'it'])
const selectedDept = ref('信息技术部')
const viewMode = ref('organize')
const showOnlyVisible = ref(false)

const orgOptions = organizations.map(org => ({
  value: org.value,
  label: org.label,
  children: org.children?.map(c => ({ value: c.value, label: c.label })),
}))

function onOrgChange(val) {
  if (val && val.length === 2) {
    const org = organizations.find(o => o.value === val[0])
    const dept = org?.children?.find(c => c.value === val[1])
    if (dept) selectedDept.value = dept.label
  } else if (val && val.length === 1) {
    selectedDept.value = ''
  }
}

const allDeptStats = ref(deptStats)

const statsItems = computed(() => {
  if (viewMode.value === 'organize') {
    const orgs = deptOrganizes.value
    const totalOrgs = orgs.length
    const totalIssues = orgs.reduce((sum, o) => sum + o.issues.length, 0)
    const pendingOrgs = orgs.filter(o => o.status === 'pending').length
    const approvedOrgs = orgs.filter(o => o.status === 'approved').length
    return [
      { label: '整理单数', value: totalOrgs, color: '#1890FF' },
      { label: '问题总数', value: totalIssues, color: '#722ED1' },
      { label: '待审批', value: pendingOrgs, color: '#D48806' },
      { label: '已通过', value: approvedOrgs, color: '#52C41A' },
    ]
  } else {
    const issues = deptIssues.value
    const rated = issues.filter(i => i.satisfaction > 0)
    const avgSat = rated.length > 0
      ? (rated.reduce((s, i) => s + i.satisfaction, 0) / rated.length).toFixed(1)
      : '—'
    return [
      { label: '问题总数', value: issues.length, color: '#1890FF' },
      { label: '待处理', value: issues.filter(i => i.status === 'pending').length, color: '#D48806' },
      { label: '解决中', value: issues.filter(i => i.status === 'in_progress').length, color: '#1890FF' },
      { label: '已完成', value: issues.filter(i => i.status === 'completed').length, color: '#52C41A' },
      { label: '已超期', value: issues.filter(i => i.status === 'overdue').length, color: '#F5222D' },
      { label: '满意度', value: avgSat, color: '#D48806' },
    ]
  }
})

const deptOrganizes = computed(() => {
  if (!selectedDept.value) return issueOrganizes
  return issueOrganizes.filter(o => o.department === selectedDept.value)
})

const deptIssues = computed(() => {
  if (!selectedDept.value) {
    return mockIssues.map(i => ({ ...i, provinceVisible: i.status === 'completed' }))
  }
  return mockIssues.filter(i => i.department === selectedDept.value)
    .map(i => ({ ...i, provinceVisible: i.status === 'completed' }))
})

/**
 * 部门维度全量统计（提出数、处理数、完成率、平均满意度）
 * 来源：以 mockIssues 为基础统计「提出/处理」，满意度直接采用 deptStats 已配置值
 */
const deptStatsExtended = computed(() => {
  const raisedMap = {}
  const handledMap = {}
  const completedMap = {}

  mockIssues.forEach(issue => {
    if (issue.status === 'draft') return
    const initDept = getIssueInitiatorDept(issue)
    if (initDept) raisedMap[initDept] = (raisedMap[initDept] || 0) + 1
    const handleDept = issue.department
    if (handleDept) {
      handledMap[handleDept] = (handledMap[handleDept] || 0) + 1
      if (issue.status === 'completed') {
        completedMap[handleDept] = (completedMap[handleDept] || 0) + 1
      }
    }
  })

  const allDepts = new Set([
    ...departments.map(d => d.label),
    ...Object.keys(raisedMap),
    ...Object.keys(handledMap),
  ])

  return Array.from(allDepts).map(dept => {
    const raised = raisedMap[dept] || 0
    const handled = handledMap[dept] || 0
    const completed = completedMap[dept] || 0
    const satObj = deptStats.find(d => d.dept === dept)
    const satisfaction = satObj?.satisfaction ?? 0
    const completionRate = handled > 0 ? Math.round((completed / handled) * 100) : 0
    return { dept, raised, handled, completed, satisfaction, completionRate }
  })
})

const TOP_N = 5

const raisedRank = computed(() =>
  [...deptStatsExtended.value].sort((a, b) => b.raised - a.raised).slice(0, TOP_N)
)
const handledRank = computed(() =>
  [...deptStatsExtended.value].sort((a, b) => b.handled - a.handled).slice(0, TOP_N)
)
const satisfactionRank = computed(() =>
  [...deptStatsExtended.value]
    .filter(d => d.satisfaction > 0)
    .sort((a, b) => b.satisfaction - a.satisfaction)
    .slice(0, TOP_N)
)

const rankCards = computed(() => {
  const maxRaised = Math.max(1, ...raisedRank.value.map(d => d.raised))
  const maxHandled = Math.max(1, ...handledRank.value.map(d => d.handled))
  return [
    {
      key: 'raised',
      title: '部门提出问题数量 TOP 5',
      color: '#1890FF',
      icon: EditPenIcon,
      topList: raisedRank.value,
      format: (item) => `${item.raised} 个`,
      barWidth: (item) => (item.raised / maxRaised) * 100,
    },
    {
      key: 'handled',
      title: '部门处理问题数量 TOP 5',
      color: '#52C41A',
      icon: Document,
      topList: handledRank.value,
      format: (item) => `${item.handled} 个`,
      barWidth: (item) => (item.handled / maxHandled) * 100,
    },
    {
      key: 'satisfaction',
      title: '部门满意度排行 TOP 5',
      color: '#D48806',
      icon: Star,
      topList: satisfactionRank.value,
      format: (item) => `${item.satisfaction.toFixed(1)} ★`,
      barWidth: (item) => (item.satisfaction / 5) * 100,
    },
  ]
})

// 查看更多 - 全量部门数据弹框
const moreDialogVisible = ref(false)
const moreDialogTitle = ref('')
const moreDialogSort = ref({ prop: 'raised', order: 'descending' })

const moreDialogData = computed(() => {
  const list = [...deptStatsExtended.value]
  const prop = moreDialogSort.value.prop
  return list.sort((a, b) => (b[prop] || 0) - (a[prop] || 0))
})

function openMoreDialog(key) {
  if (key === 'raised') {
    moreDialogTitle.value = '全部部门数据 - 按「提出问题数」排序'
    moreDialogSort.value = { prop: 'raised', order: 'descending' }
  } else if (key === 'handled') {
    moreDialogTitle.value = '全部部门数据 - 按「处理问题数」排序'
    moreDialogSort.value = { prop: 'handled', order: 'descending' }
  } else if (key === 'satisfaction') {
    moreDialogTitle.value = '全部部门数据 - 按「满意度」排序'
    moreDialogSort.value = { prop: 'satisfaction', order: 'descending' }
  }
  moreDialogVisible.value = true
}
</script>
