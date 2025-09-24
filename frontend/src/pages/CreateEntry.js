import { motion } from 'framer-motion';
import { Eye, EyeOff, Save, Sparkles, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { createEntry, uploadDocument } from '../services/api';

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

const CreateEntry = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const isPublic = watch('is_public', false);

  const createEntryMutation = useMutation(createEntry, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('entries');
      navigate(`/entry/${data.id}`);
    },
    onError: (error) => {
      console.error('Error creating entry:', error);
    },
  });

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

  const onSubmit = async (data) => {
    try {
      const entryData = {
        title: data.title,
        content: data.content,
        is_public: data.is_public || false,
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
