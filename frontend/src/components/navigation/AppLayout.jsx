import { useState, useEffect } from 'react';
import { 
  Box, 
  useTheme, 
  useMediaQuery 
} from '@mui/material';
import { useUserPreferences } from '../../hooks/useLocalStorage';
import Header from '../navigation/Header';
import Sidebar from '../navigation/Sidebar';

const DRAWER_WIDTH = 280;

/**
 * Main Application Layout component
 */
function AppLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { preferences, updatePreference } = useUserPreferences();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(preferences.sidebarCollapsed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync sidebar state with preferences
  useEffect(() => {
    setSidebarCollapsed(preferences.sidebarCollapsed);
  }, [preferences.sidebarCollapsed]);

  // Auto-close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [isMobile, mobileMenuOpen]);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    updatePreference('sidebarCollapsed', newCollapsed);
  };

  // Handle mobile menu toggle
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle mobile menu close
  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Header */}
      <Header 
        onMobileMenuToggle={handleMobileMenuToggle}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={handleSidebarToggle}
        drawerWidth={DRAWER_WIDTH}
      />

      {/* Sidebar */}
      <Sidebar 
        collapsed={!isMobile && sidebarCollapsed}
        show={isMobile && mobileMenuOpen}
        onClose={handleMobileMenuClose}
        drawerWidth={DRAWER_WIDTH}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarCollapsed ? 64 : DRAWER_WIDTH}px)` },
          ml: { sm: sidebarCollapsed ? '64px' : `${DRAWER_WIDTH}px` },
          mt: '64px', // Height of AppBar
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default AppLayout;