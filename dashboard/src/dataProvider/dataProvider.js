import apiInstance from "./apiInstance";
import queryString from 'query-string';

const dataProvider = {
  getList: (resource, params) => {
    console.log(params)
    const qp = queryString.stringify({
      ...params.pagination,
      ...params.sort,
      ...params.filter
    });
    console.log(qp);
    return apiInstance.get(`/${resource}?${qp}`);
  },
  getOne: (resource, params) => {
    return apiInstance.get(`/${params.id}.json`);
  },
  getMany:    (resource, params) => { return new Promise((resolve, reject) => {resolve('Hi')});},
  getManyReference: (resource, params) => { return new Promise((resolve, reject) => {resolve('Hi')});},
  create:     (resource, params) => { return new Promise((resolve, reject) => {resolve('Hi')});},
  update:     (resource, params) => { return new Promise((resolve, reject) => {resolve('Hi')});},
  updateMany: (resource, params) => { return new Promise((resolve, reject) => {resolve('Hi')});},
  delete:     (resource, params) => { return new Promise((resolve, reject) => {resolve('Hi')});},
  deleteMany: (resource, params) => { return new Promise((resolve, reject) => {resolve('Hi')});},
};

export default dataProvider;