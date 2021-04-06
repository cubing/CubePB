<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-text class="pb-0 pt-5">
        <v-text-field
          ref="search"
          v-model="searchInput"
          prepend-icon="mdi-magnify"
          outlined
          label="Search query (Enter to submit)"
          clearable
          @keyup.enter="submit()"
        ></v-text-field>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      searchInput: null,
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
      this.$emit('handleSubmit', this.searchInput)
      this.dialog = false
    },
  },
}
</script>
