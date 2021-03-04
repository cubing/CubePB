import { PersonalBest } from '..'

export const PbPublic = {
  ...PersonalBest,
  paginationOptions: {
    ...(!!PersonalBest.paginationOptions && PersonalBest.paginationOptions),
    downloadOptions: undefined,
  },
  viewRecordRoute: '/pb',
  deleteOptions: undefined,
  addOptions: undefined,
}
