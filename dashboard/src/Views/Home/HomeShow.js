import React from 'react';
import {
  Datagrid,
  DateField,
  ShowButton,
  ReferenceManyField,
  RichTextField,
  Show,
  Tab,
  TabbedShowLayout,
  TextField
} from 'react-admin';
import ShowCall from '../ShowCall/ShowCall';

const HomeShow = props => {
  return (
    <Show {...props}>
      <ShowCall />
    </Show>
  );
  return (
    <Show {...props}>
      <TabbedShowLayout>
        <Tab label='request'>
          <TextField source="id" />
        </Tab>
        <Tab label="response" path="response">
          <RichTextField
            source="response"
            stripTags={false}
            label=""
            addLabel={false}
          />
        </Tab>
        <Tab label="logs" path="logs">
          <ReferenceManyField
            addLabel={false}
            reference="logs"
            target="post_id"
            sort={{ field: 'created_at', order: 'DESC' }}
          >
            <Datagrid>
              <DateField source="created_at" />
              <TextField source="body" />
              <ShowButton />
            </Datagrid>
          </ReferenceManyField>
        </Tab>
      </TabbedShowLayout>
    </Show>
  );
};

export default HomeShow;