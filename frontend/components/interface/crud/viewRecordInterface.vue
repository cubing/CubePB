<template>
  <v-card flat>
    <slot name="toolbar"></slot>
    <v-card-text :class="{ 'max-height': dialogMode }" class="pt-3">
      <CircularLoader
        v-if="isLoading"
        style="min-height: 250px"
      ></CircularLoader>
      <v-container v-else class="text-left">
        <v-row>
          <v-col
            v-for="(item, i) in inputsArray"
            :key="i"
            cols="12"
            class="py-0"
          >
            <div v-if="item.fieldInfo.component" class="pb-2 subheader">
              {{ item.fieldInfo.text }}:
              <component
                :is="item.fieldInfo.component"
                class="d-inline"
                :item="currentItem"
                :field-path="
                  item.fieldInfo.compoundOptions
                    ? item.fieldInfo.compoundOptions.pathPrefix
                    : item.field
                "
              ></component>
            </div>
            <GenericInput v-else :item="item" :mode="mode"></GenericInput>
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
