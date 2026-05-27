// ===== 问题分类 =====
export const issueCategories = [
  { value: 'strategy', label: '战略规划类' },
  { value: 'business', label: '经营业务类' },
  { value: 'tech', label: '后端技术类' },
  { value: 'service', label: '客户服务类' },
  { value: 'security', label: '大安全类' },
  { value: 'logistics', label: '大后勤类' },
  { value: 'performance', label: '绩效考核类' },
  { value: 'foundation', label: '基础管理类' },
  { value: 'other', label: '其他类' },
]

// ===== 当前登录用户 =====
export const currentUser = {
  name: '段磊',
  department: '信息技术部',
}

// ===== 部门列表 =====
export const departments = [
  { value: 'office', label: '综合办公室' },
  { value: 'strategy', label: '战略发展部' },
  { value: 'market', label: '市场经营部' },
  { value: 'network', label: '网络运维部' },
  { value: 'it', label: '信息技术部' },
  { value: 'hr', label: '人力资源部' },
  { value: 'finance', label: '财务管理部' },
  { value: 'customer', label: '客户服务部' },
  { value: 'security', label: '安全保卫部' },
  { value: 'logistics', label: '行政后勤部' },
]

// ===== 组织架构（一级：省公司+地市，二级：部门）=====
export const organizations = [
  {
    value: 'province',
    label: '河北电信省公司',
    children: [
      { value: 'office', label: '综合办公室' },
      { value: 'strategy', label: '战略发展部' },
      { value: 'market', label: '市场经营部' },
      { value: 'network', label: '网络运维部' },
      { value: 'it', label: '信息技术部' },
      { value: 'hr', label: '人力资源部' },
      { value: 'finance', label: '财务管理部' },
      { value: 'customer', label: '客户服务部' },
      { value: 'security', label: '安全保卫部' },
      { value: 'logistics', label: '行政后勤部' },
    ],
  },
  {
    value: 'sjz', label: '石家庄分公司',
    children: [
      { value: 'sjz_market', label: '市场经营部' },
      { value: 'sjz_network', label: '网络运维部' },
      { value: 'sjz_customer', label: '客户服务部' },
      { value: 'sjz_office', label: '综合办公室' },
    ],
  },
  {
    value: 'bd', label: '保定分公司',
    children: [
      { value: 'bd_market', label: '市场经营部' },
      { value: 'bd_network', label: '网络运维部' },
      { value: 'bd_customer', label: '客户服务部' },
    ],
  },
  {
    value: 'ts', label: '唐山分公司',
    children: [
      { value: 'ts_market', label: '市场经营部' },
      { value: 'ts_network', label: '网络运维部' },
      { value: 'ts_customer', label: '客户服务部' },
    ],
  },
  { value: 'hd', label: '邯郸分公司', children: [{ value: 'hd_market', label: '市场经营部' }, { value: 'hd_network', label: '网络运维部' }] },
  { value: 'cd', label: '承德分公司', children: [{ value: 'cd_market', label: '市场经营部' }, { value: 'cd_network', label: '网络运维部' }] },
  { value: 'lf', label: '廊坊分公司', children: [{ value: 'lf_market', label: '市场经营部' }, { value: 'lf_security', label: '安全保卫部' }] },
  { value: 'cz', label: '沧州分公司', children: [{ value: 'cz_market', label: '市场经营部' }, { value: 'cz_hr', label: '人力资源部' }] },
  { value: 'xt', label: '邢台分公司', children: [{ value: 'xt_market', label: '市场经营部' }, { value: 'xt_network', label: '网络运维部' }] },
  { value: 'qhd', label: '秦皇岛分公司', children: [{ value: 'qhd_market', label: '市场经营部' }, { value: 'qhd_network', label: '网络运维部' }] },
  { value: 'zjk', label: '张家口分公司', children: [{ value: 'zjk_market', label: '市场经营部' }, { value: 'zjk_strategy', label: '战略发展部' }] },
  { value: 'hs', label: '衡水分公司', children: [{ value: 'hs_market', label: '市场经营部' }] },
]

// ===== 调研问题全流程（1 发起在创建页；以下为 2–11 环节 + 结束）=====
// 2 地市问题确认 → 3 发起人部门主任 → 4 接单部门主任 → 5 一级办理 → 6 二级办理
// → 7 部门主任 → 8 发起人确认 → 9 地市区县评价 → 10 发起人确认（终验，可退回二级）→ 11 结束
export const issueFlowSequence = [
  { value: 'initiate', label: '发起', color: '#909399' },
  { value: 'city_confirm', label: '地市问题确认', color: '#409EFF' },
  { value: 'initiator_dept_director', label: '发起人部门主任', color: '#E6A23C' },
  { value: 'receive_dept_director', label: '接单部门主任', color: '#E6A23C' },
  { value: 'level1', label: '一级办理', color: '#F56C6C' },
  { value: 'level2', label: '二级办理', color: '#F56C6C' },
  { value: 'dept_director', label: '部门主任', color: '#722ED1' },
  { value: 'initiator_confirm', label: '发起人确认', color: '#67C23A' },
  { value: 'city_eval', label: '地市区县评价', color: '#13C2C2' },
  { value: 'initiator_final', label: '发起人确认（终验）', color: '#52C41A' },
  { value: 'completed', label: '结束', color: '#909399' },
]

/** 与 issueFlowSequence 一致，供列表/领导视图取色 */
export const flowNodes = issueFlowSequence

/** 主流程顺序（不含发起、结束），用于默认「提交至下一环节」 */
export const issueFlowOrder = [
  'city_confirm',
  'initiator_dept_director',
  'receive_dept_director',
  'level1',
  'level2',
  'dept_director',
  'initiator_confirm',
  'city_eval',
  'initiator_final',
]

export function getFlowNodeLabel(value) {
  const n = issueFlowSequence.find((x) => x.value === value)
  return n ? n.label : value || '—'
}

/**
 * 详情页底部：是否可更新办理进展、可选路由（多选时需先选路由再提交办理）
 * kind: forward | return | end
 */
