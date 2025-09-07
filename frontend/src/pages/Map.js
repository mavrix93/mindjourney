import { motion } from 'framer-motion';
import L from 'leaflet';
import { Filter, Layers, MapPin } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { getInsights, getSentimentSummary } from '../services/api';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const FilterButton = styled(motion.button)`
  background: rgba(138, 43, 226, 0.2);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  padding: 10px 15px;
  color: #8a2be2;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  
  &:hover {
    background: rgba(138, 43, 226, 0.3);
  }
`;

const MapWrapper = styled.div`
  height: calc(100vh - 200px);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(138, 43, 226, 0.3);
  box-shadow: 0 0 20px rgba(138, 43, 226, 0.2);
`;

const Legend = styled(motion.div)`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  padding: 15px;
  z-index: 1000;
`;

const LegendTitle = styled.h3`
  color: #ffffff;
  font-size: 0.9rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const StatsPanel = styled(motion.div)`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  padding: 15px;
  z-index: 1000;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatValue = styled.span`
  color: #8a2be2;
  font-weight: 600;
`;

const NoPlacesMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  
  h3 {
    color: #ffffff;
    margin: 20px 0 10px 0;
    font-size: 1.5rem;
  }
  
  p {
    max-width: 400px;
    line-height: 1.6;
  }
`;

// Custom marker component with sentiment-based colors
const SentimentMarker = ({ insight, position }) => {
  const getMarkerColor = (sentiment) => {
    if (sentiment > 0.3) return '#4caf50'; // Green for positive
    if (sentiment < -0.3) return '#f44336'; // Red for negative
    return '#ffc107'; // Yellow for neutral
  };

  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 20px;
      height: 20px;
      background: ${getMarkerColor(insight.sentiment_score)};
      border: 2px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <Marker position={position} icon={customIcon}>
      <Popup>
        <div style={{ color: '#333', minWidth: '200px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#8a2be2' }}>
            {insight.category.name}
          </h4>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>
            {insight.text_snippet}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span>Sentiment: {insight.sentiment_score > 0.3 ? 'Positive' : 
                              insight.sentiment_score < -0.3 ? 'Negative' : 'Neutral'}</span>
            <span>Confidence: {Math.round(insight.confidence_score * 100)}%</span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// Component to fit map bounds to markers
const FitBounds = ({ insights }) => {
  const map = useMap();
  
  useEffect(() => {
    if (insights && insights.length > 0) {
      const bounds = L.latLngBounds(
        insights.map(insight => [insight.latitude, insight.longitude])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [insights, map]);
  
  return null;
};

const Map = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { data: insights, isLoading } = useQuery(
    'insights',
    getInsights,
    { retry: false }
  );

  const { data: sentimentSummary } = useQuery(
    'sentimentSummary',
    getSentimentSummary,
    { retry: false }
  );

  // Filter insights to only show places
  const placeInsights = insights?.filter(insight => 
    insight.category.category_type === 'place'
  ) || [];

  // Filter insights by category (only for places)
  const filteredInsights = placeInsights.filter(insight => 
    selectedCategory === 'all' || insight.category.category_type === selectedCategory
  );

  // For now, we'll show a message that geo-location needs to be set manually
  // In a real app, you'd geocode the place names or store coordinates
  const locationInsights = filteredInsights.map(insight => ({
    ...insight,
    latitude: null, // No coordinates available
    longitude: null,
  }));

  const categoryTypes = [
    { value: 'all', label: 'All Places' },
    { value: 'place', label: 'Places' },
    { value: 'product', label: 'Products' },
    { value: 'meal', label: 'Meals' },
    { value: 'activity', label: 'Activities' },
  ];

  return (
    <Container>
      <Header>
        <Title>
          <MapPin size={24} />
          Places & Insights
        </Title>
        <Controls>
          <FilterButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Filter size={16} />
            Filter
          </FilterButton>
        </Controls>
      </Header>

      <div style={{ position: 'relative' }}>
        {filteredInsights.length === 0 ? (
          <NoPlacesMessage>
            <MapPin size={48} />
            <h3>No Places Found</h3>
            <p>No places have been identified in your entries yet. Places will appear here once they are detected and geo-located.</p>
          </NoPlacesMessage>
        ) : (
          <MapWrapper>
            <MapContainer
              center={[51.5074, -0.1278]} // London coordinates
              zoom={10}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <FitBounds insights={locationInsights} />
              
              {locationInsights.map((insight, index) => (
                <SentimentMarker
                  key={`${insight.id}-${index}`}
                  insight={insight}
                  position={[insight.latitude, insight.longitude]}
                />
              ))}
            </MapContainer>
          </MapWrapper>
        )}

        <Legend
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <LegendTitle>
            <Layers size={16} />
            Sentiment Legend
          </LegendTitle>
          <LegendItem>
            <LegendColor color="#4caf50" />
            Positive
          </LegendItem>
          <LegendItem>
            <LegendColor color="#ffc107" />
            Neutral
          </LegendItem>
          <LegendItem>
            <LegendColor color="#f44336" />
            Negative
          </LegendItem>
        </Legend>

        <StatsPanel
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <StatItem>
            <span>Total Insights:</span>
            <StatValue>{locationInsights.length}</StatValue>
          </StatItem>
          <StatItem>
            <span>Positive:</span>
            <StatValue>
              {locationInsights.filter(i => i.sentiment_score > 0.3).length}
            </StatValue>
          </StatItem>
          <StatItem>
            <span>Neutral:</span>
            <StatValue>
              {locationInsights.filter(i => i.sentiment_score >= -0.3 && i.sentiment_score <= 0.3).length}
            </StatValue>
          </StatItem>
          <StatItem>
            <span>Negative:</span>
            <StatValue>
              {locationInsights.filter(i => i.sentiment_score < -0.3).length}
            </StatValue>
          </StatItem>
        </StatsPanel>
      </div>
    </Container>
  );
};

export default Map;
