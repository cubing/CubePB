import { MyPbs } from '.'

// MyPbs except no delete or add

const PublicPbs = <any>{
  ...MyPbs,
  deleteOptions: undefined,
  addOptions: undefined,
  expandTypes: undefined,
}

PublicPbs.expandTypes = [
  {
    recordInfo: {
      ...(<any>PublicPbs),
    },
    name: 'PB History',
    excludeFilters: ['created_by.id', 'is_current'],
    excludeHeaders: ['created_by.name+created_by.avatar'],
    lockedFilters: (_that, item) => {
      return [
        {
          field: 'created_by.id',
          operator: 'eq',
          value: item.created_by.id,
        },
        {
          field: 'event.id',
          operator: 'eq',
          value: item.event.id,
        },
        {
          field: 'pb_class.id',
          operator: 'eq',
          value: item.pb_class.id,
        },
        {
          field: 'set_size',
          operator: 'eq',
          value: item.set_size,
        },
        {
          field: 'created_by.is_public',
          operator: 'eq',
          value: true,
        },
      ]
    },
    initialSortOptions: {
      sortBy: ['happened_on'],
      sortDesc: [true],
    },
  },
]

export { PublicPbs }
