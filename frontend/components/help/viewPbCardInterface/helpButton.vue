<template>
  <v-dialog v-model="dialog" width="500" scrollable>
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on">
        <v-icon>mdi-help</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="headline"> How to Use This Page </v-card-title>

      <v-card-text style="max-height: 600px">
        This page shows all of the events alongside several commonly-used PB
        types, like Single, Ao5, Ao12, etc.
        <br /><br />
        To fill in a time, click the <v-icon small>mdi-pencil</v-icon> button in
        the box, then you will be prompted on how to enter the PB for that
        specific event and PB type. <br /><br />
        If you already had a time entered in a particular box, you can add a new
        PB by also clicking the <v-icon small>mdi-pencil</v-icon> button. Please
        note that CubePB saves all of your past and current PBs. It will create
        a new PB record with your new PB for that event and PB Type.
        <br /><br />
        If you notice an error with one of the PBs that you have entered (for
        example, a typo), you can remove that PB by clicking the
        <v-icon small color="pink">mdi-close</v-icon> button.
        <v-divider></v-divider>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="dialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
    }
  },
}
</script>
