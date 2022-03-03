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

const HomeShow = props => (
  <Show {...props}>
    <TabbedShowLayout>
      <Tab label='request'>
        <TextField source="id" />
        <TextField source="title" />
        <TextField source="teaser" />
      </Tab>
      <Tab label="Body" path="body">
        <RichTextField
          source="body"
          stripTags={false}
          label=""
          addLabel={false}
        />
      </Tab>
      <Tab label="Comments" path="comments">
        <ReferenceManyField
          addLabel={false}
          reference="comments"
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

export default HomeShow;