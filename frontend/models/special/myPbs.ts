import { PersonalBest } from '..'

export const MyPbs = {
  ...PersonalBest,
  viewRecordRoute: '/pb',
  paginationOptions: {
    ...(!!PersonalBest.paginationOptions && PersonalBest.paginationOptions),
    downloadOptions: undefined,
  },
}
