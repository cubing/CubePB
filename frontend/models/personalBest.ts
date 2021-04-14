import { getEvents, getPersonalBestClasses } from '../services/dropdown'
import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'
import UserColumn from '~/components/table/common/userColumn.vue'
import EventColumn from '~/components/table/common/eventColumn.vue'
import ResultColumn from '~/components/table/common/resultColumn.vue'
import PbTypeColumn from '~/components/table/common/pbTypeColumn.vue'
import { serializeTime } from '~/services/base'
import EditPersonalBestInterface from '~/components/interface/crud/special/editPersonalBestInterface.vue'
import ViewRecordTableInterface from '~/components/interface/crud/viewRecordTableInterface.vue'

export const PersonalBest = <RecordInfo<'personalBest'>>{
  typename: 'personalBest',
  pluralTypename: 'personalBests',
  name: 'Personal Best',
  pluralName: 'Personal Bests',
  icon: 'mdi-timer',
  renderItem: (item) => item.name,
  requiredFields: ['event.id', 'pbClass.id', 'setSize', 'createdBy.id'],
  fields: {
    id: {
      text: 'ID',
    },
    'createdBy.name+createdBy.avatar+createdBy.id': {
      text: 'Created By',
      compoundOptions: {
        pathPrefix: 'createdBy',
        primaryField: 'createdBy.name',
      },
      component: UserColumn,
    },
    'pbClass.id': {
      text: 'PB Type',
      parseQueryValue: (val) => Number(val),
      getOptions: getPersonalBestClasses,
      typename: 'personalBestClass',
      inputType: 'select',
    },
    'pbClass.name': {
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
    'event.cubingIcon': {
      text: 'Event Icon',
    },
    'event.name+event.cubingIcon': {
      text: 'Event',
      compoundOptions: {
        pathPrefix: 'event',
        primaryField: 'event.name',
      },
      component: EventColumn,
    },
    'pbClass.name+setSize': {
      text: 'PB Type',
      component: PbTypeColumn,
      compoundOptions: {
        primaryField: 'setSize',
      },
    },
    'score+timeElapsed+movesCount+attemptsSucceeded+attemptsTotal+event.scoreMethod': {
      text: 'Result',
      compoundOptions: {
        primaryField: 'score',
      },
      component: ResultColumn,
    },
    'event.scoreMethod': {
      text: 'scoreMethod',
    },
    setSize: {
      text: 'Solve Count',
      hint: '# of solves in your PB. For Avg5, this would be 5.',
      inputRules: [
        (value) => {
          return !value || Number(value) > 1 || 'Must be greater than 1'
        },
      ],
    },
    score: {
      text: 'Score',
    },
    ranking: {
      text: 'Rank',
    },
    'product.id': {
      text: 'Cube',
      // getOptions: getProducts, // not preloading these
      typename: 'product',
      inputType: 'server-combobox',
      optional: true,
    },
    'product.name': {
      text: 'Cube',
    },
    'createdBy.name': {
      text: 'Created By',
    },
    'createdBy.avatar': {
      text: 'Created By',
    },
    timeElapsed: {
      text: 'Time',
      hint: 'Type in the numbers only, the numbers will be auto-formatted',
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

        // convert string to number of ms.
        const parts = value.split('.')

        let ms = 0

        ms += Number(parts[parts.length - 1]) * 10

        const firstParts = parts[0].split(':')

        if (firstParts.length > 1) {
          ms += (Number(firstParts[0]) * 60 + Number(firstParts[1])) * 1000
        } else {
          ms += Number(firstParts[0]) * 1000
        }
        // round to tens
        return 10 * Math.floor(ms / 10)
      },
    },
    movesCount: {
      text: 'Move Count',
      inputRules: [
        (value) => {
          const regEx = /^\d+(\.\d{2})?$/
          return (
            !value ||
            regEx.test(value) ||
            'Invalid format, up to 2 decimal places allowed'
          )
        },
      ],
    },
    attemptsSucceeded: {
      text: 'Total Succeeded',
      default: () => 1,
    },
    attemptsTotal: {
      text: 'Total Attempts',
      default: () => 1,
    },
    happenedOn: {
      text: 'Date Happened',
      optional: true,
      hint:
        'Leave this blank to set to current date. To specify the exact date and time, use format: YYYY-MM-DD 1:23 PM',
      inputType: 'datepicker',
      // default to today.
      /*       default: () => {
        const date = new Date()
        return (
          date.getFullYear() +
          '-' +
          String(date.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(date.getDate()).padStart(2, '0')
        )
      }, */
      // unix timestamp to YYYY-MM-DD
      serialize: (val: number) =>
        val && new Date(val * 1000).toISOString().substring(0, 10),
      // YYYY-MM-DD to unix timestamp
      parseValue: (val: string) => {
        // null or falsey values not allowed
        if (!val) return undefined

        const msTimestamp = new Date(val).getTime()
        // date cannot be to far in the future
        if (msTimestamp > new Date().getTime() + 1000 * 60 * 60 * 24) {
          throw new Error(`Date Happened cannot be in the future`)
        }

        return msTimestamp / 1000
      },
    },
    'createdBy.id': {
      text: 'Created By',
      inputType: 'server-autocomplete',
      lookupFilters: (_that) => {
        return [
          {
            isPublic: {
              eq: true,
            },
          },
        ]
      },
      typename: 'user',
      parseQueryValue: (val) => Number(val),
    },
    'createdBy.isPublic': {
      text: 'Created By - Public',
    },
    isCurrent: {
      text: 'Is Current PB',
      inputType: 'switch',
      parseQueryValue: (val) => val === 'true',
    },
    'createdBy.userUserFollowLink/user.id': {},
    publicComments: {
      text: 'Public Comments',
      inputType: 'textarea',
      hint: 'You can add free-form solve reconstruction or other notes here',
    },
    createdAt: {
      text: 'Created At',
      component: TimeagoColumn,
    },
    updatedAt: {
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
        field: 'pbClass.id',
        operator: 'eq',
      },
      {
        field: 'setSize',
        operator: 'eq',
      },
      {
        field: 'product.id',
        operator: 'eq',
      },
      {
        field: 'createdBy.id',
        operator: 'eq',
      },
      {
        field: 'happenedOn',
        title: 'Happened After',
        operator: 'gt',
      },
      {
        field: 'happenedOn',
        title: 'Happened Before',
        operator: 'lt',
      },
      {
        field: 'isCurrent',
        operator: 'eq',
      },
    ],
    headers: [
      {
        field: 'event.name+event.cubingIcon',
        width: '200px',
      },
      {
        field: 'pbClass.name+setSize',
        width: '150px',
      },
      {
        field:
          'score+timeElapsed+movesCount+attemptsSucceeded+attemptsTotal+event.scoreMethod',
        sortable: true,
        width: '150px',
        align: 'right',
      },
      {
        field: 'happenedOn',
        sortable: true,
      },
      {
        field: 'createdBy.name+createdBy.avatar+createdBy.id',
        sortable: false,
      },
    ],
    downloadOptions: {},
  },

  addOptions: {
    fields: [
      'event.id',
      'pbClass.id',
      'setSize',
      'timeElapsed',
      'movesCount',
      'happenedOn',
      'attemptsSucceeded',
      'attemptsTotal',
      'product.id',
      'publicComments',
    ],
    component: EditPersonalBestInterface,
  },
  editOptions: {
    fields: ['publicComments', 'product.id'],
  },
  viewOptions: {
    fields: [
      'event.name+event.cubingIcon',
      'pbClass.name+setSize',
      'score+timeElapsed+movesCount+attemptsSucceeded+attemptsTotal+event.scoreMethod',
      'ranking',
      'happenedOn',
      'publicComments',
      'product.name',
      'isCurrent',
      'createdBy.name+createdBy.avatar+createdBy.id',
    ],
    component: ViewRecordTableInterface,
  },
  deleteOptions: {},
  shareOptions: {},
  copyOptions: {
    fields: ['event.id', 'pbClass.id', 'setSize'],
    component: EditPersonalBestInterface,
  },

  expandTypes: [],
}
