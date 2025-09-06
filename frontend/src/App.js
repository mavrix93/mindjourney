import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import styled from 'styled-components';
import Navigation from './components/Navigation';
import ParticleBackground from './components/ParticleBackground';
import CreateEntry from './pages/CreateEntry';
import EntryDetail from './pages/EntryDetail';
import Home from './pages/Home';
import Map from './pages/Map';
import Timeline from './pages/Timeline';

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
              <Route path="/" element={<Home />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/map" element={<Map />} />
              <Route path="/create" element={<CreateEntry />} />
              <Route path="/entry/:id" element={<EntryDetail />} />
            </Routes>
          </MainContent>
          <Navigation />
        </AppContainer>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
