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
      switch (this.currentValue.event.scoreMethod) {
        case 'STANDARD':
          return `${this.currentValue.timeElapsed}`
        case 'FMC':
          return `${this.currentValue.movesCount}`
        case 'MBLD':
          return `${this.currentValue.attemptsSucceeded}/${this.currentValue.attemptsTotal} ${this.currentValue.timeElapsed}`
        default:
          return ''
      }
    },
  },
}
</script>
