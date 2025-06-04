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
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
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
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
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
  const [newSubtask, setNewSubtask] = useState('');

  const handleTimeUpdate = (taskId, newTime) => {
    onTimeUpdate && onTimeUpdate(taskId, newTime);
  };

  const handleMenuClick = (event) => {
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

  const handleStatusToggle = () => {
    const newStatus = !todo.completed;
    onStatusChange && onStatusChange(todo.id, newStatus);
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const updatedSubtasks = [...(editedTodo.subtasks || []), {
        id: Date.now(),
        title: newSubtask,
        completed: false
      }];
      setEditedTodo({ ...editedTodo, subtasks: updatedSubtasks });
      setNewSubtask('');
    }
  };

  const handleSubtaskToggle = (subtaskId) => {
    const updatedSubtasks = editedTodo.subtasks.map(subtask =>
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
    );
    setEditedTodo({ ...editedTodo, subtasks: updatedSubtasks });
  };

  const calculateProgress = () => {
    if (!todo.subtasks?.length) return 0;
    const completed = todo.subtasks.filter(task => task.completed).length;
    return (completed / todo.subtasks.length) * 100;
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
    <Card sx={{ 
      mb: 2, 
      position: 'relative',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 4,
      },
      opacity: todo.completed ? 0.7 : 1,
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Checkbox
              checked={todo.completed}
              onChange={handleStatusToggle}
              icon={<UncheckedIcon />}
              checkedIcon={<CheckCircleIcon />}
            />
            <Box sx={{ flex: 1 }}>
              {editMode ? (
                <TextField
                  fullWidth
                  value={editedTodo.title}
                  onChange={(e) => setEditedTodo({ ...editedTodo, title: e.target.value })}
                  size="small"
                  sx={{ mb: 2 }}
                />
              ) : (
                <Typography 
                  variant="h6" 
                  component="div" 
                  gutterBottom
                  sx={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
                >
                  {todo.title}
                </Typography>
              )}
              
              {editMode ? (
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={editedTodo.description}
                  onChange={(e) => setEditedTodo({ ...editedTodo, description: e.target.value })}
                  size="small"
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {todo.description}
                </Typography>
              )}
            </Box>
          </Box>

          <IconButton onClick={handleMenuClick} size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>

        {editMode ? (
          <Stack spacing={2} sx={{ mb: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={editedTodo.deadline ? new Date(editedTodo.deadline) : null}
                onChange={(newValue) => setEditedTodo({ ...editedTodo, deadline: newValue })}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
            </LocalizationProvider>

            <FormControl size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={editedTodo.priority || ''}
                onChange={(e) => setEditedTodo({ ...editedTodo, priority: e.target.value })}
                label="Priority"
              >
                {priorityOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={editedTodo.category || ''}
                onChange={(e) => setEditedTodo({ ...editedTodo, category: e.target.value })}
                label="Category"
              >
                {categoryOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            <Chip
              icon={<FlagIcon />}
              label={todo.priority || 'No Priority'}
              size="small"
              color={getPriorityColor(todo.priority)}
            />
            
            {todo.deadline && (
              <Chip
                icon={<TimeIcon />}
                label={format(new Date(todo.deadline), 'MMM dd, yyyy')}
                size="small"
                color="info"
              />
            )}
            
            {todo.category && (
              <Chip
                icon={<CategoryIcon />}
                label={todo.category}
                size="small"
                color="secondary"
              />
            )}

            <Chip
              icon={<TimerIcon />}
              label="Time Tracking"
              size="small"
              color={showTimeTracker ? "primary" : "default"}
              onClick={() => setShowTimeTracker(!showTimeTracker)}
            />
          </Stack>
        )}

        {showTimeTracker && (
          <Box sx={{ mt: 2 }}>
            <Stopwatch 
              taskId={todo.id} 
              onTimeUpdate={handleTimeUpdate}
              initialTime={todo.timeSpent || 0}
            />
          </Box>
        )}

        {/* Subtasks Section */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Subtasks {todo.subtasks?.length > 0 && `(${todo.subtasks.filter(st => st.completed).length}/${todo.subtasks.length})`}
          </Typography>
          
          {todo.subtasks?.length > 0 && (
            <LinearProgress 
              variant="determinate" 
              value={calculateProgress()} 
              sx={{ mb: 1 }} 
            />
          )}

          <List dense>
            {editedTodo.subtasks?.map((subtask) => (
              <ListItem key={subtask.id} disablePadding>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={subtask.completed}
                    onChange={() => handleSubtaskToggle(subtask.id)}
                    disabled={!editMode}
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={subtask.title}
                  sx={{ textDecoration: subtask.completed ? 'line-through' : 'none' }}
                />
                {editMode && (
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={() => {
                        const updatedSubtasks = editedTodo.subtasks.filter(st => st.id !== subtask.id);
                        setEditedTodo({ ...editedTodo, subtasks: updatedSubtasks });
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>

          {editMode && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField
                size="small"
                placeholder="Add subtask"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
              />
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddSubtask}
                variant="outlined"
                size="small"
              >
                Add
              </Button>
            </Box>
          )}
        </Box>

        {editMode && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button size="small" onClick={handleCancel}>Cancel</Button>
            <Button size="small" variant="contained" onClick={handleSave}>Save</Button>
          </Box>
        )}
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
    </Card>
  );
};

export default Todo; 