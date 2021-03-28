// Query builder (Typescript version >= 4.1.3 required)
/* const queryResult = executeGiraffeql({
  // Start typing here to get hints
  
}); */

export function executeGiraffeql<Key extends keyof Root>(
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
  /**Date YYYY-MM-DD*/ date: string
  /**ID Field*/ id: number
  /**Regex Field*/ regex: RegExp
  /**Valid JSON*/ json: unknown
  /**Valid JSON as a string*/ jsonString: string
  /**Enum stored as a separate key value*/ userRole: 'NORMAL' | 'NONE' | 'ADMIN'
  /**Enum stored as is*/ userPermission:
    | 'A_A'
    | 'user_x'
    | 'user_get'
    | 'user_getMultiple'
    | 'user_update'
    | 'user_create'
    | 'user_delete'
    | 'personalBest_create'
    | 'product_create'
  /**Enum stored as is*/ scoreMethod: 'STANDARD' | 'FMC' | 'MBLD'
  userSortByKey: 'id' | 'createdAt' | 'updatedAt'
  userGroupByKey: undefined
  eventSortByKey: 'id' | 'createdAt'
  eventGroupByKey: undefined
  productSortByKey: 'id' | 'createdAt'
  productGroupByKey: undefined
  personalBestClassSortByKey: 'id' | 'createdAt'
  personalBestClassGroupByKey: undefined
  personalBestSortByKey:
    | 'id'
    | 'createdAt'
    | 'score'
    | 'event.name'
    | 'pbClass.name'
    | 'setSize'
    | 'timeElapsed'
    | 'happenedOn'
    | 'isCurrent'
  personalBestGroupByKey: undefined
  userUserFollowLinkSortByKey: 'createdAt'
  userUserFollowLinkGroupByKey: undefined
}
/**All Input types*/ export type InputTypes = {
  user: { id?: Scalars['id'] }
  'userFilterByField/id': FilterByField<Scalars['id']>
  'userFilterByField/createdBy.id': FilterByField<Scalars['id']>
  'userFilterByField/createdBy.name': FilterByField<Scalars['string']>
  'userFilterByField/role': FilterByField<Scalars['userRole']>
  'userFilterByField/name': FilterByField<Scalars['string']>
  'userFilterByField/isPublic': FilterByField<Scalars['boolean']>
  'userFilterByField/userUserFollowLink/user.id': FilterByField<Scalars['id']>
  'userFilterByField/userUserFollowLink/target.id': FilterByField<Scalars['id']>
  userFilterByObject: {
    id?: InputTypes['userFilterByField/id']
    'createdBy.id'?: InputTypes['userFilterByField/createdBy.id']
    'createdBy.name'?: InputTypes['userFilterByField/createdBy.name']
    role?: InputTypes['userFilterByField/role']
    name?: InputTypes['userFilterByField/name']
    isPublic?: InputTypes['userFilterByField/isPublic']
    'userUserFollowLink/user.id'?: InputTypes['userFilterByField/userUserFollowLink/user.id']
    'userUserFollowLink/target.id'?: InputTypes['userFilterByField/userUserFollowLink/target.id']
  }
  userPaginator: {
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
    providerId: Scalars['string']
    wcaId?: Scalars['string'] | null
    email: Scalars['string']
    name: Scalars['string']
    avatar?: Scalars['string'] | null
    country?: Scalars['string'] | null
    isPublic?: Scalars['boolean']
    role?: Scalars['userRole']
    permissions?: Scalars['userPermission'][] | null
  }
  updateUserFields: {
    email?: Scalars['string']
    name?: Scalars['string']
    avatar?: Scalars['string'] | null
    country?: Scalars['string'] | null
    isPublic?: Scalars['boolean']
    role?: Scalars['userRole']
    permissions?: Scalars['userPermission'][] | null
  }
  updateUser: {
    item: InputTypes['user']
    fields: InputTypes['updateUserFields']
  }
  socialLogin: {
    provider: Scalars['string']
    code: Scalars['string']
    redirectUri: Scalars['string']
  }
  event: { id?: Scalars['id']; code?: Scalars['string'] }
  'eventFilterByField/id': FilterByField<Scalars['id']>
  'eventFilterByField/createdBy.id': FilterByField<Scalars['id']>
  'eventFilterByField/code': FilterByField<Scalars['string']>
  eventFilterByObject: {
    id?: InputTypes['eventFilterByField/id']
    'createdBy.id'?: InputTypes['eventFilterByField/createdBy.id']
    code?: InputTypes['eventFilterByField/code']
  }
  eventPaginator: {
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
  createEvent: {
    name: Scalars['string']
    code: Scalars['string']
    cubingIcon?: Scalars['string'] | null
    scoreMethod: Scalars['scoreMethod']
  }
  updateEventFields: {
    name?: Scalars['string']
    code?: Scalars['string']
    cubingIcon?: Scalars['string'] | null
    scoreMethod?: Scalars['scoreMethod']
  }
  updateEvent: {
    item: InputTypes['event']
    fields: InputTypes['updateEventFields']
  }
  product: { id?: Scalars['id'] }
  'productFilterByField/id': FilterByField<Scalars['id']>
  'productFilterByField/createdBy.id': FilterByField<Scalars['id']>
  productFilterByObject: {
    id?: InputTypes['productFilterByField/id']
    'createdBy.id'?: InputTypes['productFilterByField/createdBy.id']
  }
  productPaginator: {
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
    item: InputTypes['product']
    fields: InputTypes['updateProductFields']
  }
  personalBestClass: { id?: Scalars['id'] }
  'personalBestClassFilterByField/id': FilterByField<Scalars['id']>
  'personalBestClassFilterByField/createdBy.id': FilterByField<Scalars['id']>
  personalBestClassFilterByObject: {
    id?: InputTypes['personalBestClassFilterByField/id']
    'createdBy.id'?: InputTypes['personalBestClassFilterByField/createdBy.id']
  }
  personalBestClassPaginator: {
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
    setSize?: Scalars['number'] | null
  }
  updatePersonalBestClassFields: {
    name?: Scalars['string']
    description?: Scalars['string'] | null
  }
  updatePersonalBestClass: {
    item: InputTypes['personalBestClass']
    fields: InputTypes['updatePersonalBestClassFields']
  }
  personalBest: { id?: Scalars['id'] }
  'personalBestFilterByField/id': FilterByField<Scalars['id']>
  'personalBestFilterByField/createdBy.id': FilterByField<Scalars['id']>
  'personalBestFilterByField/createdBy.isPublic': FilterByField<
    Scalars['boolean']
  >
  'personalBestFilterByField/product.id': FilterByField<Scalars['id']>
  'personalBestFilterByField/event.id': FilterByField<Scalars['id']>
  'personalBestFilterByField/pbClass.id': FilterByField<Scalars['id']>
  'personalBestFilterByField/happenedOn': FilterByField<
    Scalars['unixTimestamp']
  >
  'personalBestFilterByField/isCurrent': FilterByField<Scalars['boolean']>
  'personalBestFilterByField/setSize': FilterByField<Scalars['number']>
  personalBestFilterByObject: {
    id?: InputTypes['personalBestFilterByField/id']
    'createdBy.id'?: InputTypes['personalBestFilterByField/createdBy.id']
    'createdBy.isPublic'?: InputTypes['personalBestFilterByField/createdBy.isPublic']
    'product.id'?: InputTypes['personalBestFilterByField/product.id']
    'event.id'?: InputTypes['personalBestFilterByField/event.id']
    'pbClass.id'?: InputTypes['personalBestFilterByField/pbClass.id']
    happenedOn?: InputTypes['personalBestFilterByField/happenedOn']
    isCurrent?: InputTypes['personalBestFilterByField/isCurrent']
    setSize?: InputTypes['personalBestFilterByField/setSize']
  }
  personalBestPaginator: {
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
    pbClass: InputTypes['personalBestClass']
    event: InputTypes['event']
    setSize: Scalars['number']
    attemptsSucceeded?: Scalars['number'] | null
    attemptsTotal?: Scalars['number'] | null
    product?: InputTypes['product'] | null
    happenedOn: Scalars['unixTimestamp']
    timeElapsed?: Scalars['number'] | null
    movesCount?: Scalars['number'] | null
  }
  /**Input object for getRepositoryReleases*/ getRepositoryReleases: {
    first: Scalars['number']
  }
  'userUserFollowLinkFilterByField/user.id': FilterByField<Scalars['id']>
  'userUserFollowLinkFilterByField/target.id': FilterByField<Scalars['id']>
  userUserFollowLinkFilterByObject: {
    'user.id'?: InputTypes['userUserFollowLinkFilterByField/user.id']
    'target.id'?: InputTypes['userUserFollowLinkFilterByField/target.id']
  }
  userUserFollowLinkPaginator: {
    first?: Scalars['number']
    last?: Scalars['number']
    after?: Scalars['string']
    before?: Scalars['string']
    sortBy?: Scalars['userUserFollowLinkSortByKey'][]
    sortDesc?: Scalars['boolean'][]
    filterBy?: InputTypes['userUserFollowLinkFilterByObject'][]
    groupBy?: Scalars['userUserFollowLinkGroupByKey'][]
  }
  userUserFollowLink: { id?: Scalars['id'] }
  createUserUserFollowLink: {
    user: InputTypes['user']
    target: InputTypes['user']
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
  userUserFollowLinkEdge: {
    Typename: 'userUserFollowLinkEdge'
    Type: GetType<UserUserFollowLinkEdge>
  }
  userUserFollowLinkPaginator: {
    Typename: 'userUserFollowLinkPaginator'
    Type: GetType<UserUserFollowLinkPaginator>
  }
  userUserFollowLink: {
    Typename: 'userUserFollowLink'
    Type: GetType<UserUserFollowLink>
  }
  userRoleEnumPaginator: {
    Typename: 'userRoleEnumPaginator'
    Type: GetType<UserRoleEnumPaginator>
  }
  scoreMethodEnumPaginator: {
    Typename: 'scoreMethodEnumPaginator'
    Type: GetType<ScoreMethodEnumPaginator>
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
export type UserUserFollowLinkEdge = Edge<UserUserFollowLink>
/**Paginator*/ export type UserUserFollowLinkPaginator = {
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  paginatorInfo: { Type: PaginatorInfo; Args: undefined }
  edges: { Type: UserUserFollowLinkEdge[]; Args: undefined }
}
/**Link type*/ export type UserUserFollowLink = {
  /**The unique ID of the field*/ id: { Type: Scalars['id']; Args: undefined }
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  user: { Type: User; Args: undefined }
  target: { Type: User; Args: undefined }
  /**When the record was created*/ createdAt: {
    Type: Scalars['unixTimestamp']
    Args: undefined
  }
  /**When the record was last updated*/ updatedAt: {
    Type: Scalars['unixTimestamp'] | null
    Args: undefined
  }
  createdBy: { Type: User; Args: undefined }
}
/**EnumPaginator*/ export type UserRoleEnumPaginator = {
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  values: { Type: Scalars['userRole'][]; Args: undefined }
}
/**EnumPaginator*/ export type ScoreMethodEnumPaginator = {
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  values: { Type: Scalars['scoreMethod'][]; Args: undefined }
}
/**User type*/ export type User = {
  /**The unique ID of the field*/ id: { Type: Scalars['id']; Args: undefined }
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  provider: { Type: never; Args: undefined }
  providerId: { Type: never; Args: undefined }
  wcaId: { Type: Scalars['string'] | null; Args: undefined }
  email: { Type: Scalars['string']; Args: undefined }
  name: { Type: Scalars['string']; Args: undefined }
  avatar: { Type: Scalars['string'] | null; Args: undefined }
  country: { Type: Scalars['string'] | null; Args: undefined }
  isPublic: { Type: Scalars['boolean']; Args: undefined }
  role: { Type: Scalars['userRole']; Args: undefined }
  permissions: { Type: Scalars['userPermission'][] | null; Args: undefined }
  allPermissions: { Type: Scalars['userPermission'][]; Args: undefined }
  currentUserFollowing: { Type: Scalars['id'] | null; Args: undefined }
  /**When the record was created*/ createdAt: {
    Type: Scalars['unixTimestamp']
    Args: undefined
  }
  /**When the record was last updated*/ updatedAt: {
    Type: Scalars['unixTimestamp'] | null
    Args: undefined
  }
  createdBy: { Type: User; Args: undefined }
}
/**Authentication type*/ export type Auth = {
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  type: { Type: Scalars['string']; Args: undefined }
  token: { Type: Scalars['string']; Args: undefined }
  expiration: { Type: Scalars['number']; Args: undefined }
  expirationDays: { Type: Scalars['number']; Args: undefined }
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
  cubingIcon: { Type: Scalars['string'] | null; Args: undefined }
  scoreMethod: { Type: Scalars['scoreMethod']; Args: undefined }
  /**When the record was created*/ createdAt: {
    Type: Scalars['unixTimestamp']
    Args: undefined
  }
  /**When the record was last updated*/ updatedAt: {
    Type: Scalars['unixTimestamp'] | null
    Args: undefined
  }
  createdBy: { Type: User; Args: undefined }
}
/**Product Type*/ export type Product = {
  /**The unique ID of the field*/ id: { Type: Scalars['id']; Args: undefined }
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  name: { Type: Scalars['string']; Args: undefined }
  /**When the record was created*/ createdAt: {
    Type: Scalars['unixTimestamp']
    Args: undefined
  }
  /**When the record was last updated*/ updatedAt: {
    Type: Scalars['unixTimestamp'] | null
    Args: undefined
  }
  createdBy: { Type: User; Args: undefined }
}
/**Personal Best Type Type*/ export type PersonalBestClass = {
  /**The unique ID of the field*/ id: { Type: Scalars['id']; Args: undefined }
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  name: { Type: Scalars['string']; Args: undefined }
  description: { Type: Scalars['string'] | null; Args: undefined }
  setSize: { Type: Scalars['number'] | null; Args: undefined }
  /**When the record was created*/ createdAt: {
    Type: Scalars['unixTimestamp']
    Args: undefined
  }
  /**When the record was last updated*/ updatedAt: {
    Type: Scalars['unixTimestamp'] | null
    Args: undefined
  }
  createdBy: { Type: User; Args: undefined }
}
/**Personal Best*/ export type PersonalBest = {
  /**The unique ID of the field*/ id: { Type: Scalars['id']; Args: undefined }
  /**The typename of the record*/ __typename: {
    Type: Scalars['string']
    Args: [Scalars['number']]
  }
  pbClass: { Type: PersonalBestClass; Args: undefined }
  event: { Type: Event; Args: undefined }
  setSize: { Type: Scalars['number']; Args: undefined }
  score: { Type: Scalars['number']; Args: undefined }
  /**The number of successful attempts*/ attemptsSucceeded: {
    Type: Scalars['number'] | null
    Args: undefined
  }
  /**The total number of attempts*/ attemptsTotal: {
    Type: Scalars['number'] | null
    Args: undefined
  }
  product: { Type: Product | null; Args: undefined }
  happenedOn: { Type: Scalars['unixTimestamp']; Args: undefined }
  /**The amount of ms time elapsed for the pb attempt*/ timeElapsed: {
    Type: Scalars['number'] | null
    Args: undefined
  }
  /**The amount of moves used in the pb attempt*/ movesCount: {
    Type: Scalars['number'] | null
    Args: undefined
  }
  isCurrent: { Type: Scalars['boolean']; Args: undefined }
  /**When the record was created*/ createdAt: {
    Type: Scalars['unixTimestamp']
    Args: undefined
  }
  /**When the record was last updated*/ updatedAt: {
    Type: Scalars['unixTimestamp'] | null
    Args: undefined
  }
  createdBy: { Type: User; Args: undefined }
}
/**All Root resolvers*/ export type Root = {
  getUserRoleEnumPaginator: { Type: UserRoleEnumPaginator; Args: undefined }
  getScoreMethodEnumPaginator: {
    Type: ScoreMethodEnumPaginator
    Args: undefined
  }
  getCurrentUser: { Type: User; Args: undefined }
  getUser: { Type: User; Args: InputTypes['user'] }
  getUserPaginator: { Type: UserPaginator; Args: InputTypes['userPaginator'] }
  deleteUser: { Type: User; Args: InputTypes['user'] }
  createUser: { Type: User; Args: InputTypes['createUser'] }
  updateUser: { Type: User; Args: InputTypes['updateUser'] }
  socialLogin: { Type: Auth; Args: [InputTypes['socialLogin']] }
  getEvent: { Type: Event; Args: InputTypes['event'] }
  getEventPaginator: {
    Type: EventPaginator
    Args: InputTypes['eventPaginator']
  }
  deleteEvent: { Type: Event; Args: InputTypes['event'] }
  createEvent: { Type: Event; Args: InputTypes['createEvent'] }
  updateEvent: { Type: Event; Args: InputTypes['updateEvent'] }
  getProduct: { Type: Product; Args: InputTypes['product'] }
  getProductPaginator: {
    Type: ProductPaginator
    Args: InputTypes['productPaginator']
  }
  deleteProduct: { Type: Product; Args: InputTypes['product'] }
  createProduct: { Type: Product; Args: InputTypes['createProduct'] }
  updateProduct: { Type: Product; Args: InputTypes['updateProduct'] }
  getPersonalBestClass: {
    Type: PersonalBestClass
    Args: InputTypes['personalBestClass']
  }
  getPersonalBestClassPaginator: {
    Type: PersonalBestClassPaginator
    Args: InputTypes['personalBestClassPaginator']
  }
  deletePersonalBestClass: {
    Type: PersonalBestClass
    Args: InputTypes['personalBestClass']
  }
  createPersonalBestClass: {
    Type: PersonalBestClass
    Args: InputTypes['createPersonalBestClass']
  }
  updatePersonalBestClass: {
    Type: PersonalBestClass
    Args: InputTypes['updatePersonalBestClass']
  }
  getPersonalBest: { Type: PersonalBest; Args: InputTypes['personalBest'] }
  getPersonalBestPaginator: {
    Type: PersonalBestPaginator
    Args: InputTypes['personalBestPaginator']
  }
  deletePersonalBest: { Type: PersonalBest; Args: InputTypes['personalBest'] }
  createPersonalBest: {
    Type: PersonalBest
    Args: InputTypes['createPersonalBest']
  }
  getRepositoryReleases: {
    Type: Scalars['unknown'][]
    Args: InputTypes['getRepositoryReleases']
  }
  getRepositoryLatestVersion: {
    Type: Scalars['unknown'] | null
    Args: undefined
  }
  getUserUserFollowLinkPaginator: {
    Type: UserUserFollowLinkPaginator
    Args: InputTypes['userUserFollowLinkPaginator']
  }
  deleteUserUserFollowLink: {
    Type: UserUserFollowLink
    Args: InputTypes['userUserFollowLink']
  }
  createUserUserFollowLink: {
    Type: UserUserFollowLink
    Args: InputTypes['createUserUserFollowLink']
  }
}
