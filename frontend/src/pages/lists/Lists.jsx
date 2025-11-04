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
 * Placeholder page for Lists
 */
function Lists() {
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
          My Lists
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/lists/new')}
        >
          Create New List
        </Button>
      </Box>
      
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            No lists yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first list to get started managing gift ideas and sharing them with others.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/lists/new')}
          >
            Create Your First List
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Lists;