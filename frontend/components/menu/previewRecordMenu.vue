<template>
  <v-menu v-model="open" v-bind="$attrs">
    <!-- pass through scoped slots -->
    <template v-slot:activator="slotData">
      <slot v-if="$scopedSlots.activator" name="activator" v-bind="slotData" />
      <v-chip v-else pill small v-bind="slotData.attrs" v-on="slotData.on">
        <v-avatar left>
          <v-img v-if="item.avatar" :src="item.avatar" contain></v-img
          ><v-icon v-else>{{ icon }} </v-icon>
        </v-avatar>
        {{ item.name }}
      </v-chip>
    </template>
    <v-card>
      <v-list>
        <v-list-item>
          <v-list-item-avatar>
            <v-img v-if="item.avatar" :src="item.avatar" />
            <v-icon v-else>{{ icon }} </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <template>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
              <v-progress-linear
                v-if="loading.loadData"
                indeterminate
              ></v-progress-linear>
              <template v-else-if="itemData">
                <v-list-item-subtitle
                  >Type: {{ itemData.__typename }}</v-list-item-subtitle
                >
                <!--                 <v-list-item-subtitle
                  >Nationality: {{ itemData.country }}</v-list-item-subtitle
                > -->
              </template>
            </template>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="openPage()">
          <v-icon left>mdi-open-in-new</v-icon>
          Open Page
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
import {
  handleError,
  goToPage,
  capitalizeString,
  getIcon,
} from '~/services/base'
import { executeGiraffeql } from '~/services/giraffeql'

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      open: false,
      itemData: null,
      loading: {
        loadData: false,
      },
    }
  },

  computed: {
    icon() {
      return getIcon(this.item.__typename)
    },
    capitalizedType() {
      return capitalizeString(this.item.__typename)
    },
  },

  watch: {
    open() {
      if (!this.open) return
      this.reset()
    },
  },

  methods: {
    openPage() {
      goToPage(this, this.item.__typename, 'i-view', this.item.id, true)
    },

    async loadData() {
      this.loading.loadData = true
      try {
        this.itemData = await executeGiraffeql(this, {
          ['get' + this.capitalizedType]: {
            id: true,
            __typename: true,
            name: true,
            avatar: true,
            __args: {
              id: this.item.id,
            },
          },
        })
      } catch (err) {
        handleError(this, err)
      }
      this.loading.loadData = false
    },

    reset() {
      this.loadData()
    },
  },
}
</script>
<style scoped>
.v-chip--pill .v-avatar {
  height: 24px !important;
  width: 24px !important;
}
</style>
