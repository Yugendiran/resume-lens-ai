<script setup>
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <Analysis :slug="slug" route="/analysis" />
</template>

<script>
export default {
  data() {
    return {
      slug: this.$route.params.slug,
    };
  },
};
</script>
