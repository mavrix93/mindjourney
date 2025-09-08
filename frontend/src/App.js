import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import Navigation from './components/Navigation';
import ParticleBackground from './components/ParticleBackground';
import CategoryEntries from './pages/CategoryEntries';
import CreateEntry from './pages/CreateEntry';
import EntryDetail from './pages/EntryDetail';
import Home from './pages/Home';
import Map from './pages/Map';
import Places from './pages/Places';
import Timeline from './pages/Timeline';
import Login from './pages/Login';

function RequireAuth({ children }) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContainer = styled.div`
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #16213e 100%);
`;

const MainContent = styled.main`
  position: relative;
  z-index: 1;
  padding-bottom: 80px; /* Space for bottom navigation */
`;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContainer>
          <ParticleBackground />
          <MainContent>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
              <Route path="/timeline" element={<RequireAuth><Timeline /></RequireAuth>} />
              <Route path="/map" element={<RequireAuth><Map /></RequireAuth>} />
              <Route path="/places" element={<RequireAuth><Places /></RequireAuth>} />
              <Route path="/create" element={<RequireAuth><CreateEntry /></RequireAuth>} />
              <Route path="/entry/:id" element={<RequireAuth><EntryDetail /></RequireAuth>} />
              <Route path="/category/:categoryName/:categoryType?" element={<RequireAuth><CategoryEntries /></RequireAuth>} />
            </Routes>
          </MainContent>
          <Navigation />
        </AppContainer>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
