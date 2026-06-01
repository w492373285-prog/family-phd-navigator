<template>
  <main class="app-shell">
    <section v-if="activeTab === 'home'" class="screen home-screen">
      <div class="hero">
        <p class="eyebrow">Family PhD Navigator</p>
        <h1>一家三口出国读博全流程规划筛选器</h1>
        <p>把国家、博士申请、配偶工作、孩子入学、签证材料、预算和12个月行动计划放进同一张导航地图。</p>
        <button class="primary-btn" @click="activeTab = 'form'">
          <ClipboardList :size="18" />
          开始填写家庭情况
        </button>
      </div>

      <div class="quick-grid">
        <article v-for="item in homeCards" :key="item.title" class="quick-card">
          <component :is="item.icon" :size="22" />
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </section>

    <section v-if="activeTab === 'form'" class="screen">
      <PageHeader title="信息填写" subtitle="四步完成家庭画像，系统会按100分维度生成国家推荐。" />
      <div class="stepper">
        <button v-for="(step, index) in steps" :key="step" :class="{ active: formStep === index }" @click="formStep = index">{{ index + 1 }}</button>
      </div>

      <form class="form-card" @submit.prevent="submitPlan">
        <div v-if="formStep === 0" class="form-section">
          <h2>家庭信息</h2>
          <label>当前城市<input v-model="form.family.city" placeholder="例如：上海" /></label>
          <label>家庭年度预算（人民币）<input v-model.number="form.family.annualBudget" type="number" placeholder="例如：450000" /></label>
          <label>目标出发月份<input v-model="form.family.departureMonth" type="month" /></label>
          <label>偏好地区<select v-model="form.family.regionPreference"><option>不限</option><option>英语国家优先</option><option>欧洲优先</option><option>亚洲优先</option></select></label>
        </div>

        <div v-if="formStep === 1" class="form-section">
          <h2>博士申请人背景</h2>
          <label>目标专业<input v-model="form.applicant.targetMajor" placeholder="例如：教育学 / 计算机 / 管理学" /></label>
          <label>研究方向<input v-model="form.applicant.researchDirection" placeholder="一句话描述研究兴趣" /></label>
          <label>最高学历<select v-model="form.applicant.degree"><option>硕士</option><option>本科</option><option>MBA/专业硕士</option></select></label>
          <label>英语成绩<input v-model="form.applicant.englishScore" placeholder="例如：IELTS 6.5，或暂无" /></label>
          <label>是否有论文/研究产出<select v-model="form.applicant.hasPublication"><option value="no">暂无</option><option value="yes">有</option><option value="in-progress">准备中</option></select></label>
        </div>

        <div v-if="formStep === 2" class="form-section">
          <h2>配偶工作需求</h2>
          <label>工作紧迫度<select v-model="form.spouse.workUrgency"><option value="high">必须尽快合法工作</option><option value="medium">希望能工作</option><option value="low">短期可不工作</option></select></label>
          <label>行业方向<input v-model="form.spouse.industry" placeholder="例如：互联网、运营、教育、餐饮" /></label>
          <label>英语能力<select v-model="form.spouse.englishLevel"><option>基础</option><option>可工作沟通</option><option>流利</option></select></label>
          <label>是否接受转行<select v-model="form.spouse.openToSwitch"><option>可以</option><option>视情况</option><option>不希望</option></select></label>
        </div>

        <div v-if="formStep === 3" class="form-section">
          <h2>孩子教育需求</h2>
          <label>孩子年龄<input v-model.number="form.child.age" type="number" /></label>
          <label>学校偏好<select v-model="form.child.schoolPriority"><option value="public">优先公立学校</option><option value="international">可考虑国际学校</option><option value="flexible">灵活</option></select></label>
          <label>英语基础<select v-model="form.child.englishLevel"><option>零基础</option><option>基础</option><option>可简单交流</option></select></label>
          <label>特殊关注<input v-model="form.child.concerns" placeholder="例如：适应、语言、学区、安全" /></label>
        </div>

        <div class="form-actions">
          <button type="button" class="ghost-btn" :disabled="formStep === 0" @click="formStep--"><ChevronLeft :size="18" />上一步</button>
          <button v-if="formStep < 3" type="button" class="primary-btn" @click="formStep++">下一步<ChevronRight :size="18" /></button>
          <button v-else type="submit" class="primary-btn" :disabled="loading"><Sparkles :size="18" />{{ loading ? '生成中' : '生成规划报告' }}</button>
        </div>
      </form>
    </section>

    <section v-if="activeTab === 'results'" class="screen">
      <PageHeader title="国家筛选结果" subtitle="按博士、奖学金、配偶工作、孩子教育、成本、移民和安全综合评分。" />
      <EmptyState v-if="!plan" @go="activeTab = 'form'" />
      <template v-else>
        <article v-for="country in plan.topCountries" :key="country.id" class="country-card">
          <div class="country-head">
            <div>
              <span class="tag">推荐</span>
              <h2>{{ country.name }}</h2>
            </div>
            <strong>{{ country.totalScore }}</strong>
          </div>
          <div class="score-bars">
            <div v-for="score in country.scoreBreakdown" :key="score.label">
              <span>{{ score.label }}</span>
              <meter :max="score.max" :value="score.score"></meter>
              <b>{{ score.score }}/{{ score.max }}</b>
            </div>
          </div>
          <p>{{ country.risks }}</p>
          <small>官方链接：{{ country.official_links }}</small>
        </article>

        <section class="panel">
          <h2>不推荐国家及原因</h2>
          <div v-for="item in plan.notRecommended" :key="item.name" class="list-row">
            <span>{{ item.name }}</span>
            <p>{{ item.reason }}</p>
          </div>
        </section>
      </template>
    </section>

    <section v-if="activeTab === 'schools'" class="screen">
      <PageHeader title="推荐学校 / 导师" subtitle="按国家TOP3筛出可优先研究的学校和导师候选，套磁前务必打开官方主页核验是否仍接收博士。" />
      <EmptyState v-if="!plan" @go="activeTab = 'form'" />
      <template v-else>
        <section class="panel">
          <h2>导师筛选原则</h2>
          <p>优先看研究方向匹配、是否有博士项目或课题组、近3年论文、经费/奖学金可能性，再决定是否套磁。</p>
        </section>
        <div class="section-title">
          <h2>推荐学校排序</h2>
          <span>{{ plan.schools.length }} 所</span>
        </div>
        <article v-for="(school, index) in plan.schools" :key="school.id" class="school-card">
          <div class="school-head">
            <div>
              <span class="tag">学校 {{ index + 1 }}</span>
              <h2>{{ school.name }}</h2>
            </div>
            <strong>{{ school.matchScore || 0 }}</strong>
          </div>
          <p>{{ school.country }} · {{ school.discipline }}</p>
          <div class="match-line">
            <small>{{ (school.matchReasons || []).join('；') }}</small>
          </div>
          <a :href="school.phd_url" target="_blank">博士项目页面</a>
          <a :href="school.scholarship_url" target="_blank">奖学金页面</a>
        </article>
        <div class="section-title">
          <h2>推荐导师候选</h2>
          <span>{{ plan.mentors.length }} 位/条线索</span>
        </div>
        <section v-if="plan.mentors.length === 0" class="panel">
          <h2>暂无高相关导师</h2>
          <p>当前TOP3国家里没有和你填写方向明显匹配的导师候选。建议先扩大国家范围，或在后台补充该专业的学校与导师数据。</p>
        </section>
        <article v-for="mentor in plan.mentors" :key="mentor.id" class="mentor-card">
          <div class="mentor-head">
            <UserRound :size="20" />
            <div>
              <strong>{{ mentor.name }}</strong>
              <p>{{ mentor.country }} · {{ mentor.school }}</p>
            </div>
            <span :class="['priority-pill', mentor.priority === '高' ? 'high' : mentor.priority === '暂缓' ? 'pause' : '']">{{ mentor.matchScore || 0 }}分</span>
          </div>
          <div class="match-line">
            <span :class="['priority-pill', mentor.priority === '高' ? 'high' : mentor.priority === '暂缓' ? 'pause' : '']">{{ mentor.priority || '候选' }}</span>
            <small>{{ (mentor.matchReasons || []).join('；') }}</small>
          </div>
          <p><b>研究方向：</b>{{ mentor.research_area }}</p>
          <p><b>匹配关键词：</b>{{ mentor.keywords || '按申请人研究方向继续核验' }}</p>
          <p><b>推荐理由：</b>{{ mentor.fit_notes }}</p>
          <p><b>套磁建议：</b>{{ mentor.contact_strategy || '先读论文和导师主页，再发送CV与1页研究计划摘要。' }}</p>
          <a v-if="mentor.profile_url" :href="mentor.profile_url" target="_blank">官方主页 / 检索页</a>
          <a v-if="mentor.email" :href="`mailto:${mentor.email}`">发送邮件</a>
        </article>
      </template>
    </section>

    <section v-if="activeTab === 'roadmap'" class="screen">
      <PageHeader title="全流程路线图" subtitle="8个阶段，每一步都有任务、材料、完成标准、风险和下一步。" />
      <EmptyState v-if="!plan" @go="activeTab = 'form'" />
      <div v-else class="timeline">
        <article v-for="stage in plan.stages" :key="stage.id" class="timeline-item">
          <span>{{ stage.stage_order }}</span>
          <div>
            <h2>{{ stage.title }}</h2>
            <p><b>当前任务：</b>{{ stage.task }}</p>
            <p><b>准备材料：</b>{{ stage.materials }}</p>
            <p><b>完成标准：</b>{{ stage.completion }}</p>
            <p><b>风险提醒：</b>{{ stage.risks }}</p>
            <p><b>下一步：</b>{{ stage.next_step }}</p>
          </div>
        </article>
      </div>
    </section>

    <section v-if="activeTab === 'checklist'" class="screen">
      <PageHeader title="材料清单" subtitle="全家证件、申请材料、签证材料和孩子入学材料统一核对。" />
      <EmptyState v-if="!plan" @go="activeTab = 'form'" />
      <div v-else class="checklist">
        <label v-for="material in plan.materials" :key="material.id" class="check-row">
          <input type="checkbox" />
          <div>
            <strong>{{ material.name }}</strong>
            <p>{{ material.owner }} · {{ material.notes }}</p>
          </div>
        </label>
      </div>
    </section>

    <section v-if="activeTab === 'budget'" class="screen">
      <PageHeader title="预算测算" subtitle="按一年家庭现金流估算，单位为人民币，可在后台维护。" />
      <EmptyState v-if="!plan" @go="activeTab = 'form'" />
      <article v-for="budget in plan?.budgets || []" :key="budget.id" class="budget-card">
        <div class="country-head">
          <h2>{{ budget.country }}</h2>
          <strong>¥{{ budget.total.toLocaleString() }}</strong>
        </div>
        <div class="budget-grid">
          <span>学费 ¥{{ budget.tuition.toLocaleString() }}</span>
          <span>房租 ¥{{ budget.rent.toLocaleString() }}</span>
          <span>生活 ¥{{ budget.living.toLocaleString() }}</span>
          <span>保险 ¥{{ budget.insurance.toLocaleString() }}</span>
          <span>孩子教育 ¥{{ budget.child_school.toLocaleString() }}</span>
          <span>签证 ¥{{ budget.visa.toLocaleString() }}</span>
        </div>
        <p>{{ budget.note }}</p>
      </article>
    </section>

    <section v-if="activeTab === 'report'" class="screen">
      <PageHeader title="最终行动报告" subtitle="《一家三口出国读博规划报告》" />
      <EmptyState v-if="!plan" @go="activeTab = 'form'" />
      <template v-else>
        <div class="report-toolbar">
          <button class="primary-btn" @click="downloadPdf"><Download :size="18" />导出PDF</button>
        </div>
        <ReportView :plan="plan" />
      </template>
    </section>

    <section v-if="activeTab === 'admin'" class="screen">
      <PageHeader title="后台管理" subtitle="手动维护国家政策、学校、导师、预算、材料、流程和更新时间。" />
      <AdminPanel />
    </section>

    <nav class="bottom-nav">
      <button v-for="tab in tabs" :key="tab.key" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
        <component :is="tab.icon" :size="18" />
        <span>{{ tab.label }}</span>
      </button>
    </nav>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue';
