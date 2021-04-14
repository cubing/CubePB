<template>
  <div>
    <v-container fluid style="max-width: 1920px">
      <v-row justify="center" class="pt-3">
        <v-col :key="-1" cols="12" class="pb-0">
          <v-alert dense type="error">
            Do not share your API Keys with anyone or any application that you
            don't trust -- your API Key could allow for
            <strong>complete access</strong> to the data on your CubePB.com
            account.
          </v-alert>
          <p>
            API Keys are used to identify yourself when you are calling the
            CubePB.com APIs from 3rd party applications. This is mostly for
            developers who want to build apps that can communicate directly with
            the CubePB backend APIs.
          </p>
          <span>
            All CubePB.com API requests should be directed as a HTTP POST
            request to
            <span class="preformatted">https://api.cubepb.com/giraffeql</span>
            . The API Key needs to be passed as a header with the key
            <span class="preformatted">x-api-key</span>
            . The request body must be sent as JSON. Official documentation of
            all the API functiaonlity is not currently available, but you can
            see what the JSON body looks like for various kinds of actions by
            looking at the Request Payload in the developer console of your
            browser while performing those actions on the site. For help
            regarding setting up the requests, please feel free to drop by our
            <a href="https://discord.gg/72d8gNq7bh" target="_blank"
              >Discord server</a
            >.
          </span>
        </v-col>
      </v-row>
    </v-container>
    <CrudRecordPage
      :record-info="recordInfo"
      :locked-filters="lockedFilters"
      :hidden-filters="hiddenFilters"
      :head="head"
      :title="title"
      :icon="icon"
    ></CrudRecordPage>
  </div>
</template>

<script>
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import { MyApiKeys } from '~/models/special'

export default {
  middleware: ['router-auth'],

  components: {
    CrudRecordPage,
  },

  data() {
    return {
      recordInfo: MyApiKeys,
      head: {
        title: 'My Apps',
      },
      hiddenFilters: [],
      title: 'My Apps',
      icon: 'mdi-view-grid-plus',
    }
  },
  computed: {
    lockedFilters() {
      return this.$store.getters['auth/user']
        ? [
            {
              field: 'user.id',
              operator: 'eq',
              value: this.$store.getters['auth/user'].id,
            },
          ]
        : []
    },
  },
}
</script>
<style scoped>
.preformatted {
  font-family: monospace;
  white-space: pre;
}
</style>
