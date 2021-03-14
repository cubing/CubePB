<template>
  <div>
    {{ generateTimeAgoString(currentValue) }}
  </div>
</template>

<script>
import { generateTimeAgoString } from '~/services/base'
import columnMixin from '~/mixins/column'

export default {
  mixins: [columnMixin],

  methods: {
    generateTimeAgoString,
  },
}
</script>
