<template>
  <div>
    <v-container fluid style="max-width: 1920px">
      <v-row justify="center" class="pt-3">
        <v-col :key="-1" cols="12" class="pb-0">
          <p>
            Using this form, you can lookup your old CubePB.com PBs using the
            exact email address that you used on the old CubePB.com site.
          </p>
          <p>
            Here's how to read it:
            <br />
            RecordType: 2 = Avg, 1 = Mean, 0 = Single <br />
            Result: Divide this number by 1000 to get your time (in seconds)
          </p>
          <span>
            For help with reading the results, please feel free to drop by our
            <a href="https://discord.gg/72d8gNq7bh" target="_blank"
              >Discord server</a
            >.
          </span>
        </v-col>
      </v-row>
    </v-container>
    <LegacyRecordPagePreset></LegacyRecordPagePreset>
    <CrudRecordPage
      :record-info="recordInfo"
      :hidden-filters="hiddenFilters"
      :head="head"
      :title="title"
      :icon="icon"
    ></CrudRecordPage>
  </div>
</template>

<script>
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import LegacyRecordPagePreset from '../components/page/preset/legacyRecordPagePreset.vue'
import { PublicLegacyRecords } from '~/models/special'

export default {
  components: {
    CrudRecordPage,
    LegacyRecordPagePreset,
  },

  data() {
    return {
      recordInfo: PublicLegacyRecords,
      head: {
        title: 'Legacy App Records',
      },
      hiddenFilters: [],
      title: 'Legacy App Records',
      icon: 'mdi-view-list',
    }
  },
}
</script>
