import { motion } from 'framer-motion';
import { Heart, MapPin, Sparkles, Star, TrendingUp } from 'lucide-react';
import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getEntries, getPublicEntries } from '../services/api';

const Container = styled.div`
  min-height: calc(100vh - 64px);
  padding: 24px;
  padding-top: 72px;
  padding-bottom: 40px;
  max-width: 1100px;
  margin: 0 auto;
`;

const Header = styled(motion.div)`
  text-align: left;
  margin-bottom: 32px;
`;

const Title = styled(motion.h1)`
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #e6e6e6;
  margin-bottom: 8px;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.1rem;
  color: rgba(230, 230, 230, 0.75);
  font-weight: 400;
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin: 24px 0 24px;
`;

const StatCard = styled(motion.div)`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 14px;
  padding: 16px;
  text-align: left;
  backdrop-filter: blur(8px);
`;

const StatIcon = styled.div`
  color: #c6b9ff;
  margin-bottom: 8px;
  display: flex;
`;

const StatValue = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  color: #e6e6e6;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: rgba(230, 230, 230, 0.6);
`;

const RecentEntries = styled(motion.div)`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #e6e6e6;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const EntryCard = styled(motion.div)`
  position: relative;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 8px 24px rgba(110, 86, 207, 0.18);

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(110, 86, 207, 0.45);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 16px 36px rgba(110, 86, 207, 0.25);
  }
`;

const EntryTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: #e6e6e6;
  margin-bottom: 6px;
`;

const EntryContent = styled.p`
  color: rgba(230, 230, 230, 0.75);
  line-height: 1.5;
  margin-bottom: 8px;
`;

const EntryMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: rgba(230, 230, 230, 0.6);
`;

const EntryInsights = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const InsightChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(110, 86, 207, 0.18);
  border: 1px solid rgba(110, 86, 207, 0.35);
  color: #c6b9ff;
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 0.72rem;
  letter-spacing: 0.2px;
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

const Home = () => {
  const navigate = useNavigate();
  const { data: entries, isLoading: entriesLoading } = useQuery(
    'entries',
    getEntries,
    { retry: false }
  );

  const { data: publicEntries, isLoading: publicLoading } = useQuery(
    'publicEntries',
    getPublicEntries,
    { retry: false }
  );

  const recentEntries = entries?.slice(0, 3) || [];
  const recentPublicEntries = publicEntries?.slice(0, 2) || [];

  const stats = [
    { icon: Star, value: entries?.length || 0, label: 'Total Entries' },
    { icon: TrendingUp, value: publicEntries?.length || 0, label: 'Public Entries' },
    { icon: MapPin, value: '12', label: 'Places Visited' },
    { icon: Heart, value: '85%', label: 'Positive Sentiment' },
  ];

  return (
    <Container>
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          MindJourney
        </Title>
        <Subtitle
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Your AI-powered diary with insights
        </Subtitle>
      </Header>

      <StatsGrid
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <StatIcon>
              <stat.icon size={24} />
            </StatIcon>
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>

      <RecentEntries
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <SectionTitle>
          <Star size={20} />
          Recent Entries
        </SectionTitle>
        
        {entriesLoading ? (
          <div>Loading...</div>
        ) : recentEntries.length > 0 ? (
          recentEntries.map((entry, index) => (
            <EntryCard
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 1.4 + index * 0.1 }}
              whileHover={{ x: 5 }}
              onClick={() => navigate(`/entry/${entry.id}`)}
            >
              <EntryTitle>{entry.title || 'Untitled Entry'}</EntryTitle>
              <EntryContent>
                {entry.content.length > 100 
                  ? `${entry.content.substring(0, 100)}...` 
                  : entry.content
                }
              </EntryContent>
              {entry.insights && entry.insights.length > 0 && (
                <EntryInsights>
                  {entry.insights.slice(0, 3).map((insight) => (
                    <InsightChip key={insight.id}>
                      <Sparkles size={12} /> {insight.category.name}
                    </InsightChip>
                  ))}
                  {entry.insights.length > 3 && (
                    <InsightChip>+{entry.insights.length - 3} more</InsightChip>
                  )}
                </EntryInsights>
              )}
              <EntryMeta>
                <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                {entry.overall_sentiment !== null && (
                  <SentimentBadge sentiment={entry.overall_sentiment}>
                    {entry.overall_sentiment > 0.3 ? 'Positive' : 
                     entry.overall_sentiment < -0.3 ? 'Negative' : 'Neutral'}
                  </SentimentBadge>
                )}
              </EntryMeta>
            </EntryCard>
          ))
        ) : (
          <EntryCard>
            <EntryTitle>No entries yet</EntryTitle>
            <EntryContent>Start your journey by creating your first entry!</EntryContent>
          </EntryCard>
        )}
      </RecentEntries>

      {recentPublicEntries.length > 0 && (
        <RecentEntries
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          <SectionTitle>
            <Heart size={20} />
            Community Highlights
          </SectionTitle>
          
          {recentPublicEntries.map((entry, index) => (
            <EntryCard
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 1.8 + index * 0.1 }}
              whileHover={{ x: 5 }}
              onClick={() => navigate(`/entry/${entry.id}`)}
            >
              <EntryTitle>{entry.title || 'Untitled Entry'}</EntryTitle>
              <EntryContent>
                {entry.content.length > 100 
                  ? `${entry.content.substring(0, 100)}...` 
                  : entry.content
                }
              </EntryContent>
              {entry.insights && entry.insights.length > 0 && (
                <EntryInsights>
                  {entry.insights.slice(0, 3).map((insight) => (
                    <InsightChip key={insight.id}>
                      <Sparkles size={12} /> {insight.category.name}
                    </InsightChip>
                  ))}
                  {entry.insights.length > 3 && (
                    <InsightChip>+{entry.insights.length - 3} more</InsightChip>
                  )}
                </EntryInsights>
              )}
              <EntryMeta>
                <span>by {entry.user} • {new Date(entry.created_at).toLocaleDateString()}</span>
                {entry.overall_sentiment !== null && (
                  <SentimentBadge sentiment={entry.overall_sentiment}>
                    {entry.overall_sentiment > 0.3 ? 'Positive' : 
                     entry.overall_sentiment < -0.3 ? 'Negative' : 'Neutral'}
                  </SentimentBadge>
                )}
              </EntryMeta>
            </EntryCard>
          ))}
        </RecentEntries>
      )}
    </Container>
  );
};

export default Home;
