import { issueCategories, departments } from '../mock/data'

let keyCounter = 1

export function createEmptyIssueRow() {
  return {
    __key: keyCounter++,
    resolved: false,
    category: '',
    content: '',
    mainDept: '',
    otherDepts: [],
    expectedDate: '',
    resolvedRemark: '',
    remark: '',
  }
}

export function createEmptySurveyForm() {
  return {
    startDate: '',
    endDate: '',
    location: [],
    leader: '',
    batchTitle: '',
    issues: [createEmptyIssueRow()],
  }
}

function deptValueFromLabel(label) {
  if (!label) return ''
  return departments.find(d => d.label === label)?.value || label
}

function findLocationPath(options, targetLabel, path = []) {
  for (const node of options) {
    const nextPath = [...path, node.value]
    if (node.label === targetLabel) return nextPath
    if (node.children?.length) {
      const found = findLocationPath(node.children, targetLabel, nextPath)
      if (found.length) return found
    }
  }
  return []
}

function locationLabelsFromPath(options, path) {
  const labels = []
  let nodes = options
  for (const value of path) {
    const node = nodes.find(n => n.value === value)
    if (!node) break
    labels.push(node.label)
    nodes = node.children || []
  }
  return labels
}

function buildIssueRowFromSub(sub, issue, primaryDept) {
  return {
    __key: keyCounter++,
    resolved: false,
    category: issue.category || '',
    content: sub.title || '',
    mainDept: deptValueFromLabel(sub.mainDept || issue.department),
    otherDepts: (sub.assistDepts || []).map(deptValueFromLabel).filter(Boolean),
    expectedDate: sub.deadline || issue.deadline || '',
    resolvedRemark: '',
    remark: issue.remark || '',
  }
}

export function issueToSurveyForm(issue, locationOptions) {
  const locationPath = findLocationPath(locationOptions, issue.surveyLocation)
  const primaryDept = deptValueFromLabel(issue.department)

  let issues
  if (issue.issueType === 'daily') {
    const sub = issue.subIssues?.[0]
    issues = sub
      ? [buildIssueRowFromSub(sub, issue, primaryDept)]
      : [{
          __key: keyCounter++,
          resolved: false,
          category: '',
          content: issue.description || issue.title || '',
          mainDept: primaryDept,
          otherDepts: [],
          expectedDate: issue.deadline || issue.expectedComplete || '',
          resolvedRemark: '',
          remark: issue.remark || '',
        }]
  } else if (issue.subIssues?.length) {
    issues = issue.subIssues.map(sub => buildIssueRowFromSub(sub, issue, primaryDept))
  } else {
    issues = [{
      __key: keyCounter++,
      resolved: !!issue.resolved,
      category: issue.category || '',
      content: issue.description || issue.title || '',
      mainDept: primaryDept,
      otherDepts: [],
      expectedDate: issue.deadline || issue.expectedComplete || '',
      resolvedRemark: issue.replyContent || '',
    }]
  }

  return {
    startDate: issue.surveyDate || '',
    endDate: issue.surveyDate || issue.expectedComplete || '',
    location: locationPath,
    leader: issue.leader || '',
    batchTitle: issue.batchTitle || '',
    issues,
  }
}

export function surveyFormToIssuePatch(form, locationOptions, existingIssue = null, issueType = 'survey') {
  const locationLabels = locationLabelsFromPath(locationOptions, form.location)
  const surveyLocation = locationLabels.length
    ? locationLabels[locationLabels.length - 1]
    : (existingIssue?.surveyLocation || '')
  const issueRows = issueType === 'daily' ? form.issues.slice(0, 1) : form.issues
  const primary = issueRows.find(i => !i.resolved) || issueRows[0]
  const category = issueType === 'daily' ? (existingIssue?.category || '') : (primary?.category || existingIssue?.category || '')
  const categoryLabel = issueType === 'daily'
    ? (existingIssue?.categoryLabel || '')
    : (issueCategories.find(c => c.value === category)?.label || existingIssue?.categoryLabel || '')
  const mainDeptLabel = departments.find(d => d.value === primary?.mainDept)?.label || existingIssue?.department || ''

  const subIssues = issueRows
    .filter(i => (issueType === 'daily' ? i.content?.trim() : !i.resolved && i.content?.trim()))
    .map((item, idx) => ({
      id: existingIssue?.subIssues?.[idx]?.id || `${existingIssue?.id || 'DRAFT'}-S${idx + 1}`,
      title: item.content,
      progress: existingIssue?.subIssues?.[idx]?.progress ?? 0,
      status: 'draft',
      statusLabel: '草稿',
      handler: existingIssue?.subIssues?.[idx]?.handler || '',
      deadline: item.expectedDate || form.endDate || '',
      mainDept: departments.find(d => d.value === item.mainDept)?.label || mainDeptLabel,
      assistDepts: item.otherDepts.map(v => departments.find(d => d.value === v)?.label || v),
      collaborators: existingIssue?.subIssues?.[idx]?.collaborators || [],
    }))

  const defaultTitle = issueType === 'daily'
    ? (primary?.content || existingIssue?.title || '未命名日常问题')
    : (form.batchTitle || primary?.content || existingIssue?.title || '未命名问题')

  return {
    issueType: issueType || existingIssue?.issueType || 'survey',
    title: defaultTitle,
    batchTitle: issueType === 'daily' ? '' : form.batchTitle,
    surveyDate: form.startDate,
    expectedComplete: form.endDate || primary?.expectedDate || '',
    deadline: primary?.expectedDate || form.endDate || existingIssue?.deadline || '',
    surveyLocation,
    leader: form.leader,
    category,
    categoryLabel,
    department: mainDeptLabel || existingIssue?.department || '',
    description: primary?.content || existingIssue?.description || '',
    remark: issueType === 'daily' ? (primary?.remark || existingIssue?.remark || '') : (existingIssue?.remark || ''),
    resolved: issueType === 'daily' ? false : form.issues.every(i => i.resolved),
    replyContent: form.issues.find(i => i.resolved)?.resolvedRemark || existingIssue?.replyContent || '',
    subIssues,
    updateDate: new Date().toISOString().split('T')[0],
  }
}

export function validateSurveyForm(form, issueType = 'survey') {
  if (issueType === 'daily') {
    if (form.issues.length !== 1) return '日常问题每次仅可填报一条'
    const item = form.issues[0]
    if (!item.content?.trim() || !item.mainDept || !item.expectedDate) {
      return '请填写完整信息（问题内容、主要答复部门、期望答复时间）'
    }
    return ''
  }

  if (!form.batchTitle?.trim()) return '请填写调研批次标题'
  if (!form.startDate) return '请选择调研开始时间'
  if (!form.endDate) return '请选择调研结束时间'
  if (!form.location?.length) return '请选择调研地点'
  if (!form.leader) return '请选择调研领导/部门'

  const resolvedIssues = form.issues.filter(i => i.resolved)
  const unresolvedIssues = form.issues.filter(i => !i.resolved)

  for (const item of resolvedIssues) {
    if (!item.content?.trim()) return '已解决的问题请填写问题内容'
    if (!item.resolvedRemark?.trim()) return '已解决的问题请填写解决说明'
  }

  for (const item of unresolvedIssues) {
    if (!item.category || !item.content?.trim() || !item.mainDept || !item.expectedDate) {
      return '未解决的问题请填写完整信息（分类、内容、主要答复部门、期望答复时间）'
    }
  }

  if (!form.issues.length) return '请至少添加一条问题'
  return ''
}
