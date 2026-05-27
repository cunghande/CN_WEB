import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { useSelector } from 'react-redux';
import store from './redux/store.js';
import AppRouter from './routes/AppRouter.jsx';

const ThemeBridge = () => {
  const theme = useSelector((state) => state.auth.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  }, [theme]);

  return <AppRouter />;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeBridge />
    </Provider>
  );
}

export default App;
