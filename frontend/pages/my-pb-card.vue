<template>
  <v-container fluid>
    <v-layout column justify-left align-left>
      <v-row>
        <v-col cols="12">
          <ViewPbCardInterface
            editable
            icon="mdi-card-text"
            :title="title"
          ></ViewPbCardInterface>
        </v-col>
      </v-row>
    </v-layout>
  </v-container>
</template>

<script>
import ViewPbCardInterface from '~/components/interface/viewPbCardInterface.vue'
import { MyPbs } from '~/models/special'

export default {
  middleware: ['router-auth'],
  components: {
    ViewPbCardInterface,
  },

  data() {
    return {
      recordInfo: MyPbs,
      title: 'My PB Card',
      hiddenFilters: ['createdBy.id', 'isCurrent'],
      hiddenHeaders: ['createdBy.name+createdBy.avatar'],
    }
  },

  computed: {
    lockedFilters() {
      return this.$store.getters['auth/user']
        ? [
            {
              field: 'createdBy.id',
              operator: 'eq',
              value: this.$store.getters['auth/user']?.id,
            },
            {
              field: 'isCurrent',
              operator: 'eq',
              value: true,
            },
          ]
        : []
    },
  },

  head() {
    return {
      title: this.title,
    }
  },
}
</script>
