import { DBConfig } from 'react-indexed-db-hook';

export const indexedDBConfig: DBConfig = {
  name: 'TimesheetDB',
  version: 1,
  objectStoresMeta: [
    {
      store: 'users',
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [
        { name: 'name', keypath: 'name', options: { unique: false } },
        { name: 'email', keypath: 'email', options: { unique: true } },
        { name: 'role', keypath: 'role', options: { unique: false } },
        { name: 'profileImage', keypath: 'profileImage', options: { unique: false } },
        { name: 'createdAt', keypath: 'createdAt', options: { unique: false } },
      ]
    },
    {
      store: 'timeEntries',
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [
        { name: 'userId', keypath: 'userId', options: { unique: false } },
        { name: 'date', keypath: 'date', options: { unique: false } },
        { name: 'type', keypath: 'type', options: { unique: false } },
        { name: 'createdAt', keypath: 'createdAt', options: { unique: false } },
      ]
    },
    {
      store: 'schedules',
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [
        { name: 'userId', keypath: 'userId', options: { unique: false } },
        { name: 'date', keypath: 'date', options: { unique: false } },
        { name: 'type', keypath: 'type', options: { unique: false } },
        { name: 'shift', keypath: 'shift', options: { unique: false } },
        { name: 'createdAt', keypath: 'createdAt', options: { unique: false } },
      ]
    },
    {
      store: 'settings',
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [
        { name: 'projectName', keypath: 'projectName', options: { unique: false } },
        { name: 'regularHoursLimit', keypath: 'regularHoursLimit', options: { unique: false } },
        { name: 'updatedAt', keypath: 'updatedAt', options: { unique: false } },
      ]
    },
    {
      store: 'auth',
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [
        { name: 'email', keypath: 'email', options: { unique: true } },
        { name: 'password', keypath: 'password', options: { unique: false } },
        { name: 'userId', keypath: 'userId', options: { unique: true } },
      ]
    },
    {
      store: 'profileImages',
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [
        { name: 'userId', keypath: 'userId', options: { unique: true } },
        { name: 'imageData', keypath: 'imageData', options: { unique: false } },
        { name: 'updatedAt', keypath: 'updatedAt', options: { unique: false } },
      ]
    }
  ]
};