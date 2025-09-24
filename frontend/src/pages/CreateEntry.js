import { motion } from 'framer-motion';
import { Eye, EyeOff, Save, Sparkles, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { createEntry, createFace, getFaces, suggestFaces, uploadDocument, updateFace } from '../services/api';
import EmojiPicker from '../components/EmojiPicker';

const Container = styled.div`
  min-height: calc(100vh - 64px);
  padding: 24px;
  padding-top: 72px;
  padding-bottom: 40px;
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: left;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #e6e6e6;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: rgba(230, 230, 230, 0.75);
  font-size: 1rem;
`;

const Form = styled.form`
  max-width: 800px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
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

const FileUploadArea = styled(motion.div)`
  border: 2px dashed rgba(110, 86, 207, 0.35);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(110, 86, 207, 0.06);
  
  &:hover {
    border-color: rgba(110, 86, 207, 0.55);
    background: rgba(110, 86, 207, 0.1);
  }
  
  ${props => props.$isDragActive && `
    border-color: #6e56cf;
    background: rgba(110, 86, 207, 0.1);
  `}
`;

const UploadIcon = styled.div`
  color: #c6b9ff;
  margin-bottom: 10px;
`;

const UploadText = styled.p`
  color: rgba(230, 230, 230, 0.85);
  margin-bottom: 5px;
`;

const UploadSubtext = styled.p`
  color: rgba(230, 230, 230, 0.5);
  font-size: 0.8rem;
`;

const FileList = styled.div`
  margin-top: 15px;
`;

const FileItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 8px;
`;

const FileName = styled.span`
  color: rgba(230, 230, 230, 0.85);
  font-size: 0.9rem;
`;

const FileSize = styled.span`
  color: rgba(230, 230, 230, 0.5);
  font-size: 0.8rem;
`;

const RemoveButton = styled(motion.button)`
  background: rgba(255, 69, 58, 0.18);
  border: 1px solid rgba(255, 69, 58, 0.3);
  border-radius: 8px;
  padding: 6px 10px;
  color: #ff453a;
  cursor: pointer;
  font-size: 0.8rem;
  
  &:hover {
    background: rgba(255, 69, 58, 0.25);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
`;

const Button = styled(motion.button)`
  background: ${props => props.$variant === 'primary' ? '#6e56cf' : 'transparent'};
  border: 1px solid #6e56cf;
  border-radius: 10px;
  padding: 12px 24px;
  color: ${props => props.$variant === 'primary' ? '#ffffff' : '#c6b9ff'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$variant === 'primary' ? '#5a46b0' : 'rgba(110, 86, 207, 0.12)'};
    box-shadow: 0 0 0 3px rgba(110, 86, 207, 0.25);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 0.8rem;
  margin-top: 5px;
`;

const FaceSelectionSection = styled.div`
  margin-bottom: 25px;
`;

const FaceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 10px;
`;

const FaceCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.$selected ? 'rgba(110, 86, 207, 0.18)' : 'linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03))'};
  border: 1px solid ${props => props.$selected ? 'rgba(110, 86, 207, 0.5)' : 'rgba(110, 86, 207, 0.25)'};
  border-radius: 10px;
  padding: 12px 8px;
  color: #e6e6e6;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(110, 86, 207, 0.5);
    background: rgba(110, 86, 207, 0.1);
  }
`;

const FaceIcon = styled.div`
  font-size: 20px;
  margin-bottom: 6px;
`;

const FaceName = styled.div`
  font-size: 11px;
  text-align: center;
  font-weight: 500;
`;

const SuggestedFaces = styled.div`
  margin-top: 15px;
`;

const SuggestedTitle = styled.h4`
  color: #c6b9ff;
  font-size: 0.9rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SuggestionCard = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(110, 86, 207, 0.08);
  border: 1px solid rgba(110, 86, 207, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  color: #c6b9ff;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 8px;
  margin-bottom: 8px;
  
  &:hover {
    background: rgba(110, 86, 207, 0.15);
    border-color: rgba(110, 86, 207, 0.3);
  }
`;

const CreateFaceForm = styled.div`
  background: rgba(110, 86, 207, 0.08);
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 12px;
  padding: 20px;
  margin-top: 15px;
`;

const CreateFaceTitle = styled.h4`
  color: #c6b9ff;
  font-size: 0.9rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CreateFaceInputs = styled.div`
  display: flex;
  gap: 12px;
  align-items: end;
  margin-bottom: 15px;
`;

const CreateFaceInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 8px;
  padding: 10px 12px;
  color: #e6e6e6;
  font-size: 0.9rem;
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

const IconSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconInput = styled.input`
  width: 50px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 8px;
  padding: 10px;
  color: #e6e6e6;
  font-size: 1.2rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #6e56cf;
    box-shadow: 0 0 0 3px rgba(110, 86, 207, 0.25);
  }
