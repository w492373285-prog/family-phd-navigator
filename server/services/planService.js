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

const SCHOOL_DISCOVERY_SOURCES = {
  'Victoria University of Wellington': [
    ['Master of Public Policy people', 'https://www.wgtn.ac.nz/explore/postgraduate-programmes/master-of-public-policy/people?programme=master-of-public-policy'],
    ['Wellington Faculty profiles search', 'https://people.wgtn.ac.nz/'],
    ['School of Government', 'https://www.wgtn.ac.nz/sog']
  ],
  'Monash University': [
    ['Monash research profiles', 'https://research.monash.edu/'],
    ['Faculty of Education staff', 'https://www.monash.edu/education/about/our-people'],
    ['Faculty of Arts staff', 'https://www.monash.edu/arts/about/our-people']
  ],
  'University of British Columbia': [
    ['UBC research supervisors', 'https://www.grad.ubc.ca/prospective-students/research-supervisors'],
    ['UBC Faculty of Education people', 'https://educ.ubc.ca/faculty-staff/'],
    ['UBC graduate programs', 'https://www.grad.ubc.ca/prospective-students/graduate-degree-programs']
  ],
  'University of Toronto': [
    ['OISE Higher Education in Canada', 'https://www.oise.utoronto.ca/hec/about'],
    ['OISE faculty directory', 'https://www.oise.utoronto.ca/people'],
    ['University of Toronto graduate faculty search', 'https://www.sgs.utoronto.ca/faculty-staff/graduate-faculty-membership/']
  ],
  'The University of Hong Kong': [
    ['HKU Faculty of Education academics', 'https://web.edu.hku.hk/faculty-academics'],
    ['Technology-enhanced learning expertise', 'https://web.edu.hku.hk/research-expertise/technology-enhanced-learning'],
    ['HKU Graduate School', 'https://gradsch.hku.hk/']
  ],
  'University of Auckland': [
    ['Auckland staff profiles', 'https://profiles.auckland.ac.nz/'],
    ['Auckland doctoral study', 'https://www.auckland.ac.nz/en/study/study-options/find-a-study-option/doctor-of-philosophy-phd.html'],
    ['Auckland Faculty of Education and Social Work', 'https://www.auckland.ac.nz/en/education.html']
  ],
  'Nanyang Technological University': [
    ['NTU faculty directory', 'https://www.ntu.edu.sg/research/faculty-directory'],
    ['NTU graduate admissions', 'https://www.ntu.edu.sg/admissions/graduate'],
    ['National Institute of Education faculty', 'https://www.ntu.edu.sg/nie/about-us/people']
  ],
  'National University of Singapore': [
    ['NUS Graduate School', 'https://nusgs.nus.edu.sg/'],
    ['NUS faculty search', 'https://www.nus.edu.sg/search'],
    ['NUS Lee Kuan Yew School faculty', 'https://lkyspp.nus.edu.sg/our-people/faculty']
  ],
  'University College London': [
    ['UCL profiles search', 'https://profiles.ucl.ac.uk/'],
    ['UCL IOE people', 'https://www.ucl.ac.uk/ioe/about-ioe/departments-and-centres'],
    ['UCL graduate research degrees', 'https://www.ucl.ac.uk/prospective-students/graduate/research-degrees']
  ],
  'Technical University of Munich': [
    ['TUM professor profiles', 'https://www.professoren.tum.de/en/'],
    ['TUM jobs and vacancies', 'https://portal.mytum.de/jobs'],
    ['TUM doctoral candidates', 'https://www.tum.de/en/studies/doctoral-candidates']
  ],
  'University of Amsterdam': [
    ['UvA PhD vacancies', 'https://vacatures.uva.nl/UvA/search/?createNewAlert=false&q=phd'],
    ['UvA research profiles', 'https://www.uva.nl/en/research/researchers/researchers.html'],
    ['UvA PhD information', 'https://www.uva.nl/en/education/phd/phd.html']
  ],
  'Delft University of Technology': [
    ['TU Delft jobs', 'https://www.tudelft.nl/en/about-tu-delft/working-at-tu-delft/search-jobs'],
    ['TU Delft research profiles', 'https://www.tudelft.nl/en/research/researchers'],
    ['TU Delft PhD information', 'https://www.tudelft.nl/en/education/programmes/phd']
  ],
  'University of Tokyo': [
    ['UTokyo graduate programs', 'https://www.u-tokyo.ac.jp/en/prospective-students/graduate_course.html'],
    ['UTokyo researchers', 'https://www.u-tokyo.ac.jp/focus/en/people/'],
    ['UTokyo scholarships', 'https://www.u-tokyo.ac.jp/en/prospective-students/scholarships.html']
  ],
  'Kyoto University': [
    ['Kyoto graduate schools', 'https://www.kyoto-u.ac.jp/en/education-campus/education-and-admissions/graduate-degree-programs'],
    ['Kyoto activity database', 'https://kdb.iimc.kyoto-u.ac.jp/'],
    ['Kyoto scholarships', 'https://www.kyoto-u.ac.jp/en/education-campus/tuition/scholarships']
  ]
};

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

