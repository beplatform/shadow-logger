import * as React from "react";
import { Admin, Resource } from 'react-admin';
import dataProvider from "./dataProvider/dataProvider";
import Home from "./Views/Home/Home";

const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name='index.json' options={{label: 'Home'}} {...Home} />
  </Admin>
);

export default App;
