import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button
} from '@mui/material';
import {
  List as ListIcon,
  Group as GroupIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard page - main landing page for authenticated users
 */
function Dashboard() {
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: 'My Lists',
      description: 'Manage your gift lists and items.',
      icon: <ListIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: 'View Lists',
      path: '/lists'
    },
    {
      title: 'Groups',
      description: 'Collaborate with friends and family.',
      icon: <GroupIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: 'View Groups',
      path: '/groups'
    },
    {
      title: 'Recent Activity',
      description: "See what's happening with your lists.",
      icon: <TimelineIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: 'View Activity',
      path: '#'
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {dashboardCards.map((card, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 3 }}>
                <Box sx={{ mb: 2 }}>
                  {card.icon}
                </Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant={card.path === '#' ? 'outlined' : 'contained'}
                  onClick={() => {
                    if (card.path !== '#') {
                      navigate(card.path);
                    }
                  }}
                  disabled={card.path === '#'}
                >
                  {card.action}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Dashboard;