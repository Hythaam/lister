import {
  Box,
  Typography,
  Button,
  Card,
  CardContent
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Placeholder page for Groups
 */
function Groups() {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        <Typography variant="h4" component="h1">
          Groups
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/groups/new')}
        >
          Create New Group
        </Button>
      </Box>
      
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            No groups yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create or join groups to share lists with family and friends.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/groups/new')}
          >
            Create Your First Group
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Groups;