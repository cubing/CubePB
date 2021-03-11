import { PersonalBest } from '..'

const MyPbs = <any>{
  ...PersonalBest,
  viewRecordRoute: '/pb',
  paginationOptions: {
    ...(!!PersonalBest.paginationOptions && PersonalBest.paginationOptions),
    downloadOptions: undefined,
  },
}

MyPbs.expandTypes = [
  {
    recordInfo: {
      ...(<any>MyPbs),
    },
    name: 'PB History',
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
      ]
    },
    initialSortOptions: {
      sortBy: ['happened_on'],
      sortDesc: [true],
    },
  },
]
export { MyPbs }
