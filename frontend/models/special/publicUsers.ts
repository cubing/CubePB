import { User } from '..'
import { PublicPbs } from '.'
import ViewPbCardInterface from '~/components/interface/viewPbCardInterface.vue'

export const PublicUsers = {
  ...User,
  viewRecordRoute: 'user',

  editOptions: undefined,
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
      recordInfo: PublicPbs,
      name: 'PBs',
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
    {
      component: ViewPbCardInterface,
      name: 'PB Card',
      icon: 'mdi-card-text',
    },
  ],
}
