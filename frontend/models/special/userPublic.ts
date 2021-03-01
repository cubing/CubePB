import { User, PersonalBest } from '..'

export const UserPublic = {
  ...User,
  viewRecordRoute: '/user',
  filters: [],
  editOptions: undefined,
  viewOptions: {
    fields: ['avatar', 'name', 'email', 'wca_id', 'country'],
  },
  deleteOptions: undefined,
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
  expandTypes: [
    {
      recordInfo: PersonalBest,
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
        ]
      },
    },
  ],
}
