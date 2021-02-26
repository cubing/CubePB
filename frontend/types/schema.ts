// Query builder (Typescript version >= 4.1.3 required)
/* const queryResult = executeJomql({
  // Start typing here to get hints
}) */

export function executeJomql<Key extends keyof Root>(
  query: GetQuery<Key>
): GetResponse<Key> {
  let data: any
  return data
}

// scaffolding
export type GetQuery<K extends keyof Root> = K extends never
  ? Partial<Record<K, Queryize<Root[keyof Root]>>>
  : Record<K, Queryize<Root[K]>>

export type GetResponse<K extends keyof Root> = Responseize<Root[K]>

export type GetType<T> = Responseize<Field<T, undefined>>

type Primitive = string | number | boolean | undefined | null

type Field<T, K> = {
  Type: T
  Args: K
}

type Responseize<T> = T extends Field<infer Type, infer Args>
  ? Type extends never
    ? never
    : Type extends (infer U)[]
    ? { [P in keyof U]: Responseize<U[P]> }[]
    : { [P in keyof Type]: Responseize<Type[P]> }
  : never

type Queryize<T> = T extends Field<infer Type, infer Args>
  ? Type extends never
    ? never
    : Type extends Primitive
    ? Args extends undefined // Args is undefined
      ? LookupValue
      : Args extends [infer Arg]
      ? LookupValue | { __args: Arg } // Args is a tuple
      : { __args: Args }
    : Type extends (infer U)[]
    ? Queryize<Field<U, Args>>
    : Args extends undefined // Args is undefined
    ? { [P in keyof Type]?: Queryize<Type[P]> }
    : Args extends [infer Arg]
    ? { [P in keyof Type]?: Queryize<Type[P]> } & {
        __args?: Arg
      }
    : { [P in keyof Type]?: Queryize<Type[P]> } & { __args: Args }
  : never

type LookupValue = true

type Edge<T> = {
  __typename: Field<string, undefined>
  node: Field<T, undefined>
  cursor: Field<string, undefined>
}

export type FilterByField<T> = {
  eq?: T
  neq?: T
  gt?: T
  lt?: T
  in?: T[]
  nin?: T[]
  regex?: Scalars['regex']
}

