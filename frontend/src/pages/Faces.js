import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { PlusCircle, Check, X } from 'lucide-react';
import { getFaces, getSubscribedFaces, subscribeFace, unsubscribeFace, getPublicEntries, createFace } from '../services/api';

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
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
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

function Faces() {
  const queryClient = useQueryClient();
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newFaceName, setNewFaceName] = useState('');
  const [newFaceIcon, setNewFaceIcon] = useState('🙂');

  const { data: allFaces = [] } = useQuery(['faces'], getFaces);
  const { data: subscribedFaces = [] } = useQuery(['subscribed-faces'], getSubscribedFaces);

  const toggleFilter = (faceId) => {
    setSelectedFilters((prev) =>
      prev.includes(faceId) ? prev.filter((id) => id !== faceId) : [...prev, faceId]
    );
  };

  const { data: entries = [], isLoading: entriesLoading } = useQuery(
    ['public-entries', selectedFilters],
    () => getPublicEntries(selectedFilters.length ? { face_ids: selectedFilters.join(',') } : {}),
    { keepPreviousData: true }
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

  const subscribedIds = useMemo(() => new Set(subscribedFaces.map(f => f.id)), [subscribedFaces]);

  return (
    <Container>
      <SectionTitle>Your Faces</SectionTitle>
      <FacesGrid>
        {subscribedFaces.map(face => (
          <FaceCard key={face.id} onClick={() => toggleFilter(face.id)}>
            <FaceIcon>{face.icon || '🙂'}</FaceIcon>
            <FaceName>{face.name}</FaceName>
            <ActionsRow>
              <Chip $active={selectedFilters.includes(face.id)}>Filter</Chip>
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

      <SectionTitle style={{ marginTop: 24 }}>Entries</SectionTitle>
      <FilterChips>
        {subscribedFaces.map(face => (
          <Chip key={face.id} $active={selectedFilters.includes(face.id)} onClick={() => toggleFilter(face.id)}>
            {face.name}
          </Chip>
        ))}
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
              <Input placeholder="Icon (emoji)" value={newFaceIcon} onChange={(e) => setNewFaceIcon(e.target.value)} />
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
    </Container>
  );
}

export default Faces;

