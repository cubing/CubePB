<template>
  <v-container>
    <v-layout column justify-center align-center>
      <v-flex xs12 sm8 md6 style="max-width: 600px">
        <div class="text-center pb-5 pt-3">
          <img
            src="../static/cubepblogohorizontal.png"
            alt=""
            style="width: 75%"
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
              to get access to your PB data, please email hello@cubepb.com with
              the email address associated with your old CubePB.com account, and
              we'll try to recover the data for you in a spreadsheet format.
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
            <v-btn v-if="user" color="primary" nuxt to="/my-pbs"
              >Track My PBs</v-btn
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

            <v-btn color="primary" nuxt :to="latestPbsRoute"
              >View Latest PBs</v-btn
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

    latestPbsRoute() {
      return generateRoute('/public-pbs', {
        sortBy: ['happenedOn'],
        sortDesc: [true],
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