/**All Scalar values*/ export type Scalars = {
  /**String value*/ string: string
  /**True or False*/ boolean: boolean
  /**Numeric value*/ number: number
  /**Unknown value*/ unknown: unknown
  /**Image URL Field*/ imageUrl: string
  /**UNIX Timestamp (Seconds since Epoch Time)*/ unixTimestamp: number
  /**Valid generic JSON that is stored in database as string*/ jsonAsString: unknown
  /**ID Field*/ id: number
  /**Regex Field*/ regex: RegExp
  /**Enum stored as a separate key value*/ userRole: 'NONE' | 'NORMAL' | 'ADMIN'
  /**Enum stored as is*/ userPermission:
    | 'A_A'
    | 'user_x'
    | 'user_get'
    | 'user_getMultiple'
    | 'user_update'
    | 'user_create'
    | 'user_delete'
  userSortByKey: 'id' | 'created_at' | 'updated_at'
  userGroupByKey: undefined
  eventSortByKey: 'id' | 'created_at'
  eventGroupByKey: undefined
  productSortByKey: 'id' | 'created_at'
  productGroupByKey: undefined
  personalBestClassSortByKey: 'id' | 'created_at'
  personalBestClassGroupByKey: undefined
  personalBestSortByKey: 'id' | 'created_at'
  personalBestGroupByKey: undefined
}
/**All Input types*/ export type InputTypes = {
  getUser: { id?: Scalars['id'] }
  'userFilterByField/id': FilterByField<Scalars['id']>
  'userFilterByField/created_by': FilterByField<Scalars['id']>
  'userFilterByField/created_by.name': FilterByField<Scalars['string']>
  'userFilterByField/role': FilterByField<Scalars['userRole']>
  'userFilterByField/name': FilterByField<Scalars['string']>
  userFilterByObject: {
    id?: InputTypes['userFilterByField/id']
    created_by?: InputTypes['userFilterByField/created_by']
    'created_by.name'?: InputTypes['userFilterByField/created_by.name']
    role?: InputTypes['userFilterByField/role']
    name?: InputTypes['userFilterByField/name']
  }
  getUserPaginator: {
    first?: Scalars['number']
    last?: Scalars['number']
    after?: Scalars['string']
    before?: Scalars['string']
    sortBy?: Scalars['userSortByKey'][]
    sortDesc?: Scalars['boolean'][]
    filterBy?: InputTypes['userFilterByObject'][]
    groupBy?: Scalars['userGroupByKey'][]
    search?: Scalars['string']
  }
  createUser: {
    provider: Scalars['string']
    provider_id: Scalars['string']
    wca_id?: Scalars['string'] | null
    email: Scalars['string']
    name: Scalars['string']
    avatar?: Scalars['string'] | null
    country?: Scalars['string'] | null
    is_public?: Scalars['boolean']
    role?: Scalars['userRole']
    permissions?: Scalars['userPermission'][] | null
  }
  updateUserFields: {
    email?: Scalars['string']
    name?: Scalars['string']
    avatar?: Scalars['string'] | null
    country?: Scalars['string'] | null
    is_public?: Scalars['boolean']
    role?: Scalars['userRole']
    permissions?: Scalars['userPermission'][] | null
  }
  updateUser: {
    item: InputTypes['getUser']
    fields: InputTypes['updateUserFields']
  }
  socialLogin: {
    provider: Scalars['string']
    code: Scalars['string']
    redirect_uri: Scalars['string']
  }
  getEvent: { id?: Scalars['id']; code?: Scalars['string'] }
  'eventFilterByField/id': FilterByField<Scalars['id']>
  'eventFilterByField/created_by': FilterByField<Scalars['id']>
  'eventFilterByField/code': FilterByField<Scalars['string']>
  eventFilterByObject: {
    id?: InputTypes['eventFilterByField/id']
    created_by?: InputTypes['eventFilterByField/created_by']
    code?: InputTypes['eventFilterByField/code']
  }
  getEventPaginator: {
    first?: Scalars['number']
    last?: Scalars['number']
    after?: Scalars['string']
    before?: Scalars['string']
    sortBy?: Scalars['eventSortByKey'][]
    sortDesc?: Scalars['boolean'][]
    filterBy?: InputTypes['eventFilterByObject'][]
    groupBy?: Scalars['eventGroupByKey'][]
    search?: Scalars['string']
  }
  createEvent: { name: Scalars['string']; code: Scalars['string'] }
  updateEventFields: { name?: Scalars['string']; code?: Scalars['string'] }
  updateEvent: {
    item: InputTypes['getEvent']
    fields: InputTypes['updateEventFields']
  }
  getProduct: { id?: Scalars['id'] }
  'productFilterByField/id': FilterByField<Scalars['id']>
  'productFilterByField/created_by': FilterByField<Scalars['id']>
  productFilterByObject: {
    id?: InputTypes['productFilterByField/id']
    created_by?: InputTypes['productFilterByField/created_by']
  }
  getProductPaginator: {
    first?: Scalars['number']
    last?: Scalars['number']
    after?: Scalars['string']
    before?: Scalars['string']
    sortBy?: Scalars['productSortByKey'][]
    sortDesc?: Scalars['boolean'][]
    filterBy?: InputTypes['productFilterByObject'][]
    groupBy?: Scalars['productGroupByKey'][]
    search?: Scalars['string']
  }
  createProduct: { name: Scalars['string'] }
  updateProductFields: { name?: Scalars['string'] }
  updateProduct: {
    item: InputTypes['getProduct']
    fields: InputTypes['updateProductFields']
  }
  getPersonalBestClass: { id?: Scalars['id'] }
  'personalBestClassFilterByField/id': FilterByField<Scalars['id']>
  'personalBestClassFilterByField/created_by': FilterByField<Scalars['id']>
  personalBestClassFilterByObject: {
    id?: InputTypes['personalBestClassFilterByField/id']
    created_by?: InputTypes['personalBestClassFilterByField/created_by']
  }
  getPersonalBestClassPaginator: {
    first?: Scalars['number']
    last?: Scalars['number']
    after?: Scalars['string']
    before?: Scalars['string']
    sortBy?: Scalars['personalBestClassSortByKey'][]
    sortDesc?: Scalars['boolean'][]
    filterBy?: InputTypes['personalBestClassFilterByObject'][]
    groupBy?: Scalars['personalBestClassGroupByKey'][]
    search?: Scalars['string']
  }
  createPersonalBestClass: {
    name: Scalars['string']
    description?: Scalars['string'] | null
  }
  updatePersonalBestClassFields: {
    name?: Scalars['string']
    description?: Scalars['string'] | null
  }
  updatePersonalBestClass: {
    item: InputTypes['getPersonalBestClass']
    fields: InputTypes['updatePersonalBestClassFields']
  }
  getPersonalBest: { id?: Scalars['id'] }
  'personalBestFilterByField/id': FilterByField<Scalars['id']>
  'personalBestFilterByField/created_by': FilterByField<Scalars['id']>
  personalBestFilterByObject: {
    id?: InputTypes['personalBestFilterByField/id']
    created_by?: InputTypes['personalBestFilterByField/created_by']
  }
  getPersonalBestPaginator: {
    first?: Scalars['number']
    last?: Scalars['number']
    after?: Scalars['string']
    before?: Scalars['string']
    sortBy?: Scalars['personalBestSortByKey'][]
    sortDesc?: Scalars['boolean'][]
    filterBy?: InputTypes['personalBestFilterByObject'][]
    groupBy?: Scalars['personalBestGroupByKey'][]
    search?: Scalars['string']
  }
  createPersonalBest: {
    pb_class: InputTypes['getPersonalBestClass']
    event: InputTypes['getEvent']
    set_size: Scalars['number']
    score: Scalars['number']
    attempts_succeeded?: Scalars['number']
    attempts_total?: Scalars['number']
    product?: InputTypes['getProduct'] | null
    happened_on: Scalars['unixTimestamp']
    time_elapsed: Scalars['number']
    show_ms?: Scalars['boolean']
  }
  updatePersonalBestFields: {
    pb_class?: InputTypes['getPersonalBestClass']
    event?: InputTypes['getEvent']
    set_size?: Scalars['number']
    score?: Scalars['number']
    attempts_succeeded?: Scalars['number']
    attempts_total?: Scalars['number']
    product?: InputTypes['getProduct'] | null
    happened_on?: Scalars['unixTimestamp']
    time_elapsed?: Scalars['number']
    show_ms?: Scalars['boolean']
  }
  updatePersonalBest: {
    item: InputTypes['getPersonalBest']
    fields: InputTypes['updatePersonalBestFields']
  }
}
/**All main types*/ export type MainTypes = {
  paginatorInfo: { Typename: 'paginatorInfo'; Type: GetType<PaginatorInfo> }
  userEdge: { Typename: 'userEdge'; Type: GetType<UserEdge> }
  userPaginator: { Typename: 'userPaginator'; Type: GetType<UserPaginator> }
  eventEdge: { Typename: 'eventEdge'; Type: GetType<EventEdge> }
  eventPaginator: { Typename: 'eventPaginator'; Type: GetType<EventPaginator> }
  productEdge: { Typename: 'productEdge'; Type: GetType<ProductEdge> }
  productPaginator: {
    Typename: 'productPaginator'
    Type: GetType<ProductPaginator>
  }
  personalBestClassEdge: {
    Typename: 'personalBestClassEdge'
    Type: GetType<PersonalBestClassEdge>
  }
  personalBestClassPaginator: {
    Typename: 'personalBestClassPaginator'
    Type: GetType<PersonalBestClassPaginator>
  }
  personalBestEdge: {
    Typename: 'personalBestEdge'
    Type: GetType<PersonalBestEdge>
  }
  personalBestPaginator: {
    Typename: 'personalBestPaginator'
    Type: GetType<PersonalBestPaginator>
  }
  userRoleEnumPaginator: {
    Typename: 'userRoleEnumPaginator'
    Type: GetType<UserRoleEnumPaginator>
  }
  user: { Typename: 'user'; Type: GetType<User> }
  auth: { Typename: 'auth'; Type: GetType<Auth> }
  event: { Typename: 'event'; Type: GetType<Event> }
  product: { Typename: 'product'; Type: GetType<Product> }
  personalBestClass: {
    Typename: 'personalBestClass'
    Type: GetType<PersonalBestClass>
  }
  personalBest: { Typename: 'personalBest'; Type: GetType<PersonalBest> }
}
/**PaginatorInfo Type*/ export type PaginatorInfo = {
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  total: { Type: Scalars['number']; Args: undefined }
  count: { Type: Scalars['number']; Args: undefined }
  startCursor: { Type: Scalars['string'] | null; Args: undefined }
  endCursor: { Type: Scalars['string'] | null; Args: undefined }
}
export type UserEdge = Edge<User>
/**Paginator*/ export type UserPaginator = {
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  paginatorInfo: { Type: PaginatorInfo; Args: undefined }
  edges: { Type: UserEdge[]; Args: undefined }
}
export type EventEdge = Edge<Event>
/**Paginator*/ export type EventPaginator = {
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  paginatorInfo: { Type: PaginatorInfo; Args: undefined }
  edges: { Type: EventEdge[]; Args: undefined }
}
export type ProductEdge = Edge<Product>
/**Paginator*/ export type ProductPaginator = {
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  paginatorInfo: { Type: PaginatorInfo; Args: undefined }
  edges: { Type: ProductEdge[]; Args: undefined }
}
export type PersonalBestClassEdge = Edge<PersonalBestClass>
/**Paginator*/ export type PersonalBestClassPaginator = {
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  paginatorInfo: { Type: PaginatorInfo; Args: undefined }
  edges: { Type: PersonalBestClassEdge[]; Args: undefined }
}
export type PersonalBestEdge = Edge<PersonalBest>
/**Paginator*/ export type PersonalBestPaginator = {
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  paginatorInfo: { Type: PaginatorInfo; Args: undefined }
  edges: { Type: PersonalBestEdge[]; Args: undefined }
}
/**EnumPaginator*/ export type UserRoleEnumPaginator = {
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  values: { Type: Scalars['userRole'][]; Args: undefined }
}
/**User type*/ export type User = {
  /**The unique ID of the field*/ id: { Type: Scalars['id']; Args: undefined }
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  provider: { Type: never; Args: undefined }
  provider_id: { Type: never; Args: undefined }
  wca_id: { Type: Scalars['string'] | null; Args: undefined }
  email: { Type: Scalars['string']; Args: undefined }
  name: { Type: Scalars['string']; Args: undefined }
  avatar: { Type: Scalars['string'] | null; Args: undefined }
  country: { Type: Scalars['string'] | null; Args: undefined }
  is_public: { Type: Scalars['boolean']; Args: undefined }
  role: { Type: Scalars['userRole']; Args: undefined }
  permissions: { Type: Scalars['userPermission'][] | null; Args: undefined }
  all_permissions: { Type: Scalars['userPermission'][]; Args: undefined }
  /**When the record was created*/ created_at: {
    Type: Scalars['unixTimestamp']
    Args: undefined
  }
  /**When the record was last updated*/ updated_at: {
    Type: Scalars['unixTimestamp'] | null
    Args: undefined
  }
  created_by: { Type: User; Args: undefined }
}
/**Authentication type*/ export type Auth = {
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  type: { Type: Scalars['string']; Args: undefined }
  token: { Type: Scalars['string']; Args: undefined }
  expiration: { Type: Scalars['number']; Args: undefined }
  expiration_days: { Type: Scalars['number']; Args: undefined }
  user: { Type: User; Args: undefined }
}
/**Event Type*/ export type Event = {
  /**The unique ID of the field*/ id: { Type: Scalars['id']; Args: undefined }
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  name: { Type: Scalars['string']; Args: undefined }
  code: { Type: Scalars['string']; Args: undefined }
  /**When the record was created*/ created_at: {
    Type: Scalars['unixTimestamp']
    Args: undefined
  }
  /**When the record was last updated*/ updated_at: {
    Type: Scalars['unixTimestamp'] | null
    Args: undefined
  }
  created_by: { Type: User; Args: undefined }
}
/**Product Type*/ export type Product = {
  /**The unique ID of the field*/ id: { Type: Scalars['id']; Args: undefined }
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  name: { Type: Scalars['string']; Args: undefined }
  /**When the record was created*/ created_at: {
    Type: Scalars['unixTimestamp']
    Args: undefined
  }
  /**When the record was last updated*/ updated_at: {
    Type: Scalars['unixTimestamp'] | null
    Args: undefined
  }
  created_by: { Type: User; Args: undefined }
}
/**Personal Best Type Type*/ export type PersonalBestClass = {
  /**The unique ID of the field*/ id: { Type: Scalars['id']; Args: undefined }
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  name: { Type: Scalars['string']; Args: undefined }
  description: { Type: Scalars['string'] | null; Args: undefined }
  /**When the record was created*/ created_at: {
    Type: Scalars['unixTimestamp']
    Args: undefined
  }
  /**When the record was last updated*/ updated_at: {
    Type: Scalars['unixTimestamp'] | null
    Args: undefined
  }
  created_by: { Type: User; Args: undefined }
}
/**Personal Best*/ export type PersonalBest = {
  /**The unique ID of the field*/ id: { Type: Scalars['id']; Args: undefined }
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  pb_class: { Type: PersonalBestClass; Args: undefined }
  event: { Type: Event; Args: undefined }
  set_size: { Type: Scalars['number']; Args: undefined }
  score: { Type: Scalars['number']; Args: undefined }
  /**The number of successful attempts*/ attempts_succeeded: {
    Type: Scalars['number']
    Args: undefined
  }
  /**The total number of attempts*/ attempts_total: {
    Type: Scalars['number']
    Args: undefined
  }
  product: { Type: Product | null; Args: undefined }
  happened_on: { Type: Scalars['unixTimestamp']; Args: undefined }
  /**The amount of ms time elapsed for the pb attempt*/ time_elapsed: {
    Type: Scalars['number']
    Args: undefined
  }
  show_ms: { Type: Scalars['boolean']; Args: undefined }
  /**When the record was created*/ created_at: {
    Type: Scalars['unixTimestamp']
    Args: undefined
  }
  /**When the record was last updated*/ updated_at: {
    Type: Scalars['unixTimestamp'] | null
    Args: undefined
  }
  created_by: { Type: User; Args: undefined }
}
/**All Root resolvers*/ export type Root = {
  getUserRoleEnumPaginator: { Type: UserRoleEnumPaginator; Args: undefined }
  getCurrentUser: { Type: User; Args: undefined }
  getUser: { Type: User; Args: InputTypes['getUser'] }
  getUserPaginator: {
    Type: UserPaginator
    Args: InputTypes['getUserPaginator']
  }
  deleteUser: { Type: User; Args: InputTypes['getUser'] }
  createUser: { Type: User; Args: InputTypes['createUser'] }
  updateUser: { Type: User; Args: InputTypes['updateUser'] }
  socialLogin: { Type: Auth; Args: [InputTypes['socialLogin']] }
  getEvent: { Type: Event; Args: InputTypes['getEvent'] }
  getEventPaginator: {
    Type: EventPaginator
    Args: InputTypes['getEventPaginator']
  }
  deleteEvent: { Type: Event; Args: InputTypes['getEvent'] }
  createEvent: { Type: Event; Args: InputTypes['createEvent'] }
  updateEvent: { Type: Event; Args: InputTypes['updateEvent'] }
  getProduct: { Type: Product; Args: InputTypes['getProduct'] }
  getProductPaginator: {
    Type: ProductPaginator
    Args: InputTypes['getProductPaginator']
  }
  deleteProduct: { Type: Product; Args: InputTypes['getProduct'] }
  createProduct: { Type: Product; Args: InputTypes['createProduct'] }
  updateProduct: { Type: Product; Args: InputTypes['updateProduct'] }
  getPersonalBestClass: {
    Type: PersonalBestClass
    Args: InputTypes['getPersonalBestClass']
  }
  getPersonalBestClassPaginator: {
    Type: PersonalBestClassPaginator
    Args: InputTypes['getPersonalBestClassPaginator']
  }
  deletePersonalBestClass: {
    Type: PersonalBestClass
    Args: InputTypes['getPersonalBestClass']
  }
  createPersonalBestClass: {
    Type: PersonalBestClass
    Args: InputTypes['createPersonalBestClass']
  }
  updatePersonalBestClass: {
    Type: PersonalBestClass
    Args: InputTypes['updatePersonalBestClass']
  }
  getPersonalBest: { Type: PersonalBest; Args: InputTypes['getPersonalBest'] }
  getPersonalBestPaginator: {
    Type: PersonalBestPaginator
    Args: InputTypes['getPersonalBestPaginator']
  }
  deletePersonalBest: {
    Type: PersonalBest
    Args: InputTypes['getPersonalBest']
  }
  createPersonalBest: {
    Type: PersonalBest
    Args: InputTypes['createPersonalBest']
  }
  updatePersonalBest: {
    Type: PersonalBest
    Args: InputTypes['updatePersonalBest']
  }
}
