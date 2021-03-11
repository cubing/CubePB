import { PublicUsers } from '.'

export const MyProfile = {
  ...PublicUsers,
  editOptions: {
    fields: ['is_public'],
  },
}
