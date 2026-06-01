<template>
  <div class="admin">
    <div class="admin-tabs">
      <button v-for="item in resources" :key="item.key" :class="{ active: current.key === item.key }" @click="selectResource(item)">{{ item.label }}</button>
    </div>

    <form class="admin-form" @submit.prevent="save">
      <label v-for="field in current.fields" :key="field.key">
        {{ field.label }}
        <textarea v-if="field.long" v-model="draft[field.key]" rows="3"></textarea>
        <input v-else v-model="draft[field.key]" :type="field.type || 'text'" />
      </label>
      <button class="primary-btn" type="submit">{{ draft.id ? '保存修改' : '新增数据' }}</button>
    </form>

    <div class="admin-list">
      <article v-for="item in rows" :key="item.id" class="admin-row" @click="edit(item)">
        <strong>{{ item.name || item.title || item.country || item.school }}</strong>
        <p>{{ item.country || item.owner || item.discipline || item.task || item.note }}</p>
      </article>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { api } from '../services/api';

const resources = [
  { key: 'countries', label: '国家政策', load: api.getCountries, save: api.saveCountry, fields: [
    ['name', '国家名称'], ['phd_duration', '博士学制'], ['phd_requirements', '博士申请要求', true], ['scholarship', '奖学金机会', true], ['spouse_allowed', '是否允许带配偶'], ['spouse_work', '配偶是否可工作', true], ['public_school', '子女是否可读公立'], ['child_cost', '子女读书费用'], ['healthcare', '医疗政策'], ['living_cost', '生活成本指数', false, 'number'], ['visa_difficulty', '签证难度'], ['post_study_work', '毕业工签'], ['immigration', '移民机会'], ['risks', '风险提示', true], ['official_links', '官方政策链接', true], ['updated_at', '最新更新时间'], ['score_phd_feasibility', '博士可行性(20)', false, 'number'], ['score_scholarship', '奖学金(15)', false, 'number'], ['score_spouse_work', '配偶工作(20)', false, 'number'], ['score_child_education', '子女教育(15)', false, 'number'], ['score_living_cost', '生活成本(10)', false, 'number'], ['score_immigration', '移民机会(15)', false, 'number'], ['score_safety', '安全适应(5)', false, 'number']
  ] },
  { key: 'schools', label: '学校', load: api.getSchools, save: api.saveSchool, fields: [['country', '国家'], ['name', '学校名称'], ['discipline', '适合专业'], ['phd_url', '博士链接'], ['scholarship_url', '奖学金链接']] },
  { key: 'mentors', label: '导师', load: api.getMentors, save: api.saveMentor, fields: [['school', '学校'], ['name', '导师名称'], ['research_area', '研究方向'], ['email', '邮箱'], ['fit_notes', '匹配说明', true]] },
  { key: 'budgets', label: '预算', load: api.getBudgets, save: api.saveBudget, fields: [['country', '国家'], ['tuition', '学费', false, 'number'], ['rent', '房租', false, 'number'], ['living', '生活费', false, 'number'], ['insurance', '保险', false, 'number'], ['child_school', '孩子读书', false, 'number'], ['visa', '签证', false, 'number'], ['note', '备注', true]] },
  { key: 'materials', label: '材料', load: api.getMaterials, save: api.saveMaterial, fields: [['name', '材料名称'], ['owner', '适用对象'], ['notes', '说明', true], ['required', '是否必需', false, 'number']] },
  { key: 'stages', label: '流程', load: api.getStages, save: api.saveStage, fields: [['stage_order', '阶段序号', false, 'number'], ['title', '阶段标题'], ['task', '当前任务', true], ['materials', '需要材料', true], ['completion', '完成标准', true], ['risks', '风险提醒', true], ['next_step', '下一步', true]] }
].map(resource => ({ ...resource, fields: resource.fields.map(([key, label, long, type]) => ({ key, label, long, type })) }));

const current = ref(resources[0]);
const rows = ref([]);
const draft = ref({});

async function load() {
  rows.value = await current.value.load();
  draft.value = {};
}

function selectResource(resource) {
  current.value = resource;
  load();
}

function edit(item) {
  draft.value = { ...item };
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function save() {
  await current.value.save(draft.value);
  await load();
}

onMounted(load);
</script>
