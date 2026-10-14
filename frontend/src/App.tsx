import { Route, Routes } from 'react-router';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ModelPage from './pages/ModelPage';
import ModelsPage from './pages/ModelsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="models" element={<ModelsPage />} />
        <Route path="models/:slug" element={<ModelPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
