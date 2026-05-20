import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store.js';
import AppRouter from './routes/AppRouter.jsx';

function App() {
  return (
    <Provider store={store}>
      <AppRouter />
    </Provider>
  );
}

export default App;
