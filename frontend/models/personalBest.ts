import { getEvents, getPersonalBestClasses } from '../services/dropdown'
import { flagPersonalBest } from './actions'
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
  routeName: 'a-view',
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
    'event.id+event.name+event.cubingIcon': {
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
          const regEx = /^(\d+:)?([0-5]?\d:)?[0-5]?\d\.\d{2}$/
          return (
            !value ||
            regEx.test(value) ||
            'Invalid Time Format, must be like 12:34:56.78'
          )
        },
      ],
      serialize: serializeTime,
      parseValue: (value) => {
        if (!value) return null
        if (typeof value !== 'string') throw new Error('Invalid value')
        const regEx = /^(\d+:)?([0-5]?\d:)?[0-5]?\d\.\d{2}$/
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
        'Leave this blank to set to current date. To specify the exact date and time, use format: YYYY-MM-DD 1:23:45 PM',
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
      parseValue: (val: string): number => {
        // if falsey, default to current unix timestamp
        if (!val) return new Date().getTime() / 1000

        let dateString = val

        let year, month, day, hours, minutes, seconds

        if (
          !dateString.match(
            /^\d{4}-\d{2}-\d{2}(\s\d{1,2}:\d{2}(:\d{2})?(\s(AM|PM))?)?$/
          )
        ) {
          throw new Error('Invalid date format for Date Happened')
        }

        const dateParts = dateString.split(/-|:|\s/)

        // required
        year = Number(dateParts[0])
        month = Number(dateParts[1]) - 1
        day = Number(dateParts[2])

        // optional
        hours = Number(dateParts[3]) || null
        minutes = Number(dateParts[4]) || null
        seconds = Number(dateParts[5]) || null

        // if PM, add 12 to hours
        if (dateParts[6] === 'PM') hours += 12

        if (hours > 23) throw new Error('Hours cannot be more than 23')

        // if hours missing, automatically append current HH/MM/SS
        if (hours === undefined) {
          const currentDate = new Date()
          hours = currentDate.getHours()
          minutes = currentDate.getMinutes()
          seconds = currentDate.getSeconds()
        }

        const msTimestamp = new Date(
          year,
          month,
          day,
          hours,
          minutes,
          seconds
        ).getTime()

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
    isFlagged: {
      text: 'Is Flagged',
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
      {
        field: 'isFlagged',
        operator: 'eq',
      },
    ],
    headers: [
      {
        field: 'event.id+event.name+event.cubingIcon',
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
    downloadOptions: {
      fields: [
        'event.name',
        'pbClass.name',
        'setSize',
        'timeElapsed',
        'movesCount',
        'attemptsSucceeded',
        'attemptsTotal',
        'event.scoreMethod',
        'score',
        'happenedOn',
        'createdBy.name',
      ],
    },
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
    fields: ['publicComments', 'product.id', 'isFlagged'],
  },
  viewOptions: {
    fields: [
      'event.id+event.name+event.cubingIcon',
      'pbClass.name+setSize',
      'score+timeElapsed+movesCount+attemptsSucceeded+attemptsTotal+event.scoreMethod',
      'ranking',
      'happenedOn',
      'publicComments',
      'product.name',
      'isCurrent',
      'isFlagged',
      'createdBy.name+createdBy.avatar+createdBy.id',
    ],
    component: ViewRecordTableInterface,
  },
  deleteOptions: {},
  shareOptions: {},
  copyOptions: {
    fields: ['event.id', 'pbClass.id', 'setSize'],
    component: EditPersonalBestInterface,
    icon: 'mdi-plus',
    text: 'New PB',
  },

  expandTypes: [],

  customActions: [
    {
      text: 'Flag PB',
      icon: 'mdi-flag',
      handleClick: flagPersonalBest,
    },
  ],
}