export function getIssueFlowSubmitConfig(flowNode) {
  if (!flowNode || flowNode === 'completed' || flowNode === 'initiate') {
    return { showProgressUpdate: false, routes: [] }
  }

  const labelOf = (v) => getFlowNodeLabel(v)

  const configs = {
    city_confirm: {
      showProgressUpdate: true,
      routes: [
        { value: 'to_initiator_dept', label: `提交至${labelOf('initiator_dept_director')}`, targetNode: 'initiator_dept_director', kind: 'forward' },
      ],
    },
    initiator_dept_director: {
      showProgressUpdate: false,
      routes: [
        { value: 'return_initiator', label: '退回发起人', targetNode: 'city_confirm', kind: 'return' },
        { value: 'to_receive_dept', label: `提交至${labelOf('receive_dept_director')}`, targetNode: 'receive_dept_director', kind: 'forward' },
      ],
    },
    receive_dept_director: {
      showProgressUpdate: false,
      routes: [
        { value: 'return_initiator_dept', label: `退回${labelOf('initiator_dept_director')}`, targetNode: 'initiator_dept_director', kind: 'return' },
        { value: 'to_level1', label: `提交至${labelOf('level1')}`, targetNode: 'level1', kind: 'forward' },
      ],
    },
    level1: {
      showProgressUpdate: true,
      routes: [{ value: 'to_level2', label: `提交至${labelOf('level2')}`, targetNode: 'level2', kind: 'forward' }],
    },
    level2: {
      showProgressUpdate: true,
      routes: [{ value: 'to_dept_director', label: `提交至${labelOf('dept_director')}`, targetNode: 'dept_director', kind: 'forward' }],
    },
    dept_director: {
      showProgressUpdate: false,
      routes: [
        { value: 'return_level2', label: `退回${labelOf('level2')}`, targetNode: 'level2', kind: 'return' },
        { value: 'to_initiator_confirm', label: `提交至${labelOf('initiator_confirm')}`, targetNode: 'initiator_confirm', kind: 'forward' },
      ],
    },
    initiator_confirm: {
      showProgressUpdate: false,
      routes: [{ value: 'to_city_eval', label: `提交至${labelOf('city_eval')}`, targetNode: 'city_eval', kind: 'forward' }],
    },
    city_eval: {
      showProgressUpdate: true,
      routes: [{ value: 'to_initiator_final', label: `提交至${labelOf('initiator_final')}`, targetNode: 'initiator_final', kind: 'forward' }],
    },
    initiator_final: {
      showProgressUpdate: false,
      routes: [
        { value: 'finish', label: '结束', targetNode: 'completed', kind: 'end' },
        { value: 'return_main_only', label: '仅退回主办', targetNode: 'level2', kind: 'return' },
        { value: 'return_main_assist', label: '退回主协办', targetNode: 'level2', kind: 'return' },
      ],
    },
  }

  return configs[flowNode] || { showProgressUpdate: true, routes: [] }
}

/** 流程图节点状态：相对当前环节 */
export function getIssueFlowNodeIndex(flowNode) {
  return issueFlowSequence.findIndex((n) => n.value === flowNode)
}

export const issueStatuses = [
  { value: 'pending', label: '待处理', type: 'warning' },
  { value: 'in_progress', label: '解决中', type: 'primary' },
  { value: 'completed', label: '已完成', type: 'success' },
  { value: 'overdue', label: '已超期', type: 'danger' },
]

