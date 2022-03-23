import React from 'react';
import { AutocompleteArrayInput, CardActions, Filter, SelectField, SelectInput, TextInput } from 'react-admin';

const HomeFilters = (props) => {
	const methods = [
		{id: 'get', name: 'GET'},
		{id: 'post', name: 'POST'},
		{id: 'patch', name: 'PATCH'},
		{id: 'delete', name: 'DELETE'},
		{id: 'options', name: 'OPTIONS'}
	];
	return (
		<Filter {...props}>
			<TextInput label='URL' source='url' alwaysOn />
			<AutocompleteArrayInput source='method' choices={methods} alwaysOn allowEmpty />
			<TextInput label='Status' source='status' alwaysOn />
		</Filter>
	);
};

export default HomeFilters;