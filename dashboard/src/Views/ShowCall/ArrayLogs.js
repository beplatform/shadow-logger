import React from 'react';
import { TextField, DateField } from 'react-admin';

const ArrayLogs = (props) => {
  const { data } = props;
  const { logs } = data;

  return (
    <div className='RaTabbedShowLayout-content-57'>
      <span>
        <div className='ra-field ra-field-undefined'>
          <table className='MuiTable-root RaDatagrid-table-62'>
            <thead className='MuiTableHead-root RaDatagrid-thead-63'>
              <tr className='MuiTableRow-root RaDatagrid-row-68 RaDatagrid-headerRow-65 MuiTableRow-head'>
                <th className='MuiTableCell-root MuiTableCell-head RaDatagrid-headerCell-66 MuiTableCell-sizeSmall'>
                  <span>Time</span>
                </th>
                <th className='MuiTableCell-root MuiTableCell-head RaDatagrid-headerCell-66 MuiTableCell-sizeSmall'>
                  <span>Level</span>
                </th>
                <th className='MuiTableCell-root MuiTableCell-head RaDatagrid-headerCell-66 MuiTableCell-sizeSmall'>
                  <span>Message</span>
                </th>
              </tr>
            </thead>
            <tbody className='MuiTableBody-root datagrid-body RaDatagrid-tbody-64'>
              {logs.map((l, i) => {
                const colorBG = l.level === 'error' ? '#ff8a80' : (l.level === 'warn' ? '#ff9800' : '#2196f3')
                return (
                  <tr key={`log_${i}`} className='MuiTableRow-root RaDatagrid-row-68 RaDatagrid-rowEven-70 MuiTableRow-hover' style={{backgroundColor: colorBG}}>
                    <td className='MuiTableCell-root MuiTableCell-body column-time RaDatagrid-rowCell-72 MuiTableCell-sizeSmall'>
                      <DateField source='time' showTime record={l}/>
                    </td>
                    <td className='MuiTableCell-root MuiTableCell-body column-time RaDatagrid-rowCell-72 MuiTableCell-sizeSmall'>
                      <TextField source='level' record={l} />
                    </td>
                    <td className='MuiTableCell-root MuiTableCell-body column-time RaDatagrid-rowCell-72 MuiTableCell-sizeSmall'>
                      <TextField source='msg' record={l}/>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </span>
    </div>
  );
};

export default ArrayLogs;