import { BookOpen, BriefcaseBusiness, ChevronLeft, ChevronRight, ClipboardList, Download, FileText, Flag, GraduationCap, Home, LayoutDashboard, Map, School, Sparkles, UserRound, WalletCards } from 'lucide-vue-next';
import { api } from './services/api';
import PageHeader from './components/PageHeader.vue';
import EmptyState from './components/EmptyState.vue';
import AdminPanel from './pages/AdminPanel.vue';
import ReportView from './pages/ReportView.vue';

const activeTab = ref('home');
const formStep = ref(0);
const loading = ref(false);
const plan = ref(null);

const form = ref({
  family: { city: '', annualBudget: 450000, departureMonth: '', regionPreference: '不限' },
  applicant: { targetMajor: '', researchDirection: '', degree: '硕士', englishScore: '', hasPublication: 'no' },
  spouse: { workUrgency: 'high', industry: '', englishLevel: '可工作沟通', openToSwitch: '视情况' },
  child: { age: 9, schoolPriority: 'public', englishLevel: '基础', concerns: '' }
});

const steps = ['家庭', '申请人', '配偶', '孩子'];
const tabs = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'form', label: '填写', icon: ClipboardList },
  { key: 'results', label: '国家', icon: Flag },
  { key: 'schools', label: '导师', icon: School },
  { key: 'roadmap', label: '路线', icon: Map },
  { key: 'checklist', label: '材料', icon: FileText },
  { key: 'budget', label: '预算', icon: WalletCards },
  { key: 'report', label: '报告', icon: BookOpen },
  { key: 'admin', label: '后台', icon: LayoutDashboard }
];

const homeCards = computed(() => [
  { title: '国家推荐', text: '按100分模型生成TOP3和不推荐原因。', icon: Flag },
  { title: '博士路线', text: '覆盖导师、奖学金、材料和申请节奏。', icon: GraduationCap },
  { title: '家庭落地', text: '配偶工作、孩子入学、签证与预算联动。', icon: BriefcaseBusiness }
]);

async function submitPlan() {
  loading.value = true;
  try {
    plan.value = await api.generatePlan(form.value);
    activeTab.value = 'report';
  } finally {
    loading.value = false;
  }
}

function downloadPdf() {
  api.downloadPdf(form.value);
}
</script>
