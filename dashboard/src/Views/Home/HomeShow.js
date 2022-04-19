import React from 'react';
import { Show } from 'react-admin';
import ShowCall from '../ShowCall/ShowCall';

const HomeShow = props => {
  return (
    <Show {...props}>
      <ShowCall />
    </Show>
  );
};

export default HomeShow;
