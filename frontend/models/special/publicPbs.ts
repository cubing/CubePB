import { MyPbs } from '.'
import CrudPersonalBestInterface from '~/components/interface/crud/special/crudPersonalBestInterface.vue'
// MyPbs except no delete, edit, or add

const PublicPbs = <any>{
  ...MyPbs,
  paginationOptions: {
    ...MyPbs.paginationOptions,
    interfaceComponent: CrudPersonalBestInterface,
  },

  deleteOptions: undefined,
  addOptions: undefined,
  editOptions: undefined,
  copyOptions: undefined,
  expandTypes: [],
}

PublicPbs.expandTypes = [
  {
    recordInfo: {
      ...(<any>PublicPbs),
    },
    name: 'PB History',
    excludeFilters: ['createdBy.id', 'isCurrent'],
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
