<template>
  <div class="form-page" v-if="issue">
    <!-- 顶部操作栏 -->
    <div class="filter-bar" style="margin-bottom: 12px;">
      <el-button @click="$router.back()" size="default">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
      <span style="font-size: 15px; font-weight: 600; color: #333; margin-left: 8px;">{{ issue.title }}</span>
      <el-tag v-if="issue.pinned" type="danger" size="small" style="margin-left: 8px;">置顶</el-tag>
      <div style="flex: 1;"></div>
      <el-button size="default" @click="flowRecordDialogVisible = true">
        <el-icon><List /></el-icon> 流转记录
      </el-button>
      <el-button size="default" @click="flowChartDialogVisible = true">
        <el-icon><Share /></el-icon> 流程图
      </el-button>
      <el-button
        v-if="canShowCorrectionFeedback"
        type="warning"
        size="default"
        @click="openCorrectionDialog"
      >
        纠错反馈
      </el-button>
      <el-button
        v-if="flowSubmitConfig.showProgressUpdate && issue.status !== 'completed'"
        type="primary"
        size="default"
        @click="openProgressDialog"
      >
        <el-icon><EditPen /></el-icon> 更新进展
      </el-button>
    </div>

    <!-- 基本信息 -->
    <div class="form-card">
      <div class="form-section-title">基本信息</div>
      <el-row :gutter="16">
        <el-col :span="12">
          <div class="detail-item"><span class="detail-label">问题编号</span><span class="detail-value">{{ issue.id }}</span></div>
          <div class="detail-item"><span class="detail-label">问题分类</span><span class="detail-value">{{ issue.categoryLabel }}</span></div>
          <div class="detail-item"><span class="detail-label">所属部门</span><span class="detail-value">{{ issue.department }}</span></div>
          <div class="detail-item"><span class="detail-label">负责人（主办）</span><span class="detail-value">{{ issue.responsible }}</span></div>
          <div class="detail-item"><span class="detail-label">当前处理人</span><span class="detail-value">{{ issue.handler || '—' }}</span></div>
        </el-col>
        <el-col :span="12">
          <div class="detail-item"><span class="detail-label">当前状态</span><span class="detail-value"><span :class="'status-tag status-' + issue.status">{{ issue.statusLabel }}</span></span></div>
          <div class="detail-item"><span class="detail-label">流程节点</span><span class="detail-value">{{ issue.flowNodeLabel }}</span></div>
          <div class="detail-item"><span class="detail-label">调研日期</span><span class="detail-value">{{ issue.surveyDate }}</span></div>
          <div class="detail-item"><span class="detail-label">调研地点</span><span class="detail-value">{{ issue.surveyLocation }}</span></div>
          <div class="detail-item">
            <span class="detail-label">截止日期</span>
            <span class="detail-value" :style="{ color: isDeadlineNear ? '#F5222D' : '' }">
              {{ issue.deadline }}
              <span v-if="issue.delayedDeadline" style="color: #E6A23C; margin-left: 8px;">
                (已延期至 {{ issue.delayedDeadline }})
              </span>
            </span>
          </div>
        </el-col>
      </el-row>
      <div class="detail-item" style="margin-top: 4px;">
        <span class="detail-label">进度</span>
        <span class="detail-value"><el-progress :percentage="issue.progress" :stroke-width="10" style="width: 400px;" /></span>
      </div>
      <div class="detail-item" v-if="issue.replyContent">
        <span class="detail-label">答复内容</span>
        <span class="detail-value">{{ issue.replyContent }}</span>
      </div>
      <div class="detail-item" v-if="issue.satisfaction > 0">
        <span class="detail-label">满意度</span>
        <span class="detail-value"><el-rate v-model="issue.satisfaction" disabled /></span>
      </div>
      <div class="detail-item" v-if="issue.supervised">
        <span class="detail-label">督办状态</span>
        <span class="detail-value supervise-badge"><el-icon><Warning /></el-icon> 已被督办</span>
      </div>
    </div>

    <!-- 问题清单（即子问题；二级办理时可维护协同与进展） -->
    <div class="form-card issue-list-merged" v-if="mergedIssueRows.length > 0">
      <div class="issue-list-header">
        <div class="issue-list-header-text">
          <div class="form-section-title" style="margin-bottom: 6px;">问题清单</div>
          <p class="issue-list-desc">
            <template v-if="isLevel2Process">
              当前为 <strong>二级办理</strong>：请展开各行维护「协同处理人」并更新进展；全部更新后方可提交至部门主任。
            </template>
            <template v-else>
              与「子问题」为同一清单。协同处理、进展分工仅在 <strong>二级办理</strong> 环节办理，当前环节为只读查看。
            </template>
          </p>
        </div>
        <el-tag :type="isLevel2Process ? 'warning' : 'info'" effect="plain" size="small">
          {{ isLevel2Process ? '可办理协同' : '仅查看' }}
        </el-tag>
      </div>

      <el-table
        :data="mergedIssueRows"
        border
        size="small"
        row-key="subId"
        class="issue-list-table"
        :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 600, padding: '8px 0' }"
      >
        <el-table-column v-if="isLevel2Process && hasSubIssues" type="expand" width="44">
          <template #default="{ row }">
            <div v-if="row.subIdx >= 0" class="expand-inner">
              <div class="expand-toolbar">
                <span class="expand-title">协同处理人</span>
                <el-button type="primary" link size="small" @click="openAddCollaboratorDialog(row.subIdx)">
                  <el-icon><Plus /></el-icon> 添加协同处理人
                </el-button>
              </div>
              <el-table
                v-if="issue.subIssues[row.subIdx].collaborators?.length > 0"
                :data="issue.subIssues[row.subIdx].collaborators"
                size="small"
                class="collab-nested-table"
                :header-cell-style="{ background: '#eef1f6', color: '#333', fontWeight: 600, padding: '6px 0' }"
              >
                <el-table-column prop="name" label="姓名" width="88" />
                <el-table-column prop="dept" label="部门" width="108" />
                <el-table-column label="角色" width="72">
                  <template #default="{ row: c }">
                    <el-tag :type="c.role === 'main' ? 'primary' : 'info'" size="small">
                      {{ c.role === 'main' ? '主办' : '协办' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="进展更新" min-width="180">
                  <template #default="{ row: c }">
                    <div v-if="c.hasUpdated">
                      <span class="collab-update-text">{{ c.updateContent }}</span>
                      <div class="collab-update-date">{{ c.updateDate }}</div>
                    </div>
                    <span v-else class="collab-pending"><el-icon><WarningFilled /></el-icon> 待更新进展</span>
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="80" align="center">
                  <template #default="{ row: c }">
                    <el-tag :type="c.hasUpdated ? 'success' : 'warning'" size="small">
                      {{ c.hasUpdated ? '已更新' : '待更新' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="72" align="center">
                  <template #default="{ row: c }">
                    <el-button v-if="!c.hasUpdated" type="primary" link size="small" @click="openCollaboratorUpdateDialog(row.subIdx, c)">
                      更新
                    </el-button>
                    <span v-else class="collab-done"><el-icon><CircleCheck /></el-icon></span>
                  </template>
                </el-table-column>
              </el-table>
              <div v-else class="collab-empty">暂无协同处理人</div>

              <div v-if="isSubIssueAllUpdated(issue.subIssues[row.subIdx])" class="collab-alert collab-alert--ok">
                <el-icon><CircleCheck /></el-icon>
                <span>该子问题协同处理人已全部更新进展</span>
              </div>
              <div v-else-if="issue.subIssues[row.subIdx].collaborators?.length" class="collab-alert collab-alert--warn">
                <el-icon><WarningFilled /></el-icon>
                <span>尚有 {{ issue.subIssues[row.subIdx].collaborators.filter(c => !c.hasUpdated).length }} 人未更新进展，无法提交至下一步</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="seq" label="序号" width="52" align="center" />
        <el-table-column prop="subId" label="子问题编号" min-width="118" show-overflow-tooltip />
        <el-table-column prop="title" label="问题内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="categoryLabel" label="问题分类" width="108" show-overflow-tooltip />
        <el-table-column prop="mainDept" label="主办部门" width="108" show-overflow-tooltip />
        <el-table-column prop="assistDeptsLabel" label="配合部门" width="112" show-overflow-tooltip />
        <el-table-column prop="handler" label="处理人" width="88" show-overflow-tooltip />
        <el-table-column prop="deadline" label="截止日期" width="102" align="center" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <span :class="'status-tag status-' + row.status">{{ row.statusLabel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="进度" width="130" align="center">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="6" :show-text="true" style="width: 110px;" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openSubProgressDialog(row)">更新记录</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 底部：路由与提交办理（未办结） -->
    <div class="form-card" v-if="issue.status !== 'completed' && flowSubmitConfig.routes.length > 0">
      <div class="form-section-title">提交办理</div>
      <p style="font-size: 12px; color: #999; margin: 0 0 12px;">
        当前环节：<strong style="color: #333;">{{ issue.flowNodeLabel }}</strong>
        <template v-if="flowSubmitConfig.routes.length > 1">，请先选择办理路由，再点击「提交办理」填写意见（可选）。</template>
        <template v-else>，点击「提交办理」可填写意见（可选）。</template>
      </p>
      <div v-if="flowSubmitConfig.routes.length > 1" style="margin-bottom: 14px;">
        <span style="font-size: 13px; color: #666; margin-right: 12px;">办理路由</span>
        <el-radio-group v-model="selectedRouteValue" size="default">
          <el-radio
            v-for="r in flowSubmitConfig.routes"
            :key="r.value"
            :value="r.value"
            style="display: flex; margin-bottom: 6px; align-items: flex-start; white-space: normal; height: auto;"
          >
            {{ r.label }}
          </el-radio>
        </el-radio-group>
      </div>
      <div v-if="isLevel2Process && hasSubIssues && !allCollaboratorsUpdated" style="margin-bottom: 12px; background: #FFF7E6; border: 1px solid #FFE58F; border-radius: 6px; padding: 10px 14px; display: flex; align-items: center; gap: 8px;">
        <el-icon style="color: #FAAD14;"><WarningFilled /></el-icon>
        <span style="font-size: 13px; color: #D48806;">提示：所有子问题的协同处理人均需更新进展后，才可继续提交下一步。当前还有 {{ pendingCollaboratorsCount }} 位处理人未更新进展。</span>
      </div>
      <div style="display: flex; justify-content: center; padding: 8px 0 2px;">
        <el-button type="primary" size="large" :disabled="!canSubmitFlowStep" @click="openSubmitFlowDialog" style="min-width: 220px;">
          提交办理
        </el-button>
      </div>
    </div>

    <!-- 子问题进展更新记录（表格） -->
    <el-dialog
      v-model="subProgressDialogVisible"
      :title="subProgressDialogTitle"
      width="720px"
      destroy-on-close
      class="sub-progress-dialog"
    >
      <el-table
        v-if="subProgressTableRows.length > 0"
        :data="subProgressTableRows"
        border
        size="small"
        stripe
        max-height="420"
        :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 600, padding: '8px 0' }"
      >
        <el-table-column prop="date" label="更新时间" width="168" />
        <el-table-column prop="user" label="更新人" width="96" show-overflow-tooltip />
        <el-table-column prop="content" label="进展内容" min-width="220" show-overflow-tooltip />
        <el-table-column prop="progress" label="进度(%)" width="88" align="center" />
        <el-table-column label="更新类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.updateType === 'proactive' ? 'primary' : 'success'" size="small">
              {{ row.updateType === 'proactive' ? '主动更新' : '例行更新' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无进展更新记录" :image-size="56" />
    </el-dialog>

    <!-- 纠错反馈弹框 -->
    <el-dialog
      v-model="correctionDialogVisible"
      title="纠错反馈"
      width="520px"
      :close-on-click-modal="false"
    >
      <div style="background: #fffbe6; border: 1px solid #ffe58f; border-radius: 6px; padding: 10px 12px; margin-bottom: 12px; font-size: 12px; color: #ad6800;">
        当前反馈处理人：{{ issue?.responsible || '发起人' }}（发起人）
      </div>
      <el-form label-width="80px" size="default">
        <el-form-item label="反馈信息">
          <el-input
            v-model="correctionForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入纠错反馈信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="correctionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCorrectionFeedback">提交反馈</el-button>
      </template>
    </el-dialog>

    <!-- 流转记录弹框 -->
    <el-dialog v-model="flowRecordDialogVisible" title="流转记录" width="720px" destroy-on-close>
      <el-table
        v-if="mergedFlowRecords.length > 0"
        :data="mergedFlowRecords"
        border
        size="small"
        stripe
        max-height="420"
        :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 600, padding: '8px 0' }"
      >
        <el-table-column prop="date" label="时间" width="168" />
        <el-table-column prop="user" label="操作人" width="96" show-overflow-tooltip />
        <el-table-column prop="action" label="动作" width="180" show-overflow-tooltip />
        <el-table-column prop="remark" label="备注" min-width="220" show-overflow-tooltip />
      </el-table>
      <el-empty v-else description="暂无流转记录" :image-size="56" />
    </el-dialog>

    <!-- 流程图弹框 -->
    <el-dialog v-model="flowChartDialogVisible" title="流程图" width="900px" destroy-on-close>
      <div class="flow-chart-container" style="padding: 8px 0;">
        <div v-for="(node, idx) in issueFlowSequence" :key="node.value" class="flow-node-wrapper">
          <div :class="['flow-node-circle', getNodeStatus(node.value, issue.flowNode)]">
            <span class="flow-node-idx">{{ idx + 1 }}</span>
          </div>
          <div class="flow-node-label" :class="{ active: node.value === issue.flowNode }">{{ node.label }}</div>
          <div v-if="idx < issueFlowSequence.length - 1" :class="['flow-node-line', { done: isNodeDone(node.value, issue.flowNode) }]"></div>
        </div>
      </div>
    </el-dialog>

    <!-- 提交办理意见弹框 -->
    <el-dialog v-model="submitFlowDialogVisible" title="提交办理" width="520px" :close-on-click-modal="false">
      <div v-if="selectedRoute" style="background: #f6f8fa; padding: 10px 14px; border-radius: 6px; margin-bottom: 14px; font-size: 13px; color: #333;">
        <div><strong>所选路由：</strong>{{ selectedRoute.label }}</div>
        <div style="margin-top: 6px; color: #666;">目标环节：{{ getFlowNodeLabel(selectedRoute.targetNode) }}</div>
      </div>
      <el-form label-width="80px" size="default">
        <el-form-item label="办理意见">
          <el-input v-model="submitFlowOpinion" type="textarea" :rows="4" placeholder="选填：可填写说明、附件说明等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="submitFlowDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSubmitFlow">确认提交</el-button>
      </template>
    </el-dialog>

    <!-- 更新进展弹框 -->
    <el-dialog v-model="progressDialogVisible" title="更新进展" width="560px" :close-on-click-modal="false">
      <div style="background: #f6f8fa; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px;">
        <div style="font-size: 13px; color: #333; font-weight: 600;">{{ issue.title }}</div>
        <div style="font-size: 12px; color: #999; margin-top: 4px;">{{ issue.id }} | {{ issue.department }}</div>
      </div>
      <!-- 未全部更新时提示 -->
      <div v-if="isLevel2Process && hasSubIssues && !allCollaboratorsUpdated" style="background: #FFF7E6; border: 1px solid #FFE58F; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        <el-icon style="color: #FAAD14;"><WarningFilled /></el-icon>
        <span style="font-size: 12px; color: #D48806;">注意：仍有协同处理人未更新进展，当前仅可更新个人进展，无法提交到下一步流程节点。</span>
      </div>
      <el-form label-width="90px" size="default">
        <el-form-item label="当前进度" required>
          <el-slider v-model="progressForm.progress" :min="0" :max="100" show-input style="padding-right: 20px;" />
        </el-form-item>
        <el-form-item label="进展描述" required>
          <el-input v-model="progressForm.content" type="textarea" :rows="4" placeholder="请输入进展描述内容..." />
        </el-form-item>
        <el-form-item label="问题状态">
          <el-radio-group v-model="progressForm.status">
            <el-radio value="in_progress">解决中</el-radio>
            <el-radio value="completed">已完成</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="isOverdue && progressForm.status !== 'completed' && !issue.delayedDeadline" label="延期时间">
          <el-date-picker v-model="progressForm.delayedDeadline" type="date" placeholder="选择新的截止日期" style="width: 100%;" />
          <div style="font-size: 11px; color: #E6A23C; margin-top: 4px;">已超截止时间，可申请延期（仅支持修改一次）</div>
        </el-form-item>
        <el-form-item v-if="issue.delayedDeadline" label="延期信息">
          <span style="color: #E6A23C;">已延期至 {{ issue.delayedDeadline }}（不可再次修改）</span>
        </el-form-item>
        <el-form-item label="更新类型">
          <el-radio-group v-model="progressForm.updateType">
            <el-radio value="proactive">主动更新</el-radio>
            <el-radio value="routine">例行更新</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="附件">
          <el-upload action="#" :auto-upload="false" :limit="5">
            <el-button size="small"><el-icon><Upload /></el-icon> 上传附件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="progressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProgress">确认提交</el-button>
      </template>
    </el-dialog>

    <!-- 添加协同处理人弹框 -->
    <el-dialog v-model="addCollaboratorVisible" title="添加协同处理人" width="480px" :close-on-click-modal="false">
      <div v-if="currentSubIssueIdx !== null" style="background: #f6f8fa; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px;">
        <div style="font-size: 13px; color: #333; font-weight: 600;">{{ issue.subIssues[currentSubIssueIdx]?.title }}</div>
        <div style="font-size: 12px; color: #999; margin-top: 4px;">{{ issue.subIssues[currentSubIssueIdx]?.id }}</div>
      </div>
      <el-form label-width="80px" size="default">
        <el-form-item label="姓名" required>
          <el-input v-model="collaboratorForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="部门" required>
          <el-select v-model="collaboratorForm.dept" placeholder="选择部门" style="width: 100%;">
            <el-option v-for="d in deptList" :key="d.value" :label="d.label" :value="d.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" required>
          <el-radio-group v-model="collaboratorForm.role">
            <el-radio value="main">主办</el-radio>
            <el-radio value="assist">协办</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addCollaboratorVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddCollaborator">确定添加</el-button>
      </template>
    </el-dialog>

    <!-- 协同处理人更新进展弹框 -->
    <el-dialog v-model="collaboratorUpdateVisible" title="更新协同进展" width="480px" :close-on-click-modal="false">
      <div v-if="currentCollaborator" style="background: #f6f8fa; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px;">
        <div style="font-size: 13px; color: #333; font-weight: 600;">{{ currentCollaborator.name }} - {{ currentCollaborator.dept }}</div>
        <div style="font-size: 12px; color: #999; margin-top: 4px;">
          角色：{{ currentCollaborator.role === 'main' ? '主办' : '协办' }}
        </div>
      </div>
      <el-form label-width="80px" size="default">
        <el-form-item label="进展内容" required>
          <el-input v-model="collaboratorUpdateForm.content" type="textarea" :rows="4" placeholder="请输入进展更新内容..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="collaboratorUpdateVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCollaboratorUpdate">确认更新</el-button>
      </template>
    </el-dialog>
  </div>

  <div v-else style="text-align: center; padding: 100px;">
    <el-empty description="问题不存在" />
    <el-button type="primary" @click="$router.push('/issues')">返回问题列表</el-button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, EditPen, Upload, Warning, Plus, CircleCheck, WarningFilled, List, Share } from '@element-plus/icons-vue'
import {
  mockIssues,
  progressLogs,
  subProgressLogs,
  departments,
  issueFlowSequence,
  getIssueFlowSubmitConfig,
  getIssueFlowNodeIndex,
  flowRecords,
  getFlowNodeLabel,
  currentUser,
} from '../mock/data'

const route = useRoute()
const issueId = route.params.id
const deptList = departments

const issue = ref(null)
const found = mockIssues.find(i => i.id === issueId)
if (found) {
  issue.value = JSON.parse(JSON.stringify(found))
}

const hasSubIssues = computed(() => issue.value?.subIssues?.length > 0)

/** 当前为二级办理且未办结时，可维护子问题协同与进展 */
const isLevel2Process = computed(
  () => issue.value?.flowNode === 'level2' && issue.value?.status !== 'completed',
)

/** 问题清单行：有 subIssues 则一行一条；否则用工单主信息合成一行 */
const mergedIssueRows = computed(() => {
  if (!issue.value) return []
  const subs = issue.value.subIssues
  if (subs?.length) {
    return subs.map((sub, idx) => ({
      subIdx: idx,
      seq: idx + 1,
      subId: sub.id,
      title: sub.title,
      categoryLabel: issue.value.categoryLabel,
      handler: sub.handler,
      deadline: sub.deadline,
      mainDept: sub.mainDept || issue.value.department,
      assistDeptsLabel: sub.assistDepts?.length ? sub.assistDepts.join('、') : '—',
      status: sub.status,
      statusLabel: sub.statusLabel,
      progress: sub.progress,
    }))
  }
  const title =
    issue.value.description && issue.value.description !== '—'
      ? issue.value.description
      : issue.value.title
  return [
    {
      subIdx: -1,
      seq: 1,
      subId: issue.value.id,
      title,
      categoryLabel: issue.value.categoryLabel || '—',
      handler: issue.value.handler || issue.value.responsible || '—',
      deadline: issue.value.deadline,
      mainDept: issue.value.department || '—',
      assistDeptsLabel: '—',
      status: issue.value.status,
      statusLabel: issue.value.statusLabel,
      progress: issue.value.progress,
    },
  ]
})

const allCollaboratorsUpdated = computed(() => {
  if (!isLevel2Process.value) return true
  if (!issue.value?.subIssues) return true
  return issue.value.subIssues.every(
    (sub) => !sub.collaborators || sub.collaborators.length === 0 || sub.collaborators.every((c) => c.hasUpdated),
  )
})

const pendingCollaboratorsCount = computed(() => {
  if (!isLevel2Process.value) return 0
  if (!issue.value?.subIssues) return 0
  return issue.value.subIssues.reduce((count, sub) => {
    if (!sub.collaborators) return count
    return count + sub.collaborators.filter((c) => !c.hasUpdated).length
  }, 0)
})

function isSubIssueAllUpdated(sub) {
  if (!sub.collaborators || sub.collaborators.length === 0) return false
  return sub.collaborators.every(c => c.hasUpdated)
}

const flowSubmitConfig = computed(() =>
  issue.value ? getIssueFlowSubmitConfig(issue.value.flowNode) : { showProgressUpdate: false, routes: [] },
)
const correctionFeedbackNodes = ['level1', 'level2', 'receive_dept_director']
const canShowCorrectionFeedback = computed(
  () =>
    !!issue.value &&
    issue.value.status !== 'completed' &&
    correctionFeedbackNodes.includes(issue.value.flowNode),
)

const selectedRouteValue = ref('')
watch(
  () => [issue.value?.flowNode, flowSubmitConfig.value.routes],
  () => {
    const routes = flowSubmitConfig.value.routes
    if (!routes?.length) {
      selectedRouteValue.value = ''
      return
    }
    if (routes.length === 1) {
      selectedRouteValue.value = routes[0].value
      return
    }
    if (!routes.some((r) => r.value === selectedRouteValue.value)) {
      selectedRouteValue.value = routes[0].value
    }
  },
  { immediate: true, deep: true },
)

const selectedRoute = computed(() =>
  flowSubmitConfig.value.routes.find((r) => r.value === selectedRouteValue.value),
)

const canSubmitFlowStep = computed(() => {
  if (!selectedRoute.value) return false
  if (isLevel2Process.value && hasSubIssues.value && !allCollaboratorsUpdated.value && selectedRoute.value.kind === 'forward') {
    return false
  }
  return true
})

const flowRecordDialogVisible = ref(false)
const flowChartDialogVisible = ref(false)
const localFlowRecordAdds = ref([])

const mergedFlowRecords = computed(() => {
  const base = flowRecords[issueId] ? [...flowRecords[issueId]] : []
  const merged = [...localFlowRecordAdds.value, ...base]
  return merged.sort((a, b) => String(b.date).localeCompare(String(a.date)))
})

const submitFlowDialogVisible = ref(false)
const submitFlowOpinion = ref('')
const correctionDialogVisible = ref(false)
const correctionForm = ref({ content: '' })

function openSubmitFlowDialog() {
  if (!canSubmitFlowStep.value) {
    ElMessage.warning(
      isLevel2Process.value && hasSubIssues.value
        ? '尚有协同处理人未更新进展，无法按所选路由正向提交，请先督促更新或选择退回类路由。'
        : '当前无法提交，请检查办理条件。',
    )
    return
  }
  submitFlowOpinion.value = ''
  submitFlowDialogVisible.value = true
}

function openCorrectionDialog() {
  correctionForm.value = { content: '' }
  correctionDialogVisible.value = true
}

function submitCorrectionFeedback() {
  const content = correctionForm.value.content?.trim()
  if (!content) {
    ElMessage.warning('请输入反馈信息')
    return
  }
  localFlowRecordAdds.value.unshift({
    id: `corr-${Date.now()}`,
    date: new Date().toLocaleString('zh-CN', { hour12: false }),
    user: currentUser.name,
    action: '纠错反馈',
    remark: `反馈给发起人（${issue.value?.responsible || '未设置'}）：${content}`,
  })
  ElMessage.success(`纠错反馈已提交，处理人：${issue.value?.responsible || '发起人'}`)
  correctionDialogVisible.value = false
}

function confirmSubmitFlow() {
  const route = selectedRoute.value
  if (!route || !issue.value) return

  const next = route.targetNode
  issue.value.flowNode = next
  issue.value.flowNodeLabel = getFlowNodeLabel(next)

  if (next === 'completed') {
    issue.value.status = 'completed'
    issue.value.statusLabel = '已完成'
    issue.value.progress = 100
  }

  const opinion = submitFlowOpinion.value.trim()
  const remarkParts = [route.label]
  if (opinion) remarkParts.push(`意见：${opinion}`)
  localFlowRecordAdds.value.unshift({
    id: `local-${Date.now()}`,
    date: new Date().toLocaleString('zh-CN', { hour12: false }),
    user: currentUser.name,
    action: route.kind === 'end' ? '办结' : '流程流转',
    remark: remarkParts.join('；'),
  })

  localLogs.value.unshift({
    id: Date.now(),
    date: new Date().toLocaleString('zh-CN', { hour12: false }),
    user: currentUser.name,
    content: opinion || `已提交办理：${route.label}`,
    progress: issue.value.progress,
    updateType: 'routine',
  })

  ElMessage.success('提交成功')
  submitFlowDialogVisible.value = false
}

function getNodeStatus(nodeValue, currentNode) {
  const cur = getIssueFlowNodeIndex(currentNode)
  const idx = getIssueFlowNodeIndex(nodeValue)
  if (cur < 0 || idx < 0) return 'pending'
  if (idx < cur) return 'done'
  if (idx === cur) return 'current'
  return 'pending'
}

function isNodeDone(nodeValue, currentNode) {
  const cur = getIssueFlowNodeIndex(currentNode)
  const idx = getIssueFlowNodeIndex(nodeValue)
  if (cur < 0 || idx < 0) return false
  return idx < cur
}

const isDeadlineNear = computed(() => {
  if (!issue.value || issue.value.status === 'completed') return false
  const deadline = issue.value.delayedDeadline || issue.value.deadline
  const diff = new Date(deadline) - new Date()
  return diff < 7 * 24 * 60 * 60 * 1000
})

const isOverdue = computed(() => {
  if (!issue.value || issue.value.status === 'completed') return false
  return new Date(issue.value.deadline) < new Date()
})

const localLogs = ref([])
/** 按子问题编号追加的本地进展记录 */
const localSubLogs = ref({})

const subProgressDialogVisible = ref(false)
const subProgressDialogTitle = ref('进展更新记录')
const subProgressTableRows = ref([])

function openSubProgressDialog(row) {
  if (!issue.value) return
  subProgressDialogTitle.value = `进展更新记录 — ${row.subId}`
  let merged = []
  if (row.subIdx < 0) {
    const base = (progressLogs[issueId] || []).map((log) => ({
      ...log,
      updateType: log.updateType || 'routine',
    }))
    merged = [...localLogs.value.map((log) => ({ ...log, updateType: log.updateType || 'routine' })), ...base]
  } else {
    const base = (subProgressLogs[row.subId] || []).map((log) => ({
      ...log,
      updateType: log.updateType || 'routine',
    }))
    const local = (localSubLogs.value[row.subId] || []).map((log) => ({
      ...log,
      updateType: log.updateType || 'routine',
    }))
    merged = [...local, ...base]
  }
  merged.sort((a, b) => String(b.date).localeCompare(String(a.date)))
  subProgressTableRows.value = merged
  subProgressDialogVisible.value = true
}

// ===== 进展更新 =====
const progressDialogVisible = ref(false)
const progressForm = ref({
  progress: 0,
  content: '',
  status: 'in_progress',
  updateType: 'proactive',
  delayedDeadline: null,
})

function openProgressDialog() {
  progressForm.value = {
    progress: issue.value?.progress || 0,
    content: '',
    status: issue.value?.status === 'completed' ? 'completed' : 'in_progress',
    updateType: 'proactive',
    delayedDeadline: null,
  }
  progressDialogVisible.value = true
}

function submitProgress() {
  if (!progressForm.value.content) {
    ElMessage.warning('请输入进展描述')
    return
  }
  if (progressForm.value.delayedDeadline && !issue.value.delayedDeadline) {
    const dateStr = new Date(progressForm.value.delayedDeadline).toISOString().split('T')[0]
    issue.value.delayedDeadline = dateStr
  }
  if (progressForm.value.status === 'completed') {
    if (isLevel2Process.value && hasSubIssues.value && !allCollaboratorsUpdated.value) {
      ElMessage.warning('所有协同处理人需先更新进展，才能标记为已完成')
      return
    }
    issue.value.status = 'completed'
    issue.value.statusLabel = '已完成'
    issue.value.progress = 100
  } else {
    issue.value.progress = progressForm.value.progress
  }
  localLogs.value.unshift({
    id: Date.now(),
    date: new Date().toLocaleString('zh-CN'),
    user: currentUser.name,
    content: progressForm.value.content,
    progress: progressForm.value.status === 'completed' ? 100 : progressForm.value.progress,
    updateType: progressForm.value.updateType,
  })
  ElMessage.success('进展已更新')
  progressDialogVisible.value = false
}

// ===== 添加协同处理人 =====
const addCollaboratorVisible = ref(false)
const currentSubIssueIdx = ref(null)
const collaboratorForm = ref({ name: '', dept: '', role: 'assist' })

function openAddCollaboratorDialog(subIdx) {
  currentSubIssueIdx.value = subIdx
  collaboratorForm.value = { name: '', dept: '', role: 'assist' }
  addCollaboratorVisible.value = true
}

function submitAddCollaborator() {
  if (!collaboratorForm.value.name || !collaboratorForm.value.dept) {
    ElMessage.warning('请填写姓名和部门')
    return
  }
  const sub = issue.value.subIssues[currentSubIssueIdx.value]
  if (!sub.collaborators) sub.collaborators = []
  sub.collaborators.push({
    id: 'c' + Date.now(),
    name: collaboratorForm.value.name,
    dept: collaboratorForm.value.dept,
    role: collaboratorForm.value.role,
    hasUpdated: false,
    updateContent: '',
    updateDate: '',
  })
  ElMessage.success(`已添加协同处理人：${collaboratorForm.value.name}`)
  addCollaboratorVisible.value = false
}

// ===== 协同处理人更新进展 =====
const collaboratorUpdateVisible = ref(false)
const currentCollaborator = ref(null)
const currentCollaboratorSubIdx = ref(null)
const collaboratorUpdateForm = ref({ content: '' })

function openCollaboratorUpdateDialog(subIdx, collaborator) {
  currentCollaboratorSubIdx.value = subIdx
  currentCollaborator.value = collaborator
  collaboratorUpdateForm.value = { content: '' }
  collaboratorUpdateVisible.value = true
}

function submitCollaboratorUpdate() {
  if (!collaboratorUpdateForm.value.content) {
    ElMessage.warning('请输入进展内容')
    return
  }
  const sub = issue.value.subIssues[currentCollaboratorSubIdx.value]
  const col = sub.collaborators.find(c => c.id === currentCollaborator.value.id)
  if (col) {
    col.hasUpdated = true
    col.updateContent = collaboratorUpdateForm.value.content
    col.updateDate = new Date().toISOString().split('T')[0]
  }
  const sid = sub.id
  const nextLogs = {
    ...localSubLogs.value,
    [sid]: [
      {
        id: Date.now(),
        date: new Date().toLocaleString('zh-CN', { hour12: false }),
        user: currentCollaborator.value.name,
        content: collaboratorUpdateForm.value.content,
        progress: sub.progress,
        updateType: 'proactive',
      },
      ...(localSubLogs.value[sid] || []),
    ],
  }
  localSubLogs.value = nextLogs
  ElMessage.success(`${currentCollaborator.value.name} 的进展已更新`)
  collaboratorUpdateVisible.value = false

  if (isSubIssueAllUpdated(sub)) {
    ElMessage.success(`子问题 ${sub.id} 的所有协同处理人已完成进展更新`)
  }
}
</script>

<style scoped>
.form-page {
  max-width: none;
  width: 100%;
  margin: 0;
  padding: 0 4px;
}
.issue-list-merged {
  padding-bottom: 4px;
}
.issue-list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 14px;
}
.issue-list-header-text {
  flex: 1;
  min-width: 0;
}
.issue-list-desc {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.55;
  margin: 0;
}
.issue-list-table {
  width: 100%;
}
.expand-inner {
  padding: 12px 16px 14px 48px;
  background: linear-gradient(180deg, #fafbfd 0%, #f5f7fa 100%);
  border-top: 1px solid #ebeef5;
}
.expand-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.expand-title {
  font-size: 13px;
  font-weight: 600;
  color: #595959;
}
.collab-nested-table {
  width: 100%;
}
.collab-empty {
  text-align: center;
  padding: 14px;
  color: #999;
  font-size: 12px;
  background: #fff;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
}
.collab-update-text {
  font-size: 12px;
  color: #333;
}
.collab-update-date {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}
.collab-pending {
  color: #e6a23c;
  font-size: 12px;
}
.collab-done {
  color: #67c23a;
  font-size: 14px;
}
.collab-alert {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.collab-alert--ok {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #389e0d;
}
.collab-alert--warn {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  color: #d48806;
}
</style>
