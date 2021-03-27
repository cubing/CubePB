<template>
  <v-card flat>
    <slot name="toolbar"></slot>
    <v-card-text :class="{ 'max-height': dialogMode }" class="pt-3">
      <v-container
        v-if="loading.loadRecord || loading.loadDropdowns"
        class="text-center"
        style="height: 250px"
        fill-height
        justify-center
      >
        <v-progress-circular indeterminate></v-progress-circular>
      </v-container>
      <v-container v-else>
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
                :fieldpath="item.field"
              ></component>
            </div>

            <GenericInput v-else :item="item" :mode="mode"></GenericInput>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>

    <v-card-actions>
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

export default {
  mixins: [editRecordInterfaceMixin],
}
</script>

<style scoped>
.max-height {
  max-height: 600px;
}
</style>
