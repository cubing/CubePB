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
            xs="12"
            class="py-0"
          >
            <div
              v-if="item.fieldInfo.inputType === 'avatar'"
              class="text-center pb-3"
            >
              <v-avatar size="64">
                <v-img :src="item.value" contain></v-img>
              </v-avatar>
            </div>

            <v-textarea
              v-else-if="item.fieldInfo.inputType === 'textarea'"
              v-model="item.value"
              filled
              dense
              class="py-0"
              :label="
                (item.fieldInfo.text || item.field) +
                (item.fieldInfo.optional ? ' (optional)' : '')
              "
              :readonly="item.readonly || mode === 'view'"
            ></v-textarea>
            <v-switch
              v-else-if="item.fieldInfo.inputType === 'switch'"
              v-model="item.value"
              :label="
                (item.fieldInfo.text || item.field) +
                (item.fieldInfo.optional ? ' (optional)' : '')
              "
              :readonly="item.readonly || mode === 'view'"
            ></v-switch>
            <v-menu
              v-else-if="item.fieldInfo.inputType === 'datepicker'"
              v-model="item.focused"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="item.value"
                  :label="
                    (item.fieldInfo.text || item.field) +
                    (item.fieldInfo.optional ? ' (optional)' : '')
                  "
                  :readonly="item.readonly || mode === 'view'"
                  :clearable="!item.readonly && mode !== 'view'"
                  filled
                  autocomplete="off"
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="item.value"
                color="primary"
                no-title
                @input="item.focused = false"
              ></v-date-picker>
            </v-menu>
            <v-combobox
              v-else-if="item.fieldInfo.inputType === 'combobox'"
              ref="combobox"
              v-model="item.value"
              :items="item.options"
              item-text="name"
              item-value="id"
              :label="
                (item.fieldInfo.text || item.field) +
                (item.fieldInfo.optional ? ' (optional)' : '')
              "
              :readonly="item.readonly || mode === 'view'"
              :clearable="!item.readonly && mode !== 'view'"
              filled
              class="py-0"
            ></v-combobox>
            <v-combobox
              v-else-if="item.fieldInfo.inputType === 'server-combobox'"
              ref="combobox"
              v-model="item.value"
              :loading="item.loading"
              :search-input.sync="item.search"
              :items="item.options"
              item-text="name"
              item-value="id"
              :label="
                (item.fieldInfo.text || item.field) +
                (item.fieldInfo.optional ? ' (optional)' : '')
              "
              :readonly="item.readonly || mode === 'view'"
              :clearable="!item.readonly && mode !== 'view'"
              filled
              hide-no-data
              cache-items
              class="py-0"
              @update:search-input="handleSearchUpdate(item)"
              @blur="item.focused = false"
              @focus="item.focused = true"
            ></v-combobox>
            <v-autocomplete
              v-else-if="item.fieldInfo.inputType === 'autocomplete'"
              v-model="item.value"
              :items="item.options"
              item-text="name"
              item-value="id"
              :label="
                (item.fieldInfo.text || item.field) +
                (item.fieldInfo.optional ? ' (optional)' : '')
              "
              :readonly="item.readonly || mode === 'view'"
              :clearable="!item.readonly && mode !== 'view'"
              filled
              class="py-0"
            ></v-autocomplete>
            <v-autocomplete
              v-else-if="item.fieldInfo.inputType === 'server-autocomplete'"
              v-model="item.value"
              :loading="item.loading"
              :search-input.sync="item.search"
              :items="item.options"
              item-text="name"
              item-value="id"
              :label="
                (item.fieldInfo.text || item.field) +
                (item.fieldInfo.optional ? ' (optional)' : '')
              "
              :readonly="item.readonly || mode === 'view'"
              :clearable="!item.readonly && mode !== 'view'"
              filled
              hide-no-data
              cache-items
              class="py-0"
              @update:search-input="handleSearchUpdate(item)"
              @blur="item.focused = false"
              @focus="item.focused = true"
            ></v-autocomplete>
            <v-select
              v-else-if="item.fieldInfo.inputType === 'select'"
              v-model="item.value"
              :items="item.options"
              filled
              :label="
                (item.fieldInfo.text || item.field) +
                (item.fieldInfo.optional ? ' (optional)' : '')
              "
              :readonly="item.readonly || mode === 'view'"
              :clearable="!item.readonly && mode !== 'view'"
              item-text="name"
              item-value="id"
              class="py-0"
            ></v-select>
            <v-text-field
              v-else
              v-model="item.value"
              :label="
                (item.fieldInfo.text || item.field) +
                (item.fieldInfo.optional ? ' (optional)' : '')
              "
              :readonly="item.readonly || mode === 'view'"
              :rules="item.fieldInfo.inputRules"
              filled
              dense
              class="py-0"
            ></v-text-field>
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
