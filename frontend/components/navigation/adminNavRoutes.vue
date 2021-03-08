<template>
  <div>
    <v-divider></v-divider>
    <v-list dense>
      <v-list-group
        v-for="item in adminItems"
        :key="item.title"
        v-model="item.active"
        :prepend-icon="item.action"
        no-action
      >
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title v-text="item.title"></v-list-item-title>
          </v-list-item-content>
        </template>
        <template v-for="child in item.items">
          <v-list-item :key="child.title" :to="child.to" exact>
            <v-list-item-content>
              <v-list-item-title v-text="child.title"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list-group>
    </v-list>
  </div>
</template>

<script>
import { capitalizeString } from '~/services/common'
import * as models from '~/models'

export default {
  computed: {
    adminItems() {
      return [
        {
          action: 'mdi-star',
          active: false,
          title: 'Administration',
          permissions: [],
          items: Object.values(models).map((recordInfo) => ({
            title: capitalizeString(recordInfo.pluralTypename),
            to: '/admin?type=' + recordInfo.typename,
          })),
        },
      ]
    },
  },
  methods: {
    close() {
      this.$emit('close')
    },
    handleSubmit(data) {
      this.close()
      this.$emit('handleSubmit', data)
    },
  },
}
</script>
