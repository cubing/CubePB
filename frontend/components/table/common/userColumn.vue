<template>
  <div v-if="currentItem">
    <v-avatar size="24" class="mr-1">
      <v-img v-if="currentItem.avatar" :src="currentItem.avatar"></v-img>
      <v-icon v-else>mdi-account</v-icon>
    </v-avatar>
    {{ currentItem.name }}
  </div>
</template>

<script>
import columnMixin from '~/mixins/column'
import { getNestedProperty } from '~/services/common'

export default {
  mixins: [columnMixin],

  computed: {
    // attempt to find the nested "user" using the headerInfo.field, assuming the fieldpath's path prefix is the path to the "user"
    currentItem() {
      const fieldpathParts = this.fieldpath.split(/\./)
      return fieldpathParts.length > 1
        ? getNestedProperty(this.item, fieldpathParts.slice(0, -1).join('.'))
        : this.item
    },
  },

  methods: {},
}
</script>
