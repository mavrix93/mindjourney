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

const BackButton = styled(motion.button)`
  background: rgba(138, 43, 226, 0.2);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  padding: 10px 15px;
  color: #8a2be2;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  
  &:hover {
    background: rgba(138, 43, 226, 0.3);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled(motion.button)`
  background: ${props => props.$variant === 'danger' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(138, 43, 226, 0.2)'};
  border: 1px solid ${props => props.$variant === 'danger' ? 'rgba(244, 67, 54, 0.3)' : 'rgba(138, 43, 226, 0.3)'};
  border-radius: 12px;
  padding: 10px 15px;
  color: ${props => props.$variant === 'danger' ? '#f44336' : '#8a2be2'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  
  &:hover {
    background: ${props => props.$variant === 'danger' ? 'rgba(244, 67, 54, 0.3)' : 'rgba(138, 43, 226, 0.3)'};
  }
`;

const EntryCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
`;

const EntryMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const EntryTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 20px;
  line-height: 1.3;
`;

const EntryContent = styled.div`
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.7;
  font-size: 1.1rem;
  margin-bottom: 30px;
  white-space: pre-wrap;
`;

const InsightsSection = styled.div`
  margin-bottom: 30px;
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

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const InsightCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(138, 43, 226, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(138, 43, 226, 0.2);
  }
`;

const InsightCategory = styled.div`
  font-size: 0.8rem;
  color: #8a2be2;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InsightText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
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

const ConfidenceScore = styled.span`
  color: rgba(255, 255, 255, 0.5);
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 8px;
  padding: 15px;
`;

const DocumentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DocumentName = styled.span`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const DocumentSize = styled.span`
  color: rgba(255, 255, 255, 0.5);
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
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  padding: 15px;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #8a2be2;
    box-shadow: 0 0 10px rgba(138, 43, 226, 0.3);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  padding: 15px;
  color: #ffffff;
  font-size: 1rem;
  min-height: 200px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #8a2be2;
    box-shadow: 0 0 10px rgba(138, 43, 226, 0.3);
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
  accent-color: #8a2be2;
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
