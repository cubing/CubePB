import { PublicUsers } from '.'

export const MyProfile = {
  ...PublicUsers,
  editOptions: {
    fields: ['isPublic'],
  },
}
