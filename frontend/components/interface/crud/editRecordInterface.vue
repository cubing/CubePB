<template>
  <v-card flat>
    <slot name="toolbar"></slot>
    <v-card-text :class="{ 'max-height': dialogMode }" class="pt-3">
      <CircularLoader
        v-if="isLoading"
        style="min-height: 250px"
      ></CircularLoader>
      <v-container v-else class="px-0">
        <v-row>
          <v-col
            v-for="(item, i) in visibleInputsArray"
            :key="i"
            cols="12"
            class="py-0"
          >
            <GenericInput
              :item="item"
              :parent-item="currentItem"
              @handle-submit="handleSubmit()"
            ></GenericInput>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>

    <v-card-actions v-if="!isLoading">
      <v-spacer></v-spacer>
      <slot name="footer-action"></slot>
      <v-btn
        v-if="mode !== 'view'"
        ref="submit"
        color="primary"
        :loading="loading.editRecord"
        @click="handleSubmit()"
        >Submit</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import editRecordInterfaceMixin from '~/mixins/editRecordInterface'
import CircularLoader from '~/components/common/circularLoader.vue'

export default {
  components: {
    CircularLoader,
  },
  mixins: [editRecordInterfaceMixin],
}
</script>

<style scoped>
.max-height {
  max-height: 600px;
}
</style>
