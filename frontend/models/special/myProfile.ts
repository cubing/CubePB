import { UserPublic } from '.'

export const MyProfile = {
  ...UserPublic,
  editOptions: {
    fields: ['is_public'],
  },
}
