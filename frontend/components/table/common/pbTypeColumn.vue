<template>
  <div v-if="item">
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
        this.item.pbClass.name +
        (this.item.setSize > 1 ? ' of ' + this.item.setSize : '')
      )
    },
  },
}
</script>
