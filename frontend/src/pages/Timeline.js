import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Filter, Star } from 'lucide-react';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getEntries, searchEntries } from '../services/api';

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

const Controls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const SearchInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  padding: 10px 15px;
  color: #ffffff;
  font-size: 0.9rem;
  width: 200px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #8a2be2;
    box-shadow: 0 0 10px rgba(138, 43, 226, 0.3);
  }
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

const TimelineContainer = styled.div`
  position: relative;
`;

const TimelineLine = styled.div`
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #8a2be2, transparent);
`;

const EntryItem = styled(motion.div)`
  position: relative;
  margin-bottom: 30px;
  margin-left: 50px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(138, 43, 226, 0.6);
    box-shadow: 0 0 20px rgba(138, 43, 226, 0.2);
  }
`;

const EntryDot = styled.div`
  position: absolute;
  left: -35px;
  top: 20px;
  width: 12px;
  height: 12px;
  background: #8a2be2;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(138, 43, 226, 0.5);
`;

const EntryDate = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const EntryTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 10px;
`;

const EntryContent = styled.p`
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin-bottom: 15px;
`;

const EntryInsights = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
`;

const InsightTag = styled.span`
  background: rgba(138, 43, 226, 0.2);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 0.7rem;
  color: #8a2be2;
`;

const EntryMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
`;

const SentimentBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  background: ${props => {
    if (props.sentiment > 0.3) return 'rgba(76, 175, 80, 0.2)';
    if (props.sentiment < -0.3) return 'rgba(244, 67, 54, 0.2)';
    return 'rgba(255, 193, 7, 0.2)';
  }};
  color: ${props => {
    if (props.sentiment > 0.3) return '#4caf50';
    if (props.sentiment < -0.3) return '#f44336';
    return '#ffc107';
  }};
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
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
