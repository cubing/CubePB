<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on">
        <slot name="icon">
          <v-icon>mdi-magnify</v-icon>
        </slot>
      </v-btn>
    </template>
    <v-card>
      <v-card-text class="pb-0 pt-5">
        <v-text-field
          ref="search"
          :value="value"
          prepend-icon="mdi-magnify"
          outlined
          label="Search query (Enter to submit)"
          clearable
          @input="$emit('input', $event)"
          @keyup.enter="submit()"
        ></v-text-field>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: () => null,
    },
  },

  data() {
    return {
      dialog: false,
    }
  },

  watch: {
    dialog(val) {
      if (!val) return

      setTimeout(() => {
        this.$refs.search.focus()
      }, 0)
    },
  },

  methods: {
    submit() {
      this.$emit('handleSubmit', this.value)
      this.dialog = false
    },
  },
}
</script>
