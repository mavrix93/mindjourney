import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Download,
  Edit,
  Eye,
  EyeOff,
  Save,
  Sparkles,
  Trash2,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { deleteEntry, getEntry, updateEntry } from '../services/api';

const Container = styled.div`
  min-height: calc(100vh - 64px);
  padding: 24px;
  padding-top: 72px;
  padding-bottom: 40px;
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const BackButton = styled(motion.button)`
  background: rgba(110, 86, 207, 0.18);
  border: 1px solid rgba(110, 86, 207, 0.3);
  border-radius: 10px;
  padding: 10px 14px;
  color: #c6b9ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  
  &:hover {
    background: rgba(110, 86, 207, 0.24);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled(motion.button)`
  background: ${props => props.$variant === 'danger' ? 'rgba(255, 69, 58, 0.18)' : 'rgba(110, 86, 207, 0.18)'};
  border: 1px solid ${props => props.$variant === 'danger' ? 'rgba(255, 69, 58, 0.3)' : 'rgba(110, 86, 207, 0.3)'};
  border-radius: 10px;
  padding: 10px 14px;
  color: ${props => props.$variant === 'danger' ? '#ff453a' : '#c6b9ff'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  
  &:hover {
    background: ${props => props.$variant === 'danger' ? 'rgba(255, 69, 58, 0.24)' : 'rgba(110, 86, 207, 0.24)'};
  }
`;

const EntryCard = styled(motion.div)`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 24px;
  backdrop-filter: blur(8px);
`;

const EntryMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: rgba(230, 230, 230, 0.6);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const EntryTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #e6e6e6;
  margin-bottom: 16px;
  line-height: 1.25;
`;

const EntryContent = styled.div`
  color: rgba(230, 230, 230, 0.9);
  line-height: 1.7;
  font-size: 1.05rem;
  margin-bottom: 24px;
  white-space: pre-wrap;
`;

const InsightsSection = styled.div`
  margin-bottom: 30px;
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

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
`;

const InsightCard = styled(motion.div)`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 12px;
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

const InsightCategory = styled.div`
  font-size: 0.8rem;
  color: #c6b9ff;
  font-weight: 600;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InsightText = styled.p`
  color: rgba(230, 230, 230, 0.8);
  margin-bottom: 8px;
  font-style: italic;
`;

const InsightMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
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

const ConfidenceScore = styled.span`
  color: rgba(230, 230, 230, 0.5);
`;

const DocumentsSection = styled.div`
  margin-bottom: 30px;
`;

const DocumentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DocumentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 10px;
  padding: 14px;
`;

const DocumentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DocumentName = styled.span`
  color: rgba(230, 230, 230, 0.85);
  font-size: 0.9rem;
`;

const DocumentSize = styled.span`
  color: rgba(230, 230, 230, 0.5);
  font-size: 0.8rem;
`;

const EditForm = styled.form`
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: #e6e6e6;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 10px;
  padding: 12px 14px;
  color: #e6e6e6;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(230, 230, 230, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #6e56cf;
    box-shadow: 0 0 0 3px rgba(110, 86, 207, 0.25);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 10px;
  padding: 12px 14px;
  color: #e6e6e6;
  font-size: 1rem;
  min-height: 200px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(230, 230, 230, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #6e56cf;
    box-shadow: 0 0 0 3px rgba(110, 86, 207, 0.25);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #6e56cf;
`;

const CheckboxLabel = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  cursor: pointer;
`;

const EntryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const { data: entry, isLoading, error } = useQuery(
    ['entry', id],
    () => getEntry(id),
    { retry: false }
  );

  const updateEntryMutation = useMutation(
    (data) => updateEntry(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['entry', id]);
        queryClient.invalidateQueries('entries');
        setIsEditing(false);
      },
    }
  );

  const deleteEntryMutation = useMutation(
    () => deleteEntry(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('entries');
        navigate('/');
      },
    }
  );

  const isPublic = watch('is_public', entry?.is_public || false);

  const handleEdit = () => {
    reset({
      title: entry.title || '',
      content: entry.content || '',
      is_public: entry.is_public || false,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    reset();
  };

  const onSubmit = (data) => {
    updateEntryMutation.mutate(data);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      deleteEntryMutation.mutate();
    }
  };

  const handleInsightClick = (insight) => {
    navigate(`/category/${encodeURIComponent(insight.category.name)}/${insight.category.category_type}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading entry</div>;
  if (!entry) return <div>Entry not found</div>;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container>
      <Header>
        <BackButton
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={16} />
          Back
        </BackButton>
        
        <ActionButtons>
          {!isEditing ? (
            <>
              <ActionButton
                onClick={handleEdit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-testid="edit-entry-button"
              >
                <Edit size={16} />
                Edit
              </ActionButton>
              <ActionButton
                $variant="danger"
                onClick={handleDelete}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 size={16} />
                Delete
              </ActionButton>
            </>
          ) : (
            <>
              <ActionButton
                onClick={handleCancelEdit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={16} />
                Cancel
              </ActionButton>
            </>
          )}
        </ActionButtons>
      </Header>

      <EntryCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {isEditing ? (
          <EditForm onSubmit={handleSubmit(onSubmit)}>
            <FormGroup>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Give your entry a title..."
                {...register('title')}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="content">Content</Label>
              <TextArea
                id="content"
                placeholder="Write about your day, experiences, thoughts..."
                {...register('content', { required: 'Content is required' })}
              />
              {errors.content && (
                <div style={{ color: '#f44336', fontSize: '0.8rem', marginTop: '5px' }}>
                  {errors.content.message}
                </div>
              )}
            </FormGroup>

            <CheckboxGroup>
              <Checkbox
                id="is_public"
                type="checkbox"
                {...register('is_public')}
              />
              <CheckboxLabel htmlFor="is_public">
                {isPublic ? (
                  <>
                    <Eye size={16} style={{ marginRight: '5px' }} />
                    Make this entry public
                  </>
                ) : (
                  <>
                    <EyeOff size={16} style={{ marginRight: '5px' }} />
                    Keep this entry private
                  </>
                )}
              </CheckboxLabel>
            </CheckboxGroup>

            <ActionButton
              type="submit"
              disabled={updateEntryMutation.isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save size={16} />
              {updateEntryMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </ActionButton>
          </EditForm>
        ) : (
          <>
            <EntryMeta>
              <MetaItem>
                <Calendar size={16} />
                {formatDate(entry.created_at)}
              </MetaItem>
              <MetaItem>
                {entry.is_public ? <Eye size={16} /> : <EyeOff size={16} />}
                {entry.is_public ? 'Public' : 'Private'}
              </MetaItem>
            </EntryMeta>

            <EntryTitle>{entry.title || 'Untitled Entry'}</EntryTitle>
            <EntryContent>{entry.content}</EntryContent>
          </>
        )}
      </EntryCard>

      {entry.insights && entry.insights.length > 0 && (
        <InsightsSection>
          <SectionTitle>
            <Sparkles size={20} />
            AI Insights
          </SectionTitle>
          <InsightsGrid>
            {entry.insights.map((insight, index) => (
              <InsightCard
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => handleInsightClick(insight)}
              >
                <InsightCategory>
                  {insight.category.name} • {insight.category.category_type}
                </InsightCategory>
                <InsightText>"{insight.text_snippet}"</InsightText>
                <InsightMeta>
                  <SentimentBadge sentiment={insight.sentiment_score}>
                    {insight.sentiment_score > 0.3 ? 'Positive' : 
                     insight.sentiment_score < -0.3 ? 'Negative' : 'Neutral'}
                  </SentimentBadge>
                  <ConfidenceScore>
                    {Math.round(insight.confidence_score * 100)}% confidence
                  </ConfidenceScore>
                </InsightMeta>
              </InsightCard>
            ))}
          </InsightsGrid>
        </InsightsSection>
      )}

      {entry.documents && entry.documents.length > 0 && (
        <DocumentsSection>
          <SectionTitle>Attached Documents</SectionTitle>
          <DocumentList>
            {entry.documents.map((doc) => (
              <DocumentItem key={doc.id}>
                <DocumentInfo>
                  <DocumentName>{doc.filename}</DocumentName>
                  <DocumentSize>
                    {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                  </DocumentSize>
                </DocumentInfo>
                <ActionButton
                  onClick={() => window.open(doc.file, '_blank')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download size={16} />
                  Download
                </ActionButton>
              </DocumentItem>
            ))}
          </DocumentList>
        </DocumentsSection>
      )}
    </Container>
  );
};

export default EntryDetail;
