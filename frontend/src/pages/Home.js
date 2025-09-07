import { motion } from 'framer-motion';
import { Heart, MapPin, Sparkles, Star, TrendingUp } from 'lucide-react';
import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getEntries, getPublicEntries } from '../services/api';

const Container = styled.div`
  min-height: calc(100vh - 80px); /* Account for bottom navigation */
  padding: 20px;
  padding-top: 60px;
  padding-bottom: 100px; /* Extra space for bottom navigation */
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #8a2be2, #ff6b6b, #4ecdc4);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient 3s ease infinite;
  margin-bottom: 10px;

  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 300;
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  backdrop-filter: blur(10px);
`;

const StatIcon = styled.div`
  color: #8a2be2;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
`;

const RecentEntries = styled(motion.div)`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const EntryCard = styled(motion.div)`
  position: relative;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(138, 43, 226, 0.4);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 15px;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 10px 30px rgba(138, 43, 226, 0.15);

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(138, 43, 226, 0.7);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 16px 40px rgba(138, 43, 226, 0.25);
  }
`;

const EntryTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
`;

const EntryContent = styled.p`
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin-bottom: 10px;
`;

const EntryMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
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
  background: rgba(138, 43, 226, 0.15);
  border: 1px solid rgba(138, 43, 226, 0.35);
  color: #b792ff;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.7rem;
  letter-spacing: 0.2px;
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
