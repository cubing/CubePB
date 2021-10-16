<template>
  <div>
    <v-chip small :color="currentValue ? 'green' : 'red'" text-color="white">
      {{ currentValue ? 'Yes' : 'No' }}
    </v-chip>
  </div>
</template>

<script>
import columnMixin from '~/mixins/column'

export default {
  mixins: [columnMixin],
}
</script>
