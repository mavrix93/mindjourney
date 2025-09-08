import { motion } from 'framer-motion';
import { Clock, Home, MapPin, Plus, User, Tags } from 'lucide-react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const NavigationContainer = styled(motion.nav)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(138, 43, 226, 0.3);
  padding: 12px 0;
  z-index: 1000;
`;

const NavList = styled.ul`
  display: flex;
  justify-content: space-around;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0 20px;
`;

const NavItem = styled(motion.li)`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  ${props => props.$active && `
    background: rgba(138, 43, 226, 0.2);
    box-shadow: 0 0 20px rgba(138, 43, 226, 0.3);
  `}
`;

const NavIcon = styled(motion.div)`
  color: ${props => props.$active ? '#8a2be2' : 'rgba(255, 255, 255, 0.6)'};
  margin-bottom: 4px;
`;

const NavLabel = styled.span`
  font-size: 10px;
  color: ${props => props.$active ? '#8a2be2' : 'rgba(255, 255, 255, 0.6)'};
  font-weight: 500;
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
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <NavList>
        {navigationItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          
          return (
            <NavItem
              key={path}
              $active={isActive}
              onClick={() => navigate(path)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <NavIcon $active={isActive}>
                <Icon size={20} />
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
