<template>
  <div class="empty-state">
    <p>还没有生成规划结果。</p>
    <button class="primary-btn" @click="$emit('go')">先填写家庭情况</button>
  </div>
</template>

<script setup>
defineEmits(['go']);
</script>
