import { motion } from 'framer-motion';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Edit3, List, Map, MapPin, Navigation, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { getEntries, getInsights } from '../services/api';

const Container = styled.div`
  min-height: calc(100vh - 80px); /* Account for bottom navigation */
  padding: 20px;
  padding-top: 60px;
  padding-bottom: 100px; /* Extra space for bottom navigation */
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ViewToggle = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: ${props => props.$active ? 'rgba(138, 43, 226, 0.3)' : 'transparent'};
  color: ${props => props.$active ? '#8a2be2' : 'rgba(255, 255, 255, 0.7)'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &:hover {
    background: ${props => props.$active ? 'rgba(138, 43, 226, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$view === 'split' ? '1fr 1fr' : '1fr'};
  gap: 20px;
  min-height: 500px;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PlaceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
`;

const PlaceItem = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(138, 43, 226, 0.2);
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(138, 43, 226, 0.4);
    transform: translateY(-2px);
  }
`;

const PlaceName = styled.h3`
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const PlaceDetails = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 10px;
`;

const PlaceActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 8px;
  background: rgba(138, 43, 226, 0.1);
  color: #8a2be2;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;

  &:hover {
    background: rgba(138, 43, 226, 0.2);
    border-color: rgba(138, 43, 226, 0.5);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  padding: 40px 20px;
  
  h3 {
    color: #ffffff;
    margin-bottom: 10px;
  }
`;

const MapWrapper = styled.div`
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  
  .leaflet-container {
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
  }
  
  .leaflet-tile {
    filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
  }
`;

const MapPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
`;

const CoordinatesInfo = styled.div`
  background: rgba(138, 43, 226, 0.1);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 8px;
  padding: 10px;
  margin-top: 10px;
  font-size: 0.8rem;
  color: #8a2be2;
`;

const LocationStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  margin-bottom: 10px;
  
  &.located {
    color: #4caf50;
  }
  
  &.not-located {
    color: #ff9800;
  }
`;

