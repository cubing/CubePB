import { format } from 'timeago.js'
import { convertArrayToCSV } from 'convert-array-to-csv'
import { executeGiraffeql } from '~/services/giraffeql'
import * as models from '~/models'

type StringKeyObject = { [x: string]: any }

export function getIcon(typename: string) {
  return models[capitalizeString(typename)]?.icon ?? null
}

export function generateTimeAgoString(unixTimestamp: number | null) {
  if (!unixTimestamp) return 'None'

  return format(unixTimestamp * 1000)
}

// unix timestamp to YYYY-MM-DD HH:MM:SS
export function generateDateLocaleString(unixTimestamp: number | null) {
  if (!unixTimestamp) return 'None'

  const dateObject = new Date(unixTimestamp * 1000)

  return `${dateObject.getFullYear()}-${String(
    dateObject.getMonth() + 1
  ).padStart(2, '0')}-${String(dateObject.getDate()).padStart(
    2,
    '0'
  )} ${dateObject.toLocaleTimeString()}`
}

export function capitalizeString(str: string | undefined): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

export async function copyToClipboard(that, content) {
  await navigator.clipboard.writeText(content)
  that.$notifier.showSnackbar({
    message: 'Copied to Clipboard',
    variant: 'success',
  })
}

export function serializeNestedProperty(
  obj: StringKeyObject,
  path: string,
  serializeFn: (value) => unknown
): void {
  const pathArray = path.split(/\./)
  const finalField = pathArray.pop()
  // if no final field, must be a malformed path
  if (!finalField) return
  let currentValue = obj
  for (const prop of pathArray) {
    // if not object, end early
    if (!(currentValue && typeof currentValue === 'object')) {
      return
    }
    currentValue = currentValue[prop]
  }
  currentValue[finalField] = serializeFn(currentValue[finalField])
}

export function getNestedProperty(obj: StringKeyObject, path: string) {
  const pathArray = path.split(/\./)
  let currentValue = obj
  for (const prop of pathArray) {
    // if not object, return null;
    if (!(currentValue && typeof currentValue === 'object')) {
      return null
    }
    currentValue = currentValue[prop]
  }
  return currentValue
}

export function setNestedProperty(
  obj: StringKeyObject,
  path: string,
  value: unknown
): void {
  const pathArray = path.split(/\./)
  const finalField = pathArray.pop()
  // if no final field, must be a malformed path
  if (!finalField) return
  let currentValue = obj
  for (const prop of pathArray) {
    // if not object, end early
    if (!(currentValue && typeof currentValue === 'object')) {
      return
    }
    currentValue = currentValue[prop]
  }
  currentValue[finalField] = value
}

export function isObject(ele: unknown): ele is StringKeyObject {
  return Object.prototype.toString.call(ele) === '[object Object]'
}

export function collapseObject(obj: StringKeyObject): StringKeyObject | null {
  const returnObject = {}
  const nestedFieldsSet: Set<string> = new Set()

  for (const field in obj) {
    if (field.match(/\./)) {
      const firstPart = field.substr(0, field.indexOf('.'))
      const secondPart = field.substr(field.indexOf('.') + 1)

      // if field is set as null, skip
      if (returnObject[firstPart] === null) continue

      // if field not in return object as object, set it
      if (!isObject(returnObject[firstPart])) {
        returnObject[firstPart] = {}
        nestedFieldsSet.add(firstPart)
      }

      // if secondPart is "id", set it to null
      if (secondPart === 'id' && obj[field] === null) {
        returnObject[firstPart] = null
        nestedFieldsSet.delete(firstPart)
        continue
      }

      returnObject[firstPart][secondPart] = obj[field]
      // leaf field, add to obj if not already set
    } else if (!(field in returnObject)) {
      returnObject[field] = obj[field]
    }
  }

  // process the fields that are nested
  nestedFieldsSet.forEach((field) => {
    returnObject[field] = collapseObject(returnObject[field])
  })
  return returnObject
}

export function collapseObjectArray(objArray: StringKeyObject[]) {
  return objArray.map((obj) => collapseObject(obj))
}

export function serializeTime(ms: number | null): string | null {
  if (!ms) return null
  let totalCs = Number(ms) / 10

  const minutes = Math.floor(totalCs / (60 * 100))

  totalCs -= minutes * 60 * 100

  const seconds = Math.floor(totalCs / 100)

  totalCs -= seconds * 100

  const cs = totalCs

  return (
    (minutes ? minutes + ':' : '') +
    (minutes ? String(seconds).padStart(2, '0') : seconds) +
    '.' +
    String(Math.floor(cs)).padStart(2, '0')
  )
}

export function openLink(url: string): void {
  window.open(url)
}

// returns date in YYYY-MM-DD format
export function getCurrentDate(): string {
  return new Date().toISOString().substring(0, 10)
}

