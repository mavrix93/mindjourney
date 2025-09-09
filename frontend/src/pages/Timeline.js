import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Filter, Star } from 'lucide-react';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getEntries, searchEntries } from '../services/api';

const Container = styled.div`
  min-height: calc(100vh - 64px);
  padding: 24px;
  padding-top: 72px;
  padding-bottom: 40px;
  max-width: 1100px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #e6e6e6;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const SearchInput = styled.input`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 10px;
  padding: 10px 14px;
  color: #e6e6e6;
  font-size: 0.9rem;
  width: 220px;
  
  &::placeholder {
    color: rgba(230, 230, 230, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #6e56cf;
    box-shadow: 0 0 0 3px rgba(110, 86, 207, 0.25);
  }
`;

const FilterButton = styled(motion.button)`
  background: rgba(110, 86, 207, 0.18);
  border: 1px solid rgba(110, 86, 207, 0.3);
  border-radius: 10px;
  padding: 10px 14px;
  color: #c6b9ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  
  &:hover {
    background: rgba(110, 86, 207, 0.24);
  }
`;

const TimelineContainer = styled.div`
  position: relative;
`;

const TimelineLine = styled.div`
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #6e56cf, transparent);
`;

const EntryItem = styled(motion.div)`
  position: relative;
  margin-bottom: 24px;
  margin-left: 50px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 14px;
  padding: 16px;
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(110, 86, 207, 0.45);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 16px 36px rgba(110, 86, 207, 0.25);
  }
`;

const EntryDot = styled.div`
  position: absolute;
  left: -35px;
  top: 20px;
  width: 12px;
  height: 12px;
  background: #6e56cf;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(110, 86, 207, 0.45);
`;

const EntryDate = styled.div`
  font-size: 0.8rem;
  color: rgba(230, 230, 230, 0.6);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const EntryTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #e6e6e6;
  margin-bottom: 8px;
`;

const EntryContent = styled.p`
  color: rgba(230, 230, 230, 0.75);
  line-height: 1.6;
  margin-bottom: 12px;
`;

const EntryInsights = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
`;

const InsightTag = styled.span`
  background: rgba(110, 86, 207, 0.18);
  border: 1px solid rgba(110, 86, 207, 0.35);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.72rem;
  color: #c6b9ff;
`;

const EntryMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: rgba(230, 230, 230, 0.6);
`;

const SentimentBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  background: ${props => {
    if (props.sentiment > 0.3) return 'rgba(52, 199, 89, 0.18)';
    if (props.sentiment < -0.3) return 'rgba(255, 69, 58, 0.18)';
    return 'rgba(255, 204, 0, 0.18)';
  }};
  color: ${props => {
    if (props.sentiment > 0.3) return '#34c759';
    if (props.sentiment < -0.3) return '#ff453a';
    return '#ffcc00';
  }};
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 60px 20px;
  color: rgba(230, 230, 230, 0.6);
`;

const Timeline = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data: entries, isLoading } = useQuery(
    'entries',
    getEntries,
    { retry: false }
  );

  const { data: searchResults, isLoading: isSearchLoading } = useQuery(
    ['searchEntries', searchQuery],
    () => searchEntries(searchQuery),
    {
      enabled: isSearching && searchQuery.length > 0,
      retry: false,
    }
  );

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(query.length > 0);
  };

  const displayEntries = isSearching ? searchResults : entries;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container>
      <Header>
        <Title>
          <Calendar size={24} />
          Timeline
        </Title>
        <Controls>
          <SearchInput
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={handleSearch}
          />
          <FilterButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Filter size={16} />
            Filter
          </FilterButton>
        </Controls>
      </Header>

      <TimelineContainer>
        <TimelineLine />
        
        {isLoading ? (
          <div>Loading...</div>
        ) : displayEntries && displayEntries.length > 0 ? (
          <AnimatePresence>
            {displayEntries.map((entry, index) => (
              <EntryItem
                key={entry.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => navigate(`/entry/${entry.id}`)}
                whileHover={{ x: 5 }}
              >
                <EntryDot />
                <EntryDate>
                  <Calendar size={12} />
                  {formatDate(entry.created_at)} at {formatTime(entry.created_at)}
                </EntryDate>
                
                <EntryTitle>{entry.title || 'Untitled Entry'}</EntryTitle>
                
                <EntryContent>
                  {entry.content.length > 200 
                    ? `${entry.content.substring(0, 200)}...` 
                    : entry.content
                  }
                </EntryContent>

                {entry.insights && entry.insights.length > 0 && (
                  <EntryInsights>
                    {entry.insights.slice(0, 3).map((insight) => (
                      <InsightTag key={insight.id}>
                        {insight.category.name}
                      </InsightTag>
                    ))}
                    {entry.insights.length > 3 && (
                      <InsightTag>+{entry.insights.length - 3} more</InsightTag>
                    )}
                  </EntryInsights>
                )}

                <EntryMeta>
                  <span>{entry.is_public ? 'Public' : 'Private'}</span>
                  {entry.overall_sentiment !== null && (
                    <SentimentBadge sentiment={entry.overall_sentiment}>
                      {entry.overall_sentiment > 0.3 ? 'Positive' : 
                       entry.overall_sentiment < -0.3 ? 'Negative' : 'Neutral'}
                    </SentimentBadge>
                  )}
                </EntryMeta>
              </EntryItem>
            ))}
          </AnimatePresence>
        ) : (
          <EmptyState
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Star size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h3>No entries found</h3>
            <p>
              {isSearching 
                ? 'Try adjusting your search terms'
                : 'Start your journey by creating your first entry!'
              }
            </p>
          </EmptyState>
        )}
      </TimelineContainer>
    </Container>
  );
};

export default Timeline;