function normalizeText(value = '') {
  return String(value).toLowerCase().replace(/[，。；、/|]+/g, ' ');
}

function mentorPriorityScore(priority) {
  if (priority === '高') return 8;
  if (priority === '中') return 4;
  if (priority === '暂缓') return -8;
  return 2;
}

function buildMatchQuery(form) {
  const raw = [
    form.applicant?.targetMajor,
    form.applicant?.researchDirection
  ].filter(Boolean).join(' ');

  const normalized = normalizeText(raw);
  const aliases = [
    ['教育', ['education', 'learning', 'teaching', 'teacher', 'pedagogy', 'curriculum', 'school', 'higher education', 'doctoral education']],
    ['教育技术', ['educational technology', 'technology-enhanced learning', 'digital learning', 'ai in education', 'learning sciences']],
    ['人工智能', ['ai', 'artificial intelligence', 'machine learning', 'reliable ai', 'explainable machine learning']],
    ['计算机', ['computer science', 'data science', 'database', 'algorithms', 'complexity', 'data engineering']],
    ['数据', ['data science', 'database', 'data engineering', 'analytics']],
    ['心理', ['psychology', 'educational psychology', 'child development', 'motivation']],
    ['管理', ['management', 'governance', 'leadership', 'policy']],
    ['政策', ['policy', 'governance', 'public policy', 'higher education policy']],
    ['语言', ['language', 'bilingualism', 'multilingualism', 'literacy']],
    ['数学', ['mathematics education', 'math education']],
    ['科学', ['science education', 'stem']]
  ];

  const terms = new Set(normalized.split(/\s+/).filter(item => item.length >= 2));
  aliases.forEach(([key, values]) => {
    if (normalized.includes(key) || values.some(value => normalized.includes(value))) {
      terms.add(key);
      values.forEach(value => terms.add(value));
    }
  });

  return { raw, terms: Array.from(terms) };
}

function scoreSchool(school, form, topCountryNames = []) {
  const { raw, terms } = buildMatchQuery(form);
  const haystack = normalizeText([
    school.name,
    school.country,
    school.discipline
  ].filter(Boolean).join(' '));
  const countryBoost = topCountryNames.includes(school.country) ? 8 : 0;

  if (!raw.trim()) {
    return {
      ...school,
      matchScore: 20 + countryBoost,
      matchReasons: ['尚未填写目标专业或研究方向，先按国家推荐和学校综合范围展示。']
    };
  }

  const matched = terms.filter(term => haystack.includes(normalizeText(term)));
  const uniqueMatched = Array.from(new Set(matched));
  const directMajorHit = normalizeText(form.applicant?.targetMajor || '').split(/\s+/).some(term => term.length >= 2 && haystack.includes(term));
  const directDirectionHit = normalizeText(form.applicant?.researchDirection || '').split(/\s+/).some(term => term.length >= 2 && haystack.includes(term));
  const baseScore = 8;
  const matchScore = baseScore + uniqueMatched.length * 8 + countryBoost + (directMajorHit ? 8 : 0) + (directDirectionHit ? 8 : 0);

  const reasons = [];
  if (uniqueMatched.length) reasons.push(`匹配方向：${uniqueMatched.slice(0, 5).join('、')}`);
  if (directMajorHit) reasons.push('目标专业直接匹配');
  if (directDirectionHit) reasons.push('研究方向直接匹配');
  if (countryBoost) reasons.push('所在国家进入家庭推荐TOP3');
  if (!reasons.length) reasons.push('方向相关性较弱，作为扩展备选学校。');

  return { ...school, matchScore, matchReasons: reasons };
}

