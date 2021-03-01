<template>
  <div v-if="currentValue">
    <v-avatar size="24" class="mr-1">
      <v-img v-if="item.avatar" :src="item.avatar"></v-img>
      <v-icon v-else>mdi-account</v-icon>
    </v-avatar>
    {{ currentValue }}
  </div>
</template>

<script>
import columnMixin from '~/mixins/column'

export default {
  mixins: [columnMixin],

  methods: {},
}
</script>
