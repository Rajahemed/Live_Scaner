import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        {/* Placeholder for History and Stock Detail pages */}
      </Routes>
    </Router>
  );
}

export default App;
