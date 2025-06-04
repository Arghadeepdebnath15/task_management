import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Card,
  CardContent,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stack,
  Tooltip,
  Badge,
  Divider,
  Collapse,
  LinearProgress,
  Slider,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  ListItem,
  List,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  alpha,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AttachFile as AttachFileIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Today as TodayIcon,
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  AssignmentTurnedIn as CompletedIcon,
  Pending as PendingIcon,
  Timeline as InProgressIcon,
  Assignment as TotalIcon,
  Event as DueTodayIcon,
  Warning as OverdueIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  MoreHoriz as MoreHorizIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Timer as TimerIcon,
  Label as LabelIcon,
  Link as LinkIcon,
  ArrowRight as ArrowRightIcon,
  Comment as CommentIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format, addDays } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { tasks } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Stopwatch from '../components/Stopwatch';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  priority: Yup.string().required('Priority is required'),
  dueDate: Yup.date().required('Due date is required'),
});

const Dashboard = () => {
  const [taskList, setTaskList] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [labelAnchorEl, setLabelAnchorEl] = useState(null);
  const [selectedTaskForLabels, setSelectedTaskForLabels] = useState(null);
  const { user, logout } = useAuth();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [progressAnchorEl, setProgressAnchorEl] = useState(null);
  const [selectedTaskForProgress, setSelectedTaskForProgress] = useState(null);
  const [customProgress, setCustomProgress] = useState(0);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [selectedCompletedTask, setSelectedCompletedTask] = useState(null);
  const [completedTaskDialogOpen, setCompletedTaskDialogOpen] = useState(false);
  const [showCompletedPage, setShowCompletedPage] = useState(false);
  const navigate = useNavigate();
  const [timeTrackingTask, setTimeTrackingTask] = useState(null);
  const [attachmentsAnchorEl, setAttachmentsAnchorEl] = useState(null);
  const [selectedTaskAttachments, setSelectedTaskAttachments] = useState(null);
  const [dependencyAnchorEl, setDependencyAnchorEl] = useState(null);
  const [selectedTaskForDependencies, setSelectedTaskForDependencies] = useState(null);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [convertedPdfUrl, setConvertedPdfUrl] = useState(null);
  const imagePreviewRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const defaultLabels = [
    { id: 'work', name: 'Work', color: '#4CAF50' },
    { id: 'personal', name: 'Personal', color: '#2196F3' },
    { id: 'shopping', name: 'Shopping', color: '#9C27B0' },
    { id: 'health', name: 'Health', color: '#F44336' },
    { id: 'education', name: 'Education', color: '#FF9800' },
  ];

  const loadTasks = async () => {
    try {
      const data = await tasks.getAll();
      setTaskList(data);
      setFilteredTasks(data);
    } catch (error) {
      toast.error('Error loading tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (filter) => {
    if (filter && typeof filter === 'string') {
      setSelectedFilter(filter);
      filterTasks(filter, searchQuery);
    }
    setFilterAnchorEl(null);
  };

  const handleMenuClick = (event, task) => {
    event.stopPropagation();
    setSelectedTask(task);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedTask(null);
  };

  const filterTasks = (filter, query) => {
    let filtered = [...taskList];

    // Apply search filter
    if (query) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query.toLowerCase()) ||
          task.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case 'pending':
        filtered = filtered.filter((task) => task.status === 'pending');
        break;
      case 'in-progress':
        filtered = filtered.filter((task) => task.status === 'in-progress');
        break;
      case 'completed':
        filtered = filtered.filter((task) => task.status === 'completed');
        break;
      case 'today':
        filtered = filtered.filter(
          (task) =>
            format(new Date(task.dueDate), 'yyyy-MM-dd') ===
            format(new Date(), 'yyyy-MM-dd')
        );
        break;
      default:
        break;
    }

    setFilteredTasks(filtered);
  };

  useEffect(() => {
    filterTasks(selectedFilter, searchQuery);
  }, [taskList, selectedFilter, searchQuery]);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      attachments: [],
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          if (key === 'attachments') {
            values[key].forEach((file) => {
              formData.append('attachments', file);
            });
          } else {
            formData.append(key, values[key]);
          }
        });

        let newTask;
        if (editingTask) {
          newTask = await tasks.update(editingTask._id, formData);
          setTaskList(prev => prev.map(task => 
            task._id === editingTask._id ? newTask : task
          ));
          toast.success('Task updated successfully');
        } else {
          newTask = await tasks.create(formData);
          setTaskList(prev => [...prev, newTask]);
          toast.success('Task created successfully');
        }

        resetForm();
        setOpenDialog(false);
        setEditingTask(null);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error saving task');
      }
    },
  });

  const handleDelete = async (taskId) => {
    try {
      await tasks.delete(taskId);
      setTaskList(prev => prev.filter(task => task._id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Error deleting task');
    }
    handleMenuClose();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    formik.setValues({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: format(new Date(task.dueDate), 'yyyy-MM-dd'),
      attachments: [],
    });
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const maxSize = 5 * 1024 * 1024;
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large`);
        return false;
      }
      if (!validTypes.includes(file.type)) {
        toast.error(`File ${file.name} has an invalid type`);
        return false;
      }
      return true;
    });

    formik.setFieldValue('attachments', validFiles);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTaskStats = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const stats = {
      total: taskList.length,
      pending: taskList.filter(task => task.status === 'pending').length,
      inProgress: taskList.filter(task => task.status === 'in-progress').length,
      completed: taskList.filter(task => task.status === 'completed').length,
      dueToday: taskList.filter(task => format(new Date(task.dueDate), 'yyyy-MM-dd') === today).length,
      overdue: taskList.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate < new Date() && task.status !== 'completed';
      }).length
    };
    
    // Calculate completion rate
    stats.completionRate = taskList.length > 0 
      ? Math.round((stats.completed / taskList.length) * 100)
      : 0;

    // Calculate trend (example: compare with tasks from last 7 days)
    const lastWeekCompleted = taskList.filter(task => {
      const completedDate = new Date(task.updatedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return task.status === 'completed' && completedDate > weekAgo;
    }).length;

    stats.trend = lastWeekCompleted > stats.completed ? 'up' : 'down';
    stats.trendValue = lastWeekCompleted;

    return stats;
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    try {
      const newTask = await tasks.create({
        title: quickTitle,
        description: 'Quick task added',
        priority: 'medium',
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        status: 'pending'
      });
      setTaskList(prev => [...prev, newTask]);
      setQuickTitle('');
      setShowQuickAdd(false);
      toast.success('Task added successfully');
    } catch (error) {
      toast.error('Error adding task');
    }
  };

  const handleProgressUpdate = async (taskId, progress) => {
    try {
      const updatedTask = await tasks.update(taskId, {
        progress: progress
      });

      setTaskList(prev => prev.map(task => 
        task._id === taskId ? updatedTask : task
      ));
      
      toast.success('Progress updated successfully');
    } catch (error) {
      toast.error('Error updating progress');
    }
    handleProgressClose();
  };

  const handleProgressClick = (event, task) => {
    event.stopPropagation();
    setSelectedTaskForProgress(task);
    setCustomProgress(task.progress || 0);
    setProgressAnchorEl(event.currentTarget);
  };

  const handleProgressClose = () => {
    setProgressAnchorEl(null);
    setSelectedTaskForProgress(null);
    setCustomProgress(0);
  };

  const handleTaskCompletion = async (taskId) => {
    if (!taskId) {
      console.error('No task ID provided for completion');
      toast.error('Error: Could not complete task');
      return;
    }

    try {
      console.log('Completing task:', taskId);
      const updatedTask = await tasks.update(taskId, {
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString()
      });

      console.log('Task completed successfully:', updatedTask);
      setTaskList(prev => prev.map(task => 
        task._id === taskId ? { ...task, status: 'completed', progress: 100 } : task
      ));
      
      toast.success('Task marked as completed');
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error(error.response?.data?.message || 'Error updating task');
    }
  };

  const separateTasks = () => {
    return filteredTasks.reduce((acc, task) => {
      if (task.status === 'completed') {
        acc.completed.push(task);
      } else {
        acc.active.push(task);
      }
      return acc;
    }, { active: [], completed: [] });
  };

  const handleCompletedTaskClick = (task) => {
    setSelectedCompletedTask(task);
    setCompletedTaskDialogOpen(true);
  };

  const handleCompletedTaskDialogClose = () => {
    setSelectedCompletedTask(null);
    setCompletedTaskDialogOpen(false);
  };

  const handleCompletedCardClick = () => {
    setShowCompletedPage(true);
  };

  const handleBackToDashboard = () => {
    setShowCompletedPage(false);
  };

  const handleTimeUpdate = async (taskId, newTime) => {
    try {
      const updatedTask = await tasks.update(taskId, {
        timeSpent: newTime
      });
      setTaskList(prev => prev.map(task => 
        task._id === taskId ? { ...task, timeSpent: newTime } : task
      ));
    } catch (error) {
      console.error('Error updating time:', error);
      toast.error('Error updating time tracking');
    }
  };

  const handleAttachmentsClick = (event, task) => {
    event.stopPropagation();
    setSelectedTaskAttachments(task);
    setAttachmentsAnchorEl(event.currentTarget);
  };

  const handleAttachmentsClose = () => {
    setAttachmentsAnchorEl(null);
    setSelectedTaskAttachments(null);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleLabelClick = (event, task) => {
    event.stopPropagation();
    setSelectedTaskForLabels(task);
    setLabelAnchorEl(event.currentTarget);
  };

  const handleLabelClose = () => {
    setLabelAnchorEl(null);
    setSelectedTaskForLabels(null);
  };

  const handleLabelToggle = async (labelId) => {
    if (!selectedTaskForLabels) return;

    try {
      const currentLabels = selectedTaskForLabels.labels || [];
      const newLabels = currentLabels.includes(labelId)
        ? currentLabels.filter(id => id !== labelId)
        : [...currentLabels, labelId];

      const updatedTask = await tasks.update(selectedTaskForLabels._id, {
        labels: newLabels
      });

      setTaskList(prev => prev.map(task =>
        task._id === selectedTaskForLabels._id ? { ...task, labels: newLabels } : task
      ));

      toast.success('Labels updated successfully');
    } catch (error) {
      console.error('Error updating labels:', error);
      toast.error('Error updating labels');
    }
  };

  const handleDependencyClick = (event, task) => {
    event.stopPropagation();
    setSelectedTaskForDependencies(task);
    setDependencyAnchorEl(event.currentTarget);
  };

  const handleDependencyClose = () => {
    setDependencyAnchorEl(null);
    setSelectedTaskForDependencies(null);
  };

  const handleDependencyToggle = async (dependencyId) => {
    if (!selectedTaskForDependencies) return;

    try {
      const currentDependencies = selectedTaskForDependencies.dependencies || [];
      const newDependencies = currentDependencies.includes(dependencyId)
        ? currentDependencies.filter(id => id !== dependencyId)
        : [...currentDependencies, dependencyId];

      const updatedTask = await tasks.update(selectedTaskForDependencies._id, {
        dependencies: newDependencies
      });

      setTaskList(prev => prev.map(task =>
        task._id === selectedTaskForDependencies._id ? { ...task, dependencies: newDependencies } : task
      ));

      toast.success('Dependencies updated successfully');
    } catch (error) {
      console.error('Error updating dependencies:', error);
      toast.error('Error updating dependencies');
    }
  };

  const handleCommentsClick = (task) => {
    setSelectedTaskForComments(task);
    setCommentsDialogOpen(true);
  };

  const handleCommentsClose = () => {
    setSelectedTaskForComments(null);
    setCommentsDialogOpen(false);
  };

  const handleAddComment = async () => {
    try {
      const newCommentData = await tasks.addComment(selectedTaskForComments._id, { comment: newComment });
      setSelectedTaskForComments(prev => ({ ...prev, comments: [...prev.comments, newCommentData] }));
      setNewComment('');
      handleCommentsClose();
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Error adding comment');
    }
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImages(prev => [...prev, { file, preview: e.target.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const convertToPdf = async () => {
    if (selectedImages.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    const pdf = new jsPDF({
      unit: 'px',
      format: 'a4',
      compress: false
    });
    
    try {
      for (let i = 0; i < selectedImages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // Create a temporary canvas with higher resolution
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        // Load image and handle CORS
        img.crossOrigin = 'Anonymous';
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = selectedImages[i].preview;
        });

        // Set canvas size to match image dimensions with higher resolution
        const scale = 2; // Increase scale for better quality
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Enable image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw image at higher resolution
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data with high quality
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // Calculate dimensions to fit in PDF while maintaining aspect ratio
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
        const width = imgProps.width * ratio;
        const height = imgProps.height * ratio;
        
        // Center image on page
        const x = (pdfWidth - width) / 2;
        const y = (pdfHeight - height) / 2;
        
        // Add image to PDF with maximum quality
        pdf.addImage(imgData, 'JPEG', x, y, width, height, undefined, 'FAST');
      }
      
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setConvertedPdfUrl(pdfUrl);
      toast.success('PDF created successfully with high quality!');
    } catch (error) {
      console.error('Error converting to PDF:', error);
      toast.error('Error creating PDF');
    }
  };

  const handleDownloadPdf = () => {
    if (convertedPdfUrl) {
      saveAs(convertedPdfUrl, 'converted-images.pdf');
    }
  };

  const handleClearImages = () => {
    setSelectedImages([]);
    setConvertedPdfUrl(null);
  };

  // Add drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Please drop only image files');
      return;
    }

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImages(prev => [...prev, { file, preview: e.target.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100vw',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      bgcolor: (theme) => theme.palette.grey[100]
    }}>
      {/* Quick Add Task */}
      <Collapse in={showQuickAdd}>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'white', 
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <form onSubmit={handleQuickAdd}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type task title and press Enter"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                autoFocus
              />
              <Button 
                type="submit" 
                variant="contained"
                disabled={!quickTitle.trim()}
              >
                Add
              </Button>
              <IconButton onClick={() => setShowQuickAdd(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </form>
        </Box>
      </Collapse>

      {/* Header */}
      <Box
        sx={{
          p: 2,
          background: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          width: '100%',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 2 }}>
          <Box
            sx={{
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '100%',
                height: '100%',
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: '50%',
                animation: 'pulse 2s infinite',
              },
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(1)',
                  opacity: 0.5,
                },
                '70%': {
                  transform: 'scale(1.2)',
                  opacity: 0,
                },
                '100%': {
                  transform: 'scale(1.2)',
                  opacity: 0,
                },
              },
            }}
          >
            <Avatar
              src={user?.profilePicture?.url}
              sx={{ 
                width: 40, 
                height: 40,
                cursor: 'pointer',
                border: '2px solid',
                borderColor: 'primary.main',
                '&:hover': {
                  opacity: 0.8,
                  transform: 'scale(1.05)',
                  transition: 'all 0.2s ease-in-out',
                }
              }}
              onClick={() => navigate('/profile')}
            />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Task Dashboard
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ width: 250 }}
            />
            <Button
              variant="outlined"
              onClick={handleFilterClick}
              startIcon={<FilterListIcon />}
            >
              {selectedFilter === 'all' ? 'All Tasks' : selectedFilter}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowQuickAdd(true)}
              startIcon={<AddIcon />}
              color="primary"
            >
              Quick Add
            </Button>
            <IconButton onClick={logout} color="inherit">
              <LogoutIcon />
            </IconButton>
        </Stack>

        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={() => handleFilterClose()}
        >
          <MenuItem onClick={() => handleFilterClose('all')}>All Tasks</MenuItem>
          <MenuItem onClick={() => handleFilterClose('today')}>Due Today</MenuItem>
          <MenuItem onClick={() => handleFilterClose('pending')}>Pending</MenuItem>
          <MenuItem onClick={() => handleFilterClose('in-progress')}>In Progress</MenuItem>
          <MenuItem onClick={() => handleFilterClose('completed')}>Completed</MenuItem>
        </Menu>
          </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1,
        width: '100%',
        maxWidth: '100%',
        p: { xs: 2, sm: 3 },
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Add the PDF Converter Section before the task sections */}
            <Box sx={{ mb: 4 }}>
              <Card sx={{ 
                mb: 4, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")',
                  backgroundSize: '24px 24px',
                  opacity: 0.1,
                }
              }}>
                <Box 
                  sx={{ 
                    p: 3, 
                    position: 'relative',
                    ...(isDragging && {
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: '3px dashed rgba(255, 255, 255, 0.3)',
                        borderRadius: 2,
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)',
                      }
                    })
                  }}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isDragging && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2,
                        textAlign: 'center',
                        color: 'white',
                        pointerEvents: 'none',
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        Drop images here
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.8 }}>
                        Release to add images to the converter
                      </Typography>
                    </Box>
                  )}
                  <Grid container spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: isDragging ? 0 : 1 }}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: { xs: 3, md: 0 } }}>
                        <Typography variant="h5" sx={{ color: 'white', mb: 1, fontWeight: 600 }}>
                          Image to PDF Converter
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                          Convert your images into professional PDF documents in seconds
                        </Typography>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="image-upload"
                          multiple
                          type="file"
                          onChange={handleImageSelect}
                        />
                        <label htmlFor="image-upload">
                          <Button
                            variant="contained"
                            component="span"
                            startIcon={<AttachFileIcon />}
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.9)',
                              color: '#764ba2',
                              '&:hover': {
                                bgcolor: 'white',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                              },
                              transition: 'all 0.3s ease',
                              fontWeight: 600
                            }}
                          >
                            Select Images
                          </Button>
                        </label>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      {selectedImages.length > 0 ? (
                        <Box sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.1)', 
                          borderRadius: 2,
                          p: 2,
                          backdropFilter: 'blur(10px)'
                        }}>
                          <Typography variant="subtitle2" sx={{ color: 'white', mb: 2 }}>
                            Selected Images: {selectedImages.length}
                          </Typography>
                          <Box 
                            ref={imagePreviewRef}
                            sx={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: 1,
                              mb: 2,
                              maxHeight: '200px',
                              overflowY: 'auto',
                              '&::-webkit-scrollbar': {
                                width: '8px',
                              },
                              '&::-webkit-scrollbar-track': {
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '4px',
                              },
                              '&::-webkit-scrollbar-thumb': {
                                background: 'rgba(255, 255, 255, 0.3)',
                                borderRadius: '4px',
                                '&:hover': {
                                  background: 'rgba(255, 255, 255, 0.5)',
                                }
                              }
                            }}
                          >
                            {selectedImages.map((img, index) => (
                              <Box
                                key={index}
                                sx={{
                                  width: 80,
                                  height: 80,
                                  position: 'relative',
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                  transition: 'transform 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.05)'
                                  }
                                }}
                              >
                                <img
                                  src={img.preview}
                                  alt={`Preview ${index + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              </Box>
                            ))}
                          </Box>
                          <Stack direction="row" spacing={2}>
                            <Button
                              variant="contained"
                              onClick={convertToPdf}
                              startIcon={<PictureAsPdfIcon />}
                              sx={{
                                bgcolor: 'success.main',
                                '&:hover': {
                                  bgcolor: 'success.dark',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              Convert to PDF
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={handleClearImages}
                              startIcon={<DeleteIcon />}
                              sx={{
                                color: 'white',
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                '&:hover': {
                                  borderColor: 'white',
                                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                                }
                              }}
                            >
                              Clear
                            </Button>
                          </Stack>
                        </Box>
                      ) : (
                        <Box sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'rgba(255, 255, 255, 0.6)',
                          textAlign: 'center',
                          p: 3
                        }}>
                          <Box>
                            <PictureAsPdfIcon sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} />
                            <Typography variant="body1">
                              Select images to convert them into a PDF document
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                  
                  {convertedPdfUrl && (
                    <Box sx={{ 
                      mt: 3, 
                      pt: 3, 
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      <Button
                        variant="contained"
                        onClick={handleDownloadPdf}
                        startIcon={<DownloadIcon />}
                        sx={{
                          bgcolor: 'white',
                          color: '#764ba2',
                          '&:hover': {
                            bgcolor: 'white',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                          },
                          transition: 'all 0.3s ease',
                          fontWeight: 600
                        }}
                      >
                        Download PDF
                      </Button>
                    </Box>
                  )}
                </Box>
              </Card>
            </Box>
            
            {showCompletedPage ? (
              <Box>
                <Box sx={{ mb: 4 }}>
                  <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBackToDashboard}
                    sx={{ mb: 3 }}
                  >
                    Back to Dashboard
                  </Button>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 3
                  }}>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      Completed Tasks
                      <Typography component="span" color="text.secondary" sx={{ ml: 1, fontSize: '1.2rem' }}>
                        ({separateTasks().completed.length})
                      </Typography>
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => loadTasks()}
                      startIcon={<RefreshIcon />}
                    >
                      Refresh
                    </Button>
                  </Box>

                  {/* Completion Stats */}
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ p: 3, bgcolor: 'success.50' }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Completion Rate
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                            <CircularProgress
                              variant="determinate"
                              value={getTaskStats().completionRate}
                              size={60}
                              thickness={6}
                              sx={{ color: 'success.main' }}
                            />
                            <Box sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Typography variant="body2" component="div" color="success.main">
                                {getTaskStats().completionRate}%
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                            {separateTasks().completed.length}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Completed Tasks Grid */}
                  <Grid container spacing={2}>
                    {separateTasks().completed.map((task) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={task._id}>
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: '24px',
                            overflow: 'visible',
                            background: (theme) => `linear-gradient(135deg, 
                              ${task.status === 'completed'
                                ? `${alpha(theme.palette.success.light, 0.05)}, ${alpha(theme.palette.success.main, 0.1)}`
                                : task.priority === 'high'
                                ? `${alpha(theme.palette.error.light, 0.05)}, ${alpha(theme.palette.error.main, 0.1)}`
                                : task.priority === 'medium'
                                ? `${alpha(theme.palette.warning.light, 0.05)}, ${alpha(theme.palette.warning.main, 0.1)}`
                                : `${alpha(theme.palette.success.light, 0.05)}, ${alpha(theme.palette.success.main, 0.1)}`
                              }
                            )`,
                            backdropFilter: 'blur(10px)',
                            border: '1px solid',
                            borderColor: (theme) => `${alpha(
                              task.status === 'completed'
                                ? theme.palette.success.main
                                : task.priority === 'high'
                                ? theme.palette.error.main
                                : task.priority === 'medium'
                                ? theme.palette.warning.main
                                : theme.palette.success.main,
                              0.1
                            )}`,
                            boxShadow: (theme) => `
                              0 4px 20px ${alpha(
                                task.priority === 'high'
                                  ? theme.palette.error.main
                                  : task.priority === 'medium'
                                  ? theme.palette.warning.main
                                  : theme.palette.success.main,
                                0.15
                              )},
                              inset 0 2px 8px ${alpha(theme.palette.common.white, 0.1)}
                            `,
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '30%',
                              background: (theme) => `linear-gradient(135deg,
                                ${task.status === 'completed'
                                  ? `${alpha(theme.palette.success.light, 0.2)}, ${alpha(theme.palette.success.main, 0.1)}`
                                  : task.priority === 'high'
                                  ? `${alpha(theme.palette.error.light, 0.2)}, ${alpha(theme.palette.error.main, 0.1)}`
                                    : task.priority === 'medium'
                                  ? `${alpha(theme.palette.warning.light, 0.2)}, ${alpha(theme.palette.warning.main, 0.1)}`
                                  : `${alpha(theme.palette.success.light, 0.2)}, ${alpha(theme.palette.success.main, 0.1)}`
                                }
                              )`,
                              borderRadius: '24px 24px 0 0',
                              opacity: 0.8,
                              zIndex: 0
                            },
                            '&:hover': {
                              transform: 'translateY(-8px)',
                              boxShadow: (theme) => `
                                0 12px 24px ${alpha(
                                  task.priority === 'high'
                                    ? theme.palette.error.main
                                    : task.priority === 'medium'
                                    ? theme.palette.warning.main
                                    : theme.palette.success.main,
                                  0.25
                                )},
                                inset 0 2px 8px ${alpha(theme.palette.common.white, 0.2)}
                              `,
                              '& .priority-indicator': {
                                transform: 'scaleY(1.1) translateX(2px)',
                                boxShadow: (theme) => `4px 0 12px ${alpha(
                                  task.priority === 'high'
                                    ? theme.palette.error.main
                                    : task.priority === 'medium'
                                    ? theme.palette.warning.main
                                    : theme.palette.success.main,
                                  0.4
                                )}`,
                              },
                              '& .task-title': {
                                background: (theme) => `linear-gradient(to right,
                                  ${theme.palette.text.primary},
                                  ${alpha(
                                    task.priority === 'high'
                                      ? theme.palette.error.main
                                      : task.priority === 'medium'
                                      ? theme.palette.warning.main
                                      : theme.palette.success.main,
                                    0.8
                                  )}
                                )`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                              }
                            },
                            '& .priority-indicator': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              height: '100%',
                              width: '6px',
                              background: (theme) => `linear-gradient(to bottom, 
                                ${task.priority === 'high'
                                  ? `${theme.palette.error.light}, ${theme.palette.error.main}, ${theme.palette.error.dark}`
                                  : task.priority === 'medium'
                                  ? `${theme.palette.warning.light}, ${theme.palette.warning.main}, ${theme.palette.warning.dark}`
                                  : `${theme.palette.success.light}, ${theme.palette.success.main}, ${theme.palette.success.dark}`
                                }
                              )`,
                              borderRadius: '24px 0 0 24px',
                              opacity: 0.8,
                              transition: 'all 0.4s ease',
                              zIndex: 1
                            }
                          }}
                        >
                          <Box 
                            className="priority-indicator"
                            sx={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              height: '100%',
                              width: '6px',
                              background: (theme) => `linear-gradient(to bottom, 
                                ${task.priority === 'high'
                                  ? `${theme.palette.error.light}, ${theme.palette.error.main}, ${theme.palette.error.dark}`
                                  : task.priority === 'medium'
                                  ? `${theme.palette.warning.light}, ${theme.palette.warning.main}, ${theme.palette.warning.dark}`
                                  : `${theme.palette.success.light}, ${theme.palette.success.main}, ${theme.palette.success.dark}`
                                }
                              )`,
                              borderRadius: '24px 0 0 24px',
                              opacity: 0.8,
                              transition: 'all 0.4s ease',
                              zIndex: 1
                            }}
                          />

                          <CardContent sx={{ 
                            p: 3, 
                            pb: 1, 
                            position: 'relative', 
                            zIndex: 1,
                            '&:last-child': { pb: 1 }
                          }}>
                            {/* Status indicator dot */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: (theme) => task.status === 'completed'
                                  ? theme.palette.success.main
                                  : task.status === 'in-progress'
                                  ? theme.palette.info.main
                                  : theme.palette.warning.main,
                                boxShadow: (theme) => `0 0 8px ${alpha(
                                  task.status === 'completed'
                                    ? theme.palette.success.main
                                    : task.status === 'in-progress'
                                    ? theme.palette.info.main
                                    : theme.palette.warning.main,
                                  0.6
                                )}`,
                                animation: task.status === 'in-progress' ? 'pulse 2s infinite' : 'none',
                                '@keyframes pulse': {
                                  '0%': {
                                    transform: 'scale(1)',
                                    opacity: 1,
                                  },
                                  '50%': {
                                    transform: 'scale(1.2)',
                                    opacity: 0.8,
                                  },
                                  '100%': {
                                    transform: 'scale(1)',
                                    opacity: 1,
                                  },
                                },
                              }}
                            />
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Chip
                                  size="small"
                                  label={task.priority}
                                  sx={{
                                    height: '28px',
                                    borderRadius: '14px',
                                    textTransform: 'capitalize',
                                    fontWeight: 600,
                                    px: 1.5,
                                    background: (theme) => `linear-gradient(135deg, 
                                      ${task.priority === 'high'
                                        ? `${theme.palette.error.dark}, ${theme.palette.error.main}, ${alpha(theme.palette.error.light, 0.9)}`
                                        : task.priority === 'medium'
                                        ? `${theme.palette.warning.dark}, ${theme.palette.warning.main}, ${alpha(theme.palette.warning.light, 0.9)}`
                                        : `${theme.palette.success.dark}, ${theme.palette.success.main}, ${alpha(theme.palette.success.light, 0.9)}`
                                    })`,
                                    color: '#fff',
                                    letterSpacing: '0.5px',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                    boxShadow: (theme) => `
                                      0 4px 12px ${alpha(
                                        task.priority === 'high'
                                          ? theme.palette.error.main
                                          : task.priority === 'medium'
                                          ? theme.palette.warning.main
                                          : theme.palette.success.main,
                                        0.3
                                      )},
                                      inset 0 2px 4px ${alpha(theme.palette.common.white, 0.2)}
                                    `,
                                    '& .MuiChip-label': {
                                      px: 1,
                                    },
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'translateY(-1px)',
                                      boxShadow: (theme) => `
                                        0 6px 16px ${alpha(
                                          task.priority === 'high'
                                            ? theme.palette.error.main
                                            : task.priority === 'medium'
                                            ? theme.palette.warning.main
                                            : theme.palette.success.main,
                                          0.4
                                        )},
                                        inset 0 2px 4px ${alpha(theme.palette.common.white, 0.2)}
                                      `
                                    }
                                  }}
                                />
                                <Chip
                                  size="small"
                                  label={task.status}
                                  sx={{
                                    height: '28px',
                                    borderRadius: '14px',
                                    textTransform: 'capitalize',
                                    fontWeight: 600,
                                    px: 1.5,
                                    background: (theme) => `linear-gradient(135deg, 
                                      ${task.status === 'completed'
                                        ? `${theme.palette.success.dark}, ${theme.palette.success.main}, ${alpha(theme.palette.success.light, 0.9)}`
                                        : task.status === 'in-progress'
                                        ? `${theme.palette.info.dark}, ${theme.palette.info.main}, ${alpha(theme.palette.info.light, 0.9)}`
                                        : `${theme.palette.warning.dark}, ${theme.palette.warning.main}, ${alpha(theme.palette.warning.light, 0.9)}`
                                    })`,
                                    color: '#fff',
                                    letterSpacing: '0.5px',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                    boxShadow: (theme) => `
                                      0 4px 12px ${alpha(
                                        task.status === 'completed'
                                          ? theme.palette.success.main
                                          : task.status === 'in-progress'
                                          ? theme.palette.info.main
                                          : theme.palette.warning.main,
                                        0.3
                                      )},
                                      inset 0 2px 4px ${alpha(theme.palette.common.white, 0.2)}
                                    `,
                                    '& .MuiChip-label': {
                                      px: 1,
                                    },
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'translateY(-1px)',
                                      boxShadow: (theme) => `
                                        0 6px 16px ${alpha(
                                          task.status === 'completed'
                                            ? theme.palette.success.main
                                            : task.status === 'in-progress'
                                            ? theme.palette.info.main
                                            : theme.palette.warning.main,
                                          0.4
                                        )},
                                        inset 0 2px 4px ${alpha(theme.palette.common.white, 0.2)}
                                      `
                                    }
                                  }}
                                />
                              </Box>
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuClick(e, task)}
                                sx={{
                                  ml: 1,
                                  width: '32px',
                                  height: '32px',
                                  background: (theme) => `linear-gradient(135deg, 
                                    ${alpha(theme.palette.primary.main, 0.08)},
                                    ${alpha(theme.palette.primary.light, 0.12)}
                                  )`,
                                  backdropFilter: 'blur(4px)',
                                  color: 'primary.main',
                                  border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                  '&:hover': {
                                    background: (theme) => `linear-gradient(135deg, 
                                      ${alpha(theme.palette.primary.main, 0.12)},
                                      ${alpha(theme.palette.primary.light, 0.16)}
                                    )`,
                                    transform: 'rotate(90deg) scale(1.1)',
                                  },
                                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                              >
                                <MoreVertIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                            </Box>

                            <Typography 
                              className="task-title"
                              variant="h6" 
                              sx={{ 
                                mb: 1,
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                lineHeight: 1.3,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                minHeight: '2.6rem',
                                color: 'text.primary',
                                transition: 'all 0.3s ease',
                              }}
                            >
                              {task.title}
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{
                                mb: 2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                minHeight: '2.5rem',
                                color: 'text.secondary',
                                lineHeight: 1.6,
                                letterSpacing: '0.2px',
                              }}
                            >
                              {task.description}
                            </Typography>

                            <Stack 
                              spacing={1.5} 
                              sx={{ 
                                p: 2,
                                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.5),
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: (theme) => alpha(theme.palette.divider, 0.1),
                                backdropFilter: 'blur(8px)',
                                boxShadow: (theme) => `
                                  inset 0 2px 4px ${alpha(theme.palette.common.black, 0.02)},
                                  0 2px 8px ${alpha(theme.palette.common.black, 0.02)}
                                `,
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.8,
                                    letterSpacing: '0.4px',
                                  }}
                                >
                                  <TimelineIcon sx={{ 
                                    fontSize: 18,
                                    color: (theme) => task.progress === 100 
                                      ? theme.palette.success.main 
                                      : theme.palette.primary.main,
                                    filter: (theme) => `drop-shadow(0 2px 4px ${alpha(
                                      task.progress === 100 
                                        ? theme.palette.success.main 
                                        : theme.palette.primary.main,
                                      0.4
                                    )})`
                                  }} />
                                  Progress
                                </Typography>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      fontWeight: 700,
                                    color: (theme) => task.progress === 100 
                                      ? theme.palette.success.main
                                      : task.progress > 0 
                                      ? theme.palette.primary.main
                                      : theme.palette.warning.main,
                                    textShadow: (theme) => `0 2px 4px ${alpha(
                                      task.progress === 100 
                                        ? theme.palette.success.main
                                        : task.progress > 0 
                                        ? theme.palette.primary.main
                                        : theme.palette.warning.main,
                                      0.3
                                    )}`,
                                    letterSpacing: '0.4px',
                                    }}
                                  >
                                    {task.progress || 0}%
                                  </Typography>
                                </Box>
                              <Box sx={{ position: 'relative' }}>
                              <LinearProgress
                                variant="determinate"
                                value={task.progress || 0}
                                sx={{
                                    height: 12,
                                    borderRadius: 6,
                                    bgcolor: 'grey.100',
                                  '& .MuiLinearProgress-bar': {
                                      borderRadius: 6,
                                      bgcolor: task.progress === 100 ? 'success.main' : task.progress > 0 ? 'primary.main' : 'warning.main',
                                      boxShadow: 2,
                                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }
                                  }}
                                />
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: 12,
                                    background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                                    borderRadius: 6,
                                    pointerEvents: 'none',
                                  }}
                              />
                            </Box>
                            </Stack>

                            <Stack 
                              spacing={1.5} 
                              sx={{ 
                                p: 1.5,
                                bgcolor: 'grey.50',
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTimeIcon 
                                  fontSize="small" 
                                  sx={{ 
                                    color: new Date(task.dueDate) < new Date() && task.status !== 'completed'
                                      ? 'error.main'
                                      : 'text.secondary',
                                    opacity: 0.7
                                  }} 
                                />
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    color: new Date(task.dueDate) < new Date() && task.status !== 'completed'
                                      ? 'error.main'
                                      : 'text.secondary',
                                  }}
                                >
                                  Due {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                                  {new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
                                    <Chip
                                      label="Overdue"
                                      size="small"
                                      color="error"
                                      sx={{ 
                                        height: 20,
                                        fontSize: '0.7rem',
                                        '& .MuiChip-label': { px: 1 }
                                      }}
                                    />
                                  )}
                                </Typography>
                              </Box>

                              {task.attachments?.length > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Button
                                    size="small"
                                    startIcon={<AttachFileIcon />}
                                    onClick={(e) => handleAttachmentsClick(e, task)}
                                    sx={{ 
                                      textTransform: 'none',
                                      color: 'primary.main',
                                      '&:hover': {
                                        bgcolor: 'primary.50'
                                      }
                                    }}
                                  >
                                    {task.attachments.length} attachment{task.attachments.length !== 1 ? 's' : ''}
                                  </Button>
                                </Box>
                              )}

                              {/* Time Tracking Section */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                                <Button
                                  size="small"
                                  startIcon={
                                    <TimerIcon 
                                      sx={{ 
                                        color: timeTrackingTask === task._id ? 'primary.main' : 'text.secondary'
                                      }} 
                                    />
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTimeTrackingTask(timeTrackingTask === task._id ? null : task._id);
                                  }}
                                    sx={{ 
                                    textTransform: 'none',
                                    color: timeTrackingTask === task._id ? 'primary.main' : 'text.secondary',
                                    '&:hover': {
                                      bgcolor: 'primary.50'
                                    }
                                  }}
                                >
                                  {timeTrackingTask === task._id ? 'Stop tracking' : 'Start tracking'}
                                </Button>
                                
                                {timeTrackingTask === task._id && (
                                  <Stopwatch 
                                    taskId={task._id} 
                                    onTimeUpdate={handleTimeUpdate}
                                    initialTime={task.timeSpent || 0}
                                  />
                                )}
                                
                                {task.timeSpent > 0 && timeTrackingTask !== task._id && (
                                  <Typography variant="body2" color="text.secondary">
                                    Total time: {formatTime(task.timeSpent)}
                                  </Typography>
                              )}
                              </Box>
                            </Stack>
                          </CardContent>

                          <Box 
                            className="task-actions"
                            sx={{ 
                              p: 2,
                              pt: 0,
                              mt: 'auto',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              position: 'relative',
                              zIndex: 2
                            }}
                          >
                            <Button
                              variant="contained"
                              color="success"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (task._id) {
                                  handleTaskCompletion(task._id);
                                }
                              }}
                              startIcon={<CheckCircleIcon />}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                py: 1,
                                pointerEvents: 'auto',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.success.main, 0.4)}`
                                }
                              }}
                            >
                              Mark Complete
                            </Button>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(task)}
                              sx={{
                                bgcolor: 'primary.50',
                                color: 'primary.main',
                                '&:hover': {
                                  bgcolor: 'primary.100',
                                  transform: 'scale(1.1)',
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(task._id)}
                              sx={{
                                bgcolor: 'error.50',
                                color: 'error.main',
                                '&:hover': {
                                  bgcolor: 'error.100',
                                  transform: 'scale(1.1)',
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            ) : (
              <Box sx={{ maxWidth: '100%' }}>
                {/* Performance Overview */}
                <Card sx={{ 
                  mb: 4, 
                  p: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h5" sx={{ mb: 1 }}>
                          Task Performance
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Overview of your task management efficiency
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={getTaskStats().completionRate}
                            size={80}
                            thickness={8}
                            sx={{ color: 'white' }}
                          />
                          <Box sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                            bottom: 0,
                            right: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Typography variant="h6" component="div">
                              {getTaskStats().completionRate}%
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="body1" sx={{ mb: 0.5 }}>
                            Completion Rate
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getTaskStats().trend === 'up' ? (
                              <ArrowUpwardIcon color="inherit" />
                            ) : (
                              <ArrowDownwardIcon color="inherit" />
                            )}
                            <Typography variant="body2">
                              {getTaskStats().trendValue} tasks this week
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>Task Distribution</Typography>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Completed</Typography>
                            <Typography variant="caption">{getTaskStats().completed}</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={getTaskStats().completionRate}
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: 'rgba(255,255,255,0.2)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: 'white'
                              }
                            }}
                          />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">In Progress</Typography>
                            <Typography variant="caption">{getTaskStats().inProgress}</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(getTaskStats().inProgress / getTaskStats().total) * 100}
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: 'rgba(255,255,255,0.2)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: 'white'
                              }
                            }}
                          />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Pending</Typography>
                            <Typography variant="caption">{getTaskStats().pending}</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(getTaskStats().pending / getTaskStats().total) * 100}
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: 'rgba(255,255,255,0.2)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: 'white'
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>

                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: 'primary.main',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      minHeight: 140,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        '& .icon-bg': {
                          transform: 'scale(1.1)',
                        }
                      }
                    }}>
                      <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <TotalIcon sx={{ fontSize: 32, mr: 1 }} />
                          <Typography variant="h6">Total Tasks</Typography>
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                          {getTaskStats().total}
                        </Typography>
                      </Box>
                      <Box className="icon-bg" sx={{
                        position: 'absolute',
                        right: -20,
                        bottom: -20,
                        opacity: 0.2,
                        transform: 'scale(1)',
                        transition: 'transform 0.3s ease',
                      }}>
                        <TotalIcon sx={{ fontSize: 140 }} />
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: 'warning.main',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      minHeight: 140,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        '& .icon-bg': {
                          transform: 'scale(1.1)',
                        }
                      }
                    }}>
                      <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <PendingIcon sx={{ fontSize: 32, mr: 1 }} />
                          <Typography variant="h6">Pending Tasks</Typography>
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                          {getTaskStats().pending}
                        </Typography>
                      </Box>
                      <Box className="icon-bg" sx={{
                        position: 'absolute',
                        right: -20,
                        bottom: -20,
                        opacity: 0.2,
                        transform: 'scale(1)',
                        transition: 'transform 0.3s ease',
                      }}>
                        <PendingIcon sx={{ fontSize: 140 }} />
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: 'info.main',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      minHeight: 140,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        '& .icon-bg': {
                          transform: 'scale(1.1)',
                        }
                      }
                    }}>
                      <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <InProgressIcon sx={{ fontSize: 32, mr: 1 }} />
                          <Typography variant="h6">In Progress</Typography>
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                          {getTaskStats().inProgress}
                        </Typography>
                      </Box>
                      <Box className="icon-bg" sx={{
                        position: 'absolute',
                        right: -20,
                        bottom: -20,
                        opacity: 0.2,
                        transform: 'scale(1)',
                        transition: 'transform 0.3s ease',
                      }}>
                        <InProgressIcon sx={{ fontSize: 140 }} />
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: 'success.main',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      minHeight: 140,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        '& .icon-bg': {
                          transform: 'scale(1.1)',
                        }
                      }
                    }}>
                      <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <CompletedIcon sx={{ fontSize: 32, mr: 1 }} />
                          <Typography variant="h6">Completed</Typography>
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                          {getTaskStats().completed}
                        </Typography>
                      </Box>
                      <Box className="icon-bg" sx={{
                        position: 'absolute',
                        right: -20,
                        bottom: -20,
                        opacity: 0.2,
                        transform: 'scale(1)',
                        transition: 'transform 0.3s ease',
                      }}>
                        <CompletedIcon sx={{ fontSize: 140 }} />
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: '#6366f1',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      minHeight: 140,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        '& .icon-bg': {
                          transform: 'scale(1.1)',
                        }
                      }
                    }}>
                      <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <DueTodayIcon sx={{ fontSize: 32, mr: 1 }} />
                          <Typography variant="h6">Due Today</Typography>
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                          {getTaskStats().dueToday}
                        </Typography>
                      </Box>
                      <Box className="icon-bg" sx={{
                        position: 'absolute',
                        right: -20,
                        bottom: -20,
                        opacity: 0.2,
                        transform: 'scale(1)',
                        transition: 'transform 0.3s ease',
                      }}>
                        <DueTodayIcon sx={{ fontSize: 140 }} />
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: 'error.main',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      minHeight: 140,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        '& .icon-bg': {
                          transform: 'scale(1.1)',
                        }
                      }
                    }}>
                      <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <OverdueIcon sx={{ fontSize: 32, mr: 1 }} />
                          <Typography variant="h6">Overdue</Typography>
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                          {getTaskStats().overdue}
                        </Typography>
                      </Box>
                      <Box className="icon-bg" sx={{
                        position: 'absolute',
                        right: -20,
                        bottom: -20,
                        opacity: 0.2,
                        transform: 'scale(1)',
                        transition: 'transform 0.3s ease',
                      }}>
                        <OverdueIcon sx={{ fontSize: 140 }} />
                      </Box>
                    </Card>
                  </Grid>
                </Grid>

                {/* Tasks Section */}
                <Box sx={{ 
                  bgcolor: (theme) => alpha(theme.palette.background.paper, 0.6), 
                  borderRadius: 2,
                  p: 4,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 3,
                    width: '100%'
                  }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {selectedFilter === 'all' ? 'All Tasks' : `${selectedFilter} Tasks`}
                        <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                          ({filteredTasks.length})
                        </Typography>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(), 'MMMM d, yyyy')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => loadTasks()}
                        startIcon={<RefreshIcon />}
                      >
                        Refresh
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                      >
                        Add Task
                      </Button>
                    </Box>
                  </Box>

                  {/* Active Tasks */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Active Tasks
                    </Typography>
                    <Grid container spacing={2} sx={{ width: '100%', margin: 0 }}>
                      {separateTasks().active.map((task) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={task._id}>
                          <Card
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              position: 'relative',
                              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                              borderRadius: '24px',
                              overflow: 'visible',
                              background: (theme) => `linear-gradient(135deg, 
                                ${task.status === 'completed'
                                  ? `${alpha(theme.palette.success.light, 0.05)}, ${alpha(theme.palette.success.main, 0.1)}`
                                  : task.priority === 'high'
                                  ? `${alpha(theme.palette.error.light, 0.05)}, ${alpha(theme.palette.error.main, 0.1)}`
                                  : task.priority === 'medium'
                                  ? `${alpha(theme.palette.warning.light, 0.05)}, ${alpha(theme.palette.warning.main, 0.1)}`
                                  : `${alpha(theme.palette.success.light, 0.05)}, ${alpha(theme.palette.success.main, 0.1)}`
                                }
                              )`,
                              backdropFilter: 'blur(10px)',
                              border: '1px solid',
                              borderColor: (theme) => `${alpha(
                                task.status === 'completed'
                                  ? theme.palette.success.main
                                  : task.priority === 'high'
                                  ? theme.palette.error.main
                                  : task.priority === 'medium'
                                  ? theme.palette.warning.main
                                  : theme.palette.success.main,
                                0.1
                              )}`,
                              boxShadow: (theme) => `
                                0 4px 20px ${alpha(
                                  task.priority === 'high'
                                    ? theme.palette.error.main
                                    : task.priority === 'medium'
                                    ? theme.palette.warning.main
                                    : theme.palette.success.main,
                                  0.15
                                )},
                                inset 0 2px 8px ${alpha(theme.palette.common.white, 0.1)}
                              `,
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '30%',
                                background: (theme) => `linear-gradient(135deg,
                                  ${task.status === 'completed'
                                    ? `${alpha(theme.palette.success.light, 0.2)}, ${alpha(theme.palette.success.main, 0.1)}`
                                    : task.priority === 'high'
                                    ? `${alpha(theme.palette.error.light, 0.2)}, ${alpha(theme.palette.error.main, 0.1)}`
                                      : task.priority === 'medium'
                                    ? `${alpha(theme.palette.warning.light, 0.2)}, ${alpha(theme.palette.warning.main, 0.1)}`
                                    : `${alpha(theme.palette.success.light, 0.2)}, ${alpha(theme.palette.success.main, 0.1)}`
                                  }
                                )`,
                                borderRadius: '24px 24px 0 0',
                                opacity: 0.8,
                                zIndex: 0
                              },
                              '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: (theme) => `
                                  0 12px 24px ${alpha(
                                    task.priority === 'high'
                                      ? theme.palette.error.main
                                      : task.priority === 'medium'
                                      ? theme.palette.warning.main
                                      : theme.palette.success.main,
                                    0.25
                                  )},
                                  inset 0 2px 8px ${alpha(theme.palette.common.white, 0.2)}
                                `,
                                '& .priority-indicator': {
                                  transform: 'scaleY(1.1) translateX(2px)',
                                  boxShadow: (theme) => `4px 0 12px ${alpha(
                                    task.priority === 'high'
                                      ? theme.palette.error.main
                                      : task.priority === 'medium'
                                      ? theme.palette.warning.main
                                      : theme.palette.success.main,
                                    0.4
                                  )}`,
                                },
                                '& .task-title': {
                                  background: (theme) => `linear-gradient(to right,
                                    ${theme.palette.text.primary},
                                    ${alpha(
                                      task.priority === 'high'
                                        ? theme.palette.error.main
                                        : task.priority === 'medium'
                                        ? theme.palette.warning.main
                                        : theme.palette.success.main,
                                      0.8
                                    )}
                                  )`,
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                }
                              },
                              '& .priority-indicator': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                height: '100%',
                                width: '6px',
                                background: (theme) => `linear-gradient(to bottom, 
                                  ${task.priority === 'high'
                                    ? `${theme.palette.error.light}, ${theme.palette.error.main}, ${theme.palette.error.dark}`
                                    : task.priority === 'medium'
                                    ? `${theme.palette.warning.light}, ${theme.palette.warning.main}, ${theme.palette.warning.dark}`
                                    : `${theme.palette.success.light}, ${theme.palette.success.main}, ${theme.palette.success.dark}`
                                  }
                                )`,
                                borderRadius: '24px 0 0 24px',
                                opacity: 0.8,
                                transition: 'all 0.4s ease',
                                zIndex: 1
                              }
                            }}
                          >
                            <Box 
                              className="priority-indicator"
                              sx={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                height: '100%',
                                width: '6px',
                                background: (theme) => `linear-gradient(to bottom, 
                                  ${task.priority === 'high'
                                    ? `${theme.palette.error.light}, ${theme.palette.error.main}, ${theme.palette.error.dark}`
                                    : task.priority === 'medium'
                                    ? `${theme.palette.warning.light}, ${theme.palette.warning.main}, ${theme.palette.warning.dark}`
                                    : `${theme.palette.success.light}, ${theme.palette.success.main}, ${theme.palette.success.dark}`
                                  }
                                )`,
                                borderRadius: '24px 0 0 24px',
                                opacity: 0.8,
                                transition: 'all 0.4s ease',
                                zIndex: 1
                              }}
                            />

                            <CardContent sx={{ 
                              p: 3, 
                              pb: 1, 
                              position: 'relative', 
                              zIndex: 1,
                              '&:last-child': { pb: 1 }
                            }}>
                              {/* Status indicator dot */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 16,
                                  right: 16,
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  background: (theme) => task.status === 'completed'
                                    ? theme.palette.success.main
                                    : task.status === 'in-progress'
                                    ? theme.palette.info.main
                                    : theme.palette.warning.main,
                                  boxShadow: (theme) => `0 0 8px ${alpha(
                                    task.status === 'completed'
                                      ? theme.palette.success.main
                                      : task.status === 'in-progress'
                                      ? theme.palette.info.main
                                      : theme.palette.warning.main,
                                    0.6
                                  )}`,
                                  animation: task.status === 'in-progress' ? 'pulse 2s infinite' : 'none',
                                  '@keyframes pulse': {
                                    '0%': {
                                      transform: 'scale(1)',
                                      opacity: 1,
                                    },
                                    '50%': {
                                      transform: 'scale(1.2)',
                                      opacity: 0.8,
                                    },
                                    '100%': {
                                      transform: 'scale(1)',
                                      opacity: 1,
                                    },
                                  },
                                }}
                              />
                              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <Chip
                                    size="small"
                                    label={task.priority}
                                    sx={{
                                      height: '28px',
                                      borderRadius: '14px',
                                      textTransform: 'capitalize',
                                      fontWeight: 600,
                                      px: 1.5,
                                      background: (theme) => `linear-gradient(135deg, 
                                        ${task.priority === 'high'
                                          ? `${theme.palette.error.dark}, ${theme.palette.error.main}, ${alpha(theme.palette.error.light, 0.9)}`
                                          : task.priority === 'medium'
                                          ? `${theme.palette.warning.dark}, ${theme.palette.warning.main}, ${alpha(theme.palette.warning.light, 0.9)}`
                                          : `${theme.palette.success.dark}, ${theme.palette.success.main}, ${alpha(theme.palette.success.light, 0.9)}`
                                      })`,
                                      color: '#fff',
                                      letterSpacing: '0.5px',
                                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                      boxShadow: (theme) => `
                                        0 4px 12px ${alpha(
                                          task.priority === 'high'
                                            ? theme.palette.error.main
                                            : task.priority === 'medium'
                                            ? theme.palette.warning.main
                                            : theme.palette.success.main,
                                          0.3
                                        )},
                                        inset 0 2px 4px ${alpha(theme.palette.common.white, 0.2)}
                                      `,
                                      '& .MuiChip-label': {
                                        px: 1,
                                      },
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: (theme) => `
                                          0 6px 16px ${alpha(
                                            task.priority === 'high'
                                              ? theme.palette.error.main
                                              : task.priority === 'medium'
                                              ? theme.palette.warning.main
                                              : theme.palette.success.main,
                                            0.4
                                          )},
                                          inset 0 2px 4px ${alpha(theme.palette.common.white, 0.2)}
                                        `,
                                      }
                                    }}
                                  />
                                  <Chip
                                    size="small"
                                    label={task.status}
                                    sx={{
                                      height: '28px',
                                      borderRadius: '14px',
                                      textTransform: 'capitalize',
                                      fontWeight: 600,
                                      px: 1.5,
                                      background: (theme) => `linear-gradient(135deg, 
                                        ${task.status === 'completed'
                                          ? `${theme.palette.success.dark}, ${theme.palette.success.main}, ${alpha(theme.palette.success.light, 0.9)}`
                                          : task.status === 'in-progress'
                                          ? `${theme.palette.info.dark}, ${theme.palette.info.main}, ${alpha(theme.palette.info.light, 0.9)}`
                                          : `${theme.palette.warning.dark}, ${theme.palette.warning.main}, ${alpha(theme.palette.warning.light, 0.9)}`
                                      })`,
                                      color: '#fff',
                                      letterSpacing: '0.5px',
                                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                      boxShadow: (theme) => `
                                        0 4px 12px ${alpha(
                                          task.status === 'completed'
                                            ? theme.palette.success.main
                                            : task.status === 'in-progress'
                                            ? theme.palette.info.main
                                            : theme.palette.warning.main,
                                          0.3
                                        )},
                                        inset 0 2px 4px ${alpha(theme.palette.common.white, 0.2)}
                                      `,
                                      '& .MuiChip-label': {
                                        px: 1,
                                      },
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: (theme) => `
                                          0 6px 16px ${alpha(
                                            task.status === 'completed'
                                              ? theme.palette.success.main
                                              : task.status === 'in-progress'
                                              ? theme.palette.info.main
                                              : theme.palette.warning.main,
                                            0.4
                                          )},
                                          inset 0 2px 4px ${alpha(theme.palette.common.white, 0.2)}
                                        `,
                                      }
                                    }}
                                  />
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuClick(e, task)}
                                  sx={{
                                    ml: 1,
                                    width: '32px',
                                    height: '32px',
                                    background: (theme) => `linear-gradient(135deg, 
                                      ${alpha(theme.palette.primary.main, 0.08)},
                                      ${alpha(theme.palette.primary.light, 0.12)}
                                    )`,
                                    backdropFilter: 'blur(4px)',
                                    color: 'primary.main',
                                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                    '&:hover': {
                                      background: (theme) => `linear-gradient(135deg, 
                                        ${alpha(theme.palette.primary.main, 0.12)},
                                        ${alpha(theme.palette.primary.light, 0.16)}
                                      )`,
                                      transform: 'rotate(90deg) scale(1.1)',
                                    },
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                  }}
                                >
                                  <MoreVertIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                              </Box>

                              <Typography 
                                className="task-title"
                                variant="h6" 
                                sx={{ 
                                  mb: 1,
                                  fontWeight: 600,
                                  fontSize: '1.1rem',
                                  lineHeight: 1.3,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  minHeight: '2.6rem',
                                  color: 'text.primary',
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                {task.title}
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{
                                  mb: 2,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  minHeight: '2.5rem',
                                  color: 'text.secondary',
                                  lineHeight: 1.6,
                                  letterSpacing: '0.2px',
                                }}
                              >
                                {task.description}
                              </Typography>

                              {/* Progress Section */}
                              <Box 
                                sx={{ 
                                  mb: 2,
                                  p: 2,
                                  background: (theme) => `linear-gradient(145deg, 
                                    ${alpha(theme.palette.background.paper, 0.8)},
                                    ${alpha(theme.palette.background.paper, 0.4)}
                                  )`,
                                  borderRadius: '16px',
                                  border: '1px solid',
                                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                  backdropFilter: 'blur(8px)',
                                  boxShadow: (theme) => `
                                    inset 0 2px 4px ${alpha(theme.palette.common.black, 0.04)},
                                    0 2px 8px ${alpha(theme.palette.common.black, 0.04)}
                                  `,
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      fontWeight: 600,
                                      color: 'text.primary',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.8,
                                      letterSpacing: '0.4px',
                                    }}
                                  >
                                    <TimelineIcon sx={{ 
                                      fontSize: 18,
                                      color: (theme) => task.progress === 100 
                                        ? theme.palette.success.main 
                                        : theme.palette.primary.main,
                                      filter: (theme) => `drop-shadow(0 2px 4px ${alpha(
                                        task.progress === 100 
                                          ? theme.palette.success.main 
                                          : theme.palette.primary.main,
                                        0.4
                                      )})`
                                    }} />
                                    Progress
                                  </Typography>
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        fontWeight: 700,
                                      color: (theme) => task.progress === 100 
                                        ? theme.palette.success.main
                                        : task.progress > 0 
                                        ? theme.palette.primary.main
                                        : theme.palette.warning.main,
                                      textShadow: (theme) => `0 2px 4px ${alpha(
                                        task.progress === 100 
                                          ? theme.palette.success.main
                                          : task.progress > 0 
                                          ? theme.palette.primary.main
                                          : theme.palette.warning.main,
                                        0.3
                                      )}`,
                                      letterSpacing: '0.4px',
                                      }}
                                    >
                                      {task.progress || 0}%
                                    </Typography>
                                  </Box>
                                <Box sx={{ position: 'relative' }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={task.progress || 0}
                                  sx={{
                                      height: 12,
                                      borderRadius: 6,
                                      bgcolor: (theme) => alpha(theme.palette.grey[200], 0.4),
                                      backdropFilter: 'blur(4px)',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 6,
                                        background: (theme) => {
                                          if (task.progress === 100) {
                                            return `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main}, ${theme.palette.success.dark})`;
                                          } else if (task.progress > 0) {
                                            return `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`;
                                          } else {
                                            return `linear-gradient(135deg, ${theme.palette.warning.light}, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`;
                                          }
                                        },
                                        boxShadow: (theme) => {
                                          const color = task.progress === 100 
                                            ? theme.palette.success.main
                                          : task.progress > 0
                                            ? theme.palette.primary.main
                                            : theme.palette.warning.main;
                                          return `0 2px 8px ${alpha(color, 0.4)}, inset 0 2px 4px ${alpha(theme.palette.common.white, 0.2)}`;
                                        },
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                      }
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      height: 12,
                                      background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                                      borderRadius: 6,
                                      pointerEvents: 'none',
                                    }}
                                  />
                                </Box>
                              </Box>

                              {/* Task Details */}
                              <Stack 
                                spacing={1.5} 
                                sx={{ 
                                  p: 1.5,
                                  bgcolor: 'grey.50',
                                  borderRadius: 2,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <AccessTimeIcon 
                                    fontSize="small" 
                                    sx={{ 
                                      color: new Date(task.dueDate) < new Date() && task.status !== 'completed'
                                        ? 'error.main'
                                        : 'text.secondary',
                                      opacity: 0.7
                                    }} 
                                  />
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      fontWeight: 500,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                      color: new Date(task.dueDate) < new Date() && task.status !== 'completed'
                                        ? 'error.main'
                                        : 'text.secondary',
                                    }}
                                  >
                                    Due {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                                    {new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
                                      <Chip
                                        label="Overdue"
                                        size="small"
                                        color="error"
                                        sx={{ 
                                          height: 20,
                                          fontSize: '0.7rem',
                                          '& .MuiChip-label': { px: 1 }
                                        }}
                                      />
                                    )}
                                  </Typography>
                                </Box>

                                {task.attachments?.length > 0 && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Button
                                      size="small"
                                      startIcon={<AttachFileIcon />}
                                      onClick={(e) => handleAttachmentsClick(e, task)}
                                      sx={{ 
                                        textTransform: 'none',
                                        color: 'primary.main',
                                        '&:hover': {
                                          bgcolor: 'primary.50'
                                        }
                                      }}
                                    >
                                      {task.attachments.length} attachment{task.attachments.length !== 1 ? 's' : ''}
                                    </Button>
                                  </Box>
                                )}

                                {/* Time Tracking Section */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <TimerIcon 
                                    fontSize="small" 
                                    sx={{ 
                                      color: timeTrackingTask === task._id ? 'primary.main' : 'text.secondary',
                                        opacity: 0.7
                                      }} 
                                    />
                                  <Box sx={{ flex: 1 }}>
                                    {timeTrackingTask === task._id ? (
                                      <Stopwatch 
                                        taskId={task._id} 
                                        onTimeUpdate={handleTimeUpdate}
                                        initialTime={task.timeSpent || 0}
                                      />
                                    ) : (
                                      <Button
                                        size="small"
                                        startIcon={<TimerIcon />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setTimeTrackingTask(task._id);
                                        }}
                                      sx={{ 
                                          textTransform: 'none',
                                          color: 'text.secondary',
                                          '&:hover': {
                                            color: 'primary.main',
                                            bgcolor: 'primary.50'
                                          }
                                        }}
                                      >
                                        {task.timeSpent ? `Time spent: ${Math.floor(task.timeSpent / 3600)}h ${Math.floor((task.timeSpent % 3600) / 60)}m` : 'Start tracking'}
                                      </Button>
                                    )}
                                  </Box>
                                </Box>
                              </Stack>
                            </CardContent>

                            <Box 
                              className="task-actions"
                              sx={{ 
                                p: 2,
                                pt: 0,
                                mt: 'auto',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'relative',
                                zIndex: 2
                              }}
                            >
                              <Button
                                variant="contained"
                                color="success"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (task._id) {
                                    handleTaskCompletion(task._id);
                                  }
                                }}
                                startIcon={<CheckCircleIcon />}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  py: 1,
                                  pointerEvents: 'auto',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.success.main, 0.4)}`
                                  }
                                }}
                              >
                                Mark Complete
                              </Button>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(task)}
                                sx={{
                                  bgcolor: 'primary.50',
                                  color: 'primary.main',
                                  '&:hover': {
                                    bgcolor: 'primary.100',
                                    transform: 'scale(1.1)',
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(task._id)}
                                sx={{
                                  bgcolor: 'error.50',
                                  color: 'error.main',
                                  '&:hover': {
                                    bgcolor: 'error.100',
                                    transform: 'scale(1.1)',
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                              </Box>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  {/* Completed Tasks Section */}
                  <Box>
                    <Box 
                      sx={{
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mb: 2 
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Completed Tasks ({separateTasks().completed.length})
                      </Typography>
                      <Button
                        variant="text"
                        onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                        endIcon={showCompletedTasks ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                      >
                        {showCompletedTasks ? 'Hide' : 'Show'}
                      </Button>
                    </Box>
                    
                    <Collapse in={showCompletedTasks}>
                      <Grid container spacing={2} sx={{ width: '100%', margin: 0 }}>
                        {separateTasks().completed.map((task) => (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={task._id}>
                            <Card
                              onClick={() => handleCompletedTaskClick(task)}
                              sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                borderRadius: '24px',
                                overflow: 'visible',
                                background: (theme) => `linear-gradient(135deg, 
                                  ${task.status === 'completed'
                                    ? `${alpha(theme.palette.success.light, 0.05)}, ${alpha(theme.palette.success.main, 0.1)}`
                                    : task.priority === 'high'
                                    ? `${alpha(theme.palette.error.light, 0.05)}, ${alpha(theme.palette.error.main, 0.1)}`
                                    : task.priority === 'medium'
                                    ? `${alpha(theme.palette.warning.light, 0.05)}, ${alpha(theme.palette.warning.main, 0.1)}`
                                    : `${alpha(theme.palette.success.light, 0.05)}, ${alpha(theme.palette.success.main, 0.1)}`
                                  }
                                )`,
                                backdropFilter: 'blur(10px)',
                                border: '1px solid',
                                borderColor: (theme) => `${alpha(
                                  task.status === 'completed'
                                    ? theme.palette.success.main
                                    : task.priority === 'high'
                                    ? theme.palette.error.main
                                    : task.priority === 'medium'
                                    ? theme.palette.warning.main
                                    : theme.palette.success.main,
                                  0.1
                                )}`,
                                boxShadow: (theme) => `
                                  0 4px 20px ${alpha(
                                    task.priority === 'high'
                                      ? theme.palette.error.main
                                      : task.priority === 'medium'
                                      ? theme.palette.warning.main
                                      : theme.palette.success.main,
                                    0.15
                                  )},
                                  inset 0 2px 8px ${alpha(theme.palette.common.white, 0.1)}
                                `,
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: '30%',
                                  background: (theme) => `linear-gradient(135deg,
                                    ${task.status === 'completed'
                                      ? `${alpha(theme.palette.success.light, 0.2)}, ${alpha(theme.palette.success.main, 0.1)}`
                                      : task.priority === 'high'
                                      ? `${alpha(theme.palette.error.light, 0.2)}, ${alpha(theme.palette.error.main, 0.1)}`
                                        : task.priority === 'medium'
                                      ? `${alpha(theme.palette.warning.light, 0.2)}, ${alpha(theme.palette.warning.main, 0.1)}`
                                      : `${alpha(theme.palette.success.light, 0.2)}, ${alpha(theme.palette.success.main, 0.1)}`
                                    }
                                  )`,
                                  borderRadius: '24px 24px 0 0',
                                  opacity: 0.8,
                                  zIndex: 0
                                },
                                '&:hover': {
                                  transform: 'translateY(-8px)',
                                  boxShadow: (theme) => `
                                    0 12px 24px ${alpha(
                                      task.priority === 'high'
                                        ? theme.palette.error.main
                                        : task.priority === 'medium'
                                        ? theme.palette.warning.main
                                        : theme.palette.success.main,
                                      0.25
                                    )},
                                    inset 0 2px 8px ${alpha(theme.palette.common.white, 0.2)}
                                  `,
                                  '& .priority-indicator': {
                                    transform: 'scaleY(1.1) translateX(2px)',
                                    boxShadow: (theme) => `4px 0 12px ${alpha(
                                      task.priority === 'high'
                                        ? theme.palette.error.main
                                        : task.priority === 'medium'
                                        ? theme.palette.warning.main
                                        : theme.palette.success.main,
                                      0.4
                                    )}`,
                                  },
                                  '& .task-title': {
                                    background: (theme) => `linear-gradient(to right,
                                      ${theme.palette.text.primary},
                                      ${alpha(
                                        task.priority === 'high'
                                          ? theme.palette.error.main
                                          : task.priority === 'medium'
                                          ? theme.palette.warning.main
                                          : theme.palette.success.main,
                                        0.8
                                      )}
                                    )`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                  }
                                },
                                '& .priority-indicator': {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  height: '100%',
                                  width: '6px',
                                  background: (theme) => `linear-gradient(to bottom, 
                                    ${task.priority === 'high'
                                      ? `${theme.palette.error.light}, ${theme.palette.error.main}, ${theme.palette.error.dark}`
                                      : task.priority === 'medium'
                                      ? `${theme.palette.warning.light}, ${theme.palette.warning.main}, ${theme.palette.warning.dark}`
                                      : `${theme.palette.success.light}, ${theme.palette.success.main}, ${theme.palette.success.dark}`
                                    }
                                  )`,
                                  borderRadius: '24px 0 0 24px',
                                  opacity: 0.8,
                                  transition: 'all 0.4s ease',
                                  zIndex: 1
                                }
                              }}
                            >
                              <Box className="priority-indicator" />
                              <CardContent sx={{ p: 3, pb: 1, position: 'relative', zIndex: 1 }}>
                                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Chip
                                      size="small"
                                      label={task.priority}
                                      sx={{
                                        height: '28px',
                                        borderRadius: '14px',
                                        textTransform: 'capitalize',
                                        fontWeight: 600,
                                        px: 1.5,
                                        background: (theme) => `linear-gradient(135deg, 
                                          ${task.priority === 'high'
                                            ? `${theme.palette.error.dark}, ${theme.palette.error.main}, ${alpha(theme.palette.error.light, 0.9)}`
                                            : task.priority === 'medium'
                                            ? `${theme.palette.warning.dark}, ${theme.palette.warning.main}, ${alpha(theme.palette.warning.light, 0.9)}`
                                            : `${theme.palette.success.dark}, ${theme.palette.success.main}, ${alpha(theme.palette.success.light, 0.9)}`
                                        })`,
                                        color: '#fff',
                                        letterSpacing: '0.5px',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                        boxShadow: (theme) => `
                                          0 4px 12px ${alpha(
                                            task.priority === 'high'
                                              ? theme.palette.error.main
                                              : task.priority === 'medium'
                                              ? theme.palette.warning.main
                                              : theme.palette.success.main,
                                            0.3
                                          )},
                                          inset 0 2px 4px ${alpha(theme.palette.common.white, 0.2)}
                                        `,
                                        '& .MuiChip-label': {
                                          px: 1,
                                        },
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          transform: 'translateY(-1px)',
                                          boxShadow: (theme) => `
                                            0 6px 16px ${alpha(
                                              task.priority === 'high'
                                                ? theme.palette.error.main
                                                : task.priority === 'medium'
                                                ? theme.palette.warning.main
                                                : theme.palette.success.main,
                                              0.4
                                            )},
                                            inset 0 2px 4px ${alpha(theme.palette.common.white, 0.2)}
                                          `,
                                        }
                                      }}
                                    />
                                    <Chip
                                      size="small"
                                      label={task.status}
                                      sx={{
                                        height: '28px',
                                        borderRadius: '14px',
                                        textTransform: 'capitalize',
                                        fontWeight: 600,
                                        px: 1.5,
                                        background: (theme) => `linear-gradient(135deg, 
                                          ${task.status === 'completed'
                                            ? `${theme.palette.success.dark}, ${theme.palette.success.main}, ${alpha(theme.palette.success.light, 0.9)}`
                                            : task.status === 'in-progress'
                                            ? `${theme.palette.info.dark}, ${theme.palette.info.main}, ${alpha(theme.palette.info.light, 0.9)}`
                                            : `${theme.palette.warning.dark}, ${theme.palette.warning.main}, ${alpha(theme.palette.warning.light, 0.9)}`
                                        })`,
                                        color: '#fff',
                                        letterSpacing: '0.5px',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                        boxShadow: (theme) => `
                                          0 4px 12px ${alpha(
                                            task.status === 'completed'
                                              ? theme.palette.success.main
                                              : task.status === 'in-progress'
                                              ? theme.palette.info.main
                                              : theme.palette.warning.main,
                                            0.3
                                          )},
                                          inset 0 2px 4px ${alpha(theme.palette.common.white, 0.2)}
                                        `,
                                        '& .MuiChip-label': {
                                          px: 1,
                                        },
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          transform: 'translateY(-1px)',
                                          boxShadow: (theme) => `
                                            0 6px 16px ${alpha(
                                              task.status === 'completed'
                                                ? theme.palette.success.main
                                                : task.status === 'in-progress'
                                                ? theme.palette.info.main
                                                : theme.palette.warning.main,
                                              0.4
                                            )},
                                            inset 0 2px 4px ${alpha(theme.palette.common.white, 0.2)}
                                          `,
                                        }
                                      }}
                                    />
                                  </Box>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleMenuClick(e, task)}
                                    sx={{ 
                                      ml: 1,
                                      width: '32px',
                                      height: '32px',
                                      background: (theme) => `linear-gradient(135deg, 
                                        ${alpha(theme.palette.primary.main, 0.08)},
                                        ${alpha(theme.palette.primary.light, 0.12)}
                                      )`,
                                      backdropFilter: 'blur(4px)',
                                      color: 'primary.main',
                                      border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                      '&:hover': {
                                        background: (theme) => `linear-gradient(135deg, 
                                          ${alpha(theme.palette.primary.main, 0.12)},
                                          ${alpha(theme.palette.primary.light, 0.16)}
                                        )`,
                                        transform: 'rotate(90deg) scale(1.1)',
                                      },
                                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                  >
                                    <MoreVertIcon sx={{ fontSize: 20 }} />
                                  </IconButton>
                                </Box>

                                <Typography 
                                  className="task-title"
                                  variant="h6" 
                                  sx={{ 
                                    mb: 1,
                                    fontWeight: 600,
                                    fontSize: '1.1rem',
                                    lineHeight: 1.3,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    minHeight: '2.6rem',
                                    color: 'text.primary',
                                    transition: 'all 0.3s ease',
                                  }}
                                >
                                  {task.title}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  sx={{
                                    mb: 2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    minHeight: '2.5rem',
                                    color: 'text.secondary',
                                    lineHeight: 1.6,
                                    letterSpacing: '0.2px',
                                  }}
                                >
                                  {task.description}
                                </Typography>

                                {/* Progress Section */}
                                <Box 
                                  sx={{ 
                                    mb: 2,
                                    p: 2,
                                    background: (theme) => `linear-gradient(145deg, 
                                      ${alpha(theme.palette.background.paper, 0.8)},
                                      ${alpha(theme.palette.background.paper, 0.4)}
                                    )`,
                                    borderRadius: '16px',
                                    border: '1px solid',
                                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                    backdropFilter: 'blur(8px)',
                                    boxShadow: (theme) => `
                                      inset 0 2px 4px ${alpha(theme.palette.common.black, 0.04)},
                                      0 2px 8px ${alpha(theme.palette.common.black, 0.04)}
                                    `,
                                  }}
                                >
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        fontWeight: 600,
                                        color: 'text.primary',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.8,
                                        letterSpacing: '0.4px',
                                      }}
                                    >
                                      <TimelineIcon sx={{ 
                                        fontSize: 18,
                                        color: (theme) => task.progress === 100 
                                          ? theme.palette.success.main 
                                          : theme.palette.primary.main,
                                        filter: (theme) => `drop-shadow(0 2px 4px ${alpha(
                                          task.progress === 100 
                                            ? theme.palette.success.main 
                                            : theme.palette.primary.main,
                                          0.4
                                        )})`
                                      }} />
                                      Progress
                                    </Typography>
                                      <Typography 
                                        variant="caption" 
                                        sx={{ 
                                          fontWeight: 700,
                                        color: (theme) => task.progress === 100 
                                          ? theme.palette.success.main
                                          : task.progress > 0 
                                          ? theme.palette.primary.main
                                          : theme.palette.warning.main,
                                        textShadow: (theme) => `0 2px 4px ${alpha(
                                          task.progress === 100 
                                            ? theme.palette.success.main
                                            : task.progress > 0 
                                            ? theme.palette.primary.main
                                            : theme.palette.warning.main,
                                          0.3
                                        )}`,
                                        letterSpacing: '0.4px',
                                        }}
                                      >
                                        {task.progress || 0}%
                                      </Typography>
                                    </Box>
                                  <Box sx={{ position: 'relative' }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={task.progress || 0}
                                    sx={{
                                        height: 12,
                                        borderRadius: 6,
                                        bgcolor: (theme) => alpha(theme.palette.grey[200], 0.4),
                                        backdropFilter: 'blur(4px)',
                                      '& .MuiLinearProgress-bar': {
                                          borderRadius: 6,
                                          background: (theme) => {
                                            if (task.progress === 100) {
                                              return `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main}, ${theme.palette.success.dark})`;
                                            } else if (task.progress > 0) {
                                              return `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`;
                                            } else {
                                              return `linear-gradient(135deg, ${theme.palette.warning.light}, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`;
                                            }
                                          },
                                          boxShadow: (theme) => {
                                            const color = task.progress === 100 
                                              ? theme.palette.success.main
                                            : task.progress > 0
                                              ? theme.palette.primary.main
                                              : theme.palette.warning.main;
                                            return `0 2px 8px ${alpha(color, 0.4)}, inset 0 2px 4px ${alpha(theme.palette.common.white, 0.2)}`;
                                          },
                                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: 12,
                                        background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                                        borderRadius: 6,
                                        pointerEvents: 'none',
                                      }}
                                    />
                                  </Box>
                                </Box>

                                {/* Task Details */}
                                <Stack 
                                  spacing={1.5} 
                                  sx={{ 
                                    p: 1.5,
                                    bgcolor: 'grey.50',
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccessTimeIcon 
                                      fontSize="small" 
                                      sx={{ 
                                        color: new Date(task.dueDate) < new Date() && task.status !== 'completed'
                                          ? 'error.main'
                                          : 'text.secondary',
                                        opacity: 0.7
                                      }} 
                                    />
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        color: new Date(task.dueDate) < new Date() && task.status !== 'completed'
                                          ? 'error.main'
                                          : 'text.secondary',
                                      }}
                                    >
                                      Due {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                                      {new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
                                        <Chip
                                          label="Overdue"
                                          size="small"
                                          color="error"
                                          sx={{ 
                                            height: 20,
                                            fontSize: '0.7rem',
                                            '& .MuiChip-label': { px: 1 }
                                          }}
                                        />
                                      )}
                                    </Typography>
                                  </Box>

                                  {task.attachments?.length > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Button
                                        size="small"
                                        startIcon={<AttachFileIcon />}
                                        onClick={(e) => handleAttachmentsClick(e, task)}
                                        sx={{ 
                                          textTransform: 'none',
                                          color: 'primary.main',
                                          '&:hover': {
                                            bgcolor: 'primary.50'
                                          }
                                        }}
                                      >
                                        {task.attachments.length} attachment{task.attachments.length !== 1 ? 's' : ''}
                                      </Button>
                                    </Box>
                                  )}

                                  {/* Time Tracking Section */}
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TimerIcon 
                                      fontSize="small" 
                                      sx={{ 
                                        color: timeTrackingTask === task._id ? 'primary.main' : 'text.secondary',
                                          opacity: 0.7
                                        }} 
                                      />
                                    <Box sx={{ flex: 1 }}>
                                      {timeTrackingTask === task._id ? (
                                        <Stopwatch 
                                          taskId={task._id} 
                                          onTimeUpdate={handleTimeUpdate}
                                          initialTime={task.timeSpent || 0}
                                        />
                                      ) : (
                                        <Button
                                          size="small"
                                          startIcon={<TimerIcon />}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setTimeTrackingTask(task._id);
                                          }}
                                        sx={{ 
                                            textTransform: 'none',
                                            color: 'text.secondary',
                                            '&:hover': {
                                              color: 'primary.main',
                                              bgcolor: 'primary.50'
                                            }
                                          }}
                                        >
                                          {task.timeSpent ? `Time spent: ${Math.floor(task.timeSpent / 3600)}h ${Math.floor((task.timeSpent % 3600) / 60)}m` : 'Start tracking'}
                                        </Button>
                                      )}
                                    </Box>
                                  </Box>
                                </Stack>
                              </CardContent>

                              <Box 
                                className="task-actions"
                                sx={{ 
                                  p: 2,
                                  pt: 0,
                                  mt: 'auto',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  position: 'relative',
                                  zIndex: 2
                                }}
                              >
                                <Button
                                  variant="contained"
                                  color="success"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (task._id) {
                                      handleTaskCompletion(task._id);
                                    }
                                  }}
                                  startIcon={<CheckCircleIcon />}
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    py: 1,
                                    pointerEvents: 'auto',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.success.main, 0.4)}`
                                    }
                                  }}
                                >
                                  Mark Complete
                                </Button>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEdit(task)}
                                  sx={{
                                    bgcolor: 'primary.50',
                                    color: 'primary.main',
                                    '&:hover': {
                                      bgcolor: 'primary.100',
                                      transform: 'scale(1.1)',
                                    }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(task._id)}
                                  sx={{
                                    bgcolor: 'error.50',
                                    color: 'error.main',
                                    '&:hover': {
                                      bgcolor: 'error.100',
                                      transform: 'scale(1.1)',
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                                </Box>
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Collapse>
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Task Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(selectedTask)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => handleDelete(selectedTask?._id)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingTask(null);
          formik.resetForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {editingTask ? 'Edit Task' : 'Create New Task'}
            <IconButton
              size="small"
              onClick={() => {
                setOpenDialog(false);
                setEditingTask(null);
                formik.resetForm();
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent sx={{ pb: 2 }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
              <TextField
                fullWidth
                label="Priority"
                name="priority"
                select
                value={formik.values.priority}
                onChange={formik.handleChange}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Due Date"
                name="dueDate"
                type="date"
                value={formik.values.dueDate}
                onChange={formik.handleChange}
                error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
                helperText={formik.touched.dueDate && formik.errors.dueDate}
                InputLabelProps={{ shrink: true }}
              />
              <Box>
                <input
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  id="task-attachments"
                  multiple
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="task-attachments">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AttachFileIcon />}
                    fullWidth
                  >
                    Upload Attachments
                  </Button>
                </label>
                {formik.values.attachments.length > 0 && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {formik.values.attachments.length} file(s) selected
                  </Typography>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={() => {
                setOpenDialog(false);
                setEditingTask(null);
                formik.resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editingTask ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Progress Menu */}
      <Menu
        anchorEl={progressAnchorEl}
        open={Boolean(progressAnchorEl)}
        onClose={handleProgressClose}
        PaperProps={{
          sx: {
            width: 320,
            p: 2,
          }
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Update Progress
        </Typography>
        <Box sx={{ px: 1, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress: {customProgress}%
            </Typography>
          </Box>
          <Slider
            value={customProgress}
            onChange={(_, value) => setCustomProgress(value)}
            sx={{
              '& .MuiSlider-thumb': {
                width: 24,
                height: 24,
                '&:before': {
                  width: 8,
                  height: 8,
                }
              }
            }}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            {[0, 25, 50, 75, 100].map((value) => (
              <Button
                key={value}
                size="small"
                variant={customProgress === value ? "contained" : "outlined"}
                onClick={() => setCustomProgress(value)}
                sx={{ minWidth: 48 }}
              >
                {value}%
              </Button>
            ))}
          </Stack>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={handleProgressClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleProgressUpdate(selectedTaskForProgress?._id, customProgress)}
          >
            Update
          </Button>
        </Box>
      </Menu>

      {/* Add Completed Task Details Dialog */}
      <Dialog
        open={completedTaskDialogOpen}
        onClose={handleCompletedTaskDialogClose}
        maxWidth="sm"
        fullWidth
      >
        {selectedCompletedTask && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Completed Task Details</Typography>
                <IconButton size="small" onClick={handleCompletedTaskDialogClose}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {selectedCompletedTask.title}
                  </Typography>
                </Box>

                <Chip
                  label="Completed"
                  color="success"
                  size="small"
                  sx={{ borderRadius: 1.5 }}
                />
              </Box>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2">
                    {selectedCompletedTask.description}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FlagIcon fontSize="small" color={getPriorityColor(selectedCompletedTask.priority)} />
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {selectedCompletedTask.priority} Priority
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          Due {format(new Date(selectedCompletedTask.dueDate), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {selectedCompletedTask.attachments?.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Attachments
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {selectedCompletedTask.attachments.map((attachment, index) => (
                        <Chip
                          key={index}
                          label={attachment.name}
                          size="small"
                          icon={<AttachFileIcon />}
                          onClick={() => window.open(attachment.url, '_blank')}
                          sx={{ borderRadius: 1.5 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Completion Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'success.100',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'success.main',
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                      100%
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleCompletedTaskDialogClose}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Attachments Menu */}
      <Menu
        anchorEl={attachmentsAnchorEl}
        open={Boolean(attachmentsAnchorEl)}
        onClose={handleAttachmentsClose}
        PaperProps={{
          sx: {
            maxWidth: 320,
            p: 1,
            mt: 1
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
          Attachments
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {selectedTaskAttachments?.attachments.map((attachment, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              window.open(attachment.url, '_blank');
              handleAttachmentsClose();
            }}
            sx={{
              borderRadius: 1,
              gap: 1,
              '&:hover': {
                bgcolor: 'primary.50'
              }
            }}
          >
            <AttachFileIcon fontSize="small" color="primary" />
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="body2" noWrap>
                {attachment.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {attachment.type}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Add Labels Menu */}
      <Menu
        anchorEl={labelAnchorEl}
        open={Boolean(labelAnchorEl)}
        onClose={handleLabelClose}
        PaperProps={{
          sx: {
            maxWidth: 320,
            p: 1,
            mt: 1
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600 }}>
          Labels
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {defaultLabels.map((label) => (
          <MenuItem
            key={label.id}
            onClick={() => handleLabelToggle(label.id)}
            sx={{
              borderRadius: 1,
              mb: 0.5
            }}
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={selectedTaskForLabels?.labels?.includes(label.id) || false}
                sx={{
                  color: label.color,
                  '&.Mui-checked': {
                    color: label.color,
                  },
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary={label.name}
              primaryTypographyProps={{
                variant: 'body2',
                sx: { fontWeight: 500 }
              }}
            />
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: label.color,
                opacity: 0.2
              }}
            />
          </MenuItem>
        ))}
      </Menu>

      {/* Add Dependencies Menu */}
      <Menu
        anchorEl={dependencyAnchorEl}
        open={Boolean(dependencyAnchorEl)}
        onClose={handleDependencyClose}
        PaperProps={{
          sx: {
            maxWidth: 320,
            p: 1,
            mt: 1
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600 }}>
          Dependencies
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {taskList
          .filter(t => t._id !== selectedTaskForDependencies?._id)
          .map((task) => (
            <MenuItem
              key={task._id}
              onClick={() => handleDependencyToggle(task._id)}
              sx={{
                borderRadius: 1,
                mb: 0.5
              }}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={selectedTaskForDependencies?.dependencies?.includes(task._id) || false}
                />
              </ListItemIcon>
              <ListItemText
                primary={task.title}
                secondary={`Due: ${format(new Date(task.dueDate), 'MMM dd')}`}
                primaryTypographyProps={{
                  variant: 'body2',
                  sx: { fontWeight: 500 }
                }}
                secondaryTypographyProps={{
                  variant: 'caption'
                }}
              />
            </MenuItem>
          ))}
      </Menu>

      {/* Comments Dialog */}
      <Dialog
        open={commentsDialogOpen}
        onClose={handleCommentsClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          Comments & Notes
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Add a comment or note..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              startIcon={<CommentIcon />}
            >
              Add Comment
            </Button>
          </Box>
          <Divider />
          <List sx={{ py: 0 }}>
            {selectedTaskForComments?.comments?.map((comment) => (
              <ListItem
                key={comment.id}
                alignItems="flex-start"
                sx={{
                  px: 0,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {comment.user.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">
                        {comment.user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{
                        mt: 1,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {comment.text}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
            {(!selectedTaskForComments?.comments || selectedTaskForComments.comments.length === 0) && (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CommentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">
                  No comments yet
                </Typography>
              </Box>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCommentsClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 