// ===== 模拟问题数据 =====
const _rawMockIssues = [
  {
    id: 'DY2026020001',
    title: '石家庄分公司5G网络覆盖优化方案',
    category: 'tech',
    categoryLabel: '后端技术类',
    flowNode: 'level2',
    flowNodeLabel: '二级办理',
    progress: 76,
    status: 'in_progress',
    statusLabel: '解决中',
    description: '关于石家庄主城区5G网络覆盖盲区的优化建议方案',
    updateDate: '2026-02-09',
    responsible: '段磊',
    handler: '段磊、王志成',
    deadline: '2026-03-15',
    department: '网络运维部',
    surveyDate: '2026-01-15',
    surveyLocation: '石家庄',
    leader: '张总',
    satisfaction: 0,
    supervised: false,
    replyContent: '',
    expectedComplete: '2026-03-15',
    pinned: true,
    resolved: false,
    subIssues: [
      {
        id: 'DY2026020001-1', title: '裕华区5G信号盲区排查', handler: '王志成', status: 'in_progress', statusLabel: '解决中', progress: 80, deadline: '2026-03-01',
        mainDept: '网络运维部', assistDepts: ['信息技术部'],
        collaborators: [
          { id: 'c1', name: '王志成', dept: '网络运维部', role: 'main', hasUpdated: true, updateProgress: 100, updateContent: '已完成裕华区80%基站排查', updateDate: '2026-02-08' },
          { id: 'c2', name: '李鹏', dept: '信息技术部', role: 'assist', hasUpdated: true, updateProgress: 100, updateContent: '已配合完成系统侧数据核查', updateDate: '2026-02-07' },
        ],
      },
      {
        id: 'DY2026020001-2', title: '长安区基站扩容方案', handler: '段磊', status: 'in_progress', statusLabel: '解决中', progress: 60, deadline: '2026-03-10',
        mainDept: '网络运维部', assistDepts: ['市场经营部'],
        collaborators: [
          { id: 'c3', name: '段磊', dept: '网络运维部', role: 'main', hasUpdated: true, updateProgress: 100, updateContent: '扩容方案初稿已完成', updateDate: '2026-02-06' },
          { id: 'c4', name: '赵刚', dept: '市场经营部', role: 'assist', hasUpdated: false, updateProgress: 0, updateContent: '', updateDate: '' },
        ],
      },
      {
        id: 'DY2026020001-3', title: '新华区网络质量优化', handler: '王志成', status: 'pending', statusLabel: '待处理', progress: 20, deadline: '2026-03-15',
        mainDept: '网络运维部', assistDepts: [],
        collaborators: [
          { id: 'c5', name: '王志成', dept: '网络运维部', role: 'main', hasUpdated: false, updateProgress: 0, updateContent: '', updateDate: '' },
        ],
      },
    ],
  },
  {
    id: 'DY2026020002',
    title: '保定客户投诉处理机制完善',
    category: 'service',
    categoryLabel: '客户服务类',
    flowNode: 'level2',
    flowNodeLabel: '二级办理',
    progress: 82,
    status: 'in_progress',
    statusLabel: '解决中',
    description: '保定地区客户投诉处理时效偏长，需优化处理机制',
    updateDate: '2026-02-08',
    responsible: '何天坤',
    handler: '何天坤',
    deadline: '2026-02-28',
    department: '客户服务部',
    surveyDate: '2026-01-20',
    surveyLocation: '保定',
    leader: '李总',
    satisfaction: 0,
    supervised: false,
    replyContent: '',
    expectedComplete: '2026-02-28',
    pinned: false,
    resolved: false,
    subIssues: [
      {
        id: 'DY2026020002-1', title: '投诉处理SOP修订', handler: '何天坤', status: 'completed', statusLabel: '已完成', progress: 100, deadline: '2026-02-15',
        mainDept: '客户服务部', assistDepts: [],
        collaborators: [
          { id: 'c6', name: '何天坤', dept: '客户服务部', role: 'main', hasUpdated: true, updateProgress: 100, updateContent: 'SOP修订完成并已发布', updateDate: '2026-02-14' },
        ],
      },
      {
        id: 'DY2026020002-2', title: '投诉处理系统改造', handler: '何天坤', status: 'in_progress', statusLabel: '解决中', progress: 70, deadline: '2026-02-25',
        mainDept: '客户服务部', assistDepts: ['信息技术部'],
        collaborators: [
          { id: 'c7', name: '何天坤', dept: '客户服务部', role: 'main', hasUpdated: true, updateProgress: 85, updateContent: '系统改造进行中，预计下周完成', updateDate: '2026-02-08' },
          { id: 'c8', name: '段磊', dept: '信息技术部', role: 'assist', hasUpdated: false, updateProgress: 0, updateContent: '', updateDate: '' },
        ],
      },
    ],
  },
  {
    id: 'DY2026020003',
    title: '列表中完成的状态，修改一下',
    category: 'other',
    categoryLabel: '其他类',
    flowNode: 'completed',
    flowNodeLabel: '结束',
    progress: 0,
    status: 'completed',
    statusLabel: '已完成',
    description: '—',
    updateDate: '2026-01-30',
    responsible: '段磊',
    handler: '段磊',
    deadline: '2026-02-23',
    department: '信息技术部',
    surveyDate: '2026-01-10',
    surveyLocation: '省公司',
    leader: '王总',
    satisfaction: 4,
    supervised: false,
    replyContent: '已按要求修改完成状态显示',
    expectedComplete: '已完成',
  },
  {
    id: 'DY2026020004',
    title: '会议支撑、会服转任务',
    category: 'logistics',
    categoryLabel: '大后勤类',
    flowNode: 'completed',
    flowNodeLabel: '结束',
    progress: 0,
    status: 'completed',
    statusLabel: '已完成',
    description: '—',
    updateDate: '2026-01-27',
    responsible: '段磊',
    handler: '段磊',
    deadline: '2026-02-23',
    department: '行政后勤部',
    surveyDate: '2026-01-05',
    surveyLocation: '省公司',
    leader: '张总',
    satisfaction: 5,
    supervised: false,
    replyContent: '已完成会议支撑系统与会服转任务功能对接',
    expectedComplete: '已完成',
  },
  {
    id: 'DY2026020005',
    title: '3月份翼办攻坚进展更新',
    category: 'business',
    categoryLabel: '经营业务类',
    flowNode: 'completed',
    flowNodeLabel: '结束',
    progress: 100,
    status: 'completed',
    statusLabel: '已完成',
    description: '完全解决',
    updateDate: '2026-01-28',
    responsible: '段磊',
    handler: '段磊',
    deadline: '2026-03-30',
    department: '市场经营部',
    surveyDate: '2026-01-08',
    surveyLocation: '全省',
    leader: '李总',
    satisfaction: 5,
    supervised: false,
    replyContent: '3月份翼办攻坚各项指标已全部达成，详见附件报告',
    expectedComplete: '已完成',
  },
  {
    id: 'DY2026020006',
    title: '自选协作人-流程审批人优化',
    category: 'tech',
    categoryLabel: '后端技术类',
    flowNode: 'completed',
    flowNodeLabel: '结束',
    progress: 0,
    status: 'completed',
    statusLabel: '已完成',
    description: '完全解决',
    updateDate: '2026-01-28',
    responsible: '段磊',
    handler: '段磊',
    deadline: '2026-01-27',
    department: '信息技术部',
    surveyDate: '2026-01-12',
    surveyLocation: '省公司',
    leader: '王总',
    satisfaction: 4,
    supervised: false,
    replyContent: '流程审批人选择功能已优化完成',
    expectedComplete: '已完成',
  },
  {
    id: 'DY2026020007',
    title: '流程节点限制',
    category: 'tech',
    categoryLabel: '后端技术类',
    flowNode: 'completed',
    flowNodeLabel: '结束',
    progress: 0,
    status: 'completed',
    statusLabel: '已完成',
    description: '完全解决',
    updateDate: '2026-01-28',
    responsible: '段磊',
    handler: '段磊',
    deadline: '2026-01-27',
    department: '信息技术部',
    surveyDate: '2026-01-12',
    surveyLocation: '省公司',
    leader: '张总',
    satisfaction: 5,
    supervised: false,
    replyContent: '已实现流程节点的权限限制功能',
    expectedComplete: '已完成',
  },
  {
    id: 'DY2026020008',
    title: '优化：任务表单字段名称要显示完整',
    category: 'tech',
    categoryLabel: '后端技术类',
    flowNode: 'completed',
    flowNodeLabel: '结束',
    progress: 54,
    status: 'completed',
    statusLabel: '已完成',
    description: '完全解决',
    updateDate: '2026-02-01',
    responsible: '段磊',
    handler: '段磊',
    deadline: '2026-02-23',
    department: '信息技术部',
    surveyDate: '2026-01-18',
    surveyLocation: '省公司',
    leader: '李总',
    satisfaction: 4,
    supervised: false,
    replyContent: '表单字段名称已全部调整为完整显示',
    expectedComplete: '已完成',
  },
  {
    id: 'DY2026020009',
    title: '默认分组，也要可以改名称',
    category: 'other',
    categoryLabel: '其他类',
    flowNode: 'completed',
    flowNodeLabel: '结束',
    progress: 0,
    status: 'completed',
    statusLabel: '已完成',
    description: '完全解决',
    updateDate: '2026-02-01',
    responsible: '段磊',
    handler: '段磊',
    deadline: '2026-02-10',
    department: '信息技术部',
    surveyDate: '2026-01-22',
    surveyLocation: '省公司',
    leader: '王总',
    satisfaction: 3,
    supervised: false,
    replyContent: '默认分组名称已支持自定义修改',
    expectedComplete: '已完成',
  },
  {
    id: 'DY2026020010',
    title: '唐山地市营业厅服务标准化建设',
    category: 'service',
    categoryLabel: '客户服务类',
    flowNode: 'city_confirm',
    flowNodeLabel: '地市问题确认',
    progress: 15,
    status: 'pending',
    statusLabel: '待处理',
    description: '关于唐山地市营业厅服务标准化及人员培训需求',
    updateDate: '2026-02-07',
    responsible: '李明',
    handler: '',
    deadline: '2026-03-20',
    department: '客户服务部',
    surveyDate: '2026-02-01',
    surveyLocation: '唐山',
    leader: '张总',
    satisfaction: 0,
    supervised: false,
    replyContent: '',
    expectedComplete: '2026-03-20',
  },
  {
    id: 'DY2026020011',
    title: '邯郸地区渠道合作伙伴激励政策调整',
    category: 'business',
    categoryLabel: '经营业务类',
    flowNode: 'level1',
    flowNodeLabel: '一级办理',
    progress: 35,
    status: 'in_progress',
    statusLabel: '解决中',
    description: '邯郸地区代理商反映当前激励政策力度不够',
    updateDate: '2026-02-06',
    responsible: '赵刚',
    handler: '赵刚',
    deadline: '2026-03-10',
    department: '市场经营部',
    surveyDate: '2026-01-25',
    surveyLocation: '邯郸',
    leader: '李总',
    satisfaction: 0,
    supervised: true,
    replyContent: '',
    expectedComplete: '2026-03-10',
  },
  {
    id: 'DY2026020012',
    title: '承德基站电力保障问题',
    category: 'tech',
    categoryLabel: '后端技术类',
    flowNode: 'level2',
    flowNodeLabel: '二级办理',
    progress: 60,
    status: 'in_progress',
    statusLabel: '解决中',
    description: '承德山区基站供电不稳定，影响网络质量',
    updateDate: '2026-02-05',
    responsible: '王伟',
    handler: '王伟、刘洋',
    deadline: '2026-02-20',
    department: '网络运维部',
    surveyDate: '2026-01-22',
    surveyLocation: '承德',
    leader: '王总',
    satisfaction: 0,
    supervised: true,
    replyContent: '',
    expectedComplete: '2026-02-20',
  },
  {
    id: 'DY2026020013',
    title: '廊坊数据中心安全加固方案',
    category: 'security',
    categoryLabel: '大安全类',
    flowNode: 'initiator_dept_director',
    flowNodeLabel: '发起人部门主任',
    progress: 5,
    status: 'pending',
    statusLabel: '待处理',
    description: '廊坊数据中心安全等级评估及加固建议',
    updateDate: '2026-02-08',
    responsible: '张伟',
    handler: '',
    deadline: '2026-04-01',
    department: '安全保卫部',
    surveyDate: '2026-02-03',
    surveyLocation: '廊坊',
    leader: '张总',
    satisfaction: 0,
    supervised: false,
    replyContent: '',
    expectedComplete: '2026-04-01',
  },
  {
    id: 'DY2026020014',
    title: '沧州分公司人才梯队建设规划',
    category: 'strategy',
    categoryLabel: '战略规划类',
    flowNode: 'initiator_confirm',
    flowNodeLabel: '发起人确认',
    progress: 90,
    status: 'in_progress',
    statusLabel: '解决中',
    description: '沧州分公司中层管理人员储备不足，需制定培养计划',
    updateDate: '2026-02-04',
    responsible: '孙丽',
    handler: '孙丽',
    deadline: '2026-02-15',
    department: '人力资源部',
    surveyDate: '2026-01-18',
    surveyLocation: '沧州',
    leader: '李总',
    satisfaction: 0,
    supervised: false,
    replyContent: '已制定三年人才梯队建设方案，包含轮岗、培训、导师制等措施',
    expectedComplete: '2026-02-15',
  },
  {
    id: 'DY2026020015',
    title: '优化：任务看板的卡片展示',
    category: 'tech',
    categoryLabel: '后端技术类',
    flowNode: 'completed',
    flowNodeLabel: '结束',
    progress: 0,
    status: 'completed',
    statusLabel: '已完成',
    description: '完全解决',
    updateDate: '2026-02-01',
    responsible: '段磊',
    handler: '段磊',
    deadline: '2026-03-30',
    department: '信息技术部',
    surveyDate: '2026-01-20',
    surveyLocation: '省公司',
    leader: '王总',
    satisfaction: 5,
    supervised: false,
    replyContent: '任务看板卡片展示样式已优化完成',
    expectedComplete: '已完成',
  },
  {
    id: 'DY2026020016',
    title: '邢台农村宽带覆盖提升工程进展跟踪',
    category: 'business',
    categoryLabel: '经营业务类',
    flowNode: 'dept_director',
    flowNodeLabel: '部门主任',
    progress: 45,
    status: 'in_progress',
    statusLabel: '解决中',
    description: '邢台农村地区宽带覆盖率偏低，影响数字乡村建设',
    updateDate: '2026-02-03',
    responsible: '刘强',
    handler: '刘强、张华',
    deadline: '2026-03-31',
    department: '网络运维部',
    surveyDate: '2026-01-28',
    surveyLocation: '邢台',
    leader: '张总',
    satisfaction: 0,
    supervised: false,
    replyContent: '',
    expectedComplete: '2026-03-31',
  },
  {
    id: 'DY2026020017',
    title: '秦皇岛旅游旺季网络容量保障预案',
    category: 'tech',
    categoryLabel: '后端技术类',
    flowNode: 'city_eval',
    flowNodeLabel: '地市区县评价',
    progress: 95,
    status: 'in_progress',
    statusLabel: '解决中',
    description: '秦皇岛旅游景点暑期网络拥塞问题的容量保障方案',
    updateDate: '2026-02-02',
    responsible: '陈明',
    handler: '陈明',
    deadline: '2026-02-28',
    department: '网络运维部',
    surveyDate: '2026-01-15',
    surveyLocation: '秦皇岛',
    leader: '李总',
    satisfaction: 0,
    supervised: false,
    replyContent: '已制定分级扩容预案，包含临时基站部署、CDN缓存优化等措施',
    expectedComplete: '2026-02-28',
  },
  {
    id: 'DY2026020018',
    title: '张家口冬奥遗产网络设施维护方案',
    category: 'strategy',
    categoryLabel: '战略规划类',
    flowNode: 'completed',
    flowNodeLabel: '结束',
    progress: 100,
    status: 'completed',
    statusLabel: '已完成',
    description: '完全解决',
    updateDate: '2026-01-25',
    responsible: '周波',
    handler: '周波',
    deadline: '2026-02-20',
    department: '战略发展部',
    surveyDate: '2026-01-10',
    surveyLocation: '张家口',
    leader: '张总',
    satisfaction: 5,
    supervised: false,
    replyContent: '冬奥遗产网络设施维护方案已制定完毕并通过评审',
    expectedComplete: '已完成',
  },
  {
    id: 'DY2026020019',
    title: '衡水分公司政企专线 SLA 达标整改',
    category: 'tech',
    categoryLabel: '后端技术类',
    flowNode: 'receive_dept_director',
    flowNodeLabel: '接单部门主任',
    progress: 22,
    status: 'in_progress',
    statusLabel: '解决中',
    description: '衡水政企客户专线故障恢复时长未达 SLA，需接单部门主任分派主办部门',
    updateDate: '2026-02-09',
    responsible: '韩雪',
    handler: '韩雪',
    deadline: '2026-03-25',
    department: '网络运维部',
    surveyDate: '2026-02-05',
    surveyLocation: '衡水',
    leader: '王总',
    satisfaction: 0,
    supervised: false,
    replyContent: '',
    expectedComplete: '2026-03-25',
    pinned: false,
    resolved: false,
  },
  {
    id: 'DY2026020020',
    title: '石家庄营业厅排队时长优化（终验）',
    category: 'service',
    categoryLabel: '客户服务类',
    flowNode: 'initiator_final',
    flowNodeLabel: '发起人确认（终验）',
    progress: 98,
    status: 'in_progress',
    statusLabel: '解决中',
    description: '营业厅排队系统与线上取号联调完成，等待发起人终验：可结束或退回二级办理',
    updateDate: '2026-02-10',
    responsible: '段磊',
    handler: '段磊',
    deadline: '2026-02-28',
    department: '客户服务部',
    surveyDate: '2026-01-28',
    surveyLocation: '石家庄',
    leader: '张总',
    satisfaction: 0,
    supervised: false,
    replyContent: '区县评价已完成，满意度良好',
    expectedComplete: '2026-02-28',
    pinned: false,
    resolved: false,
  },
]

