import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Typography,
  Divider,
  useTheme
} from '@mui/material';
import {
  Dashboard,
  List as ListIcon,
  Group,
  Add,
  ExpandLess,
  ExpandMore,
  Assignment,
  People
} from '@mui/icons-material';

/**
 * Sidebar Navigation component
 */
function Sidebar({ collapsed = false, show = false, onClose, drawerWidth }) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    lists: true,
    groups: false
  });

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Check if current path matches
  const isActive = (path) => location.pathname === path;
  const isActiveParent = (parentPath) => location.pathname.startsWith(parentPath);

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  // Navigation items with Material Icons
  const navigationItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: <Dashboard />
    },
    {
      key: 'lists',
      label: 'My Lists',
      path: '/lists',
      icon: <ListIcon />,
      expandable: true,
      expanded: expandedSections.lists,
      children: [
        { key: 'create-list', label: 'Create New List', path: '/lists/new', icon: <Add /> },
        { key: 'all-lists', label: 'All Lists', path: '/lists', icon: <Assignment /> }
      ]
    },
    {
      key: 'groups',
      label: 'Groups',
      path: '/groups',
      icon: <Group />,
      expandable: true,
      expanded: expandedSections.groups,
      children: [
        { key: 'create-group', label: 'Create Group', path: '/groups/new', icon: <Add /> },
        { key: 'my-groups', label: 'My Groups', path: '/groups', icon: <People /> }
      ]
    }
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <List sx={{ flexGrow: 1, pt: 0 }}>
        {navigationItems.map((item) => (
          <Box key={item.key}>
            {/* Main navigation item */}
            <ListItem disablePadding>
              <ListItemButton
                selected={isActive(item.path) || isActiveParent(item.path)}
                onClick={() => {
                  if (item.expandable) {
                    toggleSection(item.key);
                  } else {
                    handleNavigation(item.path);
                  }
                }}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed ? 'auto' : 3,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <>
                    <ListItemText primary={item.label} />
                    {item.expandable && (
                      item.expanded ? <ExpandLess /> : <ExpandMore />
                    )}
                  </>
                )}
              </ListItemButton>
            </ListItem>

            {/* Expandable children */}
            {item.expandable && !collapsed && (
              <Collapse in={item.expanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children?.map((child) => (
                    <ListItem key={child.key} disablePadding>
                      <ListItemButton
                        selected={isActive(child.path)}
                        onClick={() => handleNavigation(child.path)}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: 3,
                            justifyContent: 'center',
                          }}
                        >
                          {child.icon}
                        </ListItemIcon>
                        <ListItemText primary={child.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>

      {/* Sidebar footer */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        {!collapsed ? (
          <Typography variant="caption" color="textSecondary" align="center">
            Lister v1.0.0
          </Typography>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" title="Lister v1.0.0">
              ℹ️
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={show}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: collapsed ? 64 : drawerWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

export default Sidebar;