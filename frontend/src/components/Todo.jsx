import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  useMediaQuery,
  Collapse,
  LinearProgress,
  Slider,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Flag as FlagIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon,
  Share as ShareIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Stopwatch from './Stopwatch';

const priorityOptions = ['Low', 'Medium', 'High'];
const categoryOptions = ['Work', 'Personal', 'Shopping', 'Health', 'Other'];

const Todo = ({ 
  todo, 
  onDelete, 
  onEdit, 
  onTimeUpdate,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onShare 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedTodo, setEditedTodo] = useState(todo);
  const [showTimeTracker, setShowTimeTracker] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [progressAnchorEl, setProgressAnchorEl] = useState(null);
  const [customProgress, setCustomProgress] = useState(todo.progress || 0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTimeUpdate = (taskId, newTime) => {
    onTimeUpdate && onTimeUpdate(taskId, newTime);
  };

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setEditMode(true);
    handleMenuClose();
  };

  const handleSave = () => {
    onEdit(editedTodo);
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditedTodo(todo);
    setEditMode(false);
  };

  const handleDelete = () => {
    onDelete(todo.id);
    handleMenuClose();
  };

  const handleStatusToggle = (e) => {
    e.stopPropagation();
    const newStatus = !todo.completed;
    onStatusChange && onStatusChange(todo.id, newStatus);
  };

  const handleProgressClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setProgressAnchorEl(event.currentTarget);
  };

  const handleProgressClose = () => {
    setProgressAnchorEl(null);
  };

  const handleProgressUpdate = () => {
    const updatedTodo = { ...todo, progress: customProgress };
    onEdit(updatedTodo);
    handleProgressClose();
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Card 
      sx={{ 
        mb: 2,
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3
        },
        cursor: 'pointer'
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              size="small" 
              onClick={handleStatusToggle}
            >
              {todo.completed ? 
                <CheckCircleIcon color="success" /> : 
                <UncheckedIcon />
              }
            </IconButton>
            {editMode ? (
              <TextField
                value={editedTodo.title}
                onChange={(e) => setEditedTodo({ ...editedTodo, title: e.target.value })}
                size="small"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Typography 
                variant="h6" 
                sx={{ 
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? 'text.secondary' : 'text.primary'
                }}
              >
                {todo.title}
              </Typography>
            )}
          </Box>
          <IconButton onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          {editMode ? (
            <TextField
              fullWidth
              multiline
              rows={3}
              value={editedTodo.description}
              onChange={(e) => setEditedTodo({ ...editedTodo, description: e.target.value })}
              sx={{ mb: 2 }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {todo.description}
            </Typography>
          )}

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Chip 
              icon={<FlagIcon />} 
              label={todo.priority} 
              color={getPriorityColor(todo.priority)}
              size="small"
            />
            <Chip 
              icon={<TimeIcon />} 
              label={format(new Date(todo.dueDate), 'MMM dd, yyyy')}
              size="small"
            />
            {todo.category && (
              <Chip 
                icon={<CategoryIcon />} 
                label={todo.category}
                size="small"
              />
            )}
          </Stack>

          <Box sx={{ mt: 2 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 1, 
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleProgressClick(e);
              }}
            >
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimelineIcon fontSize="small" />
                Progress: {todo.progress || 0}%
              </Typography>
            </Box>
            <Box 
              sx={{ 
                position: 'relative', 
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8
                },
                padding: '8px 0',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleProgressClick(e);
              }}
            >
              <LinearProgress
                variant="determinate"
                value={todo.progress || 0}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'grey.200',
                  cursor: 'pointer',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    bgcolor: todo.progress === 100 ? 'success.main' : 'primary.main'
                  }
                }}
              />
            </Box>
          </Box>

          {showTimeTracker && (
            <Box sx={{ mt: 2 }}>
              <Stopwatch 
                taskId={todo.id} 
                onTimeUpdate={handleTimeUpdate}
                initialTime={todo.timeSpent || 0}
              />
            </Box>
          )}

          {editMode && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button size="small" onClick={handleCancel}>Cancel</Button>
              <Button size="small" variant="contained" onClick={handleSave}>Save</Button>
            </Box>
          )}
        </Collapse>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          onShare && onShare(todo);
        }}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          Share
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={progressAnchorEl}
        open={Boolean(progressAnchorEl)}
        onClose={handleProgressClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            width: 300,
            p: 2,
          }
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          Update Progress
        </Typography>
        <Box sx={{ px: 1, py: 2 }} onClick={(e) => e.stopPropagation()}>
          <Typography variant="body2" gutterBottom>
            Progress: {customProgress}%
          </Typography>
          <Slider
            value={customProgress}
            onChange={(_, value) => setCustomProgress(value)}
            valueLabelDisplay="auto"
            step={5}
            marks
            min={0}
            max={100}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            {[0, 25, 50, 75, 100].map((value) => (
              <Button
                key={value}
                size="small"
                variant={customProgress === value ? "contained" : "outlined"}
                onClick={(e) => {
                  e.stopPropagation();
                  setCustomProgress(value);
                }}
              >
                {value}%
              </Button>
            ))}
          </Stack>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button onClick={(e) => {
            e.stopPropagation();
            handleProgressClose();
          }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={(e) => {
              e.stopPropagation();
              handleProgressUpdate();
            }}
          >
            Update
          </Button>
        </Box>
      </Menu>
    </Card>
  );
};

export default Todo; 