const ASSIST_DEPT_POOL = ['信息技术部', '市场经营部', '综合办公室', '行政后勤部', '人力资源部']
const COLLAB_NAMES = ['李鹏', '张华', '王敏', '刘洋', '陈静', '周涛']

function pickAssistDept(mainDept, slot) {
  const pool = ASSIST_DEPT_POOL.filter((d) => d !== mainDept)
  return pool[slot % pool.length] || pool[0]
}

function buildSubIssueCollaborators(issue, slot, handler, mainDept, assistDepts) {
  const atLevel2 = issue.flowNode === 'level2' && issue.status !== 'completed'
  const mainUpdated = atLevel2 && slot === 1
  const collabs = [
    {
      id: `${issue.id}-c${slot}-m`,
      name: handler,
      dept: mainDept,
      role: 'main',
      hasUpdated: mainUpdated,
      updateProgress: mainUpdated ? 100 : 0,
      updateContent: mainUpdated ? '已提交本阶段办理情况说明' : '',
      updateDate: mainUpdated ? '2026-02-08' : '',
    },
  ]
  assistDepts.forEach((dept, i) => {
    collabs.push({
      id: `${issue.id}-c${slot}-a${i}`,
      name: COLLAB_NAMES[(slot + i) % COLLAB_NAMES.length],
      dept,
      role: 'assist',
      hasUpdated: false,
      updateProgress: 0,
      updateContent: '',
      updateDate: '',
    })
  })
  return collabs
}

