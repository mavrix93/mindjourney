import { motion } from 'framer-motion';
import { Clock, Home, MapPin, Plus, User, Tags } from 'lucide-react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const NavigationContainer = styled(motion.nav)`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(12, 12, 14, 0.6);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(110, 86, 207, 0.25);
  padding: 10px 0;
  z-index: 1000;
`;

const NavList = styled.ul`
  display: flex;
  justify-content: center;
  align-items: center;
  list-style: none;
  gap: 8px;
  margin: 0 auto;
  padding: 0 16px;
`;

const NavItem = styled(motion.li)`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 10px;
  transition: all 0.3s ease;
  
  ${props => props.$active && `
    background: rgba(110, 86, 207, 0.15);
    box-shadow: 0 0 0 1px rgba(110, 86, 207, 0.25) inset;
  `}
`;

const NavIcon = styled(motion.div)`
  color: ${props => props.$active ? '#c6b9ff' : 'rgba(230, 230, 230, 0.7)'};
  margin-right: 8px;
`;

const NavLabel = styled.span`
  font-size: 12px;
  color: ${props => props.$active ? '#e6e6e6' : 'rgba(230, 230, 230, 0.7)'};
  font-weight: 600;
`;

const navigationItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/timeline', icon: Clock, label: 'Timeline' },
  { path: '/faces', icon: Tags, label: 'Faces' },
  { path: '/places', icon: MapPin, label: 'Places' },
  { path: '/create', icon: Plus, label: 'Create' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <NavigationContainer
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <NavList>
        {navigationItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          
          return (
            <NavItem
              key={path}
              $active={isActive}
              onClick={() => navigate(path)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <NavIcon $active={isActive}>
                <Icon size={18} />
              </NavIcon>
              <NavLabel $active={isActive}>{label}</NavLabel>
            </NavItem>
          );
        })}
      </NavList>
    </NavigationContainer>
  );
};

export default Navigation;
