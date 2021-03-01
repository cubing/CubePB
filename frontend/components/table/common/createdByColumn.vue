<template>
  <div v-if="item.created_by">
    <v-avatar size="24" class="mr-1">
      <v-img v-if="avatar" :src="avatar"></v-img>
      <v-icon v-else>mdi-account</v-icon>
    </v-avatar>
    {{ currentValue }}
  </div>
</template>

<script>
import columnMixin from '~/mixins/column'
import { getNestedProperty } from '~/services/common'

export default {
  mixins: [columnMixin],
  computed: {
    avatar() {
      return getNestedProperty(this.item, 'created_by.avatar')
    },
  },

  methods: {},
}
</script>
