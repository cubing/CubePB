import { format } from 'timeago.js'
import { convertArrayToCSV } from 'convert-array-to-csv'
import { executeGiraffeql } from '~/services/giraffeql'

type StringKeyObject = { [x: string]: any }

export function generateTimeAgoString(unixTimestamp: number | null) {
  if (!unixTimestamp) return 'None'

  return format(unixTimestamp * 1000)
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
    if (err.response && err.response.data.error.message) {
      that.$notifier.showSnackbar({
        message: err.response.data.error.message,
        variant: 'error',
      })
      console.log(err.response.data.error)
    } else {
      that.$notifier.showSnackbar({
        message: err.message,
        variant: 'error',
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

export function goToPage(that, routeName, item, openInNew = false) {
  const routeObject = {
    name: routeName,
    query: {
      id: item.id,
      expand: that.$route.query.expand ?? 0,
    },
  }

  if (openInNew) {
    const routeData = that.$router.resolve(routeObject)
    window.open(routeData.href, '_blank')
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
