import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { CommandProvider } from './contexts/CommandContext';
import { Layout } from './components/Layout/Layout';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CommandProvider>
        <Layout />
      </CommandProvider>
    </ThemeProvider>
  );
};

export default App;
