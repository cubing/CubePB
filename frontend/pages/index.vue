<template>
  <v-container>
    <v-layout column justify-center align-center>
      <v-flex xs12 sm8 md6 style="max-width: 600px">
        <div class="text-center">
          <img src="../static/cubepb-trimmed.png" alt="" style="width: 50%" />
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
              <a href="https://discord.gg/syZfxBpT" target="_blank"
                >Discord server</a
              >. If you would prefer to email, our email is
              <a>hello@cubepb.com</a>.
            </p>
            <p>
              If you saved your PBs on the previous version of CubePB, the data
              is unfortunately not recoverable because the user login system has
              been changed to WCA login, and you will need to re-enter your PBs.
            </p>
            <p>
              CubePB.com is made possible with support from
              <a href="https://thecubicle.com" target="_blank"
                >TheCubicle.com</a
              >
            </p>
          </v-card-text>
        </v-card>

        <ReleaseHistory class="mt-3" />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import ReleaseHistory from '~/components/common/releaseHistory.vue'

export default {
  components: {
    ReleaseHistory,
  },

  methods: {},
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
