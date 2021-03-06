import axios from 'axios'
import Cookie from 'js-cookie'
// import { pusher } from './pusher'
import { Root, GetQuery, GetResponse } from '~/types/schema'

const prodResource = axios.create({
  baseURL: process.env.apiUrl,
})

export async function executeGiraffeql<Key extends keyof Root>(
  _that,
  query: GetQuery<Key>
): Promise<GetResponse<Key>> {
  // fetches the idToken directly from the cookies, if available
  const idToken = Cookie.get('auth-token')

  const request = idToken
    ? {
        headers: {
          Authorization: 'Bearer ' + idToken,
        },
      }
    : undefined

  const { data } = await prodResource.post('/giraffeql', query, request)

  return data.data
}

export async function executeGiraffeqlSubscription(_that, query, _callbackFn) {
  // fetches the idToken directly from the cookies, if available
  const idToken = Cookie.get('auth-token')

  const request = idToken
    ? {
        headers: {
          Authorization: 'Bearer ' + idToken,
        },
      }
    : undefined

  const { data } = await prodResource.post('/giraffeql', query, request)

  // const channel = pusher.subscribe(data.data.channel_name)

  // channel.bind('subscription-data', callbackFn)

  return data.data.channel_name
}
