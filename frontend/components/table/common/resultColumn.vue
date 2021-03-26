<template>
  <div v-if="item">
    {{ renderedResult }}
  </div>
</template>

<script>
import columnMixin from '~/mixins/column'
import { serializeTime } from '~/services/base'

export default {
  mixins: [columnMixin],

  computed: {
    renderedResult() {
      switch (this.item.event.scoreMethod) {
        case 'STANDARD':
          return `${serializeTime(this.item.timeElapsed)}`
        case 'FMC':
          return `${this.item.movesCount}`
        case 'MBLD':
          return `${this.item.attemptsSucceeded}/${
            this.item.attemptsTotal
          } ${serializeTime(this.item.timeElapsed)}`
        default:
          return ''
      }
    },
  },
}
</script>
