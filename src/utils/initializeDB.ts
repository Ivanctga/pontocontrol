import { indexedDBConfig } from '../config/indexedDB';

export const initializeDB = () => {
  return new Promise((resolve, reject) => {
    // Verifica se o banco de dados já existe
    const request = indexedDB.open('TimesheetDB');
    
    request.onerror = (event) => {
      console.error('Erro ao abrir o banco de dados:', event);
      reject('Erro ao abrir o banco de dados');
    };
    
    request.onsuccess = (event) => {
      const db = request.result;
      const stores = Array.from(db.objectStoreNames);
      console.log('Object stores existentes:', stores);
      
      // Verifica se todas as stores necessárias existem
      const requiredStores = indexedDBConfig.objectStoresMeta.map(store => store.store);
      const missingStores = requiredStores.filter(store => !stores.includes(store));
      
      if (missingStores.length > 0) {
        console.warn('Stores ausentes, recriando o banco de dados:', missingStores);
        // Fecha a conexão atual
        db.close();
        
        // Incrementa a versão do banco de dados para forçar a recriação
        const deleteRequest = indexedDB.deleteDatabase('TimesheetDB');
        
        deleteRequest.onsuccess = () => {
          console.log('Banco de dados excluído com sucesso, recriando...');
          // Recria o banco de dados com todas as stores
          const newRequest = indexedDB.open('TimesheetDB', indexedDBConfig.version);
          
          newRequest.onupgradeneeded = (event) => {
            const db = newRequest.result;
            
            // Cria todas as object stores
            indexedDBConfig.objectStoresMeta.forEach(storeMeta => {
              if (!db.objectStoreNames.contains(storeMeta.store)) {
                const objectStore = db.createObjectStore(
                  storeMeta.store,
                  storeMeta.storeConfig
                );
                
                // Adiciona os índices
                storeMeta.storeSchema.forEach(schema => {
                  objectStore.createIndex(
                    schema.name,
                    schema.keypath || schema.name,
                    schema.options
                  );
                });
              }
            });
          };
          
          newRequest.onsuccess = () => {
            console.log('Banco de dados recriado com sucesso');
            resolve('Banco de dados inicializado com sucesso');
          };
          
          newRequest.onerror = (event) => {
            console.error('Erro ao recriar o banco de dados:', event);
            reject('Erro ao recriar o banco de dados');
          };
        };
        
        deleteRequest.onerror = (event) => {
          console.error('Erro ao excluir o banco de dados:', event);
          reject('Erro ao excluir o banco de dados');
        };
      } else {
        console.log('Todas as stores já existem');
        db.close();
        resolve('Banco de dados já inicializado');
      }
    };
  });
};