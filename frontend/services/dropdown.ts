import { executeGiraffeql } from '~/services/Giraffeql'

function memoize(memoizedFn) {
  const cache = {}

  return function () {
    // first arg is always gonna be that, so we will exclude it
    const [that, forceReload, ...otherArgs] = arguments
    const args = JSON.stringify(otherArgs)
    cache[args] = forceReload
      ? memoizedFn(that, false, ...otherArgs)
      : cache[args] || memoizedFn(that, false, ...otherArgs)
    return cache[args]
  }
}

export const getEvents = memoize(async function (that, _forceReload = false) {
  const data = await executeGiraffeql<'getEventPaginator'>(that, {
    getEventPaginator: {
      edges: {
        node: {
          id: true,
          name: true,
          scoreMethod: true,
        },
      },
      __args: {
        first: 100,
      },
    },
  })

  return data.edges.map((edge) => edge.node)
})

export const getProducts = memoize(async function (that, _forceReload = false) {
  const data = await executeGiraffeql<'getProductPaginator'>(that, {
    getProductPaginator: {
      edges: {
        node: {
          id: true,
          name: true,
        },
      },
      __args: {
        first: 100,
      },
    },
  })

  return data.edges.map((edge) => edge.node)
})

export const getPersonalBestClasses = memoize(async function (
  that,
  _forceReload = false
) {
  const data = await executeGiraffeql<'getPersonalBestClassPaginator'>(that, {
    getPersonalBestClassPaginator: {
      edges: {
        node: {
          id: true,
          name: true,
          setSize: true,
        },
      },
      __args: {
        first: 100,
      },
    },
  })

  return data.edges.map((edge) => edge.node)
})

export const getUserRoles = memoize(async function (
  that,
  _forceReload = false
) {
  const data = await executeGiraffeql<'getUserRoleEnumPaginator'>(that, {
    getUserRoleEnumPaginator: {
      values: true,
    },
  })

  return data.values
})

export const getScoreMethods = memoize(async function (
  that,
  _forceReload = false
) {
  const data = await executeGiraffeql<'getScoreMethodEnumPaginator'>(that, {
    getScoreMethodEnumPaginator: {
      values: true,
    },
  })

  return data.values
})

export const getBooleanOptions = memoize(function (
  _that,
  _forceReload = false
) {
  return Promise.resolve([true, false])
})

export const getNullOptions = memoize(function (_that, _forceReload = false) {
  return Promise.resolve([
    { id: '__null', name: 'None' },
    { id: null, name: 'Any' },
  ])
})
