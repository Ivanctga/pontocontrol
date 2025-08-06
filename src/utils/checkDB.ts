// Função para verificar o estado do IndexedDB
export const checkIndexedDB = () => {
  return new Promise((resolve, reject) => {
    // Abre uma conexão com o banco de dados
    const request = indexedDB.open('TimesheetDB');
    
    request.onerror = (event) => {
      console.error('Erro ao abrir o banco de dados:', event);
      reject('Erro ao abrir o banco de dados');
    };
    
    request.onsuccess = (event) => {
      const db = request.result;
      const stores = Array.from(db.objectStoreNames);
      console.log('Object stores disponíveis:', stores);
      
      // Verifica se as stores necessárias existem
      const requiredStores = ['users', 'auth', 'timeEntries', 'schedules', 'settings', 'profileImages'];
      const missingStores = requiredStores.filter(store => !stores.includes(store));
      
      if (missingStores.length > 0) {
        console.error('Stores ausentes:', missingStores);
        reject(`Stores ausentes: ${missingStores.join(', ')}`);
      } else {
        resolve('Todas as stores estão presentes');
      }
      
      // Fecha a conexão
      db.close();
    };
    
    request.onupgradeneeded = (event) => {
      console.log('Upgrade do banco de dados necessário');
      // Isso não deveria acontecer aqui, pois estamos apenas verificando
    };
  });
};