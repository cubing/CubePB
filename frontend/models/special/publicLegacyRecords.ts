import { LegacyRecord } from '..'

export const PublicLegacyRecords = {
  ...LegacyRecord,
  paginationOptions: {
    ...LegacyRecord.paginationOptions,
    downloadOptions: undefined,
  },
  editOptions: undefined,
  addOptions: undefined,
  deleteOptions: undefined,
  importOptions: undefined,
  viewOptions: {
    fields: [
      'wcaEventId',
      'recordType',
      'numberOfSolves',
      'result',
      'otherEventName',
      'mainCube',
      'eventType',
      'date',
    ],
  },
}
