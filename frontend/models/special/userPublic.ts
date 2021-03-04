import { User } from '..'
import { PbPublic } from '.'

export const UserPublic = {
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
    fields: ['avatar', 'name', 'email', 'wca_id', 'country'],
  },
  deleteOptions: undefined,

  expandTypes: [
    {
      recordInfo: PbPublic,
      name: 'PBs',
      excludeFilters: ['created_by.id'],
      excludeHeaders: ['created_by.name+created_by.avatar'],
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
        ]
      },
    },
  ],
}