`;

const CreateFaceButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const CreateFaceButton = styled(motion.button)`
  background: ${props => props.$variant === 'primary' ? '#6e56cf' : 'transparent'};
  border: 1px solid #6e56cf;
  border-radius: 8px;
  padding: 8px 16px;
  color: ${props => props.$variant === 'primary' ? '#ffffff' : '#c6b9ff'};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$variant === 'primary' ? '#5a46b0' : 'rgba(110, 86, 207, 0.12)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddFaceButton = styled(motion.button)`
  background: rgba(110, 86, 207, 0.1);
  border: 1px dashed rgba(110, 86, 207, 0.4);
  border-radius: 10px;
  padding: 12px;
  color: #c6b9ff;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  
  &:hover {
    background: rgba(110, 86, 207, 0.15);
    border-color: rgba(110, 86, 207, 0.6);
  }
`;

const FaceActions = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${FaceCard}:hover & {
    opacity: 1;
  }
`;

const FaceActionButton = styled.button`
  background: rgba(110, 86, 207, 0.2);
  border: 1px solid rgba(110, 86, 207, 0.3);
  border-radius: 6px;
  padding: 4px 6px;
  color: #c6b9ff;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(110, 86, 207, 0.3);
    border-color: rgba(110, 86, 207, 0.5);
  }
`;

const EditFaceForm = styled.div`
  background: rgba(110, 86, 207, 0.08);
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 12px;
  padding: 16px;
  margin-top: 15px;
`;

const EditFaceTitle = styled.h4`
  color: #c6b9ff;
  font-size: 0.9rem;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EditFaceInputs = styled.div`
  display: flex;
  gap: 12px;
  align-items: end;
  margin-bottom: 12px;
