import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
  LightMode,
  DarkMode
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { formatUserName, formatInitials } from '../../utils/formatters';
import { useThemeMode } from '../../theme/useThemeMode.js';

/**
 * Application Header component
 */
function Header({ onMobileMenuToggle, sidebarCollapsed, onSidebarToggle, drawerWidth }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleUserMenuClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userDisplayName = formatUserName(user);
  const userInitials = formatInitials(userDisplayName);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${sidebarCollapsed ? 64 : drawerWidth}px)` },
        ml: { sm: sidebarCollapsed ? '64px' : `${drawerWidth}px` },
        transition: (theme) => theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar>
        {/* Mobile menu button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMobileMenuToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Desktop sidebar toggle */}
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          onClick={onSidebarToggle}
          sx={{ mr: 2, display: { xs: 'none', sm: 'flex' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Lister
        </Typography>

        {/* User menu */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Theme toggle button */}
          <IconButton
            size="large"
            aria-label="toggle theme"
            onClick={toggleTheme}
            color="inherit"
          >
            {isDark ? <LightMode /> : <DarkMode />}
          </IconButton>

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="user-menu"
            aria-haspopup="true"
            onClick={handleUserMenuOpen}
            color="inherit"
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {userInitials}
            </Avatar>
          </IconButton>

          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1">{userDisplayName}</Typography>
              <Typography variant="body2" color="textSecondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleUserMenuClose}>
              <AccountCircle sx={{ mr: 1 }} />
              Profile Settings
            </MenuItem>
            <MenuItem onClick={handleUserMenuClose}>
              <Settings sx={{ mr: 1 }} />
              Preferences
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;