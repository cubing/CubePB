<template>
  <div v-if="currentValue">
    {{ renderedResult }}
  </div>
</template>

<script>
import columnMixin from '~/mixins/column'

export default {
  mixins: [columnMixin],

  computed: {
    renderedResult() {
      return (
        this.currentValue.pbClass.name +
        (this.currentValue.setSize > 1
          ? ' of ' + this.currentValue.setSize
          : '')
      )
    },
  },
}
</script>
