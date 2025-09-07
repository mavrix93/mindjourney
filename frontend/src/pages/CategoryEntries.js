import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { ArrowLeft, Calendar, MapPin, Star, Clock } from 'lucide-react';
import { getEntriesByCategory } from '../services/api';

const Container = styled.div`
  min-height: calc(100vh - 80px); /* Account for bottom navigation */
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  padding: 20px;
  padding-bottom: 100px; /* Extra space for bottom navigation */
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Header = styled.div`
  position: relative;
  z-index: 1;
  margin-bottom: 30px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 3s ease-in-out infinite;
  text-align: center;

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin: 10px 0 0 0;
`;

const EntriesGrid = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

const EntryCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
`;

const EntryTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #ffffff;
`;

const EntryContent = styled.p`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0 0 15px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const EntryMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #ff6b6b;
  font-size: 1.1rem;
  margin-top: 50px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin-top: 50px;
`;

const CategoryEntries = () => {
  const { categoryName, categoryType } = useParams();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['categoryEntries', categoryName, categoryType],
    queryFn: () => getEntriesByCategory(categoryName, categoryType),
    enabled: !!categoryName,
  });

  useEffect(() => {
    if (data) {
      setEntries(data);
    }
  }, [data]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleEntryClick = (entryId) => {
    navigate(`/entry/${entryId}`);
  };

  if (isLoading) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Back
          </BackButton>
          <Title>Loading...</Title>
        </Header>
        <LoadingSpinner>Loading entries...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Back
          </BackButton>
          <Title>Error</Title>
        </Header>
        <ErrorMessage>
          Failed to load entries for "{categoryName}". Please try again.
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </BackButton>
        <Title>"{categoryName}"</Title>
        <Subtitle>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} found
          {categoryType && ` in ${categoryType}`}
        </Subtitle>
      </Header>

      {entries.length === 0 ? (
        <EmptyState>
          No entries found for "{categoryName}". Try exploring other categories!
        </EmptyState>
      ) : (
        <EntriesGrid>
          {entries.map((entry) => (
            <EntryCard key={entry.id} onClick={() => handleEntryClick(entry.id)}>
              <EntryTitle>{entry.title || 'Untitled Entry'}</EntryTitle>
              <EntryContent>{entry.content}</EntryContent>
              <EntryMeta>
                <MetaItem>
                  <Calendar size={16} />
                  {formatDate(entry.created_at)}
                </MetaItem>
                <MetaItem>
                  <Clock size={16} />
                  {new Date(entry.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </MetaItem>
                {entry.overall_sentiment && (
                  <MetaItem>
                    <Star size={16} />
                    {entry.overall_sentiment > 0 ? '😊' : entry.overall_sentiment < 0 ? '😞' : '😐'}
                  </MetaItem>
                )}
              </EntryMeta>
            </EntryCard>
          ))}
        </EntriesGrid>
      )}
    </Container>
  );
};

export default CategoryEntries;
