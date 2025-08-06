import { initDB } from 'react-indexed-db-hook';
import { indexedDBConfig } from './config/indexedDB';
import { initializeDB } from './utils/initializeDB';

// Inicializa o banco de dados IndexedDB
initDB(indexedDBConfig);

// Verifica e garante que todas as object stores existam
initializeDB()
  .then(result => console.log(result))
  .catch(error => console.error('Erro ao inicializar o banco de dados:', error));