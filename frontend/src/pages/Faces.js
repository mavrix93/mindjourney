import { Calendar, Check, Eye, EyeOff, PlusCircle, User, X, Tag, Filter } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import styled from 'styled-components';
import EmojiPicker from '../components/EmojiPicker';
import { createFace, getEntriesByFace, getFaces, getPublicEntries, getSubscribedFaces, subscribeFace, unsubscribeFace, getCategories, getEntriesByCategory, updateFace } from '../services/api';

const Container = styled.div`
  padding: 24px;
  padding-top: 72px;
  padding-bottom: 40px;
  max-width: 1100px;
  margin: 0 auto;
  color: #e6e6e6;
`;

const SectionTitle = styled.h2`
  margin: 0 0 16px;
  font-size: 1.25rem;
  font-weight: 700;
`;

const FacesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
`;

const FaceCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 14px;
  padding: 12px;
  color: #e6e6e6;
  cursor: pointer;
`;

const FaceIcon = styled.div`
  font-size: 28px;
  margin-bottom: 8px;
`;

const FaceName = styled.div`
  font-size: 12px;
  text-align: center;
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const FilterChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0 8px;
`;

const Chip = styled.button`
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(110, 86, 207, 0.35);
  background: ${p => (p.$active ? 'rgba(110, 86, 207, 0.18)' : 'transparent')};
  color: #c6b9ff;
`;

const EntriesList = styled.div`
  margin-top: 16px;
  display: grid;
  gap: 10px;
`;

const EntryCard = styled.div`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 12px;
  padding: 12px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  width: 100%;
  max-width: 420px;
  background: rgba(12, 12, 14, 0.8);
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 12px;
  padding: 16px;
`;

const ModalTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 1.1rem;
`;

const ModalRow = styled.div`
  margin-bottom: 12px;
`;

const Input = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 10px;
  padding: 10px 12px;
  color: #e6e6e6;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Button = styled.button`
  background: ${p => p.$variant === 'primary' ? '#6e56cf' : 'transparent'};
  border: 1px solid #6e56cf;
  color: ${p => p.$variant === 'primary' ? '#fff' : '#c6b9ff'};
  border-radius: 10px;
  padding: 8px 12px;
`;

const FaceEntriesModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const FaceEntriesContent = styled.div`
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  background: rgba(12, 12, 14, 0.9);
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
`;

const FaceEntriesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const FaceEntriesTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FaceEntriesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FaceEntryCard = styled.div`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(110, 86, 207, 0.4);
    background: rgba(110, 86, 207, 0.08);
  }
`;

const FaceEntryTitle = styled.div`
  font-weight: 600;
  color: #e6e6e6;
  margin-bottom: 4px;
`;

const FaceEntryContent = styled.div`
  color: rgba(230, 230, 230, 0.7);
  font-size: 0.9rem;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const FaceEntryMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: rgba(230, 230, 230, 0.5);
`;

const FaceEntryDate = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FaceEntryVisibility = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: rgba(230, 230, 230, 0.5);
  padding: 20px;
  font-style: italic;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
`;

