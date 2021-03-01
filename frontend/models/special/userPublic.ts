import userRecordInfo from '../user'

export default {
  ...userRecordInfo,
  viewRecordRoute: '/user',
  filters: [],
  editOptions: undefined,
  viewOptions: {
    fields: ['avatar', 'name', 'email', 'wca_id', 'country'],
  },
  deleteOptions: undefined,
  headers: [
    {
      field: 'name+avatar',
      sortable: false,
    },
    {
      field: 'wca_id',
      width: '150px',
      sortable: false,
    },
    {
      field: 'country',
      width: '100px',
      sortable: false,
    },
  ],
}