`;

const EditFaceInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 8px;
  padding: 10px 12px;
  color: #e6e6e6;
  font-size: 0.9rem;
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

const EditFaceButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const EditFaceButton = styled(motion.button)`
  background: ${props => props.$variant === 'primary' ? '#6e56cf' : 'transparent'};
  border: 1px solid #6e56cf;
  border-radius: 8px;
  padding: 8px 16px;
  color: ${props => props.$variant === 'primary' ? '#ffffff' : '#c6b9ff'};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$variant === 'primary' ? '#5a46b0' : 'rgba(110, 86, 207, 0.12)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CreateEntry = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFaces, setSelectedFaces] = useState([]);
  const [suggestedFaces, setSuggestedFaces] = useState([]);
  const [showCreateFaceForm, setShowCreateFaceForm] = useState(false);
  const [newFaceName, setNewFaceName] = useState('');
  const [newFaceIcon, setNewFaceIcon] = useState('🙂');
  const [editingFace, setEditingFace] = useState(null);
  const [editFaceName, setEditFaceName] = useState('');
  const [editFaceIcon, setEditFaceIcon] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const isPublic = watch('is_public', false);
  const content = watch('content', '');
  const title = watch('title', '');

  // Fetch available faces
  const { data: faces = [] } = useQuery(['faces'], getFaces);

  // Get face suggestions based on content
  const { data: faceSuggestions = [] } = useQuery(
    ['face-suggestions', title, content],
    () => suggestFaces({ title, text: content }),
    { 
      enabled: !!(title || content),
      staleTime: 30000 // Cache for 30 seconds
    }
  );

  const createEntryMutation = useMutation(createEntry, {
    onSuccess: (data) => {
      // Invalidate all entry-related queries
      queryClient.invalidateQueries('entries');
      queryClient.invalidateQueries(['entry', data.id]);
      queryClient.invalidateQueries(['face-entries']);
      
      // Force a fresh fetch by removing the cached entry data
      queryClient.removeQueries(['entry', data.id]);
      
      // Navigate to the entry detail page (which will auto-refresh during processing)
      navigate(`/entry/${data.id}`);
    },
    onError: (error) => {
      console.error('Error creating entry:', error);
    },
  });

  const createFaceMutation = useMutation(createFace, {
    onSuccess: (data) => {
      // Invalidate faces query to refresh the list
      queryClient.invalidateQueries('faces');
      
      // Add the new face to selected faces
      setSelectedFaces(prev => [...prev, data.id]);
      
      // Hide the create face form
      setShowCreateFaceForm(false);
      setNewFaceName('');
      setNewFaceIcon('🙂');
    },
    onError: (error) => {
      console.error('Error creating face:', error);
    },
  });

  const updateFaceMutation = useMutation(
    ({ id, data }) => updateFace(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('faces');
        setEditingFace(null);
        setEditFaceName('');
        setEditFaceIcon('');
      },
      onError: (error) => {
        console.error('Error updating face:', error);
      },
    }
  );


  const onDrop = (acceptedFiles) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFaceSelection = (faceId) => {
    setSelectedFaces(prev => 
      prev.includes(faceId) 
        ? prev.filter(id => id !== faceId)
        : [...prev, faceId]
    );
  };

  const addSuggestedFace = (suggestion) => {
    if (suggestion.id && !selectedFaces.includes(suggestion.id)) {
      setSelectedFaces(prev => [...prev, suggestion.id]);
    }
  };

  const handleCreateFace = async () => {
    if (!newFaceName.trim()) return;
    
    const faceData = {
      name: newFaceName.trim(),
      icon: newFaceIcon,
      description: `Created from entry: ${title || 'Untitled'}`
    };
    
    await createFaceMutation.mutateAsync(faceData);
  };

  const cancelCreateFace = () => {
    setShowCreateFaceForm(false);
    setNewFaceName('');
    setNewFaceIcon('🙂');
  };

  const startEditFace = (face) => {
    setEditingFace(face);
    setEditFaceName(face.name);
    setEditFaceIcon(face.icon || '🙂');
  };

  const cancelEditFace = () => {
    setEditingFace(null);
    setEditFaceName('');
    setEditFaceIcon('');
  };

  const handleUpdateFace = async () => {
    if (!editFaceName.trim() || !editingFace) return;
    
    const faceData = {
      name: editFaceName.trim(),
      icon: editFaceIcon,
    };
    
    await updateFaceMutation.mutateAsync({ id: editingFace.id, data: faceData });
  };

  const onSubmit = async (data) => {
    try {
      const entryData = {
        title: data.title,
        content: data.content,
        is_public: data.is_public || false,
        face_ids: selectedFaces,
      };

      const entry = await createEntryMutation.mutateAsync(entryData);

      // Upload files if any
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          await uploadDocument(entry.id, file);
        }
      }
    } catch (error) {
      console.error('Error creating entry:', error);
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <Sparkles size={24} />
          Create New Entry
        </Title>
        <Subtitle>Share your thoughts and let AI extract insights</Subtitle>
      </Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label htmlFor="title">Title (Optional)</Label>
          <Input
            id="title"
            type="text"
            placeholder="Give your entry a title..."
            {...register('title')}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="content">Your Entry *</Label>
          <TextArea
            id="content"
            placeholder="Write about your day, experiences, thoughts, or anything you'd like to remember..."
            {...register('content', { required: 'Content is required' })}
          />
          {errors.content && (
            <ErrorMessage>{errors.content.message}</ErrorMessage>
          )}
        </FormGroup>

        <FormGroup>
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
                  Make this entry public (share with community)
                </>
              ) : (
                <>
                  <EyeOff size={16} style={{ marginRight: '5px' }} />
                  Keep this entry private
                </>
              )}
            </CheckboxLabel>
          </CheckboxGroup>
        </FormGroup>

        <FaceSelectionSection>
          <Label>Select Faces (Optional)</Label>
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
                <FaceActions>
                  <FaceActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditFace(face);
                    }}
                    title="Edit face"
                  >
                    ✏️
                  </FaceActionButton>
                </FaceActions>
              </FaceCard>
            ))}
            {!showCreateFaceForm && (
              <AddFaceButton
                onClick={() => setShowCreateFaceForm(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>+</span>
                <span>Add New Face</span>
              </AddFaceButton>
            )}
          </FaceGrid>
          
          {faceSuggestions.length > 0 && (
            <SuggestedFaces>
              <SuggestedTitle>
                <Sparkles size={16} />
                AI Suggestions
              </SuggestedTitle>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {faceSuggestions.map((suggestion, index) => (
                  <SuggestionCard
                    key={index}
                    onClick={() => addSuggestedFace(suggestion)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{suggestion.icon}</span>
                    <span>{suggestion.name}</span>
                  </SuggestionCard>
                ))}
              </div>
            </SuggestedFaces>
          )}

          {showCreateFaceForm && (
            <CreateFaceForm>
              <CreateFaceTitle>
                <Sparkles size={16} />
                Create New Face
              </CreateFaceTitle>
              <CreateFaceInputs>
                <CreateFaceInput
                  type="text"
                  placeholder="Face name (e.g., 'Gardener', 'Father')"
                  value={newFaceName}
                  onChange={(e) => setNewFaceName(e.target.value)}
                />
                <IconSelector>
                  <span style={{ color: '#c6b9ff', fontSize: '14px' }}>Icon:</span>
                  <EmojiPicker 
                    selectedEmoji={newFaceIcon} 
                    onEmojiSelect={setNewFaceIcon} 
                  />
                </IconSelector>
              </CreateFaceInputs>
              <CreateFaceButtons>
                <CreateFaceButton
                  type="button"
                  $variant="secondary"
                  onClick={cancelCreateFace}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </CreateFaceButton>
                <CreateFaceButton
                  type="button"
                  $variant="primary"
                  onClick={handleCreateFace}
                  disabled={!newFaceName.trim() || createFaceMutation.isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {createFaceMutation.isLoading ? 'Creating...' : 'Create Face'}
                </CreateFaceButton>
              </CreateFaceButtons>
            </CreateFaceForm>
          )}

          {editingFace && (
            <EditFaceForm>
              <EditFaceTitle>
                <Sparkles size={16} />
                Edit Face: {editingFace.name}
              </EditFaceTitle>
              <EditFaceInputs>
                <EditFaceInput
                  type="text"
                  placeholder="Face name (e.g., 'Gardener', 'Father')"
                  value={editFaceName}
                  onChange={(e) => setEditFaceName(e.target.value)}
                />
                <IconSelector>
                  <span style={{ color: '#c6b9ff', fontSize: '14px' }}>Icon:</span>
                  <EmojiPicker 
                    selectedEmoji={editFaceIcon} 
                    onEmojiSelect={setEditFaceIcon} 
                  />
                </IconSelector>
              </EditFaceInputs>
              <EditFaceButtons>
                <EditFaceButton
                  type="button"
                  $variant="secondary"
                  onClick={cancelEditFace}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </EditFaceButton>
                <EditFaceButton
                  type="button"
                  $variant="primary"
                  onClick={handleUpdateFace}
                  disabled={!editFaceName.trim() || updateFaceMutation.isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {updateFaceMutation.isLoading ? 'Updating...' : 'Update Face'}
                </EditFaceButton>
              </EditFaceButtons>
            </EditFaceForm>
          )}
        </FaceSelectionSection>

        <FormGroup>
          <Label>Attach Documents (Optional)</Label>
          <FileUploadArea
            {...getRootProps()}
            $isDragActive={isDragActive}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input {...getInputProps()} />
            <UploadIcon>
              <Upload size={32} />
            </UploadIcon>
            <UploadText>
              {isDragActive
                ? 'Drop files here...'
                : 'Drag & drop files here, or click to select'
              }
            </UploadText>
            <UploadSubtext>
              Supports images, PDFs, and text files (max 10MB each)
            </UploadSubtext>
          </FileUploadArea>

          {uploadedFiles.length > 0 && (
            <FileList>
              {uploadedFiles.map((file, index) => (
                <FileItem key={index}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <FileName>{file.name}</FileName>
                    <FileSize>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </FileSize>
                  </div>
                  <RemoveButton
                    onClick={() => removeFile(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Remove
                  </RemoveButton>
                </FileItem>
              ))}
            </FileList>
          )}
        </FormGroup>

        <ButtonGroup>
          <Button
            type="button"
            $variant="secondary"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            $variant="primary"
            disabled={createEntryMutation.isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Save size={16} />
            {createEntryMutation.isLoading ? 'Creating...' : 'Create Entry'}
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

export default CreateEntry;
