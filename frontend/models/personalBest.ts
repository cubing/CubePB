import {
  getEvents,
  getProducts,
  getPersonalBestClasses,
} from '../services/dropdown'
import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'
import UserColumn from '~/components/table/common/userColumn.vue'
import EventColumn from '~/components/table/common/eventColumn.vue'
import { serializeTime } from '~/services/base'
import EditPersonalBestInterface from '~/components/interface/crud/special/editPersonalBestInterface.vue'

export const PersonalBest = <RecordInfo<'personalBest'>>{
  typename: 'personalBest',
  pluralTypename: 'personalBests',
  name: 'Personal Best',
  pluralName: 'Personal Bests',
  icon: 'mdi-timer',
  renderItem: (item) => item.name,
  requiredFields: ['event.id', 'pb_class.id', 'set_size', 'created_by.id'],
  fields: {
    id: {
      text: 'ID',
    },
    'created_by.name+created_by.avatar': {
      text: 'Created By',
      component: UserColumn,
    },
    'pb_class.id': {
      text: 'PB Type',
      parseQueryValue: (val) => Number(val),
      getOptions: getPersonalBestClasses,
      typename: 'personalBestClass',
      inputType: 'select',
    },
    'pb_class.name': {
      text: 'PB Type',
    },
    'event.id': {
      text: 'Event',
      parseQueryValue: (val) => Number(val),
      getOptions: getEvents,
      optionsType: 'event',
      inputType: 'autocomplete',
    },
    'event.name': {
      text: 'Event',
    },
    'event.code': {
      text: 'Event Code',
    },
    'event.name+event.code': {
      text: 'Event',
      component: EventColumn,
    },
    set_size: {
      text: 'Sample Size',
      hint: '# of attempts in your PB. For Avg5, this would be 5.',
    },
    score: {
      text: 'Score',
    },
    'product.id': {
      text: 'Cube',
      getOptions: getProducts,
      typename: 'product',
      inputType: 'server-combobox',
      optional: true,
    },
    'product.name': {
      text: 'Cube',
    },
    'created_by.name': {
      text: 'Created By',
    },
    'created_by.avatar': {
      text: 'Created By',
    },
    time_elapsed: {
      text: 'Time',
      hint: 'Skip this for FMC',
      inputRules: [
        (value) => {
          const regEx = /^(\d+:)?\d{1,2}\.\d{2}$/
          return (
            !value ||
            regEx.test(value) ||
            'Invalid Time Format, must be like 1234:56.78'
          )
        },
      ],
      serialize: serializeTime,
      parseValue: (value) => {
        if (!value) return null
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
        return (1000 * Math.round(seconds * 100)) / 100
      },
    },
    moves_count: {
      text: 'Move Count',
      hint: 'For FMC only',
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
      // default to today.
      default: () => new Date().toISOString().substring(0, 10),
      // unix timestamp to YYYY-MM-DD
      serialize: (val: number) =>
        val && new Date(val * 1000).toISOString().substring(0, 10),
      // YYYY-MM-DD to unix timestamp
      parseValue: (val: string) => val && new Date(val).getTime() / 1000,
    },
    'created_by.id': {
      text: 'Created By',
      inputType: 'server-autocomplete',
      lookupFilters: (_that) => {
        return [
          {
            is_public: {
              eq: true,
            },
          },
        ]
      },
      typename: 'user',
      parseQueryValue: (val) => Number(val),
    },
    'created_by.is_public': {
      text: 'Created By - Public',
    },
    is_current: {
      text: 'Is Current PB',
      inputType: 'switch',
      parseQueryValue: (val) => val === 'true',
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
  paginationOptions: {
    hasSearch: false,

    filters: [
      {
        field: 'event.id',
        operator: 'eq',
      },
      {
        field: 'pb_class.id',
        operator: 'eq',
      },
      {
        field: 'product.id',
        operator: 'eq',
      },
      {
        field: 'created_by.id',
        operator: 'eq',
      },
      {
        field: 'happened_on',
        title: 'Happened After',
        operator: 'gt',
      },
      {
        field: 'happened_on',
        title: 'Happened Before',
        operator: 'lt',
      },
      {
        field: 'is_current',
        operator: 'eq',
      },
      {
        field: 'set_size',
        operator: 'eq',
      },
    ],
    headers: [
      {
        field: 'event.name+event.code',
        sortable: true,
        width: '200px',
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
        align: 'right',
      },
      {
        field: 'time_elapsed',
        sortable: true,
        width: '125px',
        align: 'right',
      },
      {
        field: 'moves_count',
        sortable: false,
        width: '125px',
        align: 'right',
      },
      {
        field: 'attempts_succeeded',
        sortable: false,
        width: '150px',
        align: 'right',
      },
      {
        field: 'attempts_total',
        sortable: false,
        width: '150px',
        align: 'right',
      },
      {
        field: 'happened_on',
        sortable: true,
        width: '150px',
      },
      {
        field: 'created_by.name+created_by.avatar',
        sortable: false,
      },
      {
        field: 'score',
        sortable: true,
        align: 'right',
        width: '200px',
      },
    ],
    downloadOptions: {},
  },

  addOptions: {
    fields: [
      'event.id',
      'pb_class.id',
      'set_size',
      'time_elapsed',
      'moves_count',
      'happened_on',
      'attempts_succeeded',
      'attempts_total',
      'product.id',
    ],
    component: EditPersonalBestInterface,
  },
  editOptions: undefined,
  viewOptions: {
    fields: [
      'event.id',
      'pb_class.id',
      'set_size',
      'time_elapsed',
      'moves_count',
      'happened_on',
      'attempts_succeeded',
      'attempts_total',
      'product.id',
      'score',
      'created_by.name',
    ],
    component: EditPersonalBestInterface,
  },
  deleteOptions: {},
  shareOptions: {},
}