function buildGeneratedSubIssue(issue, slot) {
  const handler = (issue.handler || issue.responsible || '经办人').split(/[、,\s]+/)[0]
  const mainDept = issue.department || '信息技术部'
  const location = issue.surveyLocation || '本地'
  const titles = [
    `${location}事项一：需求梳理与方案设计`,
    `${location}事项二：实施推进与协同办理`,
    `${location}事项三：成效验收与总结闭环`,
  ]
  const statusSlots =
    issue.status === 'completed'
      ? [
          { status: 'completed', statusLabel: '已完成' },
          { status: 'completed', statusLabel: '已完成' },
          { status: 'completed', statusLabel: '已完成' },
        ]
      : [
          { status: 'in_progress', statusLabel: '解决中' },
          { status: 'in_progress', statusLabel: '解决中' },
          { status: 'pending', statusLabel: '待处理' },
        ]
  const st = statusSlots[slot - 1]
  const base = Math.min(100, Math.max(0, (issue.progress || 0) + (slot - 2) * 10))
  const assistDepts = slot === 2 ? [pickAssistDept(mainDept, slot)] : slot === 1 ? [pickAssistDept(mainDept, 0)] : []
  return {
    id: `${issue.id}-${slot}`,
    title: titles[slot - 1],
    handler,
    status: st.status,
    statusLabel: st.statusLabel,
    progress: issue.status === 'completed' ? 100 : base,
    deadline: issue.deadline,
    mainDept,
    assistDepts,
    collaborators: buildSubIssueCollaborators(issue, slot, handler, mainDept, assistDepts),
  }
}

/** 每条主问题固定 3 条子问题，便于详情页问题清单区分 */
function ensureThreeSubIssues(issue) {
  const map = new Map((issue.subIssues || []).map((s) => [s.id, s]))
  for (let slot = 1; slot <= 3; slot += 1) {
    const sid = `${issue.id}-${slot}`
    if (!map.has(sid)) {
      map.set(sid, buildGeneratedSubIssue(issue, slot))
    }
  }
  return [1, 2, 3].map((slot) => map.get(`${issue.id}-${slot}`))
}

function withCollaboratorProgress(issue) {
  return {
    ...issue,
    subIssues: issue.subIssues?.map((sub) => ({
      ...sub,
      collaborators: sub.collaborators?.map((c) => ({
        ...c,
        updateProgress: c.updateProgress ?? (c.hasUpdated ? 80 : 0),
      })),
    })),
  }
}

export const mockIssues = _rawMockIssues
  .map((issue) => ({
    ...issue,
    subIssues: ensureThreeSubIssues(issue),
  }))
  .map(withCollaboratorProgress)

// ===== 调研计划数据 =====
export const mockPlans = [
  {
    id: 'JH2026020001',
    startTime: '2026-02-15 上午',
    endTime: '2026-02-16 下午',
    locations: ['石家庄市', '正定县'],
    leaderLevel: '公司副总经理',
    companionLevel: '市公司副总经理',
    department: '市场经营部',
    initiator: '王明',
    status: 'approved',
    statusLabel: '已审核',
    createDate: '2026-02-09',
  },
  {
    id: 'JH2026020002',
    startTime: '2026-02-18 上午',
    endTime: '2026-02-18 下午',
    locations: ['保定市'],
    leaderLevel: '部门主任',
    companionLevel: '市公司部门主任',
    department: '客户服务部',
    initiator: '李伟',
    status: 'pending',
    statusLabel: '待审核',
    createDate: '2026-02-09',
  },
  {
    id: 'JH2026020003',
    startTime: '2026-02-20 上午',
    endTime: '2026-02-21 下午',
    locations: ['唐山市', '迁安市'],
    leaderLevel: '公司总经理',
    companionLevel: '市公司总经理',
    department: '战略发展部',
    initiator: '赵强',
    status: 'approved',
    statusLabel: '已审核',
    createDate: '2026-02-08',
  },
]

// ===== 部门看板统计数据 =====
export const deptStats = [
  { dept: '网络运维部', total: 8, pending: 1, inProgress: 4, completed: 3, overdue: 1, satisfaction: 4.2 },
  { dept: '信息技术部', total: 12, pending: 0, inProgress: 2, completed: 10, overdue: 0, satisfaction: 4.5 },
  { dept: '客户服务部', total: 5, pending: 2, inProgress: 2, completed: 1, overdue: 0, satisfaction: 3.8 },
  { dept: '市场经营部', total: 6, pending: 0, inProgress: 3, completed: 3, overdue: 1, satisfaction: 4.0 },
  { dept: '战略发展部', total: 3, pending: 0, inProgress: 1, completed: 2, overdue: 0, satisfaction: 4.8 },
  { dept: '安全保卫部', total: 2, pending: 1, inProgress: 1, completed: 0, overdue: 0, satisfaction: 0 },
  { dept: '人力资源部', total: 3, pending: 0, inProgress: 1, completed: 2, overdue: 0, satisfaction: 4.3 },
  { dept: '行政后勤部', total: 2, pending: 0, inProgress: 0, completed: 2, overdue: 0, satisfaction: 4.6 },
  { dept: '综合办公室', total: 1, pending: 0, inProgress: 0, completed: 1, overdue: 0, satisfaction: 5.0 },
  { dept: '财务管理部', total: 1, pending: 0, inProgress: 1, completed: 0, overdue: 0, satisfaction: 0 },
]

