import { db } from '../db/database.js';

const SCORE_FIELDS = [
  ['博士申请可行性', 'score_phd_feasibility', 20],
  ['博士奖学金机会', 'score_scholarship', 15],
  ['配偶工作权限', 'score_spouse_work', 20],
  ['子女教育友好度', 'score_child_education', 15],
  ['生活成本', 'score_living_cost', 10],
  ['移民机会', 'score_immigration', 15],
  ['安全与适应度', 'score_safety', 5]
];

function rowTotal(row) {
  return SCORE_FIELDS.reduce((sum, [, key]) => sum + Number(row[key] || 0), 0);
}

function preferenceAdjustment(row, form) {
  let adjustment = 0;
  const reasons = [];

  if (form.spouse?.workUrgency === 'high') {
    adjustment += row.score_spouse_work >= 16 ? 5 : -5;
    reasons.push(row.score_spouse_work >= 16 ? '配偶工作权限匹配度高' : '配偶工作权限存在不确定性');
  }

  if (form.child?.schoolPriority === 'public') {
    adjustment += row.score_child_education >= 12 ? 4 : -4;
    reasons.push(row.score_child_education >= 12 ? '子女公立教育路径较友好' : '子女入读公立学校需额外核验');
  }

  if (form.family?.annualBudget) {
    const budget = db.prepare('SELECT * FROM budgets WHERE country = ?').get(row.name);
    const total = budget ? budget.tuition + budget.rent + budget.living + budget.insurance + budget.child_school + budget.visa : 0;
    if (total && total <= Number(form.family.annualBudget)) {
      adjustment += 4;
      reasons.push('一年预算基本可覆盖');
    } else if (total) {
      adjustment -= 4;
      reasons.push('预算压力偏高');
    }
  }

  if (form.applicant?.hasPublication === 'yes') {
    adjustment += row.score_phd_feasibility >= 15 ? 3 : 0;
  }

  return { adjustment, reasons };
}

function shortfalls(form) {
  const result = [];
  if (!form.applicant?.englishScore) result.push('英语成绩尚未明确，需要先锁定目标考试和最低小分。');
  if (!form.applicant?.researchDirection) result.push('研究方向还不够具体，会影响导师筛选和套磁回复率。');
  if (form.applicant?.hasPublication !== 'yes') result.push('论文或研究产出不足，建议用研究计划、项目经历和推荐信补强。');
  if (!form.applicant?.targetMajor) result.push('目标专业未明确，学校和导师筛选会过宽。');
  return result.length ? result : ['背景基础可进入导师筛选，重点提升研究匹配度和申请材料质量。'];
}

function monthlyPlan() {
  return [
    '第1月：确定主攻国家TOP3，整理家庭证件和申请人学术材料。',
    '第2月：确定目标专业关键词，建立20所学校和30名导师长名单。',
    '第3月：完成英语考试报名和第一版Research Proposal。',
    '第4月：套磁第一批导师，按回复调整研究方向和学校层级。',
    '第5月：准备推荐信、成绩单、学历认证和CV终稿。',
    '第6月：递交第一批学校和奖学金申请。',
    '第7月：继续递交滚动项目，准备面试问题和研究展示。',
    '第8月：跟进offer和奖学金，预审签证资金与家庭关系材料。',
    '第9月：确定最终去向，启动全家签证材料、体检和保险。',
    '第10月：递交签证，联系住宿和孩子学校。',
    '第11月：处理行前事项，安排机票、银行卡、疫苗和入学文件。',
    '第12月：落地后办理住址、医保、税号、孩子入学和配偶求职。'
  ];
}

export function generatePlan(form) {
  const countries = db.prepare('SELECT * FROM countries').all();
  const ranked = countries.map(row => {
    const baseScore = rowTotal(row);
    const { adjustment, reasons } = preferenceAdjustment(row, form);
    const totalScore = Math.max(0, Math.min(100, baseScore + adjustment));
    return {
      ...row,
      totalScore,
      baseScore,
      adjustment,
      fitReasons: reasons,
      scoreBreakdown: SCORE_FIELDS.map(([label, key, max]) => ({ label, score: row[key], max }))
    };
  }).sort((a, b) => b.totalScore - a.totalScore);

  const topCountries = ranked.slice(0, 3);
  const notRecommended = ranked.slice(-3).reverse().map(country => ({
    name: country.name,
    score: country.totalScore,
    reason: [country.risks, ...(country.fitReasons.filter(item => item.includes('不确定') || item.includes('压力') || item.includes('核验')))].filter(Boolean).join('；')
  }));

  const topNames = topCountries.map(country => country.name);
  const schools = db.prepare(`SELECT * FROM schools WHERE country IN (${topNames.map(() => '?').join(',')})`).all(...topNames);
  const mentors = db.prepare('SELECT * FROM mentors').all();
  const budgets = db.prepare(`SELECT * FROM budgets WHERE country IN (${topNames.map(() => '?').join(',')})`).all(...topNames);
  const stages = db.prepare('SELECT * FROM stages ORDER BY stage_order').all();
  const materials = db.prepare('SELECT * FROM materials ORDER BY id').all();

  const budgetSummaries = budgets.map(item => ({
    ...item,
    total: item.tuition + item.rent + item.living + item.insurance + item.child_school + item.visa
  }));

  return {
    form,
    generatedAt: new Date().toISOString(),
    rankedCountries: ranked,
    topCountries,
    notRecommended,
    schools,
    mentors,
    stages,
    materials,
    budgets: budgetSummaries,
    report: {
      recommendedPath: `建议以${topCountries.map(item => item.name).join('、')}作为主攻组合：先用家庭政策和预算筛掉高风险国家，再用导师匹配度决定最终申请。`,
      applicantShortfalls: shortfalls(form),
      spouseAdvice: form.spouse?.workUrgency === 'high'
        ? '配偶需要优先选择工作权限明确的国家，递签前逐条核验家属工签政策，并同步准备英文简历和目标行业岗位清单。'
        : '配偶可先以合法陪读和适应为主，落地后根据签证权限逐步寻找兼职或全职机会。',
      childAdvice: '孩子9岁处于小学阶段，建议提前准备出生证明、疫苗记录、近两年成绩单和英文/当地语言衔接计划，优先确认公立学校资格与住址要求。',
      monthlyPlan: monthlyPlan(),
      riskWarnings: [
        '签证和家属工作政策变化快，最终决策必须以官方政策页和学校国际办公室确认为准。',
        '博士奖学金不是自动获得，预算需准备无奖学金或奖学金延迟到账的缓冲。',
        '导师匹配度比国家平均分更关键，进入申请阶段后应以导师和经费为核心。'
      ]
    }
  };
}
