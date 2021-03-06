import { PersonalBest } from '..'

const MyPbs = <any>{
  ...PersonalBest,
  routeName: 'i-view',
  paginationOptions: {
    ...(!!PersonalBest.paginationOptions && PersonalBest.paginationOptions),
  },
  editOptions: {
    fields: ['publicComments', 'product.id'],
    icon: 'mdi-comment-edit',
    text: 'Comments',
  },
  enterOptions: {},
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
      ]
    },
    initialSortOptions: {
      sortBy: ['happenedOn'],
      sortDesc: [true],
    },
  },
]
export { MyPbs }
