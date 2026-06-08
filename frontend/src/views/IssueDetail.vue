<template>
  <div class="form-page" v-if="issue">
    <!-- 顶部操作栏 -->
    <div class="filter-bar" style="margin-bottom: 12px;">
      <el-button @click="$router.back()" size="default">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
      <span style="font-size: 15px; font-weight: 600; color: #333; margin-left: 8px;">{{ isDraft ? (issue.batchTitle || issue.title) : issue.title }}</span>
      <el-tag v-if="isDraft" type="info" effect="plain" size="small" style="margin-left: 8px;">草稿编辑中</el-tag>
      <el-tag v-if="issueTypeLabel" type="info" effect="plain" size="small" style="margin-left: 8px;">{{ issueTypeLabel }}</el-tag>
      <el-tag v-if="issue.pinned" type="danger" size="small" style="margin-left: 8px;">置顶</el-tag>
      <div style="flex: 1;"></div>
      <template v-if="!isDraft">
        <el-button size="default" @click="flowRecordDialogVisible = true">
          <el-icon><List /></el-icon> 流转记录
        </el-button>
        <el-button size="default" @click="flowChartDialogVisible = true">
          <el-icon><Share /></el-icon> 流程图
        </el-button>
      </template>
    </div>

    <IssueFormEditor
      v-if="isDraft"
      :issue="issue"
      :issue-type="issue.issueType || 'survey'"
      submit-label="提交办理"
      show-draft-icon
      @cancel="router.back()"
      @save-draft="saveDraft"
      @submit="submitDraftForFlow"
    />

    <template v-else>
    <!-- 日常问题详情 -->
    <template v-if="isDailyIssue">
      <div class="form-card">
        <div class="form-section-title">日常问题信息</div>
        <div class="daily-detail-form">
          <div class="daily-detail-field">
            <div class="daily-detail-label">问题编号</div>
            <div class="daily-detail-value">{{ issue.id }}</div>
          </div>
          <div class="daily-detail-field">
            <div class="daily-detail-label">问题内容</div>
            <div class="daily-detail-value">{{ issue.description || '—' }}</div>
          </div>
          <div class="daily-detail-field">
            <div class="daily-detail-label">主要答复部门</div>
            <div class="daily-detail-value">{{ issue.department || '—' }}</div>
          </div>
          <div class="daily-detail-field">
            <div class="daily-detail-label">配合部门</div>
            <div class="daily-detail-value">{{ dailyAssistDepts }}</div>
          </div>
          <div class="daily-detail-field">
            <div class="daily-detail-label">期望答复时间</div>
            <div class="daily-detail-value" :style="{ color: isDeadlineNear ? '#F5222D' : '' }">
              {{ issue.deadline || '—' }}
              <span v-if="issue.delayedDeadline" style="color: #E6A23C; margin-left: 8px;">
                (已延期至 {{ issue.delayedDeadline }})
              </span>
            </div>
          </div>
          <div v-if="issue.remark" class="daily-detail-field">
            <div class="daily-detail-label">备注</div>
            <div class="daily-detail-value">{{ issue.remark }}</div>
          </div>
        </div>
      </div>

      <div class="form-card">
        <div class="form-section-title">办理信息</div>
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">当前状态</span>
              <span class="detail-value"><span :class="'status-tag status-' + issue.status">{{ issue.statusLabel }}</span></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">流程节点</span>
              <span class="detail-value">{{ issue.flowNodeLabel }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">发起人</span>
              <span class="detail-value">{{ issue.responsible || '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">当前处理人</span>
              <span class="detail-value">{{ issue.handler || '—' }}</span>
            </div>
          </el-col>
        </el-row>
        <div class="detail-item" v-if="issue.replyContent">
          <span class="detail-label">答复内容</span>
          <span class="detail-value">{{ issue.replyContent }}</span>
        </div>
        <div class="detail-item" v-if="issue.supervised">
          <span class="detail-label">督办状态</span>
          <span class="detail-value supervise-badge"><el-icon><Warning /></el-icon> 已被督办</span>
        </div>
      </div>
    </template>

    <!-- 调研问题详情 -->
    <template v-else>
    <div class="form-card">
      <div class="form-section-title">基本信息</div>
      <el-row :gutter="16">
        <el-col :span="12">
          <div class="detail-item"><span class="detail-label">问题编号</span><span class="detail-value">{{ issue.id }}</span></div>
          <div class="detail-item">
            <span class="detail-label">问题分类</span>
            <span class="detail-value">{{ issue.categoryLabel || '—' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">所属部门</span>
            <span class="detail-value">{{ issue.department }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">负责人（主办）</span>
            <span class="detail-value">{{ issue.responsible }}</span>
          </div>
          <div class="detail-item"><span class="detail-label">当前处理人</span><span class="detail-value">{{ issue.handler || '—' }}</span></div>
        </el-col>
        <el-col :span="12">
          <div class="detail-item"><span class="detail-label">当前状态</span><span class="detail-value"><span :class="'status-tag status-' + issue.status">{{ issue.statusLabel }}</span></span></div>
          <div class="detail-item"><span class="detail-label">流程节点</span><span class="detail-value">{{ issue.flowNodeLabel }}</span></div>
          <div class="detail-item">
            <span class="detail-label">调研日期</span>
            <span class="detail-value">{{ issue.surveyDate }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">调研地点</span>
            <span class="detail-value">{{ issue.surveyLocation }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">调研批次标题</span>
            <span class="detail-value">{{ issue.batchTitle || '—' }}</span>
          </div>
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
    </template>

    <!-- 问题清单（即子问题；二级办理时可维护协同与进展） -->
    <div ref="issueListSectionRef" class="form-card issue-list-merged" v-if="!isDailyIssue && mergedIssueRows.length > 0">
      <div class="issue-list-header">
        <div class="issue-list-header-text">
          <div class="form-section-title" style="margin-bottom: 6px;">问题清单</div>
          <p v-if="!isDailyIssue" class="issue-list-desc">
            <template v-if="canAccessLevel2Progress">
              可随时进入 <strong>二级办理</strong> 更新进展：展开各行维护「协同处理人」并填写进展；提交至下一环节时不校验进度是否达到 100%。
            </template>
            <template v-else>
              与「子问题」为同一清单。当前状态为只读查看。
            </template>
          </p>
        </div>
        <el-tag v-if="!isDailyIssue" :type="canAccessLevel2Progress ? 'warning' : 'info'" effect="plain" size="small">
          {{ canAccessLevel2Progress ? '可更新进展' : '仅查看' }}
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
        <el-table-column v-if="canAccessLevel2Progress && hasSubIssues" type="expand" width="44">
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
                <el-table-column label="进度" width="108" align="center">
                  <template #default="{ row: c }">
                    <el-progress
                      :percentage="c.updateProgress ?? 0"
                      :stroke-width="6"
                      :show-text="true"
                      :status="isCollaboratorComplete(c) ? 'success' : undefined"
                      style="width: 92px;"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="进展更新" min-width="160">
                  <template #default="{ row: c }">
                    <div v-if="c.hasUpdated">
                      <span class="collab-update-text">{{ c.updateContent }}</span>
                      <div class="collab-update-date">{{ c.updateDate }}</div>
                    </div>
                    <span v-else class="collab-pending"><el-icon><WarningFilled /></el-icon> 待更新进展</span>
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="88" align="center">
                  <template #default="{ row: c }">
                    <el-tag :type="isCollaboratorComplete(c) ? 'success' : c.hasUpdated ? 'warning' : 'info'" size="small">
                      {{ isCollaboratorComplete(c) ? '已完成' : c.hasUpdated ? '进行中' : '待更新' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="72" align="center">
                  <template #default="{ row: c }">
                    <el-button
                      v-if="!isCollaboratorComplete(c)"
                      type="primary"
                      link
                      size="small"
                      @click="openCollaboratorUpdateDialog(row.subIdx, c)"
                    >
                      更新
                    </el-button>
                    <span v-else class="collab-done"><el-icon><CircleCheck /></el-icon></span>
                  </template>
                </el-table-column>
              </el-table>
              <div v-else class="collab-empty">暂无协同处理人</div>

              <div v-if="isSubIssueAllUpdated(issue.subIssues[row.subIdx])" class="collab-alert collab-alert--ok">
                <el-icon><CircleCheck /></el-icon>
                <span>该子问题协同处理人已全部完成进展更新</span>
              </div>
              <div v-else-if="issue.subIssues[row.subIdx].collaborators?.length" class="collab-alert collab-alert--warn">
                <el-icon><WarningFilled /></el-icon>
                <span>尚有 {{ countIncompleteCollaborators(issue.subIssues[row.subIdx]) }} 位协同处理人未更新进展</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="seq" label="序号" width="52" align="center" />
        <el-table-column prop="subId" label="子问题编号" min-width="118" show-overflow-tooltip />
        <el-table-column prop="title" label="问题内容" min-width="200" show-overflow-tooltip />
        <el-table-column v-if="!isDailyIssue" prop="categoryLabel" label="问题分类" width="108" show-overflow-tooltip />
        <el-table-column prop="mainDept" label="主办部门" width="108" show-overflow-tooltip />
        <el-table-column prop="assistDeptsLabel" label="配合部门" width="112" show-overflow-tooltip />
        <el-table-column prop="handler" label="处理人" width="88" show-overflow-tooltip />
        <el-table-column prop="deadline" label="截止日期" width="102" align="center" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <span :class="'status-tag status-' + row.status">{{ row.statusLabel }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="!isDailyIssue" label="进度" width="130" align="center">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="6" :show-text="true" style="width: 110px;" />
          </template>
        </el-table-column>
        <el-table-column v-if="!isDailyIssue" label="操作" :width="actionColumnWidth" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openSubProgressDialog(row)">更新记录</el-button>
            <el-button
              v-if="canAccessLevel2Progress && row.subIdx >= 0"
              type="primary"
              link
              size="small"
              @click="openSubIssueProgressDialog(row)"
            >进展更新</el-button>
            <el-button
              v-if="canShowCorrectionFeedback"
              type="warning"
              link
              size="small"
              @click="openCorrectionDialog(row)"
            >纠错反馈</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 底部：路由与提交办理（未办结） -->
    <div class="form-card" v-if="issue.status !== 'completed' && flowSubmitConfig.routes.length > 0">
      <div class="form-section-title">提交办理</div>
      <p style="font-size: 12px; color: #999; margin: 0 0 12px;">
        当前环节：<strong style="color: #333;">{{ issue.flowNodeLabel }}</strong>
        <template v-if="flowSubmitConfig.routes.length > 1">，请先选择办理路由，填写办理意见后点击「提交办理」。</template>
        <template v-else>，填写办理意见后点击「提交办理」。</template>
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
            <span>{{ r.label }}</span>
            <span v-if="getRouteAssigneeInfo(r)" style="color: #999; font-size: 12px; margin-left: 8px;">
              （处理人：{{ getRouteAssigneeInfo(r).name }} · {{ getRouteAssigneeInfo(r).dept }}）
            </span>
          </el-radio>
        </el-radio-group>
      </div>
      <div v-if="selectedRouteAssignee" class="route-assignee-card">
        <div class="route-assignee-card__header">
          <el-icon><User /></el-icon>
          <span>下一步处理人</span>
        </div>
        <div class="route-assignee-card__body">
          <div class="route-assignee-item">
            <span class="route-assignee-label">姓名</span>
            <span class="route-assignee-value">{{ selectedRouteAssignee.name }}</span>
          </div>
          <div class="route-assignee-item">
            <span class="route-assignee-label">部门</span>
            <span class="route-assignee-value">{{ selectedRouteAssignee.dept }}</span>
          </div>
          <div class="route-assignee-item">
            <span class="route-assignee-label">目标环节</span>
            <span class="route-assignee-value">{{ getFlowNodeLabel(selectedRoute?.targetNode, issue.issueType || 'survey') }}</span>
          </div>
        </div>
      </div>
      <el-form label-width="80px" size="default" style="margin-bottom: 8px;">
        <el-form-item label="办理意见" required>
          <el-input
            v-model="submitFlowOpinion"
            type="textarea"
            :rows="4"
            placeholder="请输入办理意见"
          />
        </el-form-item>
      </el-form>
      <div style="display: flex; justify-content: center; padding: 8px 0 2px;">
        <el-button type="primary" size="large" :disabled="!canSubmitFlowStep" @click="confirmSubmitFlow" style="min-width: 220px;">
          提交办理
        </el-button>
      </div>
    </div>
    </template>

    <!-- 子问题进展更新记录（表格） -->
    <el-dialog
      v-model="subProgressDialogVisible"
      :title="subProgressDialogTitle"
      width="820px"
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
        <el-table-column prop="date" label="更新时间" width="158" />
        <el-table-column prop="user" label="更新人" width="88" show-overflow-tooltip />
        <el-table-column prop="dept" label="部门" width="108" show-overflow-tooltip />
        <el-table-column label="部门角色" width="88" align="center">
          <template #default="{ row }">
            <el-tag :type="row.deptRole === 'main' ? 'primary' : 'info'" size="small">
              {{ deptRoleLabel(row.deptRole) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="进展内容" min-width="180" show-overflow-tooltip />
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
      @closed="correctionTargetRow = null"
    >
      <div
        v-if="correctionTargetRow"
        style="background: #f6f8fa; padding: 10px 14px; border-radius: 6px; margin-bottom: 12px;"
      >
        <div style="font-size: 13px; color: #333; font-weight: 600;">{{ correctionTargetRow.title }}</div>
        <div style="font-size: 12px; color: #999; margin-top: 4px;">
          {{ correctionTargetRow.subId }} | 主单 {{ issue.id }}
        </div>
      </div>
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
        <div v-for="(node, idx) in currentIssueFlowSequence" :key="node.value" class="flow-node-wrapper">
          <div :class="['flow-node-circle', getNodeStatus(node.value, issue.flowNode)]">
            <span class="flow-node-idx">{{ idx + 1 }}</span>
          </div>
          <div class="flow-node-label" :class="{ active: node.value === issue.flowNode }">{{ node.label }}</div>
          <div v-if="idx < currentIssueFlowSequence.length - 1" :class="['flow-node-line', { done: isNodeDone(node.value, issue.flowNode) }]"></div>
        </div>
      </div>
    </el-dialog>

    <!-- 流转记录弹框 -->
    <el-dialog
      v-model="progressDialogVisible"
      :title="progressTargetSubIdx !== null ? '子问题进展更新' : '更新进展'"
      width="560px"
      :close-on-click-modal="false"
      @closed="progressTargetSubIdx = null"
    >
      <div style="background: #f6f8fa; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px;">
        <template v-if="progressTargetSubIdx !== null && issue.subIssues?.[progressTargetSubIdx]">
          <div style="font-size: 13px; color: #333; font-weight: 600;">{{ issue.subIssues[progressTargetSubIdx].title }}</div>
          <div style="font-size: 12px; color: #999; margin-top: 4px;">
            {{ issue.subIssues[progressTargetSubIdx].id }} | 主单 {{ issue.id }}
          </div>
        </template>
        <template v-else>
          <div style="font-size: 13px; color: #333; font-weight: 600;">{{ issue.title }}</div>
          <div style="font-size: 12px; color: #999; margin-top: 4px;">{{ issue.id }} | {{ issue.department }}</div>
        </template>
      </div>
      <!-- 未全部更新时提示 -->
      <el-form label-width="90px" size="default">
        <el-form-item label="当前进度" required>
          <el-slider
            v-model="progressForm.progress"
            :min="0"
            :max="100"
            :step="PROGRESS_STEP_PERCENT"
            show-stops
          />
        </el-form-item>
        <el-form-item label="进展描述" required>
          <el-input v-model="progressForm.content" type="textarea" :rows="4" placeholder="请输入进展描述内容..." />
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
        <el-form-item label="当前进度" required>
          <el-slider
            v-model="collaboratorUpdateForm.progress"
            :min="0"
            :max="100"
            :step="PROGRESS_STEP_PERCENT"
            show-stops
          />
        </el-form-item>
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
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Upload, Warning, Plus, CircleCheck, WarningFilled, List, Share, User } from '@element-plus/icons-vue'
import IssueFormEditor from '../components/IssueFormEditor.vue'
import {
  mockIssues,
  progressLogs,
  subProgressLogs,
  departments,
  issueTypes,
  getIssueFlowSequence,
  getIssueFlowSubmitConfig,
  getIssueFlowNodeIndex,
  getRouteAssignee,
  flowRecords,
  getFlowNodeLabel,
  getFirstFlowNodeAfterSubmit,
  getSubmitConfirmMessage,
  currentUser,
  getBatchNameByIssueId,
  PROGRESS_STEP_PERCENT,
  snapProgressPercent,
} from '../mock/data'

const route = useRoute()
const router = useRouter()
const issueId = route.params.id
const deptList = departments

const issue = ref(null)
const found = mockIssues.find(i => i.id === issueId)
if (found) {
  issue.value = JSON.parse(JSON.stringify(found))
  if (!issue.value.batchTitle) {
    issue.value.batchTitle = getBatchNameByIssueId(issue.value.id)
  }
}

const hasSubIssues = computed(() => issue.value?.subIssues?.length > 0)

const isDailyIssue = computed(() => issue.value?.issueType === 'daily')

const dailyAssistDepts = computed(() => {
  const sub = issue.value?.subIssues?.[0]
  if (sub?.assistDepts?.length) return sub.assistDepts.join('、')
  return '—'
})

const issueTypeLabel = computed(() =>
  issueTypes.find(t => t.value === (issue.value?.issueType || 'survey'))?.label || '',
)

const currentIssueFlowSequence = computed(() =>
  getIssueFlowSequence(issue.value?.issueType || 'survey'),
)

/** 草稿状态：可编辑基本信息并保存/提交办理 */
const isDraft = computed(() => issue.value?.status === 'draft')

/** 调研问题流程进行中：任意环节均可进入二级办理进展更新 */
const canAccessLevel2Progress = computed(() => {
  if (!issue.value) return false
  if (issue.value.issueType === 'daily') return false
  if (['draft', 'completed'].includes(issue.value.status)) return false
  return issue.value.flowNode !== 'initiate' && issue.value.flowNode !== 'completed'
})

const issueListSectionRef = ref(null)

onMounted(() => {
  if (route.query.action !== 'progress' || !canAccessLevel2Progress.value) return
  nextTick(() => {
    issueListSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
})

function applyDraftPatch(patch) {
  if (!issue.value) return
  Object.assign(issue.value, patch)
}

function persistIssue() {
  const idx = mockIssues.findIndex(i => i.id === issue.value.id)
  if (idx !== -1) {
    mockIssues[idx] = JSON.parse(JSON.stringify(issue.value))
  }
}

function saveDraft(patch) {
  applyDraftPatch(patch)
  persistIssue()
  ElMessage.success('草稿已保存')
}

async function submitDraftForFlow(patch) {
  applyDraftPatch(patch)
  const type = issue.value.issueType || 'survey'
  const firstNode = getFirstFlowNodeAfterSubmit(type)
  try {
    await ElMessageBox.confirm(
      getSubmitConfirmMessage(type),
      '确认提交办理',
      { type: 'warning', confirmButtonText: '确认提交', cancelButtonText: '取消' },
    )
  } catch {
    return
  }

  issue.value.status = 'pending'
  issue.value.statusLabel = '待处理'
  issue.value.flowNode = firstNode
  issue.value.flowNodeLabel = getFlowNodeLabel(firstNode, type)

  localFlowRecordAdds.value.unshift({
    id: `submit-${Date.now()}`,
    date: new Date().toLocaleString('zh-CN', { hour12: false }),
    user: currentUser.name,
    action: '草稿提交办理',
    remark: `已由草稿提交至「${issue.value.flowNodeLabel}」环节`,
  })

  persistIssue()
  ElMessage.success('草稿已提交办理')
  router.push('/dashboard')
}

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

function isCollaboratorComplete(c) {
  return !!c?.hasUpdated
}

function countIncompleteCollaborators(sub) {
  if (!sub?.collaborators?.length) return 0
  return sub.collaborators.filter((c) => !isCollaboratorComplete(c)).length
}

function isSubIssueAllUpdated(sub) {
  if (!sub.collaborators?.length) return false
  return sub.collaborators.every((c) => isCollaboratorComplete(c))
}

const flowSubmitConfig = computed(() =>
  issue.value
    ? getIssueFlowSubmitConfig(issue.value.flowNode, issue.value.issueType || 'survey')
    : { showProgressUpdate: false, routes: [] },
)
const correctionFeedbackNodes = ['level1', 'level2', 'receive_dept_director']
const canShowCorrectionFeedback = computed(
  () =>
    !!issue.value &&
    !isDailyIssue.value &&
    issue.value.status !== 'completed' &&
    correctionFeedbackNodes.includes(issue.value.flowNode),
)

const actionColumnWidth = computed(() => {
  let width = 100
  if (canAccessLevel2Progress.value) width += 76
  if (canShowCorrectionFeedback.value) width += 84
  return width
})

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

function getRouteAssigneeInfo(route) {
  if (!route || !issue.value) return null
  return getRouteAssignee(issue.value, route.targetNode)
}

const selectedRouteAssignee = computed(() => getRouteAssigneeInfo(selectedRoute.value))

const canSubmitFlowStep = computed(() => !!selectedRoute.value)

const flowRecordDialogVisible = ref(false)
const flowChartDialogVisible = ref(false)
const localFlowRecordAdds = ref([])

const mergedFlowRecords = computed(() => {
  const base = flowRecords[issueId] ? [...flowRecords[issueId]] : []
  const merged = [...localFlowRecordAdds.value, ...base]
  return merged.sort((a, b) => String(b.date).localeCompare(String(a.date)))
})

const submitFlowOpinion = ref('')
const correctionDialogVisible = ref(false)
const correctionForm = ref({ content: '' })

function confirmSubmitFlow() {
  if (!canSubmitFlowStep.value) {
    ElMessage.warning('请先选择办理路由')
    return
  }

  const route = selectedRoute.value
  if (!route || !issue.value) return

  const opinion = submitFlowOpinion.value.trim()
  if (!opinion) {
    ElMessage.warning('请填写办理意见')
    return
  }

  const next = route.targetNode
  const type = issue.value.issueType || 'survey'
  issue.value.flowNode = next
  issue.value.flowNodeLabel = getFlowNodeLabel(next, type)

  if (next === 'completed') {
    issue.value.status = 'completed'
    issue.value.statusLabel = '已完成'
    issue.value.progress = 100
  }

  const remarkParts = [route.label, `意见：${opinion}`]
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
    content: opinion,
    progress: issue.value.progress,
    updateType: 'routine',
  })

  submitFlowOpinion.value = ''
  ElMessage.success('提交成功')
}

const correctionTargetRow = ref(null)
function openCorrectionDialog(row = null) {
  correctionTargetRow.value = row || null
  correctionForm.value = { content: '' }
  correctionDialogVisible.value = true
}

function submitCorrectionFeedback() {
  const content = correctionForm.value.content?.trim()
  if (!content) {
    ElMessage.warning('请输入反馈信息')
    return
  }
  const target = correctionTargetRow.value
  const targetLabel = target?.subId ? `子问题 ${target.subId}` : ''
  const remarkPrefix = targetLabel ? `[${targetLabel}] ` : ''
  localFlowRecordAdds.value.unshift({
    id: `corr-${Date.now()}`,
    date: new Date().toLocaleString('zh-CN', { hour12: false }),
    user: currentUser.name,
    action: '纠错反馈',
    remark: `${remarkPrefix}反馈给发起人（${issue.value?.responsible || '未设置'}）：${content}`,
  })
  ElMessage.success(`纠错反馈已提交，处理人：${issue.value?.responsible || '发起人'}`)
  correctionDialogVisible.value = false
  correctionTargetRow.value = null
}

function getNodeStatus(nodeValue, currentNode) {
  const type = issue.value?.issueType || 'survey'
  const cur = getIssueFlowNodeIndex(currentNode, type)
  const idx = getIssueFlowNodeIndex(nodeValue, type)
  if (cur < 0 || idx < 0) return 'pending'
  if (idx < cur) return 'done'
  if (idx === cur) return 'current'
  return 'pending'
}

function isNodeDone(nodeValue, currentNode) {
  const type = issue.value?.issueType || 'survey'
  const cur = getIssueFlowNodeIndex(currentNode, type)
  const idx = getIssueFlowNodeIndex(nodeValue, type)
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

function deptRoleLabel(role) {
  return role === 'assist' ? '协办' : '主办'
}

function resolveLogDeptRole(log, sub) {
  if (log.dept) {
    return { dept: log.dept, deptRole: log.deptRole || 'main' }
  }
  const col = sub?.collaborators?.find((c) => c.name === log.user)
  if (col) {
    return { dept: col.dept, deptRole: col.role }
  }
  return {
    dept: sub?.mainDept || issue.value?.department || '—',
    deptRole: 'main',
  }
}

function normalizeProgressLogRow(log, sub) {
  const { dept, deptRole } = resolveLogDeptRole(log, sub)
  return {
    ...log,
    updateType: log.updateType || 'routine',
    dept,
    deptRole,
  }
}

function openSubProgressDialog(row) {
  if (!issue.value) return
  subProgressDialogTitle.value = `进展更新记录 — ${row.subId}`
  const sub = row.subIdx >= 0 ? issue.value.subIssues?.[row.subIdx] : null
  let merged = []
  if (row.subIdx < 0) {
    const base = (progressLogs[issueId] || []).map((log) =>
      normalizeProgressLogRow(log, { mainDept: issue.value.department }),
    )
    merged = [...localLogs.value.map((log) => normalizeProgressLogRow(log, null)), ...base]
  } else {
    const base = (subProgressLogs[row.subId] || []).map((log) => normalizeProgressLogRow(log, sub))
    const local = (localSubLogs.value[row.subId] || []).map((log) => normalizeProgressLogRow(log, sub))
    merged = [...local, ...base]
  }
  merged.sort((a, b) => String(b.date).localeCompare(String(a.date)))
  subProgressTableRows.value = merged
  subProgressDialogVisible.value = true
}

// ===== 进展更新 =====
const progressDialogVisible = ref(false)
/** null 为主单进展；>=0 为子问题清单行进展更新 */
const progressTargetSubIdx = ref(null)
const progressForm = ref({
  progress: 0,
  content: '',
})

function openProgressDialog() {
  progressTargetSubIdx.value = null
  progressForm.value = {
    progress: snapProgressPercent(issue.value?.progress || 0),
    content: '',
  }
  progressDialogVisible.value = true
}

function openSubIssueProgressDialog(row) {
  if (row.subIdx < 0 || !issue.value?.subIssues?.[row.subIdx]) return
  progressTargetSubIdx.value = row.subIdx
  const sub = issue.value.subIssues[row.subIdx]
  progressForm.value = {
    progress: snapProgressPercent(sub.progress ?? 0),
    content: '',
  }
  progressDialogVisible.value = true
}

function syncParentProgressFromSubs() {
  const subs = issue.value?.subIssues
  if (!subs?.length) return
  const avg = Math.round(subs.reduce((sum, s) => sum + (s.progress || 0), 0) / subs.length)
  issue.value.progress = avg
  issue.value.updateDate = new Date().toISOString().split('T')[0]
}

function submitProgress() {
  if (!progressForm.value.content) {
    ElMessage.warning('请输入进展描述')
    return
  }

  const progress = snapProgressPercent(progressForm.value.progress)
  progressForm.value.progress = progress

  const subIdx = progressTargetSubIdx.value
  if (subIdx !== null && subIdx >= 0) {
    const sub = issue.value.subIssues[subIdx]
    sub.progress = progress
    if (sub.status === 'pending') {
      sub.status = 'in_progress'
      sub.statusLabel = '解决中'
    }
    const sid = sub.id
    localSubLogs.value = {
      ...localSubLogs.value,
      [sid]: [
        {
          id: Date.now(),
          date: new Date().toLocaleString('zh-CN', { hour12: false }),
          user: currentUser.name,
          dept: sub.mainDept || issue.value.department,
          deptRole: 'main',
          content: progressForm.value.content,
          progress: sub.progress,
          updateType: 'routine',
        },
        ...(localSubLogs.value[sid] || []),
      ],
    }
    syncParentProgressFromSubs()
    ElMessage.success(`子问题「${sub.title}」进展已更新`)
    progressDialogVisible.value = false
    return
  }

  issue.value.progress = progress
  issue.value.updateDate = new Date().toISOString().split('T')[0]
  localLogs.value.unshift({
    id: Date.now(),
    date: new Date().toLocaleString('zh-CN'),
    user: currentUser.name,
    dept: issue.value.department || currentUser.department,
    deptRole: 'main',
    content: progressForm.value.content,
    progress,
    updateType: 'routine',
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
    updateProgress: 0,
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
const collaboratorUpdateForm = ref({ content: '', progress: 0 })

function openCollaboratorUpdateDialog(subIdx, collaborator) {
  currentCollaboratorSubIdx.value = subIdx
  currentCollaborator.value = collaborator
  collaboratorUpdateForm.value = {
    content: collaborator.updateContent || '',
    progress: collaborator.updateProgress ?? 0,
  }
  collaboratorUpdateVisible.value = true
}

function submitCollaboratorUpdate() {
  if (!collaboratorUpdateForm.value.content) {
    ElMessage.warning('请输入进展内容')
    return
  }
  const progress = snapProgressPercent(collaboratorUpdateForm.value.progress ?? 0)
  collaboratorUpdateForm.value.progress = progress
  const sub = issue.value.subIssues[currentCollaboratorSubIdx.value]
  const col = sub.collaborators.find(c => c.id === currentCollaborator.value.id)
  if (col) {
    col.hasUpdated = true
    col.updateProgress = progress
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
        dept: currentCollaborator.value.dept,
        deptRole: currentCollaborator.value.role,
        content: collaboratorUpdateForm.value.content,
        progress,
        updateType: 'proactive',
      },
      ...(localSubLogs.value[sid] || []),
    ],
  }
  localSubLogs.value = nextLogs
  collaboratorUpdateVisible.value = false

  ElMessage.success(`${currentCollaborator.value.name} 的进展已更新（进度 ${progress}%）`)
  if (isSubIssueAllUpdated(sub)) {
    ElMessage.success(`子问题 ${sub.id} 的协同处理人已全部完成进展更新`)
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
.daily-detail-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 100%;
}
.daily-detail-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.daily-detail-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}
.daily-detail-value {
  font-size: 14px;
  color: #595959;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
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
.route-assignee-card {
  margin-bottom: 12px;
  border: 1px solid #d6e4ff;
  background: #f0f5ff;
  border-radius: 6px;
  overflow: hidden;
}
.route-assignee-card__header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #e6efff;
  color: #1d39c4;
  font-size: 13px;
  font-weight: 600;
}
.route-assignee-card__body {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 10px 14px 12px;
}
.route-assignee-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.route-assignee-label {
  color: #8c8c8c;
}
.route-assignee-value {
  color: #1f1f1f;
  font-weight: 600;
}
</style>