// ===== 流转记录（与流程节点变更对应，供详情弹窗展示）=====
export const flowRecords = {
  'DY2026020001': [
    { id: 1, date: '2026-01-18 09:10', user: '段磊', action: '发起', remark: '调研问题录入' },
    { id: 2, date: '2026-01-19 11:00', user: '石家庄地市管理员', action: '地市问题确认', remark: '问题属实，纳入省公司流程' },
    { id: 3, date: '2026-01-20 14:20', user: '李主任', action: '发起人部门主任 → 接单部门主任', remark: '同意转办' },
    { id: 4, date: '2026-01-21 10:00', user: '网络运维部王主任', action: '接单部门主任 → 一级办理', remark: '指定副主任牵头' },
    { id: 5, date: '2026-01-23 16:30', user: '王志成', action: '一级办理 → 二级办理', remark: '进入主管现场处置' },
  ],
  'DY2026020010': [
    { id: 1, date: '2026-02-02 09:00', user: '李明', action: '发起', remark: '唐山营业厅服务标准化需求' },
    { id: 2, date: '2026-02-06 15:00', user: '唐山分公司', action: '待地市问题确认', remark: '市公司已核实问题背景' },
  ],
  'DY2026020013': [
    { id: 1, date: '2026-02-04 10:00', user: '张伟', action: '发起', remark: '数据中心安全加固' },
    { id: 2, date: '2026-02-07 09:30', user: '廊坊地市', action: '地市问题确认 → 发起人部门主任', remark: '同意上报' },
    { id: 3, date: '2026-02-08 11:00', user: '安全保卫部张主任', action: '待发起人部门主任审核', remark: '可退回发起人或提交接单部门主任' },
  ],
  'DY2026020014': [
    { id: 1, date: '2026-01-22 10:00', user: '孙丽', action: '发起', remark: '人才梯队建设' },
    { id: 2, date: '2026-01-28 14:00', user: '沧州地市', action: '地市问题确认', remark: '确认' },
    { id: 3, date: '2026-01-29 09:00', user: '人力资源部主任', action: '多级办理完成', remark: '方案已定稿' },
    { id: 4, date: '2026-02-03 16:00', user: '网络运维部主任', action: '部门主任 → 发起人确认', remark: '请发起人确认方案' },
  ],
  'DY2026020017': [
    { id: 1, date: '2026-01-18 14:00', user: '陈明', action: '发起', remark: '旅游旺季容量保障' },
    { id: 2, date: '2026-01-25 10:30', user: '秦皇岛地市', action: '地市问题确认', remark: '同意' },
    { id: 3, date: '2026-01-30 11:00', user: '网络运维部主任', action: '部门主任 → 发起人确认', remark: '' },
    { id: 4, date: '2026-02-01 09:00', user: '陈明', action: '发起人确认 → 地市区县评价', remark: '同意进入区县评价' },
    { id: 5, date: '2026-02-02 10:00', user: '海港区公司', action: '地市区县评价', remark: '评价：方案可行，建议加强应急演练' },
  ],
  'DY2026020019': [
    { id: 1, date: '2026-02-06 09:00', user: '韩雪', action: '发起', remark: '政企专线 SLA 整改' },
    { id: 2, date: '2026-02-07 14:00', user: '衡水地市', action: '地市问题确认', remark: '确认' },
    { id: 3, date: '2026-02-08 10:30', user: '省网络部对接人', action: '发起人部门主任 → 接单部门主任', remark: '请网络运维部接单' },
  ],
  'DY2026020020': [
    { id: 1, date: '2026-02-01 09:00', user: '段磊', action: '发起', remark: '营业厅排队优化' },
    { id: 2, date: '2026-02-04 16:00', user: '石家庄长安区', action: '地市区县评价', remark: '排队时长明显下降' },
    { id: 3, date: '2026-02-10 09:00', user: '系统', action: '进入发起人确认（终验）', remark: '可选择：结束 / 仅退回主办 / 退回主协办' },
  ],
}

// ===== 进展更新记录 =====
const _baseProgressLogs = {
  'DY2026020001': [
    { id: 1, date: '2026-02-09 14:30', user: '王志成', dept: '网络运维部', deptRole: 'main', content: '已完成主城区信号测试，覆盖率提升至92%', progress: 76 },
    { id: 2, date: '2026-02-05 10:15', user: '段磊', dept: '网络运维部', deptRole: 'main', content: '方案已通过技术评审，进入实施阶段', progress: 60 },
    { id: 3, date: '2026-01-28 16:00', user: '段磊', dept: '网络运维部', deptRole: 'main', content: '完成现场勘测，初步方案已拟定', progress: 35 },
    { id: 4, date: '2026-01-20 09:00', user: '段磊', dept: '网络运维部', deptRole: 'main', content: '问题已接收，安排人员进行现场勘测', progress: 10 },
  ],
  'DY2026020002': [
    { id: 1, date: '2026-02-08 11:20', user: '何天坤', content: '新投诉处理流程已上线试运行，处理时效缩短40%', progress: 82 },
    { id: 2, date: '2026-02-01 15:00', user: '何天坤', content: '完成投诉处理SOP修订，已提交审核', progress: 55 },
    { id: 3, date: '2026-01-25 09:30', user: '何天坤', content: '完成保定地区投诉数据分析，找到主要瓶颈', progress: 25 },
  ],
  'DY2026020011': [
    { id: 1, date: '2026-02-06 16:45', user: '赵刚', content: '已收集各区县代理商反馈，正在汇总激励方案', progress: 35 },
    { id: 2, date: '2026-01-30 10:00', user: '赵刚', content: '问题已接收，开始走访邯郸区县代理商', progress: 15 },
  ],
  'DY2026020012': [
    { id: 1, date: '2026-02-05 14:00', user: '刘洋', content: '已完成3个重点基站的UPS改造，剩余5个计划本月完成', progress: 60 },
    { id: 2, date: '2026-01-28 11:30', user: '王伟', content: '已制定基站电力改造方案，采购申请已提交', progress: 30 },
    { id: 3, date: '2026-01-24 09:00', user: '王伟', content: '完成承德山区基站供电情况摸底', progress: 15 },
  ],
  'DY2026020014': [
    { id: 1, date: '2026-02-04 17:00', user: '孙丽', content: '人才梯队方案已定稿，等待发起人确认', progress: 90 },
    { id: 2, date: '2026-01-30 14:20', user: '孙丽', content: '已完成沧州分公司中层人员盘点和能力评估', progress: 60 },
    { id: 3, date: '2026-01-22 10:00', user: '孙丽', content: '开始对沧州分公司进行人才现状调研', progress: 20 },
  ],
  'DY2026020016': [
    { id: 1, date: '2026-02-03 15:30', user: '张华', content: '邢台3个乡镇宽带改造已完工，验收中', progress: 45 },
    { id: 2, date: '2026-01-31 09:00', user: '刘强', content: '已完成施工方案制定，进入实施阶段', progress: 25 },
  ],
  'DY2026020017': [
    { id: 1, date: '2026-02-02 16:00', user: '陈明', content: '区县评价材料已汇总，等待发起人终验', progress: 95 },
    { id: 2, date: '2026-02-01 09:00', user: '陈明', content: '发起人已确认方案，进入地市区县评价环节', progress: 88 },
    { id: 3, date: '2026-01-25 10:30', user: '陈明', content: '完成景区网络容量评估和扩容方案制定', progress: 70 },
    { id: 4, date: '2026-01-18 14:00', user: '陈明', content: '开始秦皇岛旅游景区网络现状分析', progress: 20 },
  ],
  'DY2026020010': [
    { id: 1, date: '2026-02-07 10:00', user: '李明', content: '已补充营业厅现场照片及培训需求清单', progress: 15 },
  ],
  'DY2026020013': [
    { id: 1, date: '2026-02-08 09:00', user: '张伟', content: '已整理等保测评初稿，报部门主任审核', progress: 5 },
  ],
  'DY2026020019': [
    { id: 1, date: '2026-02-09 11:00', user: '韩雪', content: '已联系主办部门，准备下达一级办理任务', progress: 22 },
  ],
  'DY2026020020': [
    { id: 1, date: '2026-02-10 08:30', user: '段磊', content: '终验材料已齐备，拟提交办结', progress: 98 },
  ],
}

function enrichIssueProgressLog(log, issue) {
  return {
    ...log,
    updateType: log.updateType || 'routine',
    dept: log.dept || issue?.department || '—',
    deptRole: log.deptRole || 'main',
  }
}

export const progressLogs = (() => {
  const logs = {}
  Object.entries(_baseProgressLogs).forEach(([issueId, entries]) => {
    const issue = mockIssues.find((i) => i.id === issueId)
    logs[issueId] = entries.map((log) => enrichIssueProgressLog(log, issue))
  })
  return logs
})()

