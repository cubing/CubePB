import { User } from '..'
import { PublicPbs } from './publicPbs'
import ViewPbCardInterface from '~/components/interface/viewPbCardInterface.vue'

export const MyProfile = {
  ...User,
  routeName: 'i-view',
  editOptions: {
    fields: ['isPublic'],
  },
  paginationOptions: {
    ...(!!User.paginationOptions && User.paginationOptions),
    filters: [],
    headers: [
      {
        field: 'name+avatar',
        sortable: false,
      },
      {
        field: 'wcaId',
        width: '150px',
        sortable: false,
      },
      {
        field: 'country',
        width: '100px',
        sortable: false,
      },
      {
        field: 'createdAt',
        width: '150px',
        sortable: true,
      },
    ],
    downloadOptions: undefined,
  },
  viewOptions: {
    ...(!!User.viewOptions && User.viewOptions),
    fields: ['avatar', 'name', 'wcaId', 'country', 'currentUserFollowing'],
  },
  deleteOptions: undefined,

  expandTypes: [
    {
      component: ViewPbCardInterface,
      recordInfo: PublicPbs,
      name: 'PB Card',
      icon: 'mdi-card-text',
      lockedFilters: (_that, item) => {
        return [
          {
            field: 'createdBy.id',
            operator: 'eq',
            value: item.id,
          },
          {
            field: 'createdBy.isPublic',
            operator: 'eq',
            value: true,
          },
        ]
      },
    },
    {
      recordInfo: PublicPbs,
      name: 'All PBs',
      excludeFilters: ['createdBy.id', 'isCurrent'],
      excludeHeaders: ['createdBy.name+createdBy.avatar+createdBy.id'],
      lockedFilters: (_that, item) => {
        return [
          {
            field: 'createdBy.id',
            operator: 'eq',
            value: item.id,
          },
          {
            field: 'createdBy.isPublic',
            operator: 'eq',
            value: true,
          },
          {
            field: 'isCurrent',
            operator: 'eq',
            value: true,
          },
        ]
      },
    },
  ],
}
