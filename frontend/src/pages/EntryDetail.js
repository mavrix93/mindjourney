import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    Download,
    Edit,
    Eye,
    EyeOff,
    RefreshCw,
    Save,
    Sparkles,
    Trash2,
    User,
    X
} from 'lucide-react';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { deleteDocument, deleteEntry, getEntry, getFaces, reprocessEntry, updateEntry, uploadDocument } from '../services/api';

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

const FileUploadArea = styled(motion.div)`
  border: 2px dashed rgba(110, 86, 207, 0.35);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(110, 86, 207, 0.06);
  margin-bottom: 12px;
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

const FaceSelectionSection = styled.div`
  margin-bottom: 20px;
`;

const FaceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  margin-top: 10px;
`;

const FaceCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.$selected ? 'rgba(110, 86, 207, 0.18)' : 'linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03))'};
  border: 1px solid ${props => props.$selected ? 'rgba(110, 86, 207, 0.5)' : 'rgba(110, 86, 207, 0.25)'};
  border-radius: 8px;
  padding: 8px 6px;
  color: #e6e6e6;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(110, 86, 207, 0.5);
    background: rgba(110, 86, 207, 0.1);
  }
`;

const FaceIcon = styled.div`
  font-size: 16px;
  margin-bottom: 4px;
`;

const FaceName = styled.div`
  font-size: 10px;
  text-align: center;
  font-weight: 500;
`;

const FaceDisplaySection = styled.div`
  margin-bottom: 20px;
`;

const FaceDisplayGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const FaceDisplayCard = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(110, 86, 207, 0.12);
  border: 1px solid rgba(110, 86, 207, 0.3);
  border-radius: 6px;
  padding: 6px 10px;
  color: #c6b9ff;
  font-size: 0.85rem;
`;

const ProcessingStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${props => props.$processed ? 'rgba(52, 199, 89, 0.12)' : 'rgba(255, 204, 0, 0.12)'};
  border: 1px solid ${props => props.$processed ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 204, 0, 0.3)'};
  border-radius: 10px;
  color: ${props => props.$processed ? '#34c759' : '#ffcc00'};
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 20px;
  box-shadow: ${props => !props.$processed ? '0 0 20px rgba(255, 204, 0, 0.1)' : 'none'};
  animation: ${props => !props.$processed ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const RefreshIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8px;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .spinner {
    animation: spin 1s linear infinite;
  }
`;

const EntryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFaces, setSelectedFaces] = useState([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const { data: entry, isLoading, error, refetch } = useQuery(
    ['entry', id],
    () => getEntry(id),
    { 
      retry: false,
      refetchInterval: (data) => {
        // Auto-refresh every 3 seconds if processing is not complete
        return data?.insights_processed === false ? 3000 : false;
      },
      refetchIntervalInBackground: true,
    }
  );

  // Fetch available faces
  const { data: faces = [] } = useQuery(['faces'], getFaces);

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

  const uploadMutation = useMutation(
    ({ entryId, file }) => uploadDocument(entryId, file),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['entry', id]);
        queryClient.invalidateQueries('entries');
      },
    }
  );

  const deleteDocMutation = useMutation(
    ({ entryId, docId }) => deleteDocument(entryId, docId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['entry', id]);
        queryClient.invalidateQueries('entries');
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

  const reprocessMutation = useMutation(
    () => reprocessEntry(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['entry', id]);
        queryClient.invalidateQueries('entries');
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
    setSelectedFaces(entry.faces ? entry.faces.map(f => f.id) : []);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    reset();
    setSelectedFaces([]);
  };

  const toggleFaceSelection = (faceId) => {
    setSelectedFaces(prev => 
      prev.includes(faceId) 
        ? prev.filter(id => id !== faceId)
        : [...prev, faceId]
    );
  };

  const onSubmit = (data) => {
    const updateData = {
      ...data,
      face_ids: selectedFaces,
    };
    updateEntryMutation.mutate(updateData);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      deleteEntryMutation.mutate();
    }
  };

  const handleInsightClick = (insight) => {
    navigate(`/category/${encodeURIComponent(insight.category.name)}/${insight.category.category_type}`);
  };

  const onDrop = async (acceptedFiles) => {
    setIsUploading(true);
    try {
      for (const file of acceptedFiles) {
        await uploadMutation.mutateAsync({ entryId: id, file });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md'],
    },
    maxSize: 10 * 1024 * 1024,
  });

  if (isLoading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '40px', color: '#e6e6e6' }}>
          <Sparkles size={32} style={{ marginBottom: '16px', opacity: 0.7 }} />
          <div>Loading entry...</div>
          <ProcessingStatus $processed={false} style={{ marginTop: '20px', maxWidth: '400px', margin: '20px auto 0' }}>
            <Sparkles size={18} />
            AI Processing in Progress...
            <RefreshIndicator>
              <Sparkles size={14} className="spinner" />
              Auto-refreshing...
            </RefreshIndicator>
          </ProcessingStatus>
        </div>
      </Container>
    );
  }
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

            <FaceSelectionSection>
              <Label>Select Faces</Label>
              <FaceGrid>
                {faces.map(face => (
                  <FaceCard
                    key={face.id}
                    $selected={selectedFaces.includes(face.id)}
                    onClick={() => toggleFaceSelection(face.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaceIcon>{face.icon || '🙂'}</FaceIcon>
                    <FaceName>{face.name}</FaceName>
                  </FaceCard>
                ))}
              </FaceGrid>
            </FaceSelectionSection>

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

      {/* Processing Status - More Prominent */}
      <ProcessingStatus $processed={entry.insights_processed} style={{ 
        marginBottom: '30px',
        fontSize: '0.9rem',
        fontWeight: '600',
        textAlign: 'center',
        maxWidth: '400px',
        margin: '0 auto 30px'
      }}>
        <Sparkles size={18} />
        {entry.insights_processed ? 'AI Processing Complete' : 'AI Processing in Progress...'}
        {!entry.insights_processed && (
          <RefreshIndicator>
            <Sparkles size={14} className="spinner" />
            Auto-refreshing...
            <ActionButton
              onClick={() => refetch()}
              style={{ 
                marginLeft: '10px', 
                padding: '4px 8px', 
                fontSize: '0.7rem',
                background: 'rgba(110, 86, 207, 0.1)',
                border: '1px solid rgba(110, 86, 207, 0.3)',
                color: '#c6b9ff'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={12} />
              Refresh Now
            </ActionButton>
          </RefreshIndicator>
        )}
        {entry.insights_processed && (
          <RefreshIndicator style={{ marginTop: '8px' }}>
            <ActionButton
              onClick={() => reprocessMutation.mutate()}
              disabled={reprocessMutation.isLoading}
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.8rem',
                background: 'rgba(110, 86, 207, 0.15)',
                border: '1px solid rgba(110, 86, 207, 0.4)',
                color: '#c6b9ff'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={14} />
              {reprocessMutation.isLoading ? 'Reprocessing...' : 'Reprocess AI Analysis'}
            </ActionButton>
          </RefreshIndicator>
        )}
      </ProcessingStatus>

      {/* Face Display */}
      {entry.faces && entry.faces.length > 0 && (
        <FaceDisplaySection>
          <SectionTitle>
            <User size={20} />
            Associated Faces
          </SectionTitle>
          <FaceDisplayGrid>
            {entry.faces.map(face => (
              <FaceDisplayCard key={face.id}>
                <span>{face.icon || '🙂'}</span>
                <span>{face.name}</span>
              </FaceDisplayCard>
            ))}
          </FaceDisplayGrid>
        </FaceDisplaySection>
      )}

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

      <DocumentsSection>
        <SectionTitle>Attached Documents</SectionTitle>
        <FileUploadArea {...getRootProps()} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <input {...getInputProps()} />
          {isUploading ? 'Uploading...' : (isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select')}
        </FileUploadArea>
        {entry.documents && entry.documents.length > 0 && (
          <DocumentList>
            {entry.documents.map((doc) => (
              <DocumentItem key={doc.id}>
                <DocumentInfo>
                  <DocumentName>{doc.filename}</DocumentName>
                  <DocumentSize>
                    {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                  </DocumentSize>
                </DocumentInfo>
                <div style={{ display: 'flex', gap: 8 }}>
                  <ActionButton
                    onClick={() => window.open(doc.file, '_blank')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download size={16} />
                    Download
                  </ActionButton>
                  <ActionButton
                    $variant="danger"
                    onClick={() => deleteDocMutation.mutate({ entryId: id, docId: doc.id })}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 size={16} />
                    Remove
                  </ActionButton>
                </div>
              </DocumentItem>
            ))}
          </DocumentList>
        )}
      </DocumentsSection>
    </Container>
  );
};

export default EntryDetail;
