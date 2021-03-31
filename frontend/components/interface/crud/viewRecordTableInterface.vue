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
      <v-container v-else class="text-left">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left" style="width: 150px">Name</th>
                <th class="text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in inputsArray" :key="i">
                <td>{{ item.fieldInfo.text }}</td>
                <td>
                  <component
                    :is="item.fieldInfo.component"
                    v-if="item.fieldInfo.component"
                    :item="currentItem"
                    :field-path="
                      item.fieldInfo.compoundOptions
                        ? item.fieldInfo.compoundOptions.pathPrefix
                        : item.field
                    "
                  ></component>
                  <span v-else>{{ currentItem[item.field] }}</span>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
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
