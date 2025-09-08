import React, { useState } from 'react';
import styled from 'styled-components';
import { login } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  max-width: 420px;
  margin: 80px auto;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 24px;
  color: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
`;

const Title = styled.h2`
  margin: 0 0 16px;
`;

const Field = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: #6c5ce7;
  color: white;
  cursor: pointer;
  font-weight: 600;
`;

const ErrorText = styled.p`
  color: #ff7675;
`;

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.non_field_errors?.[0] || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Sign in</Title>
      <form onSubmit={handleSubmit}>
        <Field>
          <Label>Username</Label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </Field>
        <Field>
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <ErrorText>{error}</ErrorText>}
        <Button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
      </form>
    </Container>
  );
}

export default Login;

