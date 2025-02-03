import React from 'react';
import { 
  createBrowserRouter,
  RouterProvider,
  Outlet
} from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { CommandProvider } from './contexts/CommandContext';
import {
  Layout,
  CommandInterface,
  TaskHistory,
  Settings
} from './components';
import './styles/global.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    children: [
      {
        index: true,
        element: <CommandInterface />
      },
      {
        path: 'history',
        element: <TaskHistory />
      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  }
]);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CommandProvider>
        <RouterProvider router={router} />
      </CommandProvider>
    </ThemeProvider>
  );
};

export default App;
