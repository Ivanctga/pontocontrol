import React, { useEffect, useState } from 'react';
import { checkIndexedDB } from '../utils/checkDB';

const DBChecker: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkDB = async () => {
      try {
        setLoading(true);
        const result = await checkIndexedDB();
        setDbStatus(result as string);
        setError('');
      } catch (err) {
        setError(err as string);
        setDbStatus('');
      } finally {
        setLoading(false);
      }
    };

    checkDB();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Status do IndexedDB</h2>
      {loading ? (
        <p>Verificando banco de dados...</p>
      ) : error ? (
        <div className="text-red-600">
          <p className="font-bold">Erro:</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="text-green-600">
          <p className="font-bold">Status:</p>
          <p>{dbStatus}</p>
        </div>
      )}
    </div>
  );
};

export default DBChecker;