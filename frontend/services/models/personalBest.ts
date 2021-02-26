import { getEvents, getProducts, getPersonalBestClasses } from '../dropdown'
import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'
import EditPersonalBestDialog from '~/components/dialog/personalBest/editPersonalBestDialog.vue'

export default <RecordInfo<'personalBest'>>{
  type: 'personalBest',
  name: 'Personal Best',
  icon: 'mdi-timer',
  renderItem: (item) => item.name,
  options: {
    sortBy: ['created_at'],
    sortDesc: [true],
  },
  hasSearch: true,
  filters: [
    {
      field: 'product.id',
      operator: 'eq',
    },
    {
      field: 'id',
      operator: 'eq',
    },
  ],
  fields: {
    id: {
      text: 'ID',
    },
    'pb_class.id': {
      text: 'PB Type',
      parseValue: (val) => Number(val),
      getOptions: getPersonalBestClasses,
      type: 'personalBestClass',
      inputType: 'select',
    },
    'pb_class.name': {
      text: 'PB Type',
    },
    'event.id': {
      text: 'Event',
      parseValue: (val) => Number(val),
      getOptions: getEvents,
      optionsType: 'event',
      inputType: 'autocomplete',
    },
    'event.name': {
      text: 'Event',
    },
    set_size: {
      text: 'Sample Size',
    },
    score: {
      text: 'Score',
    },
    'product.id': {
      text: 'Cube',
      getOptions: getProducts,
      type: 'product',
      inputType: 'server-combobox',
      optional: true,
    },
    'product.name': {
      text: 'Cube',
    },
    time_elapsed: {
      text: 'Time',
      inputRules: [
        (value) => {
          const regEx = /^(\d+:)?\d{1,2}\.\d{2}$/
          return (
            regEx.test(value) || 'Invalid Time Format, must be like 1234:56.78'
          )
        },
      ],
      serialize: (value) => {
        let totalCs = Number(value) / 10

        const minutes = Math.floor(totalCs / (60 * 100))

        totalCs -= minutes * 60 * 100

        const seconds = Math.floor(totalCs / 100)

        totalCs -= seconds * 100

        const cs = totalCs

        return (
          (minutes ? minutes + ':' : '') +
          (minutes ? String(seconds).padStart(2, '0') : seconds) +
          '.' +
          String(cs).substring(0, 2)
        )
      },
      parseValue: (value) => {
        if (typeof value !== 'string') throw new Error('Invalid value')
        const regEx = /^(\d+:)?\d{1,2}\.\d{2}$/
        if (!regEx.test(value)) throw new Error('Invalid value')

        // convert string to number of cs.
        const parts = value.split('.')
        let seconds = 0

        seconds += Number(parts[parts.length - 1]) / 100

        const firstParts = parts[0].split(':')

        if (firstParts.length > 1) {
          seconds += Number(firstParts[0]) * 60 + Number(firstParts[1])
        } else {
          seconds += Number(firstParts[0])
        }
        // round to tens
        return (1000 * Math.floor(seconds * 100)) / 100
      },
    },
    attempts_succeeded: {
      text: 'Total Succeeded',
      default: () => 1,
    },
    attempts_total: {
      text: 'Total Attempts',
      default: () => 1,
    },
    happened_on: {
      text: 'Date Happened',
      inputType: 'datepicker',
    },
    created_at: {
      text: 'Created At',
      component: TimeagoColumn,
    },
    updated_at: {
      text: 'Updated At',
      component: TimeagoColumn,
    },
  },
  addOptions: {
    fields: [
      'event.id',
      'pb_class.id',
      'set_size',
      'time_elapsed',
      'happened_on',
      'attempts_succeeded',
      'attempts_total',
      'product.id',
    ],
    component: EditPersonalBestDialog,
  },
  editOptions: undefined,
  viewOptions: {
    fields: [
      'event.id',
      'pb_class.id',
      'set_size',
      'time_elapsed',
      'happened_on',
      'attempts_succeeded',
      'attempts_total',
      'product.id',
      'score',
    ],
    component: EditPersonalBestDialog,
  },
  deleteOptions: {},
  shareOptions: {
    route: '/personalBests',
  },
  headers: [
    {
      field: 'event.name',
      sortable: false,
      width: '75px',
    },
    {
      field: 'pb_class.name',
      sortable: true,
      width: '100px',
    },
    {
      field: 'set_size',
      sortable: true,
      width: '125px',
    },
    {
      field: 'score',
      sortable: true,
    },
    {
      field: 'happened_on',
      sortable: true,
      width: '150px',
    },
    {
      field: 'created_at',
      width: '150px',
      sortable: true,
    },
    {
      field: 'updated_at',
      width: '150px',
      sortable: true,
    },
  ],
  expandTypes: [],
}
