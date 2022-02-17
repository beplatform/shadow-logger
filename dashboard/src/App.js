import * as React from "react";
import { Admin, Resource, ListGuesser } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';
import Axios from 'axios';

const dataProvider = jsonServerProvider('http://localhost:3001');

const apiClient = Axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Pragma': 'no-cache',
    'Content-Type': 'application/json; charset=UTF-8',
  }
});

apiClient.interceptors.response.use((response) => {
  console.log(response);
  return {
    ...response,
    total: 5
  };
}, (error) => {
  return Promise.reject(error);
}, {synchronous: true});

const dataProvider2 = {
  getList:    (resource, params) => {
    return apiClient.get(`/${resource}`);
  },
  getOne:     (resource, params) => { return new Promise((resolve, reject) => {resolve('Hi')});},
  getMany:    (resource, params) => { return new Promise((resolve, reject) => {resolve('Hi')});},
  getManyReference: (resource, params) => { return new Promise((resolve, reject) => {resolve('Hi')});},
  create:     (resource, params) => { return new Promise((resolve, reject) => {resolve('Hi')});},
  update:     (resource, params) => { return new Promise((resolve, reject) => {resolve('Hi')});},
  updateMany: (resource, params) => { return new Promise((resolve, reject) => {resolve('Hi')});},
  delete:     (resource, params) => { return new Promise((resolve, reject) => {resolve('Hi')});},
  deleteMany: (resource, params) => { return new Promise((resolve, reject) => {resolve('Hi')});},
}

const App = () => (
  <Admin dataProvider={dataProvider2}>
    <Resource name='index.json' options={{label: 'Home'}} list={ListGuesser} />
  </Admin>
);

export default App;