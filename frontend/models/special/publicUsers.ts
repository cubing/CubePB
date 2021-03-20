import { User } from '..'
import { PublicPbs } from '.'

export const PublicUsers = {
  ...User,
  viewRecordRoute: '/user',

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
        field: 'wca_id',
        width: '150px',
        sortable: false,
      },
      {
        field: 'country',
        width: '100px',
        sortable: false,
      },
    ],
    downloadOptions: undefined,
  },
  viewOptions: {
    fields: ['avatar', 'name', 'wca_id', 'country'],
  },
  deleteOptions: undefined,

  expandTypes: [
    {
      recordInfo: PublicPbs,
      name: 'PBs',
      excludeFilters: ['created_by.id', 'is_current'],
      excludeHeaders: ['created_by.name+created_by.avatar+created_by.id'],
      lockedFilters: (_that, item) => {
        return [
          {
            field: 'created_by.id',
            operator: 'eq',
            value: item.id,
          },
          {
            field: 'created_by.is_public',
            operator: 'eq',
            value: true,
          },
          {
            field: 'is_current',
            operator: 'eq',
            value: true,
          },
        ]
      },
    },
  ],
}
