import React from 'react';
import {
  Datagrid,
  List,
  ShowButton,
	TextField,
	DateField
} from 'react-admin';
import HomeFilters from './HomeFilters';

const HomeList = (({ classes, ...props }) => (
  <List {...props} bulkActionButtons={false} sort={{field: 'time', order: 'DESC'}} filters={<HomeFilters />}>
    <Datagrid>
      <TextField source='id' sortable={false} />
      <DateField source='time' showTime />
      <TextField source='ip'/>
      <TextField source='method'/>
      <TextField source='url'/>
      <TextField source='status'/>
      <ShowButton />
    </Datagrid>
  </List>
));

export default HomeList;
