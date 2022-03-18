import apiInstance from "./apiInstance";

const dataProvider = {
  getList: (resource, params) => {
    return apiInstance.get(`/${resource}`);
  },
  getOne: (resource, params) => {
    console.log(resource)
    console.log(params)
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