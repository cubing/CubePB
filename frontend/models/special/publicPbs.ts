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
    excludeFilters: ['createdBy.id', 'is_current'],
    excludeHeaders: ['createdBy.name+createdBy.avatar+createdBy.id'],
    lockedFilters: (_that, item) => {
      return [
        {
          field: 'createdBy.id',
          operator: 'eq',
          value: item.createdBy.id,
        },
        {
          field: 'event.id',
          operator: 'eq',
          value: item.event.id,
        },
        {
          field: 'pbClass.id',
          operator: 'eq',
          value: item.pbClass.id,
        },
        {
          field: 'setSize',
          operator: 'eq',
          value: item.setSize,
        },
        {
          field: 'createdBy.isPublic',
          operator: 'eq',
          value: true,
        },
      ]
    },
    initialSortOptions: {
      sortBy: ['happenedOn'],
      sortDesc: [true],
    },
  },
]

export { PublicPbs }