export function downloadCSV(
  that,
  dataArray: StringKeyObject[],
  name = 'file'
): void {
  try {
    that.$notifier.showSnackbar({
      message: 'File download started',
      variant: 'success',
    })

    const csvString = convertArrayToCSV(dataArray)

    const link = document.createElement('a')
    const blob = new Blob(['\uFEFF', csvString])
    link.href = window.URL.createObjectURL(blob)
    link.download = name + '.csv'
    link.click()
  } catch (err) {
    handleError(that, err)
  }
}

export function handleError(that, err) {
  if (that) {
    // error thrown by server
    if (err.response && err.response.data.error.message) {
      that.$notifier.showSnackbar({
        message: `${
          err.response.data.error.message
        } at [${err.response.data.error.fieldPath
          .filter((ele) => ele !== '__args')
          .join('-')}]`,
        variant: 'error',
        copyableMessage: JSON.stringify(
          {
            ...err.response.data.error,
            payload: err.response.config.data,
          },
          null,
          2
        ),
      })
      console.log(err.response.data.error)
    } else {
      // error thrown on client side
      that.$notifier.showSnackbar({
        message: err.message,
        variant: 'error',
        copyableMessage: JSON.stringify(
          {
            message: err.message,
            stack: err.stack,
          },
          null,
          2
        ),
      })
      console.log(err)
    }
  } else {
    console.log(err)
  }
}

export function generateRoute(route: string, pageOptions?: any) {
  return (
    route +
    (pageOptions
      ? '?pageOptions=' + encodeURIComponent(btoa(JSON.stringify(pageOptions)))
      : '')
  )
}

// generates a record route based on the recordInfo
export function generateRecordRouteObject(
  typename,
  routeName,
  itemId,
  expandIndex = 0
) {
  if (!routeName) return null

  return {
    name: routeName,
    query: {
      id: itemId,
      expand: expandIndex,
      type: typename,
    },
  }
}

export function goToPage(
  that,
  typename,
  routeName,
  itemId,
  openInNew = false,
  expandIndex = 0
) {
  const routeObject = generateRecordRouteObject(
    typename,
    routeName,
    itemId,
    expandIndex
  )

  if (!routeObject) return

  if (openInNew) {
    window.open(that.$router.resolve(routeObject).href, '_blank')
  } else {
    that.$router.push(routeObject)
  }
}

export function getPaginatorData(that, operation, query, args) {
  return executeGiraffeql(that, <any>{
    [operation]: {
      paginatorInfo: {
        total: true,
        startCursor: true,
        endCursor: true,
      },
      edges: {
        node: query,
        cursor: true,
      },
      __args: args,
    },
  })
}

// executes a giraffeql paginated operation 100 rows at a time until no more results are returned
export async function collectPaginatorData(
  that,
  operation,
  query,
  args = {},
  fetchRows = 100
) {
  let afterCursor: string | undefined

  const allResults: any[] = []

  let hasMore = true
  while (hasMore) {
    const data = <any>await getPaginatorData(that, operation, query, {
      ...args,
      first: fetchRows,
      after: afterCursor,
    })

    afterCursor = data.paginatorInfo.endCursor

    // if results returned is less than fetchRows, no more results
    if (data.edges.length < fetchRows) hasMore = false

    allResults.push(...data.edges.map((ele) => ele.node))
  }

  return allResults
}

export function setInputValue(inputObjectsArray, key, value) {
  const inputObject = inputObjectsArray.find((ele) => ele.field === key)
  if (!inputObject) throw new Error(`Input key not found: '${key}'`)

  inputObject.value = value
}

export function getInputValue(inputObjectsArray, key) {
  const inputObject = inputObjectsArray.find((ele) => ele.field === key)
  if (!inputObject) throw new Error(`Input key not found: '${key}'`)
  return inputObject.value
}

export function getInputObject(inputObjectsArray, key) {
  const inputObject = inputObjectsArray.find((ele) => ele.field === key)
  if (!inputObject) throw new Error(`Input key not found: '${key}'`)
  return inputObject
}

export function convertCSVToJSON(text: string) {
  let p = ''
  let l
  let row = ['']
  const ret = [row]
  let i = 0
  let r = 0
  let s = !0

  for (l of text) {
    if (l === '"') {
      if (s && l === p) row[i] += l
      s = !s
    } else if (l === ',' && s) l = row[++i] = ''
    else if (l === '\n' && s) {
      if (p === '\r') row[i] = row[i].slice(0, -1)
      row = ret[++r] = [(l = '')]
      i = 0
    } else row[i] += l
    p = l
  }
  const objArray: StringKeyObject[] = []
  const headers = ret[0]
  for (let k = 1; k < ret.length; k++) {
    const o = {}
    let hasUndefined = false
    for (let j = 0; j < headers.length; j++) {
      o[headers[j]] = ret[k][j]
      if (ret[k][j] === undefined) hasUndefined = true
    }
    // not pushing rows where at least one column is undefined
    if (!hasUndefined) objArray.push(o)
  }
  return objArray
}
