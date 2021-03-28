import { UserUserFollowLink } from '..'

export const PublicFollows = {
  ...UserUserFollowLink,
  paginationOptions: {
    ...(!!UserUserFollowLink.paginationOptions &&
      UserUserFollowLink.paginationOptions),
    filters: [],
    headers: [
      {
        field: 'user.id+user.name+user.avatar',
        sortable: false,
      },
      {
        field: 'target.id+target.name+target.avatar',
        sortable: false,
      },
      {
        field: 'createdAt',
        width: '150px',
        sortable: true,
      },
    ],
    downloadOptions: undefined,
  },
  addOptions: undefined,
}
