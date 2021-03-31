<template>
  <div v-if="currentValue">
    <v-avatar size="24">
      <span class="cubing-icon" :class="currentValue.cubingIcon"></span>
    </v-avatar>
    {{ currentValue.name }}
  </div>
</template>

<script>
import columnMixin from '~/mixins/column'

export default {
  mixins: [columnMixin],
}
</script>
