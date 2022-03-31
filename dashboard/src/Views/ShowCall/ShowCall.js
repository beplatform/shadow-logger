import React, { Fragment } from 'react';
import { Tab, TabbedShowLayout, TextField, FieldTitle, ArrayField, Datagrid, ReferenceArrayField } from 'react-admin';
import { mapFields } from '../../utils/utils';

const ShowCall = ({record, ...props}) => {
	const { request, response, id } = record;

	const requestMap = request ? mapFields('request', request) : [];
	const responseMap = response ? mapFields('response', response) : [];

	return (
		<TabbedShowLayout>
			<Tab label='request'>
				<TextField source='id' label='Request ID' />
				<hr/>
				{
					requestMap.map(({isTitle, ...k}) => {
						if (isTitle)
							return <Fragment key={k.source}><hr/><FieldTitle {...k} /></Fragment>
						return <TextField key={k.source} {...k} />
					})
				}
			</Tab>
			<Tab label='response'>
				<TextField source='id' label='Request ID' />
				<hr/>
				{
					responseMap.map(({isTitle, isJson, ...k}) => {
						if (isTitle)
							return <Fragment key={k.source}><hr/><FieldTitle {...k} /></Fragment>
						if (isJson)
							return <JsonField key={k.source} {...k} />
						return <TextField key={k.source} {...k} />
					})
				}
			</Tab>
			<Tab label='logs'>
				<ArrayField source='logs'>
					<Datagrid>
						<TextField source='time'/>
						<TextField source='level'/>
						<TextField source='message'/>
					</Datagrid>
				</ArrayField>
			</Tab>
		</TabbedShowLayout>
	);
};

export default ShowCall;