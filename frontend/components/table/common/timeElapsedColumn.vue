<template>
  <div>
    {{ serializeTime(currentValue) }}
  </div>
</template>

<script>
import { serializeTime } from '~/services/common'
import columnMixin from '~/mixins/column'

export default {
  mixins: [columnMixin],

  methods: {
    serializeTime,
  },
}
</script>
