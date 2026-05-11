import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';
import { router } from './router';

function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#0F766E', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
        }}
      />
    </Providers>
  );
}

export default App;
