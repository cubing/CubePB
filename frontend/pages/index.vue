<template>
  <v-container>
    <v-layout column justify-center align-center>
      <v-flex xs12 sm8 md6 style="max-width: 600px">
        <div class="text-center pb-5 pt-3">
          <img
            :src="
              require($vuetify.theme.dark
                ? '../static/cubepb-logo-2.png'
                : '../static/cubepb-logo-2-b.png')
            "
            alt=""
            style="max-width: 75%"
          />
        </div>
        <v-card>
          <v-card-title class="headline">
            Welcome to the New CubePB.com
          </v-card-title>
          <v-card-text>
            <p>
              CubePB.com is a website for tracking and showcasing your personal
              bests in speedcubing events. The website has been newly re-written
              from the ground up as an open-source project. Feel free to check
              out our
              <a href="https://github.com/cubing/CubePB" target="_blank"
                >Github repository</a
              >
              to let us know your feedback, report bugs, or to contribute.
              Please also check out our official
              <a href="https://discord.gg/72d8gNq7bh" target="_blank"
                >Discord server</a
              >. If you would prefer to email, our email is
              <a>hello@cubepb.com</a>.
            </p>
            <p>
              If you saved your PBs on the previous version of CubePB and need
              to get access to your PB data, please go to the
              <nuxt-link to="/legacy-record-lookup"
                >Legacy Record Lookup</nuxt-link
              >
              page, where you can lookup your old CubePB records using your
              email address.
            </p>
            <p>
              CubePB.com is made possible with support from
              <a href="https://thecubicle.com" target="_blank"
                >TheCubicle.com</a
              >
            </p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn v-if="user" color="primary" nuxt to="/my-pb-card">
              <v-icon left> mdi-card-text </v-icon>
              Track My PBs</v-btn
            >
            <v-btn v-else text @click="goToWcaAuth()">
              <img
                src="../static/wcalogo2020.svg"
                alt=""
                style="width: 32px"
                class="pr-2"
              />
              Login
            </v-btn>

            <v-btn color="primary" nuxt :to="fastestPbsRoute">
              <v-icon left> mdi-podium </v-icon>
              Leaderboard</v-btn
            >
          </v-card-actions>
        </v-card>

        <ReleaseHistory class="mt-3" />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
import ReleaseHistory from '~/components/common/releaseHistory.vue'
import { generateRoute } from '~/services/base'
import { goToWcaAuth } from '~/services/auth'

export default {
  components: {
    ReleaseHistory,
  },

  computed: {
    ...mapGetters({
      user: 'auth/user',
    }),

    fastestPbsRoute() {
      return generateRoute('/public-pbs', {
        sortBy: ['score'],
        sortDesc: [false],
        filters: [
          {
            field: 'event.id',
            operator: 'eq',
            value: 4, // 3x3x3 on prod db
          },
          {
            field: 'pbClass.id',
            operator: 'eq',
            value: 1, // pbClass single on prod db
          },
          {
            field: 'setSize',
            operator: 'eq',
            value: 1,
          },
        ],
      })
    },
  },

  methods: {
    goToWcaAuth,
  },
  head() {
    return {
      title: 'Home',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:
            'CubePB.com is a website for storing and showcasing your personal bests in speedcubing-related events.',
        },
      ],
    }
  },
}
</script>
