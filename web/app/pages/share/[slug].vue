<template>
  <Analysis :slug="slug" route="/public/analysis" />
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
