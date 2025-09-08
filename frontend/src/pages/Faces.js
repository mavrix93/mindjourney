import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { PlusCircle, Check, X } from 'lucide-react';
import { getFaces, getSubscribedFaces, subscribeFace, unsubscribeFace, getPublicEntries } from '../services/api';

const Container = styled.div`
  padding: 20px;
  color: #fff;
`;

const SectionTitle = styled.h2`
  margin: 0 0 16px;
  font-size: 20px;
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
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 14px;
  padding: 12px;
  color: #fff;
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
  border: 1px solid rgba(138, 43, 226, 0.6);
  background: ${p => (p.$active ? 'rgba(138, 43, 226, 0.25)' : 'transparent')};
  color: #fff;
`;

const EntriesList = styled.div`
  margin-top: 16px;
  display: grid;
  gap: 10px;
`;

const EntryCard = styled.div`
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  padding: 12px;
`;

function Faces() {
  const queryClient = useQueryClient();
  const [selectedFilters, setSelectedFilters] = useState([]);

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
        <FaceCard onClick={() => { /* future: open modal to manage */ }}>
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
    </Container>
  );
}

export default Faces;

