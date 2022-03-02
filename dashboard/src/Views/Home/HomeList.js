import React from 'react';
import {
  Datagrid,
  List,
  Responsive,
  ShowButton,
  SimpleList,
	TextField,
	DateField
} from 'react-admin';

const HomeList = (({ classes, ...props }) => (
  <List {...props} sort={{ field: 'published_at', order: 'DESC' }}>
    <Responsive
      small={
        <SimpleList linkType="show" primaryText={record => record.title} />
      }
      medium={
        <Datagrid>
          <TextField source='id'/>
          <DateField source='time' />
          <TextField source='ip'/>
          <TextField source='queryCount'/>
          <TextField source='mailCount'/>
          <TextField source='method'/>
          <TextField source='url'/>
          <TextField source='status'/>
          <ShowButton />
        </Datagrid>
      }
    />
  </List>
));

export default HomeList;