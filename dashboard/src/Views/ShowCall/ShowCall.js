import React, { useEffect, useState } from 'react';
import { Tab, TabbedShowLayout, TextField, DateField } from 'react-admin';
import dataprovider from '../../dataProvider/dataProvider.js'
import { JsonField } from 'react-admin-json-view';
import ArrayLogs from './ArrayLogs';

const ShowCall = props => {
    const [data, setData] = useState([])

    useEffect(() => {
      dataprovider.getOne(null, { id: props.record.id }).then(res => setData(res.data))
    }, [props.record.id]);

    return (
        <TabbedShowLayout {...props}>
            <Tab label='request'>
                <TextField source='id' label='Request ID' />
                <hr />
                <TextField source='method' label='Method' />
                <DateField source='time' label='Request Time' showTime />
                <TextField source='url' label='URL' />
                <TextField source='ip' label='IP' />
                <JsonField source='headers' label='Headers' addLabel={true} reactJsonOptions={{ name: null, collapsed: false, displayDataTypes: false }} />
                <JsonField source='body' label='Body' addLabel={true} reactJsonOptions={{ name: null, collapsed: false, displayDataTypes: false }} />
            </Tab>
            <Tab label='response'>
                <TextField source='id' label='Request ID' />
                <hr />
                <TextField source='statusCode' label='Status' color='red' />
                <DateField source='time' label='Response Time' showTime />
                {
                    props.record && props.record.body && typeof props.record.body === 'object' ?
                        <JsonField source='body' label='Body' addLabel={true} reactJsonOptions={{ name: null, collapsed: false, displayDataTypes: false }} />
                        :
                        <TextField source='body' label='Body' />
                }
            </Tab>
            <Tab label='logs'>
                <ArrayLogs data={data} />
            </Tab>
        </TabbedShowLayout>
    );
};

export default ShowCall;

