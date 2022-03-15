import * as React from "react";
import { Admin, Resource, ListGuesser } from 'react-admin';
import Axios from 'axios';
import Home from "./Views/Home/Home";

const apiClient = Axios.create({
  baseURL: 'http://localhost:8081/data',
  headers: {
    'Pragma': 'no-cache',
    'Content-Type': 'application/json; charset=UTF-8',
  }
});

apiClient.interceptors.response.use((response) => {
  return {
    ...response,
    total: response.data.length,
  };
}, (error) => {
  return Promise.reject(error);
}, {synchronous: true});

const dataProvider2 = {
  getList: (resource, params) => {
    return apiClient.get(`/${resource}`);
  },
  getOne: (resource, params) => {
    return apiClient.get(`/${resource}`);
  },
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
    <Resource name='index.json' options={{label: 'Home'}} {...Home} />
  </Admin>
);

export default App;
