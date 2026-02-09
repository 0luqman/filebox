import React from 'react';
import { StoreProvider } from './store';
import Layout from './components/Layout';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Layout />
    </StoreProvider>
  );
};

export default App;
