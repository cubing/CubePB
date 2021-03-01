<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <nuxt-link to="/">
        <v-img :src="require('../static/cubepb-trimmed.png')" class="ma-2" />
      </nuxt-link>
      <v-divider></v-divider>
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
        <v-list-item
          v-if="user"
          key="-1"
          :to="currentUserProfileRoute"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>mdi-card-account-details</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>My Profile</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list dense>
        <v-list-group
          v-for="item in visibleFeatureGroups"
          :key="item.title"
          v-model="item.active"
          :prepend-icon="item.action"
          no-action
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item-content>
          </template>
          <template v-for="child in item.items">
            <v-list-item
              v-if="canSee(child.roles, child.permissions)"
              :key="child.title"
              :to="child.to"
            >
              <v-list-item-content>
                <v-list-item-title v-text="child.title"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list-group>
      </v-list>
      <template v-slot:append>
        <client-only>
          <template v-if="user">
            <v-menu
              :close-on-content-click="true"
              :max-width="300"
              offset-x
              top
            >
              <template v-slot:activator="{ on }">
                <v-list-item key="-2" v-on="on">
                  <v-list-item-avatar>
                    <v-img v-if="user.avatar" :src="user.avatar" />
                    <v-icon v-else>mdi-account</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{ user.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      user.email
                    }}</v-list-item-subtitle>
                    <v-list-item-subtitle
                      >Role: {{ user.role }}</v-list-item-subtitle
                    >
                  </v-list-item-content>
                </v-list-item>
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
                      <v-list-item-subtitle>{{
                        user.email
                      }}</v-list-item-subtitle>
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

          <div v-else>
            <v-list-item @click="goToWcaAuth()">
              <v-list-item-action>
                <img
                  src="~static/WCAlogo_notext.svg"
                  alt=""
                  style="width: 32px"
                  class="pr-2"
                />
              </v-list-item-action>
              <v-list-item-content>WCA Login</v-list-item-content>
            </v-list-item>
          </div>
        </client-only>
      </template>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-img
        v-if="!drawer"
        :src="require('../static/cubepb-trimmed.png')"
        max-height="48"
        max-width="130"
        contain
      />
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
              <v-list-item :key="-1" :to="currentUserProfileRoute" exact nuxt>
                <v-list-item-content>
                  <v-list-item-title>My Profile</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
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
          src="../static/WCAlogo_notext.svg"
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
      <a @click="copyIdTokenToClipboard()">{{ getBuildInfo() }}</a>
      <span>&nbsp;&copy; {{ new Date().getFullYear() }}</span>
      <span class="pl-2"
        >CubePB is made possible by
        <a @click="openLink('https://thecubicle.com')">TheCubicle.com</a></span
      >
      <v-spacer></v-spacer>
      <v-icon
        small
        class="pr-2"
        @click="openLink('https://discord.gg/zg3GafZF')"
        >mdi-discord</v-icon
      >
      <v-icon
        small
        class="pr-2"
        @click="openLink('https://github.com/cubing/CubePB')"
        >mdi-github</v-icon
      >
      <v-btn small text @click="toggleTheme()"
        >Dark Mode: {{ $vuetify.theme.dark ? 'On' : 'Off' }}</v-btn
      >
    </v-footer>
    <Snackbar />
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'
import Snackbar from '~/components/snackbar/snackbar'
import { goToWcaAuth, handleLogout } from '~/services/auth'
import sharedService from '~/services/shared'
import { copyToClipboard, openLink } from '~/services/common'

export default {
  components: {
    Snackbar,
  },
  data() {
    return {
      clipped: false,
      drawer: true,
      fixed: true,
      items: [
        {
          icon: 'mdi-home',
          title: 'Home',
          to: '/',
        },
      ],
      navItems: [
        {
          icon: 'mdi-timer',
          title: 'My PBs',
          to: '/my-pbs',
          loginRequired: true,
        },
        {
          icon: 'mdi-account',
          title: 'Users',
          to: '/public-users',
          loginRequired: false,
        },
        {
          icon: 'mdi-star',
          title: 'All PBs',
          to: '/all-pbs',
          loginRequired: false,
        },
      ],

      featureItems: [
        {
          action: 'mdi-star',
          active: true,
          roles: ['ADMIN'],
          permissions: [],
          items: [
            {
              title: 'Users',
              to: '/admin/users',
              roles: ['NORMAL', 'ADMIN'],
              permissions: [],
            },
            {
              title: 'Events',
              to: '/admin/events',
              roles: ['NORMAL', 'ADMIN'],
              permissions: [],
            },
            {
              title: 'PB Types',
              to: '/admin/personalBestClasses',
              roles: ['NORMAL', 'ADMIN'],
              permissions: [],
            },
            {
              title: 'Products',
              to: '/admin/products',
              roles: ['NORMAL', 'ADMIN'],
              permissions: [],
            },
            {
              title: 'PBs',
              to: '/admin/personalBests',
              roles: ['NORMAL', 'ADMIN'],
              permissions: [],
            },
          ],
          title: 'Administration',
        },
      ],
      accountItems: [{ title: 'Settings', to: '/settings', exact: false }],
      miniVariant: false,
    }
  },

  computed: {
    ...mapGetters({
      user: 'auth/user',
    }),

    visibleFeatureGroups() {
      return this.featureItems.filter((item) =>
        this.canSee(item.roles, item.permissions)
      )
    },

    visibleNavItems() {
      return this.navItems.filter(
        (item) => this.$store.getters['auth/user'] || !item.loginRequired
      )
    },

    currentUserProfileRoute() {
      return this.$store.getters['auth/user']
        ? '/user?id=' + this.$store.getters['auth/user'].id
        : null
    },
  },

  methods: {
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
          this.$store.getters['auth/user']?.all_permissions.includes(ele)
        )
      )
    },
    copyIdTokenToClipboard() {
      if (this.$store.getters['auth/token']) {
        copyToClipboard(this, this.$store.getters['auth/token'])
      }
    },

    logout() {
      try {
        this.$router.push('/')

        handleLogout(this)
      } catch (err) {
        sharedService.handleError(err, this.$root)
      }
    },

    getBuildInfo() {
      return (
        'Build ' +
        (process.env.VER ? process.env.VER + ' - ' : '') +
        process.env.build_date
      )
    },
  },
}
</script>
