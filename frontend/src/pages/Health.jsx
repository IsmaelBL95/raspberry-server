// frontend/src/pages/Health.jsx

import { useEffect, useState } from 'react';

export default function Health() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => setData(json))
      .catch(err => setError(err.message));
  }, []);

  if (error) return <pre>{error}</pre>;
  if (!data) return <pre>Cargando...</pre>;

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}