/** 各子问题进展更新记录（详情「更新记录」弹窗按子问题编号读取） */
const _baseSubProgressLogs = {
  'DY2026020001-1': [
    { id: 1, date: '2026-02-08 16:00', user: '王志成', dept: '网络运维部', deptRole: 'main', content: '裕华区盲测点第二轮复测完成', progress: 80, updateType: 'routine' },
    { id: 2, date: '2026-02-05 11:00', user: '李鹏', dept: '信息技术部', deptRole: 'assist', content: '配合完成网管侧指标核对', progress: 55, updateType: 'proactive' },
    { id: 3, date: '2026-01-30 09:30', user: '王志成', dept: '网络运维部', deptRole: 'main', content: '启动裕华区基站与室分联合排查', progress: 30, updateType: 'routine' },
  ],
  'DY2026020001-2': [
    { id: 1, date: '2026-02-06 14:20', user: '段磊', dept: '网络运维部', deptRole: 'main', content: '扩容方案初稿已提交内部评审', progress: 60, updateType: 'proactive' },
    { id: 2, date: '2026-02-01 10:00', user: '段磊', dept: '网络运维部', deptRole: 'main', content: '长安区需求摸排在途', progress: 35, updateType: 'routine' },
  ],
  'DY2026020001-3': [
    { id: 1, date: '2026-02-07 09:00', user: '王志成', dept: '网络运维部', deptRole: 'main', content: '新华区路测计划已排期', progress: 20, updateType: 'routine' },
  ],
  'DY2026020002-1': [
    { id: 1, date: '2026-02-14 17:00', user: '何天坤', dept: '客户服务部', deptRole: 'main', content: 'SOP 终稿发布并培训一线坐席', progress: 100, updateType: 'routine' },
    { id: 2, date: '2026-02-10 09:00', user: '何天坤', dept: '客户服务部', deptRole: 'main', content: 'SOP 部门会签通过', progress: 85, updateType: 'proactive' },
  ],
  'DY2026020002-2': [
    { id: 1, date: '2026-02-08 15:30', user: '何天坤', dept: '客户服务部', deptRole: 'main', content: '与信息技术部联调接口字段', progress: 70, updateType: 'routine' },
    { id: 2, date: '2026-02-03 11:00', user: '段磊', dept: '信息技术部', deptRole: 'assist', content: '配合完成接口联调用例', progress: 45, updateType: 'proactive' },
    { id: 3, date: '2026-02-02 16:20', user: '何天坤', dept: '客户服务部', deptRole: 'main', content: '投诉系统改造开发包已提测', progress: 40, updateType: 'routine' },
  ],
}

function enrichSubProgressLog(log, sub) {
  const col = sub.collaborators?.find((c) => c.name === log.user)
  return {
    ...log,
    updateType: log.updateType || 'routine',
    dept: log.dept || col?.dept || sub.mainDept || '—',
    deptRole: log.deptRole || col?.role || 'main',
  }
}

function defaultSubProgressLog(sub) {
  const handler = (sub.handler || '经办人').split(/[、,\s]+/)[0]
  return [
    enrichSubProgressLog(
      {
        id: 1,
        date: '2026-02-07 10:00',
        user: handler,
        content: `【${sub.title}】已登记首条进展`,
        progress: sub.progress ?? 0,
        updateType: 'routine',
      },
      sub,
    ),
  ]
}

export const subProgressLogs = (() => {
  const logs = {}
  Object.entries(_baseSubProgressLogs).forEach(([subId, entries]) => {
    const sub = mockIssues.flatMap((i) => i.subIssues || []).find((s) => s.id === subId)
    logs[subId] = entries.map((log) => enrichSubProgressLog(log, sub || { mainDept: '—' }))
  })
  mockIssues.forEach((issue) => {
    issue.subIssues?.forEach((sub) => {
      if (!logs[sub.id]?.length) {
        logs[sub.id] = defaultSubProgressLog(sub)
      }
    })
  })
  return logs
})()

// ===== 督办单数据 =====
export const supervisionOrders = [
  {
    id: 'DB2026020001',
    issueId: 'DY2026020011',
    issueTitle: '邯郸地区渠道合作伙伴激励政策调整',
    leader: '李总',
    targetDept: '市场经营部',
    createDate: '2026-02-05',
    deadline: '2026-02-20',
    reason: '该问题涉及代理商稳定性，需加快推进激励政策调整',
    status: 'in_progress',
    statusLabel: '督办中',
    flowNode: 'level1',
    flowNodeLabel: '一级办理（副主任审批中）',
    logs: [
      { date: '2026-02-06 16:45', user: '赵刚', content: '已收集反馈，正在汇总方案' },
      { date: '2026-02-05 10:00', user: '李总', content: '发起督办，要求2月20日前完成' },
    ],
  },
  {
    id: 'DB2026020002',
    issueId: 'DY2026020012',
    issueTitle: '承德基站电力保障问题',
    leader: '王总',
    targetDept: '网络运维部',
    createDate: '2026-02-03',
    deadline: '2026-02-15',
    reason: '基站供电问题影响范围大，涉及山区用户通信保障',
    status: 'in_progress',
    statusLabel: '督办中',
    flowNode: 'level2',
    flowNodeLabel: '二级办理（主管处理中）',
    logs: [
      { date: '2026-02-05 14:00', user: '刘洋', content: '已完成3个基站UPS改造' },
      { date: '2026-02-03 09:00', user: '王总', content: '发起督办，要求尽快解决供电问题' },
    ],
  },
  {
    id: 'DB2026020003',
    issueId: 'DY2026020001',
    issueTitle: '石家庄分公司5G网络覆盖优化方案',
    leader: '张总',
    targetDept: '信息技术部',
    createDate: '2026-02-11',
    deadline: '2026-02-18',
    reason: '跨部门协同推进偏慢，需信息技术部加快系统侧能力支撑',
    status: 'in_progress',
    statusLabel: '督办中',
    flowNode: 'level2',
    flowNodeLabel: '二级办理（主管处理中）',
    logs: [
      { date: '2026-02-11 10:00', user: '张总', content: '发起督办，要求一周内形成系统优化落地计划' },
      { date: '2026-02-11 15:30', user: '段磊', content: '已组织技术组评估网优需求并制定改造排期' },
    ],
  },
]

// ===== 调研批次数据 =====
export const surveyBatches = [
  {
    id: 'PC2026010001',
    name: '2026年1月张总石家庄调研',
    leader: '张总',
    startDate: '2026-01-15',
    endDate: '2026-01-16',
    location: '石家庄',
    issueCount: 3,
    completedCount: 1,
    issueIds: ['DY2026020001', 'DY2026020003', 'DY2026020007'],
  },
  {
    id: 'PC2026010002',
    name: '2026年1月李总保定/沧州调研',
    leader: '李总',
    startDate: '2026-01-18',
    endDate: '2026-01-20',
    location: '保定、沧州',
    issueCount: 4,
    completedCount: 2,
    issueIds: ['DY2026020002', 'DY2026020005', 'DY2026020008', 'DY2026020014'],
  },
  {
    id: 'PC2026010003',
    name: '2026年1月王总承德/秦皇岛调研',
    leader: '王总',
    startDate: '2026-01-22',
    endDate: '2026-01-24',
    location: '承德、秦皇岛',
    issueCount: 4,
    completedCount: 2,
    issueIds: ['DY2026020006', 'DY2026020009', 'DY2026020012', 'DY2026020017'],
  },
  {
    id: 'PC2026020001',
    name: '2026年2月张总唐山/邢台调研',
    leader: '张总',
    startDate: '2026-02-01',
    endDate: '2026-02-03',
    location: '唐山、邢台',
    issueCount: 3,
    completedCount: 1,
    issueIds: ['DY2026020010', 'DY2026020013', 'DY2026020016'],
  },
  {
    id: 'PC2026020002',
    name: '2026年1月张总张家口调研',
    leader: '张总',
    startDate: '2026-01-10',
    endDate: '2026-01-11',
    location: '张家口',
    issueCount: 1,
    completedCount: 1,
    issueIds: ['DY2026020018'],
  },
  {
    id: 'PC2026010004',
    name: '2026年1月李总邯郸调研',
    leader: '李总',
    startDate: '2026-01-25',
    endDate: '2026-01-26',
    location: '邯郸',
    issueCount: 2,
    completedCount: 1,
    issueIds: ['DY2026020004', 'DY2026020011'],
  },
]

