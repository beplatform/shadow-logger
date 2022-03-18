import React, { Fragment } from 'react';
import { Tab, TabbedShowLayout, TextField, FieldTitle, LoadingPage } from 'react-admin';
import { capitalizeFirstLetter, mapFields } from '../../utils/utils';

const ShowCall = ({record, ...props}) => {
	const { request, response } = record;

	if (!request || !response) {
		return <LoadingPage />
	}

	const requestMap = mapFields('request', request);
	const responseMap = mapFields('response', response);

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
					responseMap.map(({isTitle, ...k}) => {
						if (isTitle)
							return <Fragment key={k.source}><hr/><FieldTitle {...k} /></Fragment>
						return <TextField key={k.source} {...k} />
					})
				}
			</Tab>
			<Tab label='logs'>

			</Tab>
		</TabbedShowLayout>
	);
};

export default ShowCall;