const Tab = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(110, 86, 207, 0.25);
  background: ${p => p.$active ? 'rgba(110, 86, 207, 0.18)' : 'transparent'};
  color: ${p => p.$active ? '#c6b9ff' : 'rgba(230, 230, 230, 0.7)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
`;

const CategoryCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(110, 86, 207, 0.25);
  border-radius: 14px;
  padding: 12px;
  color: #e6e6e6;
  cursor: pointer;
`;

const CategoryIcon = styled.div`
  font-size: 24px;
  margin-bottom: 6px;
`;

const CategoryName = styled.div`
  font-size: 12px;
  text-align: center;
  margin-bottom: 4px;
`;

const CategoryType = styled.div`
  font-size: 10px;
  color: rgba(230, 230, 230, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

const EditFaceButton = styled.button`
  background: ${p => p.$variant === 'primary' ? '#6e56cf' : 'transparent'};
  border: 1px solid #6e56cf;
  border-radius: 8px;
  padding: 8px 16px;
  color: ${p => p.$variant === 'primary' ? '#ffffff' : '#c6b9ff'};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${p => p.$variant === 'primary' ? '#5a46b0' : 'rgba(110, 86, 207, 0.12)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function Faces() {
  const queryClient = useQueryClient();
  const [selectedFaceFilters, setSelectedFaceFilters] = useState([]);
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newFaceName, setNewFaceName] = useState('');
  const [newFaceIcon, setNewFaceIcon] = useState('🙂');
  const [selectedFaceForEntries, setSelectedFaceForEntries] = useState(null);
  const [selectedCategoryForEntries, setSelectedCategoryForEntries] = useState(null);
  const [activeTab, setActiveTab] = useState('faces'); // 'faces' or 'categories'
  const [editingFace, setEditingFace] = useState(null);
  const [editFaceName, setEditFaceName] = useState('');
  const [editFaceIcon, setEditFaceIcon] = useState('');

  const { data: allFaces = [] } = useQuery(['faces'], getFaces);
  const { data: subscribedFaces = [] } = useQuery(['subscribed-faces'], getSubscribedFaces);
  const { data: categories = [] } = useQuery(['categories'], getCategories);

  const toggleFaceFilter = (faceId) => {
    setSelectedFaceFilters((prev) =>
      prev.includes(faceId) ? prev.filter((id) => id !== faceId) : [...prev, faceId]
    );
  };

  const toggleCategoryFilter = (categoryId) => {
    setSelectedCategoryFilters((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const { data: entries = [], isLoading: entriesLoading } = useQuery(
    ['public-entries', selectedFaceFilters, selectedCategoryFilters],
    () => {
      const filters = {};
      if (selectedFaceFilters.length) {
        filters.face_ids = selectedFaceFilters.join(',');
      }
      if (selectedCategoryFilters.length) {
        filters.category_ids = selectedCategoryFilters.join(',');
      }
      return getPublicEntries(filters);
    },
    { keepPreviousData: true }
  );

  // Query for entries by selected face
  const { data: faceEntries = [], isLoading: faceEntriesLoading } = useQuery(
    ['face-entries', selectedFaceForEntries?.id],
    () => getEntriesByFace(selectedFaceForEntries.id),
    { 
      enabled: !!selectedFaceForEntries,
      keepPreviousData: true 
    }
  );

  // Query for entries by selected category
  const { data: categoryEntries = [], isLoading: categoryEntriesLoading } = useQuery(
    ['category-entries', selectedCategoryForEntries?.id],
    () => getEntriesByCategory(selectedCategoryForEntries.id),
    { 
      enabled: !!selectedCategoryForEntries,
      keepPreviousData: true 
    }
  );

  const subscribeMutation = useMutation(subscribeFace, {
    onSuccess: () => {
      queryClient.invalidateQueries(['subscribed-faces']);
    },
  });

  const unsubscribeMutation = useMutation(unsubscribeFace, {
    onSuccess: () => {
      queryClient.invalidateQueries(['subscribed-faces']);
    },
  });

  const updateFaceMutation = useMutation(
    ({ id, data }) => updateFace(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['faces']);
        queryClient.invalidateQueries(['subscribed-faces']);
        setEditingFace(null);
        setEditFaceName('');
        setEditFaceIcon('');
      },
      onError: (error) => {
        console.error('Error updating face:', error);
      },
    }
  );

  const subscribedIds = useMemo(() => new Set(subscribedFaces.map(f => f.id)), [subscribedFaces]);

  const showFaceEntries = (face) => {
    setSelectedFaceForEntries(face);
  };

  const closeFaceEntries = () => {
    setSelectedFaceForEntries(null);
  };

  const showCategoryEntries = (category) => {
    setSelectedCategoryForEntries(category);
  };

  const closeCategoryEntries = () => {
    setSelectedCategoryForEntries(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  return (
    <Container>
      <TabContainer>
        <Tab $active={activeTab === 'faces'} onClick={() => setActiveTab('faces')}>
          <User size={16} />
          Faces
        </Tab>
        <Tab $active={activeTab === 'categories'} onClick={() => setActiveTab('categories')}>
          <Tag size={16} />
          Categories
        </Tab>
      </TabContainer>

      {activeTab === 'faces' && (
        <>
          <SectionTitle>Your Faces</SectionTitle>
          <FacesGrid>
            {subscribedFaces.map(face => (
              <FaceCard key={face.id} onClick={() => toggleFaceFilter(face.id)}>
                <FaceIcon>{face.icon || '🙂'}</FaceIcon>
                <FaceName>{face.name}</FaceName>
                <ActionsRow>
                  <Chip $active={selectedFaceFilters.includes(face.id)}>Filter</Chip>
                  <Chip onClick={(e) => { e.stopPropagation(); showFaceEntries(face); }}>
                    <User size={14} />
                  </Chip>
                  <Chip onClick={(e) => { e.stopPropagation(); startEditFace(face); }}>
                    ✏️
                  </Chip>
                  <Chip onClick={(e) => { e.stopPropagation(); unsubscribeMutation.mutate(face.id); }}>
                    <X size={14} />
                  </Chip>
                </ActionsRow>
              </FaceCard>
            ))}
            <FaceCard onClick={() => setIsAddOpen(true)} data-testid="open-add-face">
              <PlusCircle />
              <FaceName>Add more</FaceName>
            </FaceCard>
          </FacesGrid>

          <SectionTitle style={{ marginTop: 24 }}>Explore Faces</SectionTitle>
          <FacesGrid>
            {allFaces.map(face => (
              <FaceCard key={face.id}>
                <FaceIcon>{face.icon || '🙂'}</FaceIcon>
                <FaceName>{face.name}</FaceName>
                <ActionsRow>
                  {subscribedIds.has(face.id) ? (
                    <Chip $active={true}><Check size={14}/> Subscribed</Chip>
                  ) : (
                    <Chip onClick={() => subscribeMutation.mutate(face.id)}>Subscribe</Chip>
                  )}
                </ActionsRow>
              </FaceCard>
            ))}
          </FacesGrid>
        </>
      )}

      {activeTab === 'categories' && (
        <>
          <SectionTitle>Categories</SectionTitle>
          <FacesGrid>
            {categories.map(category => (
              <CategoryCard key={category.id} onClick={() => toggleCategoryFilter(category.id)}>
                <CategoryIcon>
                  {category.category_type === 'place' ? '📍' :
                   category.category_type === 'product' ? '🛍️' :
                   category.category_type === 'movie' ? '🎬' :
                   category.category_type === 'meal' ? '🍽️' :
                   category.category_type === 'person' ? '👤' :
                   category.category_type === 'activity' ? '🏃' :
                   category.category_type === 'emotion' ? '😊' : '🏷️'}
                </CategoryIcon>
                <CategoryName>{category.name}</CategoryName>
                <CategoryType>{category.category_type}</CategoryType>
                <ActionsRow>
                  <Chip $active={selectedCategoryFilters.includes(category.id)}>Filter</Chip>
                  <Chip onClick={(e) => { e.stopPropagation(); showCategoryEntries(category); }}>
                    <Tag size={14} />
                  </Chip>
                </ActionsRow>
              </CategoryCard>
            ))}
          </FacesGrid>
        </>
      )}

      <SectionTitle style={{ marginTop: 24 }}>Entries</SectionTitle>
      <FilterChips>
        {selectedFaceFilters.map(faceId => {
          const face = subscribedFaces.find(f => f.id === faceId);
          return face ? (
            <Chip key={faceId} $active={true} onClick={() => toggleFaceFilter(faceId)}>
              {face.name}
            </Chip>
          ) : null;
        })}
        {selectedCategoryFilters.map(categoryId => {
          const category = categories.find(c => c.id === categoryId);
          return category ? (
            <Chip key={categoryId} $active={true} onClick={() => toggleCategoryFilter(categoryId)}>
              {category.name}
            </Chip>
          ) : null;
        })}
      </FilterChips>

      <EntriesList>
        {entriesLoading ? (
          <div>Loading...</div>
        ) : (
          entries.map(e => (
            <EntryCard key={e.id}>
              <div style={{ fontWeight: 600 }}>{e.title || 'Untitled'}</div>
              <div style={{ opacity: 0.8, marginTop: 6 }}>{e.content}</div>
            </EntryCard>
          ))
        )}
      </EntriesList>

      {isAddOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Add Face</ModalTitle>
            <ModalRow>
              <Input placeholder="Name" value={newFaceName} onChange={(e) => setNewFaceName(e.target.value)} />
            </ModalRow>
            <ModalRow>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#c6b9ff', fontSize: '14px' }}>Icon:</span>
                <EmojiPicker 
                  selectedEmoji={newFaceIcon} 
                  onEmojiSelect={setNewFaceIcon} 
                />
              </div>
            </ModalRow>
            <ModalActions>
              <Button onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button
                $variant="primary"
                onClick={async () => {
                  try {
                    await createFace({ name: newFaceName || 'New Face', icon: newFaceIcon || '🙂' });
                    queryClient.invalidateQueries(['faces']);
                    setIsAddOpen(false);
                  } catch (e) {}
                }}
                data-testid="submit-add-face"
              >
                Add
              </Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {editingFace && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Edit Face</ModalTitle>
            <ModalRow>
              <Input 
                placeholder="Name" 
                value={editFaceName} 
                onChange={(e) => setEditFaceName(e.target.value)} 
              />
            </ModalRow>
            <ModalRow>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#c6b9ff', fontSize: '14px' }}>Icon:</span>
                <EmojiPicker 
                  selectedEmoji={editFaceIcon} 
                  onEmojiSelect={setEditFaceIcon} 
                />
              </div>
            </ModalRow>
            <ModalActions>
              <Button onClick={cancelEditFace}>Cancel</Button>
              <Button
                $variant="primary"
                onClick={handleUpdateFace}
                disabled={!editFaceName.trim() || updateFaceMutation.isLoading}
              >
                {updateFaceMutation.isLoading ? 'Updating...' : 'Update'}
              </Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {selectedFaceForEntries && (
        <FaceEntriesModal>
          <FaceEntriesContent>
            <FaceEntriesHeader>
              <FaceEntriesTitle>
                <span>{selectedFaceForEntries.icon || '🙂'}</span>
                {selectedFaceForEntries.name} - Entries
              </FaceEntriesTitle>
              <Button onClick={closeFaceEntries}>
                <X size={16} />
              </Button>
            </FaceEntriesHeader>
            
            {faceEntriesLoading ? (
              <div>Loading entries...</div>
            ) : faceEntries.length > 0 ? (
              <FaceEntriesList>
                {faceEntries.map(entry => (
                  <FaceEntryCard key={entry.id} onClick={() => window.location.href = `/entry/${entry.id}`}>
                    <FaceEntryTitle>{entry.title || 'Untitled Entry'}</FaceEntryTitle>
                    <FaceEntryContent>{entry.content}</FaceEntryContent>
                    <FaceEntryMeta>
                      <FaceEntryDate>
                        <Calendar size={12} />
                        {formatDate(entry.created_at)}
                      </FaceEntryDate>
                      <FaceEntryVisibility>
                        {entry.is_public ? <Eye size={12} /> : <EyeOff size={12} />}
                        {entry.is_public ? 'Public' : 'Private'}
                      </FaceEntryVisibility>
                    </FaceEntryMeta>
                  </FaceEntryCard>
                ))}
              </FaceEntriesList>
            ) : (
              <EmptyState>
                No entries found for this face.
              </EmptyState>
            )}
          </FaceEntriesContent>
        </FaceEntriesModal>
      )}

      {selectedCategoryForEntries && (
        <FaceEntriesModal>
          <FaceEntriesContent>
            <FaceEntriesHeader>
              <FaceEntriesTitle>
                <span>
                  {selectedCategoryForEntries.category_type === 'place' ? '📍' :
                   selectedCategoryForEntries.category_type === 'product' ? '🛍️' :
                   selectedCategoryForEntries.category_type === 'movie' ? '🎬' :
                   selectedCategoryForEntries.category_type === 'meal' ? '🍽️' :
                   selectedCategoryForEntries.category_type === 'person' ? '👤' :
                   selectedCategoryForEntries.category_type === 'activity' ? '🏃' :
                   selectedCategoryForEntries.category_type === 'emotion' ? '😊' : '🏷️'}
                </span>
                {selectedCategoryForEntries.name} - Entries
              </FaceEntriesTitle>
              <Button onClick={closeCategoryEntries}>
                <X size={16} />
              </Button>
            </FaceEntriesHeader>
            
            {categoryEntriesLoading ? (
              <div>Loading entries...</div>
            ) : categoryEntries.length > 0 ? (
              <FaceEntriesList>
                {categoryEntries.map(entry => (
                  <FaceEntryCard key={entry.id} onClick={() => window.location.href = `/entry/${entry.id}`}>
                    <FaceEntryTitle>{entry.title || 'Untitled Entry'}</FaceEntryTitle>
                    <FaceEntryContent>{entry.content}</FaceEntryContent>
                    <FaceEntryMeta>
                      <FaceEntryDate>
                        <Calendar size={12} />
                        {formatDate(entry.created_at)}
                      </FaceEntryDate>
                      <FaceEntryVisibility>
                        {entry.is_public ? <Eye size={12} /> : <EyeOff size={12} />}
                        {entry.is_public ? 'Public' : 'Private'}
                      </FaceEntryVisibility>
                    </FaceEntryMeta>
                  </FaceEntryCard>
                ))}
              </FaceEntriesList>
            ) : (
              <EmptyState>
                No entries found for this category.
              </EmptyState>
            )}
          </FaceEntriesContent>
        </FaceEntriesModal>
      )}
    </Container>
  );
}

export default Faces;