const Places = () => {
  const [view, setView] = useState('split'); // 'map', 'list', 'split'

  const { data: insights, isLoading: insightsLoading } = useQuery(
    'insights',
    getInsights,
    { retry: false }
  );

  const { data: entries, isLoading: entriesLoading } = useQuery(
    'entries',
    getEntries,
    { retry: false }
  );

  // Filter insights to only show places
  const placeInsights = insights?.filter(insight => 
    insight.category.category_type === 'place'
  ) || [];

  // Get entries with coordinates (geocoded)
  const entriesWithCoordinates = entries?.filter(entry => 
    entry.latitude && entry.longitude
  ) || [];

  // Get entries that have place insights but no coordinates
  const entriesWithPlacesNoCoords = entries?.filter(entry => 
    entry.insights?.some(insight => insight.category.category_type === 'place') &&
    (!entry.latitude || !entry.longitude)
  ) || [];

  // Get entries without places
  const entriesWithoutPlaces = entries?.filter(entry => 
    !entry.insights?.some(insight => insight.category.category_type === 'place')
  ) || [];

  // Create custom marker icon
  const createCustomIcon = (color = '#8a2be2') => {
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0zm0 17c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z" fill="${color}"/>
        </svg>
      `)}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41]
    });
  };

  const handleSetLocation = (placeName) => {
    // TODO: Implement location setting functionality
    console.log('Setting location for:', placeName);
  };

  const handleEditPlace = (placeName) => {
    // TODO: Implement place editing functionality
    console.log('Editing place:', placeName);
  };

  return (
    <Container>
      <Header>
        <Title>
          <MapPin size={24} />
          Places & Locations
        </Title>
        <ViewToggle>
          <ToggleButton 
            $active={view === 'map'} 
            onClick={() => setView('map')}
          >
            <Map size={16} />
            Map
          </ToggleButton>
          <ToggleButton 
            $active={view === 'split'} 
            onClick={() => setView('split')}
          >
            <List size={16} />
            Split
          </ToggleButton>
          <ToggleButton 
            $active={view === 'list'} 
            onClick={() => setView('list')}
          >
            <List size={16} />
            List
          </ToggleButton>
        </ViewToggle>
      </Header>

      <ContentArea $view={view}>
        {(view === 'map' || view === 'split') && (
          <Section>
            <SectionTitle>
              <Map size={20} />
              Map View
            </SectionTitle>
            {entriesWithCoordinates.length === 0 ? (
              <MapPlaceholder>
                <div>
                  <MapPin size={48} />
                  <h3>No Geo-located Places</h3>
                  <p>Places will appear here once they are geo-located by AI</p>
                  <p>Found {placeInsights.length} places, {entriesWithPlacesNoCoords.length} need coordinates</p>
                </div>
              </MapPlaceholder>
            ) : (
              <MapWrapper>
                <MapContainer
                  center={[entriesWithCoordinates[0]?.latitude || 0, entriesWithCoordinates[0]?.longitude || 0]}
                  zoom={entriesWithCoordinates.length === 1 ? 10 : 3}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {entriesWithCoordinates.map((entry) => (
                    <Marker
                      key={entry.id}
                      position={[entry.latitude, entry.longitude]}
                      icon={createCustomIcon(entry.overall_sentiment > 0.3 ? '#4caf50' : entry.overall_sentiment < -0.3 ? '#f44336' : '#8a2be2')}
                    >
                      <Popup>
                        <div style={{ color: '#000', minWidth: '200px' }}>
                          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                            {entry.title || 'Untitled Entry'}
                          </h3>
                          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
                            {entry.location_name}
                          </p>
                          <p style={{ margin: '0 0 8px 0', fontSize: '11px' }}>
                            {entry.content.substring(0, 100)}...
                          </p>
                          <div style={{ fontSize: '10px', color: '#888' }}>
                            {new Date(entry.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </MapWrapper>
            )}
          </Section>
        )}

        {(view === 'list' || view === 'split') && (
          <Section>
            <SectionTitle>
              <List size={20} />
              Places Management
            </SectionTitle>
            
            {entriesWithCoordinates.length > 0 && (
              <>
                <h3 style={{ color: '#4caf50', marginBottom: '15px' }}>
                  Geo-located Places ({entriesWithCoordinates.length})
                </h3>
                <PlaceList>
                  {entriesWithCoordinates.map((entry, index) => (
                    <PlaceItem
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <PlaceName>{entry.location_name || entry.title || 'Untitled Entry'}</PlaceName>
                      <LocationStatus className="located">
                        <Navigation size={16} />
                        Located by AI
                      </LocationStatus>
                      <PlaceDetails>
                        Entry: "{entry.title || 'Untitled Entry'}"
                      </PlaceDetails>
                      <PlaceDetails>
                        Sentiment: {entry.overall_sentiment > 0.3 ? '😊 Positive' : 
                                   entry.overall_sentiment < -0.3 ? '😞 Negative' : '😐 Neutral'}
                      </PlaceDetails>
                      <CoordinatesInfo>
                        📍 {entry.latitude.toFixed(6)}, {entry.longitude.toFixed(6)}
                      </CoordinatesInfo>
                      <PlaceActions>
                        <ActionButton onClick={() => handleEditPlace(entry.location_name)}>
                          <Edit3 size={14} />
                          Edit Location
                        </ActionButton>
                      </PlaceActions>
                    </PlaceItem>
                  ))}
                </PlaceList>
              </>
            )}

            {entriesWithPlacesNoCoords.length > 0 && (
              <>
                <h3 style={{ color: '#ff9800', marginBottom: '15px', marginTop: '30px' }}>
                  Places Needing Coordinates ({entriesWithPlacesNoCoords.length})
                </h3>
                <PlaceList>
                  {entriesWithPlacesNoCoords.map((entry, index) => {
                    const placeInsight = entry.insights?.find(insight => insight.category.category_type === 'place');
                    return (
                      <PlaceItem
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <PlaceName>{placeInsight?.category.name || entry.title || 'Untitled Entry'}</PlaceName>
                        <LocationStatus className="not-located">
                          <MapPin size={16} />
                          Needs Geo-location
                        </LocationStatus>
                        <PlaceDetails>
                          From: "{placeInsight?.text_snippet || entry.content.substring(0, 50)}..."
                        </PlaceDetails>
                        <PlaceDetails>
                          Entry: "{entry.title || 'Untitled Entry'}"
                        </PlaceDetails>
                        <PlaceActions>
                          <ActionButton onClick={() => handleSetLocation(placeInsight?.category.name)}>
                            <MapPin size={14} />
                            Set Location
                          </ActionButton>
                        </PlaceActions>
                      </PlaceItem>
                    );
                  })}
                </PlaceList>
              </>
            )}

            {entriesWithoutPlaces.length > 0 && (
              <>
                <h3 style={{ color: '#ffc107', marginBottom: '15px', marginTop: '30px' }}>
                  Entries Without Places ({entriesWithoutPlaces.length})
                </h3>
                <PlaceList>
                  {entriesWithoutPlaces.slice(0, 5).map((entry, index) => (
                    <PlaceItem
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <PlaceName>{entry.title || 'Untitled Entry'}</PlaceName>
                      <PlaceDetails>
                        {entry.content.substring(0, 100)}...
                      </PlaceDetails>
                      <PlaceActions>
                        <ActionButton onClick={() => handleSetLocation(entry.title)}>
                          <Plus size={14} />
                          Add Place
                        </ActionButton>
                      </PlaceActions>
                    </PlaceItem>
                  ))}
                </PlaceList>
              </>
            )}

            {entriesWithCoordinates.length === 0 && entriesWithPlacesNoCoords.length === 0 && entriesWithoutPlaces.length === 0 && (
              <EmptyState>
                <MapPin size={48} />
                <h3>No Places Found</h3>
                <p>Create some entries and mention places to see them here!</p>
              </EmptyState>
            )}
          </Section>
        )}
      </ContentArea>
    </Container>
  );
};

export default Places;
