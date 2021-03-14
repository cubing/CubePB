<template>
  <div v-if="currentItem">
    <v-avatar size="24">
      <span class="cubing-icon" :class="'event-' + currentItem.code"></span>
    </v-avatar>
    {{ currentItem.name }}
  </div>
</template>

<script>
import columnMixin from '~/mixins/column'
import { getNestedProperty } from '~/services/base'

export default {
  mixins: [columnMixin],
  computed: {
    // attempt to find the nested "event" using the headerInfo.field, assuming the fieldpath's path prefix is the path to the "event"
    currentItem() {
      const fieldpathParts = this.fieldpath.split(/\./)
      return fieldpathParts.length > 1
        ? getNestedProperty(this.item, fieldpathParts.slice(0, -1).join('.'))
        : this.item
    },
  },
}
</script>
