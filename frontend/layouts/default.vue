<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list dense>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list dense>
        <v-list-item
          v-for="(item, i) in visibleNavItems"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list v-if="user" dense>
        <v-list-item
          v-for="(item, i) in userItems"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <AdminNavRoutes v-if="isAdmin"></AdminNavRoutes>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <nuxt-link to="/">
        <v-img
          :src="require('../static/cubepb-trimmed.png')"
          max-height="48"
          max-width="130"
          contain
        />
      </nuxt-link>
      <v-spacer />
      <template v-if="user">
        <v-menu :close-on-content-click="true" :max-width="300" offset-y bottom>
          <template v-slot:activator="{ on }">
            <v-chip pill v-on="on">
              <v-avatar left>
                <v-img v-if="user.avatar" :src="user.avatar"></v-img
                ><v-icon v-else>mdi-account</v-icon>
              </v-avatar>
              {{ user.name }}
            </v-chip>
          </template>

          <v-card>
            <v-list>
              <v-list-item>
                <v-list-item-avatar>
                  <v-img v-if="user.avatar" :src="user.avatar" />
                  <v-icon v-else>mdi-account</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ user.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
                  <v-list-item-subtitle
                    >Role: {{ user.role }}</v-list-item-subtitle
                  >
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <v-list dense>
              <v-list-item
                v-for="(item, i) in accountItems"
                :key="i"
                :to="item.to"
                exact
                nuxt
              >
                <v-list-item-content>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item @click="logout()">
                <v-list-item-content>
                  <v-list-item-title>Logout</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </template>
      <v-btn v-else text @click="goToWcaAuth()">
        <img
          src="../static/wcalogo2020.svg"
          alt=""
          style="width: 32px"
          class="pr-2"
        />
        WCA Login
      </v-btn>
    </v-app-bar>
    <v-main>
      <nuxt />
    </v-main>
    <v-footer :absolute="!fixed" app>
      <VersionCheckText />
      <span class="hidden-sm-and-down"
        >&nbsp;&copy; {{ new Date().getFullYear() }}</span
      >
      <span class="pl-2 hidden-sm-and-down"
        >CubePB is made possible by
        <a @click="openLink('https://thecubicle.com')">TheCubicle.com</a></span
      >
      <v-spacer></v-spacer>
      <v-icon
        small
        class="mr-2"
        @click="openLink('https://discord.gg/72d8gNq7bh')"
        >mdi-discord</v-icon
      >
      <v-icon
        small
        class="mr-2"
        @click="openLink('https://github.com/cubing/CubePB')"
        >mdi-github</v-icon
      >
      <v-icon
        small
        class="mr-2"
        title="hello@cubepb.com"
        @click="copyToClipboard('hello@cubepb.com')"
        >mdi-email</v-icon
      >
      <v-icon
        small
        class="mr-2"
        title="Toogle Brightness"
        @click="toggleTheme()"
        >mdi-brightness-4</v-icon
      >
    </v-footer>
    <Snackbar />
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'
import Snackbar from '~/components/snackbar/snackbar.vue'
import VersionCheckText from '~/components/common/versionCheckText.vue'
import { goToWcaAuth, handleLogout } from '~/services/auth'
import {
  copyToClipboard,
  openLink,
  handleError,
  generateRoute,
} from '~/services/base'
import AdminNavRoutes from '~/components/navigation/adminNavRoutes.vue'

export default {
  components: {
    Snackbar,
    VersionCheckText,
    AdminNavRoutes,
  },
  data() {
    return {
      clipped: true,
      drawer: true,
      fixed: true,
      items: [
        {
          icon: 'mdi-home',
          title: 'Home',
          to: '/',
        },
      ],
      userItems: [
        {
          icon: 'mdi-timer',
          title: 'My PBs',
          to: '/my-pbs',
        },
        {
          icon: 'mdi-card-text',
          title: 'My PB Card',
          to: '/my-pb-card',
        },
        {
          icon: 'mdi-timetable',
          title: 'My PB Feed',
          to: generateRoute('/my-pb-feed', {
            sortBy: ['happenedOn'],
            sortDesc: [true],
          }),
        },
        {
          icon: 'mdi-card-account-details',
          title: 'My Profile',
          to: '/my-profile?expand=0',
        },
        {
          icon: 'mdi-account-multiple',
          title: 'My Followers',
          to: '/my-followers',
        },
        {
          icon: 'mdi-account-switch',
          title: 'Users I Follow',
          to: '/my-follows',
        },
      ],
      navItems: [
        {
          icon: 'mdi-account',
          title: 'Public Users',
          to: generateRoute('/public-users', {
            sortBy: ['createdAt'],
            sortDesc: [true],
          }),
          loginRequired: false,
        },
        {
          icon: 'mdi-star',
          title: 'Latest PBs',
          to: generateRoute('/public-pbs', {
            sortBy: ['happenedOn'],
            sortDesc: [true],
          }),
          loginRequired: false,
        },
      ],
      accountItems: [
        { title: 'My Profile', to: '/my-profile', exact: false },
        { title: 'Settings', to: '/settings', exact: false },
      ],
      miniVariant: false,
    }
  },

  computed: {
    ...mapGetters({
      user: 'auth/user',
    }),

    visibleNavItems() {
      return this.navItems.filter(
        (item) => this.$store.getters['auth/user'] || !item.loginRequired
      )
    },
    isAdmin() {
      return this.$store.getters['auth/user']?.role === 'ADMIN'
    },
  },

  methods: {
    copyToClipboard(content) {
      return copyToClipboard(this, content)
    },
    goToWcaAuth,
    openLink,

    toggleTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
      localStorage.setItem('theme', this.$vuetify.theme.dark ? 'dark' : 'light')
    },

    canSee(allowedRoles, allowedPermissions) {
      return (
        allowedRoles.includes(this.$store.getters['auth/user']?.role) ||
        allowedPermissions.some((ele) =>
          // eslint-disable-next-line camelcase
          this.$store.getters['auth/user']?.allPermissions.includes(ele)
        )
      )
    },

    logout() {
      try {
        this.$router.push('/')

        handleLogout(this)
      } catch (err) {
        handleError(this, err)
      }
    },
  },
}
</script>