function scoreMentor(mentor, form, topCountryNames = []) {
  const { raw, terms } = buildMatchQuery(form);
  const haystack = normalizeText([
    mentor.name,
    mentor.school,
    mentor.research_area,
    mentor.keywords,
    mentor.fit_notes
  ].filter(Boolean).join(' '));

  const countryBoost = topCountryNames.includes(mentor.country) ? 6 : 0;

  if (!raw.trim()) {
    return {
      ...mentor,
      matchScore: mentorPriorityScore(mentor.priority) + countryBoost,
      matchReasons: ['尚未填写目标专业或研究方向，先按国家和导师优先级展示。']
    };
  }

  const matched = terms.filter(term => haystack.includes(normalizeText(term)));
  const uniqueMatched = Array.from(new Set(matched));
  const directMajorHit = normalizeText(form.applicant?.targetMajor || '').split(/\s+/).some(term => term.length >= 2 && haystack.includes(term));
  const directDirectionHit = normalizeText(form.applicant?.researchDirection || '').split(/\s+/).some(term => term.length >= 2 && haystack.includes(term));
  const matchScore = uniqueMatched.length * 10 + mentorPriorityScore(mentor.priority) + countryBoost + (directMajorHit ? 8 : 0) + (directDirectionHit ? 10 : 0);

  const reasons = [];
  if (uniqueMatched.length) reasons.push(`匹配关键词：${uniqueMatched.slice(0, 5).join('、')}`);
  if (directMajorHit) reasons.push('目标专业直接匹配');
  if (directDirectionHit) reasons.push('研究方向直接匹配');
  if (countryBoost) reasons.push('所在国家进入家庭推荐TOP3');
  if (!reasons.length) reasons.push('与当前目标方向相关性较弱，仅作为同国家备选线索。');

  return {
    ...mentor,
    matchScore,
    matchReasons: reasons
  };
}

function createSchoolMentorLead(school) {
  const sources = SCHOOL_DISCOVERY_SOURCES[school.name] || [
    ['博士项目页面', school.phd_url],
    ['奖学金/研究生页面', school.scholarship_url]
  ];

  return sources.filter(([, url]) => Boolean(url)).slice(0, 3).map(([sourceName, url], index) => ({
    id: `school-lead-${school.id}-${index}`,
    country: school.country,
    school: school.name,
    name: `${sourceName} - 自动整理入口`,
    research_area: school.discipline,
    email: '',
    profile_url: url,
    priority: index === 0 ? '高' : '检索',
    keywords: school.discipline,
    fit_notes: `系统已为${school.name}整理该官方入口，用来继续定位具体导师、学院人员、博士职位或研究组。`,
    contact_strategy: `打开该入口后，用“${school.discipline.split('/').slice(0, 3).map(item => item.trim()).join(' / ')}”以及你的研究方向关键词检索；优先记录姓名、邮箱、近3年论文、是否写明PhD supervision或open positions。`,
    matchScore: Math.max(12, Number(school.matchScore || 0) - index * 2),
    matchReasons: ['自动整理的官方导师/课题组来源', ...(school.matchReasons || []).slice(0, 2)]
  }));
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
  const scoredMentors = db.prepare('SELECT * FROM mentors').all()
    .map(mentor => scoreMentor(mentor, form, topNames))
    .sort((a, b) => b.matchScore - a.matchScore || mentorPriorityScore(b.priority) - mentorPriorityScore(a.priority) || a.country.localeCompare(b.country));

  const schools = db.prepare('SELECT * FROM schools').all()
    .map(school => scoreSchool(school, form, topNames))
    .sort((a, b) => b.matchScore - a.matchScore || a.country.localeCompare(b.country) || a.name.localeCompare(b.name))
    .slice(0, 25)
    .map(school => {
      const mentorCandidates = scoredMentors
        .filter(mentor => mentor.school === school.name)
        .slice(0, 5);

      return {
        ...school,
        mentorCandidates: mentorCandidates.length ? mentorCandidates : createSchoolMentorLead(school)
      };
    });
  const mentors = schools.flatMap(school => school.mentorCandidates)
    .sort((a, b) => Number(b.matchScore || 0) - Number(a.matchScore || 0))
    .slice(0, 40);
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
