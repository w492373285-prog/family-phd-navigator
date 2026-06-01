<template>
  <article class="report">
    <h2>1. 最推荐国家TOP3</h2>
    <ol>
      <li v-for="country in plan.topCountries" :key="country.id">{{ country.name }}：{{ country.totalScore }}分，{{ country.fitReasons.join('；') || '综合匹配度较高' }}</li>
    </ol>

    <h2>2. 不推荐国家及原因</h2>
    <p v-for="item in plan.notRecommended" :key="item.name">{{ item.name }}：{{ item.reason }}</p>

    <h2>3. 推荐申请路径</h2>
    <p>{{ plan.report.recommendedPath }}</p>

    <h2>4. 博士申请短板</h2>
    <ul><li v-for="item in plan.report.applicantShortfalls" :key="item">{{ item }}</li></ul>

    <h2>5. 配偶工作建议</h2>
    <p>{{ plan.report.spouseAdvice }}</p>

    <h2>6. 孩子入学建议</h2>
    <p>{{ plan.report.childAdvice }}</p>

    <h2>7. 一年家庭预算</h2>
    <p v-for="item in plan.budgets" :key="item.id">{{ item.country }}：约 ¥{{ item.total.toLocaleString() }}。{{ item.note }}</p>

    <h2>8. 未来12个月行动计划</h2>
    <ol><li v-for="item in plan.report.monthlyPlan" :key="item">{{ item }}</li></ol>

    <h2>9. 每月该做什么</h2>
    <p>建议每月月底复盘导师回复、语言成绩、预算现金流和签证政策，更新下一月任务优先级。</p>

    <h2>10. 风险提醒</h2>
    <ul><li v-for="item in plan.report.riskWarnings" :key="item">{{ item }}</li></ul>
  </article>
</template>

<script setup>
defineProps({ plan: Object });
</script>
