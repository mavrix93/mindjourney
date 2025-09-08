import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
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
import Faces from './pages/Faces';

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
  background: radial-gradient(1200px circle at 10% 10%, rgba(110, 86, 207, 0.12), transparent 40%),
              radial-gradient(1000px circle at 90% 20%, rgba(30, 144, 255, 0.10), transparent 40%),
              linear-gradient(180deg, #0b0b0b 0%, #0f0f10 100%);
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
              <Route path="/places" element={<Places />} />
              <Route path="/faces" element={<Faces />} />
              <Route path="/create" element={<CreateEntry />} />
              <Route path="/entry/:id" element={<EntryDetail />} />
              <Route path="/category/:categoryName/:categoryType?" element={<CategoryEntries />} />
            </Routes>
          </MainContent>
          <Navigation />
        </AppContainer>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