// ===== 阶段总结数据（保留但不再在部门看板中显示） =====
export const stageSummaries = [
  {
    id: 1,
    title: '2026年一季度调研问题总结',
    period: '2026年一季度',
    department: '综合办公室',
    author: '陈同超',
    createDate: '2026-01-31',
    content: '本季度共开展调研活动15次，收集问题43个，已完成解决38个，完成率88.4%。主要集中在网络运维和客户服务领域。',
  },
  {
    id: 2,
    title: '张总2025年度调研问题回顾',
    period: '2025年全年',
    department: '战略发展部',
    author: '周波',
    createDate: '2026-01-15',
    content: '张总2025年度共调研12个地市，收集问题86个，其中战略规划类22个、经营业务类35个、技术类18个、其他11个。',
  },
]

// ===== 问题整理数据 =====
export const issueOrganizes = [
  {
    id: 'ZL2026040001',
    reporter: '段磊',
    department: '信息技术部',
    createDate: '2026-04-10',
    status: 'approved',
    statusLabel: '已通过',
    approver: '张主任',
    approveDate: '2026-04-11',
    issues: [
      { seq: 1, title: '系统登录异常', description: '部分用户反馈登录时出现500错误', result: '已排查为数据库连接池配置问题，已修复' },
      { seq: 2, title: '报表导出超时', description: '大数据量报表导出时超过30秒超时', result: '优化查询SQL，增加异步导出功能' },
      { seq: 3, title: '移动端页面适配', description: '手机端部分页面显示不完整', result: '待处理' },
    ],
  },
  {
    id: 'ZL2026040002',
    reporter: '王志成',
    department: '信息技术部',
    createDate: '2026-04-12',
    status: 'pending',
    statusLabel: '待审批',
    approver: '',
    approveDate: '',
    issues: [
      { seq: 1, title: '网络设备巡检异常', description: '3台核心交换机固件版本过低，存在安全隐患', result: '计划本月安排升级' },
      { seq: 2, title: '机房温控告警', description: 'B区机房温度偶发超标', result: '空调系统需要检修' },
    ],
  },
  {
    id: 'ZL2026040003',
    reporter: '赵刚',
    department: '市场经营部',
    createDate: '2026-04-08',
    status: 'approved',
    statusLabel: '已通过',
    approver: '李主任',
    approveDate: '2026-04-09',
    issues: [
      { seq: 1, title: '渠道激励方案落地', description: '新激励方案执行情况反馈', result: '各区县已开始执行，效果待评估' },
    ],
  },
]

// ===== 调研计划待办数据（每年1月1日系统自动为每个部门生成2条待办）=====
export const planTodos = [
  {
    id: 'TB2026010001',
    department: '信息技术部',
    title: '2026年上半年调研计划填报',
    type: 'first_half',
    status: 'pending',
    statusLabel: '待处理',
    createDate: '2026-01-01',
    content: '',
  },
  {
    id: 'TB2026010002',
    department: '信息技术部',
    title: '2026年下半年调研计划填报',
    type: 'second_half',
    status: 'pending',
    statusLabel: '待处理',
    createDate: '2026-01-01',
    content: '',
  },
  {
    id: 'TB2026010003',
    department: '网络运维部',
    title: '2026年上半年调研计划填报',
    type: 'first_half',
    status: 'completed',
    statusLabel: '已完成',
    createDate: '2026-01-01',
    content: '已完成上半年调研计划填报，计划调研石家庄、保定、唐山3个地市。',
    submitDate: '2026-01-15',
  },
  {
    id: 'TB2026010004',
    department: '网络运维部',
    title: '2026年下半年调研计划填报',
    type: 'second_half',
    status: 'pending',
    statusLabel: '待处理',
    createDate: '2026-01-01',
    content: '',
  },
  {
    id: 'TB2026010005',
    department: '市场经营部',
    title: '2026年上半年调研计划填报',
    type: 'first_half',
    status: 'completed',
    statusLabel: '已完成',
    createDate: '2026-01-01',
    content: '上半年计划调研邯郸、邢台、沧州3个地市，重点关注渠道建设和业务发展。',
    submitDate: '2026-01-10',
  },
  {
    id: 'TB2026010006',
    department: '市场经营部',
    title: '2026年下半年调研计划填报',
    type: 'second_half',
    status: 'pending',
    statusLabel: '待处理',
    createDate: '2026-01-01',
    content: '',
  },
  {
    id: 'TB2026010007',
    department: '客户服务部',
    title: '2026年上半年调研计划填报',
    type: 'first_half',
    status: 'pending',
    statusLabel: '待处理',
    createDate: '2026-01-01',
    content: '',
  },
  {
    id: 'TB2026010008',
    department: '客户服务部',
    title: '2026年下半年调研计划填报',
    type: 'second_half',
    status: 'pending',
    statusLabel: '待处理',
    createDate: '2026-01-01',
    content: '',
  },
]

// ===== 问题处理纠错反馈待办（处理人为发起人）=====
export const issueCorrectionTodos = [
  {
    id: 'CF2026020001',
    issueId: 'DY2026020011',
    issueTitle: '邯郸地区渠道合作伙伴激励政策调整',
    handler: '赵刚',
    status: 'pending',
    statusLabel: '待处理',
    currentStage: '发起人纠错处理',
    deadline: '2026-02-12',
    createDate: '2026-02-10',
    feedback: '一级办理阶段发现区县数据口径不一致，请发起人核对后反馈处理意见。',
  },
  {
    id: 'CF2026020002',
    issueId: 'DY2026020019',
    issueTitle: '衡水分公司政企专线 SLA 达标整改',
    handler: '韩雪',
    status: 'in_progress',
    statusLabel: '处理中',
    currentStage: '发起人纠错处理',
    deadline: '2026-02-14',
    createDate: '2026-02-11',
    feedback: '接单部门主任环节发现主办部门划分有误，请发起人确认纠正。',
  },
  {
    id: 'CF2026020003',
    issueId: 'DY2026020001',
    issueTitle: '石家庄分公司5G网络覆盖优化方案',
    handler: '段磊',
    status: 'pending',
    statusLabel: '待处理',
    currentStage: '发起人纠错处理',
    deadline: '2026-02-15',
    createDate: '2026-02-12',
    feedback: '二级办理环节反馈：协办部门责任边界需重新确认，请发起人纠偏后再流转。',
  },
]
