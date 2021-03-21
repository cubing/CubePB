import { InputTypes, MainTypes, FilterByField } from '~/types/schema'

export type RecordInfo<T extends keyof MainTypes> = {
  // name of the type
  typename: T
  pluralTypename: string
  name: string
  pluralName: string
  // route that shareUrl and enterItem should be based off
  viewRecordRoute?: string
  icon?: string
  // how to render the item as a string
  renderItem?: (item) => string

  // fields that must always be requested when fetching the specific item and multiple items, along with the id field. could be for certain rendering purposes
  requiredFields?: string[]

  // all of the "known" fields of the type. could be nested types (not included in type hints)
  fields?: {
    [K in keyof MainTypes[T]['Type']]?: {
      text?: string
      // hint field for helping the user to fill out the field
      hint?: string
      icon?: string
      inputType?:
        | 'html'
        | 'single-image'
        | 'multiple-image'
        | 'key-value-array'
        | 'avatar'
        | 'datepicker'
        | 'switch'
        | 'textarea'
        | 'combobox' // combobox allows the user to add new inputs on the fly (will change to autocomplete in filter interfaces)
        | 'server-combobox' // server-combobox allows the user to add new inputs on the fly with getOptions optional, and fetching results from server (will change to autocomplete in filter interfaces)
        | 'autocomplete' // same as combobox but cannot add new inputs
        | 'server-autocomplete' // if there's lots of entries, may not want to fetch all of the entries at once. getOptions will be optional
        | 'select' // standard select
      inputRules?: any[]
      getOptions?: (that) => Promise<any[]>
      typename?: string
      // filters that should be applied when looking up results (server-X input type)
      lookupFilters?: (that) => any[]

      // is the field hidden? if yes, won't fetch it for edit fields
      hidden?: boolean
      // is the field nullable? if so, we will add some text saying that to the input
      optional?: boolean
      default?: (that) => unknown
      // fetching from API, in editRecordInterface (when editing/viewing)
      serialize?: (val: MainTypes[T]['Type'][K]) => unknown
      // submitting to API, in filterBy and create/update functions
      parseValue?: (val: unknown) => unknown
      // for crudRecordPage. parsing the query params
      parseQueryValue?: (val: unknown) => unknown
      component?: any // component for rendering the field in table
    }
  }

  // options related to viewing multiple, if possible
  paginationOptions?: {
    // does the interface have a search bar?
    hasSearch: `${T}Paginator` extends keyof InputTypes
      ? 'search' extends keyof InputTypes[`${T}Paginator`]
        ? boolean
        : false
      : false
    // all of the possible usable filters
    filters: `${T}FilterByObject` extends keyof InputTypes
      ? RecordFilter<InputTypes[`${T}FilterByObject`]>[]
      : []

    // the headers of the table
    headers: {
      field: keyof MainTypes[T]['Type']
      width?: string
      sortable: boolean
      align?: string
    }[]
    // special options for overriding the action header element
    headerActionOptions?: {
      text?: string
      width?: string
    }
    handleRowClick?: (that, item) => void
    // custom component
    interfaceComponent?: any
    // can the results be downloaded?
    downloadOptions?: {}
  }

  addOptions?: {
    // required: fields that can be added
    fields: string[]
    // custom component
    component?: any
    // if not createX, the custom create operation name
    operationName?: string
  }

  editOptions?: {
    // required: fields that can be added
    fields: string[]
    // custom component
    component?: any
    // if not createX, the custom create operation name
    operationName?: string
  }

  deleteOptions?: {
    // no fields when deleting
    // custom component
    component?: any
    // if not createX, the custom create operation name
    operationName?: string
  }

  viewOptions?: {
    // required: fields that can be added
    fields: string[]
    // custom component
    component?: any
    // if not createX, the custom create operation name
    // currently must use getX
    // operationName?: string
  }

  shareOptions?: {
    // custom component
    component?: any
  }

  enterOptions?: {}

  expandTypes?: {
    recordInfo: RecordInfo<any>
    // name for the expandType, otherwise recordInfo.name will be used
    name?: string
    // function that will replace the lockedSubFilters() computed property in crud.js if provided
    lockedFilters?: (that, item) => FilterObject[]
    // headers fields that should not be shown
    excludeHeaders?: string[]
    // filter fields that should not be shown (however, they can still be manipulated in a custom component file)
    excludeFilters?: string[]
    // initial filters that should be loaded into the nested component
    initialFilters?: FilterObject[]

    // initial sort options that should be applied to nested component
    initialSortOptions?: {
      sortBy: string[]
      sortDesc: boolean[]
    }
  }[]
}

type FilterObject = {
  field: string
  title?: string
  operator: string
  value: any
}

type RecordFilter<T> = {
  field: keyof T
  operator: keyof FilterByField<any>
}
