<template>
  <div v-if="currentValue">
    {{ renderedResult }}
    <v-tooltip v-if="currentValue.isFlagged" bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-icon small color="pink" v-bind="attrs" v-on="on">mdi-alert</v-icon>
      </template>
      <span
        >A moderator has flagged this PB as suspicious.
        <br />
        For the PB creator: If it was mistakenly entered, please delete it and
        re-enter the correct time.
        <br />If you believe this was flagged in error, please contact us at
        hello@cubepb.com with supporting evidence.</span
      >
    </v-tooltip>
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
