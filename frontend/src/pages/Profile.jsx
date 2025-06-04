import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Button,
  Paper,
  TextField,
  Grid,
  IconButton,
  Divider,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
  Badge,
  Chip,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  useTheme,
  alpha,
  ListItemIcon,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AddAPhoto as AddAPhotoIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  ArrowBack as ArrowBackIcon,
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  LocalFireDepartment as FireIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Favorite as HeartIcon,
  PriorityHigh as PriorityHighIcon,
  Today as TodayIcon,
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  Celebration as CelebrationIcon,
  AcUnit as SnowflakeIcon,
  WbSunny as SunIcon,
  Park as ParkIcon,
  Bolt as BoltIcon,
  Layers as LayersIcon,
  Assignment as TasksIcon,
  Timer as TimerIcon,
  DateRange as DateRangeIcon,
  Assessment as AssessmentIcon,
  Flag as FlagIcon,
  AccessTime as AccessTimeIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  NotificationsActive as NotificationIcon,
  Share as ShareIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Language as LanguageIcon,
  Link as LinkIcon,
  ArrowForward as ArrowForwardIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { auth } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const theme = useTheme();
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    occupation: user?.occupation || '',
    education: user?.education || '',
    website: user?.website || '',
    languages: user?.languages || [],
    profilePicture: user?.profilePicture || null,
    coverPicture: user?.coverPicture || null,
    socialLinks: user?.socialLinks || {
      twitter: '',
      linkedin: '',
      github: '',
    },
  });

  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    efficiency: 0,
    streak: 0,
    tasksByPriority: {
      high: 0,
      medium: 0,
      low: 0,
    },
    recentActivity: [],
    bestStreak: 0,
    tasksInStreak: 0,
    onTimeCompletionRate: 0,
    averageCompletionTime: '0',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserStats();
  }, [user, navigate]);

  const fetchUserStats = async () => {
    try {
      const response = await auth.getUserStats();
      if (response && response.data) {
        setStats({
          ...response.data,
          recentActivity: response.data.recentActivity || [],
          tasksByPriority: response.data.tasksByPriority || {
            high: 0,
            medium: 0,
            low: 0,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else {
        toast.error('Error fetching user statistics');
      }
    }
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileData(prev => ({
        ...prev,
        profilePicture: {
          ...prev.profilePicture,
          preview: URL.createObjectURL(file),
          file,
        },
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      Object.keys(profileData).forEach(key => {
        if (key !== 'profilePicture' && key !== 'coverPicture' && key !== 'socialLinks') {
          formData.append(key, profileData[key]);
        }
      });

      if (profileData.profilePicture?.file) {
        formData.append('profilePicture', profileData.profilePicture.file);
      }

      formData.append('socialLinks', JSON.stringify(profileData.socialLinks));

      const response = await auth.updateProfile(formData);
      const token = localStorage.getItem('token');
      login({ ...response, token });
      
      setEditMode(false);
      toast.success('Profile updated successfully!');
      
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setProfileData({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || '',
      occupation: user?.occupation || '',
      education: user?.education || '',
      website: user?.website || '',
      languages: user?.languages || [],
      profilePicture: user?.profilePicture || null,
      coverPicture: user?.coverPicture || null,
      socialLinks: user?.socialLinks || {
        twitter: '',
        linkedin: '',
        github: '',
      },
    });
  };

  const calculateLevel = () => {
    // Base XP from completed tasks (10 XP per completed task)
    const completedTasksXP = stats.completedTasks * 10;
    
    // Bonus XP from efficiency (0-50 bonus XP based on efficiency percentage)
    const efficiencyBonus = Math.floor((stats.efficiency / 100) * 50);
    
    // Bonus XP from streak (5 XP per day of streak)
    const streakBonus = stats.streak * 5;
    
    // Total XP
    const totalXP = completedTasksXP + efficiencyBonus + streakBonus;
    
    // Level calculation: each level requires 100 XP
    return Math.floor(totalXP / 100) + 1;
  };

  const calculateProgress = () => {
    // Calculate total XP
    const completedTasksXP = stats.completedTasks * 10;
    const efficiencyBonus = Math.floor((stats.efficiency / 100) * 50);
    const streakBonus = stats.streak * 5;
    const totalXP = completedTasksXP + efficiencyBonus + streakBonus;
    
    // Get current level and XP required for next level
    const currentLevel = Math.floor(totalXP / 100) + 1;
    const xpForCurrentLevel = (currentLevel - 1) * 100;
    const xpForNextLevel = currentLevel * 100;
    
    // Calculate progress percentage to next level
    const progressXP = totalXP - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const progress = (progressXP / xpNeeded) * 100;
    
    return Math.min(progress, 100);
  };

  const getXPBreakdown = () => {
    return {
      tasks: stats.completedTasks * 10,
      efficiency: Math.floor((stats.efficiency / 100) * 50),
      streak: stats.streak * 5
    };
  };

  // Helper function to get current season
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  // Helper function to check if it's a special date
  const isSpecialDate = () => {
    const today = new Date();
    const month = today.getMonth();
    const date = today.getDate();
    
    // Special dates mapping
    const specialDates = {
      christmas: { month: 11, date: 25 },
      newYear: { month: 0, date: 1 },
      halloween: { month: 9, date: 31 },
      valentines: { month: 1, date: 14 },
    };

    return Object.entries(specialDates).find(
      ([_, value]) => value.month === month && value.date === date
    )?.[0];
  };

  const getAchievements = () => {
    const achievements = [];
    
    // Task Master Achievements
    if (stats.completedTasks >= 100) {
      achievements.push({
        icon: <TrophyIcon />,
        title: 'Task Master',
        description: 'Completed 100 tasks',
        color: 'warning.main',
        category: 'Completion'
      });
    }
    if (stats.completedTasks >= 50) {
      achievements.push({
        icon: <StarIcon />,
        title: 'Rising Star',
        description: 'Completed 50 tasks',
        color: 'secondary.main',
        category: 'Completion'
      });
    }
    if (stats.completedTasks >= 25) {
      achievements.push({
        icon: <CheckCircleIcon />,
        title: 'Getting Started',
        description: 'Completed 25 tasks',
        color: 'info.main',
        category: 'Completion'
      });
    }
    
    // Streak Achievements
    if (stats.streak >= 30) {
      achievements.push({
        icon: <FireIcon />,
        title: 'Monthly Master',
        description: '30-day streak',
        color: 'error.main',
        category: 'Streak'
      });
    }
    if (stats.streak >= 7) {
      achievements.push({
        icon: <FireIcon />,
        title: 'Weekly Warrior',
        description: '7-day streak',
        color: 'error.main',
        category: 'Streak'
      });
    }
    
    // Efficiency Achievements
    if (stats.efficiency >= 95) {
      achievements.push({
        icon: <SpeedIcon />,
        title: 'Perfection Seeker',
        description: '95%+ efficiency',
        color: 'success.main',
        category: 'Efficiency'
      });
    }
    if (stats.efficiency >= 90) {
      achievements.push({
        icon: <SpeedIcon />,
        title: 'Efficiency Expert',
        description: '90%+ efficiency',
        color: 'success.main',
        category: 'Efficiency'
      });
    }
    
    // Priority Management
    if (stats.tasksByPriority.high >= 20) {
      achievements.push({
        icon: <PriorityHighIcon />,
        title: 'High Stakes Handler',
        description: 'Completed 20 high-priority tasks',
        color: 'error.main',
        category: 'Priority'
      });
    }
    
    // Level Achievements
    if (calculateLevel() >= 10) {
      achievements.push({
        icon: <TrophyIcon />,
        title: 'Master of Tasks',
        description: 'Reached Level 10',
        color: 'warning.main',
        category: 'Level'
      });
    }
    if (calculateLevel() >= 5) {
      achievements.push({
        icon: <StarIcon />,
        title: 'Task Veteran',
        description: 'Reached Level 5',
        color: 'primary.main',
        category: 'Level'
      });
    }

    // Daily Goals
    if (stats.tasksByPriority.high + stats.tasksByPriority.medium + stats.tasksByPriority.low >= 5) {
      achievements.push({
        icon: <TodayIcon />,
        title: 'Daily Champion',
        description: 'Completed 5 tasks in a day',
        color: 'info.main',
        category: 'Daily'
      });
    }

    // Special Achievements
    if (stats.streak >= 3 && stats.efficiency >= 80) {
      achievements.push({
        icon: <AutoAwesomeIcon />,
        title: 'Consistent Performer',
        description: '3+ day streak with 80%+ efficiency',
        color: 'secondary.main',
        category: 'Special'
      });
    }

    // Complexity Achievements
    const simultaneousTasks = stats.inProgressTasks;
    if (simultaneousTasks >= 5) {
      achievements.push({
        icon: <BoltIcon />,
        title: 'Multitasking Master',
        description: 'Handle 5 tasks simultaneously',
        color: 'secondary.main',
        category: 'Complexity'
      });
    }
    if (simultaneousTasks >= 3) {
      achievements.push({
        icon: <LayersIcon />,
        title: 'Task Juggler',
        description: 'Handle 3 tasks simultaneously',
        color: 'info.main',
        category: 'Complexity'
      });
    }
    if (stats.tasksByPriority.high >= 3 && stats.efficiency >= 85) {
      achievements.push({
        icon: <PsychologyIcon />,
        title: 'Priority Expert',
        description: 'Complete 3 high-priority tasks with 85%+ efficiency',
        color: 'error.main',
        category: 'Complexity'
      });
    }
    if (stats.completedTasks >= 3 && stats.streak >= 2) {
      achievements.push({
        icon: <TasksIcon />,
        title: 'Consistent Multitasker',
        description: 'Complete 3+ tasks while maintaining streak',
        color: 'primary.main',
        category: 'Complexity'
      });
    }

    // Seasonal Achievements
    const season = getCurrentSeason();
    const specialDate = isSpecialDate();

    // Season-specific achievements
    if (season === 'winter' && stats.completedTasks >= 10) {
      achievements.push({
        icon: <SnowflakeIcon />,
        title: 'Winter Warrior',
        description: 'Complete 10 tasks during winter',
        color: 'info.main',
        category: 'Seasonal'
      });
    }
    if (season === 'spring' && stats.completedTasks >= 10) {
      achievements.push({
        icon: <ParkIcon />,
        title: 'Spring Sprinter',
        description: 'Complete 10 tasks during spring',
        color: 'success.main',
        category: 'Seasonal'
      });
    }
    if (season === 'summer' && stats.completedTasks >= 10) {
      achievements.push({
        icon: <SunIcon />,
        title: 'Summer Star',
        description: 'Complete 10 tasks during summer',
        color: 'warning.main',
        category: 'Seasonal'
      });
    }
    if (season === 'autumn' && stats.completedTasks >= 10) {
      achievements.push({
        icon: <ParkIcon />,
        title: 'Autumn Achiever',
        description: 'Complete 10 tasks during autumn',
        color: 'error.main',
        category: 'Seasonal'
      });
    }

    // Special date achievements
    if (specialDate === 'christmas' && stats.completedTasks >= 1) {
      achievements.push({
        icon: <CelebrationIcon />,
        title: 'Holiday Helper',
        description: 'Complete tasks during Christmas',
        color: 'error.main',
        category: 'Seasonal'
      });
    }
    if (specialDate === 'newYear' && stats.completedTasks >= 1) {
      achievements.push({
        icon: <CelebrationIcon />,
        title: 'New Year Starter',
        description: 'Start the year productively',
        color: 'primary.main',
        category: 'Seasonal'
      });
    }
    if (specialDate === 'halloween' && stats.completedTasks >= 1) {
      achievements.push({
        icon: <CelebrationIcon />,
        title: 'Spooky Scheduler',
        description: 'Complete tasks during Halloween',
        color: 'warning.main',
        category: 'Seasonal'
      });
    }
    if (specialDate === 'valentines' && stats.completedTasks >= 1) {
      achievements.push({
        icon: <HeartIcon />,
        title: 'Valentine Virtuoso',
        description: 'Share the love by completing tasks',
        color: 'error.main',
        category: 'Seasonal'
      });
    }

    return achievements;
  };

  // Enhanced efficiency calculation
  const calculateEfficiencyMetrics = () => {
    return {
      overall: stats.efficiency,
      taskCompletion: (stats.completedTasks / (stats.completedTasks + stats.inProgressTasks)) * 100 || 0,
      onTimeCompletion: stats.onTimeCompletionRate || 0,
      averageCompletionTime: stats.averageCompletionTime || '0',
    };
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        width: '100%',
        overflowX: 'hidden'
      }}
    >
      {/* Cover Image and Profile Header */}
      <Box
        sx={{
          height: 280,
          position: 'relative',
          width: '100%',
          backgroundImage: profileData.coverPicture?.url 
            ? `url(${profileData.coverPicture.url})`
            : `linear-gradient(120deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
          },
        }}
      >
        <Box sx={{ px: 2, width: '100%' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{
              mt: 2,
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box 
        sx={{ 
          mt: -8,
          position: 'relative',
          zIndex: 1,
          width: '100vw',
          maxWidth: '100vw',
        }}
      >
        {/* Profile Header Card */}
        <Card
          elevation={3}
          sx={{
            borderRadius: 4,
            mb: 3,
            position: 'relative',
            overflow: 'visible',
            mx: 0,
            width: '100%',
          }}
        >
          {/* Profile Picture and Basic Info */}
          <Box sx={{ p: 3, display: 'flex', alignItems: 'flex-end' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                editMode && (
                  <label htmlFor="profile-picture-input">
                    <input
                      accept="image/*"
                      id="profile-picture-input"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handleProfilePictureChange}
                    />
                    <IconButton
                      component="span"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    >
                      <AddAPhotoIcon />
                    </IconButton>
                  </label>
                )
              }
            >
              <Avatar
                src={profileData.profilePicture?.preview || profileData.profilePicture?.url}
                sx={{
                  width: 150,
                  height: 150,
                  border: '4px solid white',
                  boxShadow: theme.shadows[3],
                  mt: -12,
                }}
              />
            </Badge>

            <Box sx={{ ml: 3, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
              <Typography variant="h4" fontWeight="bold">
                    {profileData.username}
              </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" />
                    {profileData.email}
                  </Typography>
                </Box>

                <Box>
              {!editMode ? (
                    <>
                      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                        <MoreVertIcon />
                      </IconButton>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                        sx={{ ml: 1 }}
                >
                  Edit Profile
                </Button>
                    </>
              ) : (
                    <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                        {loading ? 'Saving...' : 'Save'}
                  </Button>
                </Stack>
              )}
            </Box>
              </Box>

              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                {profileData.location && (
                  <Chip
                    icon={<LocationIcon />}
                    label={profileData.location}
                    size="small"
                  />
                )}
                {profileData.occupation && (
                  <Chip
                    icon={<WorkIcon />}
                    label={profileData.occupation}
                    size="small"
                  />
                )}
                {profileData.education && (
                  <Chip
                    icon={<SchoolIcon />}
                    label={profileData.education}
                    size="small"
                  />
                )}
                {profileData.website && (
                  <Chip
                    icon={<LinkIcon />}
                    label="Website"
                    component="a"
                    href={profileData.website}
                    target="_blank"
                    clickable
                    size="small"
                  />
                )}
              </Box>
            </Box>
          </Box>

          {/* Navigation Tabs */}
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              px: 3,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Tab label="Overview" />
            <Tab label="Statistics" />
            <Tab label="Achievements" />
            <Tab label="Activity" />
          </Tabs>
        </Card>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">Settings</Typography>
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <NotificationsIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">Notifications</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { logout(); navigate('/login'); }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">Logout</Typography>
          </MenuItem>
        </Menu>

        {/* Tab Panels */}
        <Box sx={{ mt: 3, width: '100%' }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
              {/* Left Column */}
              <Grid item xs={12} md={3} sx={{ pl: 0 }}>
                <Stack spacing={3} sx={{ width: '100%' }}>
                  {/* About Section */}
                  <Card sx={{ width: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        About
                      </Typography>
                      {editMode ? (
              <TextField
                fullWidth
                          multiline
                          rows={4}
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <Typography variant="body1">
                          {profileData.bio || "No bio added yet"}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>

                  {/* Personal Info */}
                  <Card sx={{ width: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Personal Information
                      </Typography>
                      <Stack spacing={2}>
                        {editMode ? (
                          <>
                            <TextField
                              fullWidth
                              label="Location"
                              value={profileData.location}
                              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                InputProps={{
                                startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <TextField
                fullWidth
                              label="Occupation"
                              value={profileData.occupation}
                              onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })}
                InputProps={{
                                startAdornment: <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <TextField
                fullWidth
                              label="Education"
                              value={profileData.education}
                              onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                              InputProps={{
                                startAdornment: <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                              }}
                            />
                            <TextField
                              fullWidth
                              label="Website"
                              value={profileData.website}
                              onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                              InputProps={{
                                startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationIcon color="action" />
                              <Typography>{profileData.location || 'Not specified'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <WorkIcon color="action" />
                              <Typography>{profileData.occupation || 'Not specified'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <SchoolIcon color="action" />
                              <Typography>{profileData.education || 'Not specified'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinkIcon color="action" />
                              <Typography>
                                {profileData.website ? (
                                  <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                                    {profileData.website}
                                  </a>
                                ) : (
                                  'Not specified'
                                )}
                              </Typography>
                            </Box>
                          </>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Languages */}
                  <Card sx={{ width: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Languages
                      </Typography>
                      {editMode ? (
                        <TextField
                          fullWidth
                          label="Languages"
                          value={profileData.languages.join(', ')}
                          onChange={(e) => setProfileData({ 
                            ...profileData, 
                            languages: e.target.value.split(',').map(lang => lang.trim()) 
                          })}
                          helperText="Separate languages with commas"
                          InputProps={{
                            startAdornment: <LanguageIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                      ) : (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {profileData.languages.length > 0 ? (
                            profileData.languages.map((lang, index) => (
                              <Chip
                                key={index}
                                label={lang}
                                icon={<LanguageIcon />}
                                size="small"
                              />
                            ))
                          ) : (
                            <Typography color="text.secondary">No languages specified</Typography>
                          )}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} md={9} sx={{ pr: 0 }}>
                <Stack spacing={3} sx={{ width: '100%' }}>
                  {/* Performance Overview */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimelineIcon color="primary" />
                        Performance Overview
                      </Typography>
                      <Grid container spacing={2}>
                        {/* Efficiency Card */}
                        <Grid item xs={12} sm={6} md={4}>
                          <Card sx={{ bgcolor: 'primary.main', color: 'white', p: 2, borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <SpeedIcon sx={{ mr: 1 }} />
                              <Typography variant="h6">Efficiency</Typography>
                            </Box>
                            <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                                <CircularProgress
                                  variant="determinate"
                                  value={stats.efficiency}
                                  size={100}
                                  thickness={8}
                                  sx={{ color: 'white' }}
                                />
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                  }}
                                >
                                  <Typography variant="h4" component="div">
                                    {stats.efficiency}%
                                  </Typography>
                                </Box>
                              </Box>
                              <Stack spacing={1} sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Typography variant="body2">Task Completion Rate</Typography>
                                  <Typography variant="body2">
                                    {Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100)}%
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Typography variant="body2">On-time Completion</Typography>
                                  <Typography variant="body2">{stats.onTimeCompletionRate}%</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Typography variant="body2">Avg. Completion Time</Typography>
                                  <Typography variant="body2">{stats.averageCompletionTime}</Typography>
                                </Box>
                              </Stack>
                            </Box>
                          </Card>
                        </Grid>

                        {/* Streak Card */}
                        <Grid item xs={12} sm={6} md={4}>
                          <Card sx={{ bgcolor: 'error.main', color: 'white', p: 2, borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <FireIcon sx={{ mr: 1 }} />
                              <Typography variant="h6">Current Streak</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                              <Typography variant="h2" sx={{ mb: 1 }}>
                                {stats.streak}
                              </Typography>
                              <Typography variant="body2">
                                days
                              </Typography>
                            </Box>
                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Best Streak</Typography>
                                <Typography variant="body2">{stats.bestStreak} days</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Tasks in Streak</Typography>
                                <Typography variant="body2">{stats.tasksInStreak} tasks</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Daily Average</Typography>
                                <Typography variant="body2">
                                  {stats.streak ? (Math.round((stats.tasksInStreak / stats.streak) * 10) / 10) : 0} tasks/day
                                </Typography>
                              </Box>
                            </Stack>
                          </Card>
                        </Grid>

                        {/* New Task Progress Card */}
                        <Grid item xs={12} sm={6} md={4}>
                          <Card sx={{ bgcolor: 'success.main', color: 'white', p: 2, borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <AssessmentIcon sx={{ mr: 1 }} />
                              <Typography variant="h6">Task Progress</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                              <Typography variant="h2" sx={{ mb: 1 }}>
                                {stats.completedTasks}
                              </Typography>
                              <Typography variant="body2">
                                completed tasks
                              </Typography>
                            </Box>
                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Total Tasks</Typography>
                                <Typography variant="body2">{stats.totalTasks}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body2">In Progress</Typography>
                                <Typography variant="body2">{stats.inProgressTasks}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Completion Rate</Typography>
                                <Typography variant="body2">
                                  {Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100)}%
                                </Typography>
                              </Box>
                            </Stack>
                          </Card>
                        </Grid>

                        {/* Task Distribution Row */}
                        <Grid item xs={12}>
                          <Grid container spacing={2}>
                            {/* High Priority Tasks */}
                            <Grid item xs={12} sm={4}>
                              <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), p: 2, borderRadius: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <PriorityHighIcon color="error" sx={{ mr: 1 }} />
                                  <Typography variant="h6" color="error.main">High Priority</Typography>
                                </Box>
                                <Typography variant="h3" color="error.main" sx={{ mb: 1 }}>
                                  {stats.tasksByPriority.high}
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min((stats.tasksByPriority.high / (stats.totalTasks || 1)) * 100, 100)}
                                  color="error"
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Card>
                            </Grid>

                            {/* Medium Priority Tasks */}
                            <Grid item xs={12} sm={4}>
                              <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), p: 2, borderRadius: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <FlagIcon color="warning" sx={{ mr: 1 }} />
                                  <Typography variant="h6" color="warning.main">Medium Priority</Typography>
                                </Box>
                                <Typography variant="h3" color="warning.main" sx={{ mb: 1 }}>
                                  {stats.tasksByPriority.medium}
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min((stats.tasksByPriority.medium / (stats.totalTasks || 1)) * 100, 100)}
                                  color="warning"
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Card>
                            </Grid>

                            {/* Low Priority Tasks */}
                            <Grid item xs={12} sm={4}>
                              <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), p: 2, borderRadius: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <FlagIcon color="success" sx={{ mr: 1 }} />
                                  <Typography variant="h6" color="success.main">Low Priority</Typography>
                                </Box>
                                <Typography variant="h3" color="success.main" sx={{ mb: 1 }}>
                                  {stats.tasksByPriority.low}
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min((stats.tasksByPriority.low / (stats.totalTasks || 1)) * 100, 100)}
                                  color="success"
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Card>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Recent Activity Preview */}
                <Card>
                  <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUpIcon color="success" />
                          Recent Activity
                    </Typography>
                        <Button
                          endIcon={<ArrowForwardIcon />}
                          onClick={() => setActiveTab(3)}
                        >
                          View All
                        </Button>
                      </Box>
                      <Stack spacing={2}>
                        {stats.recentActivity.slice(0, 3).map((activity, index) => (
                          <Card
                            key={index}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              bgcolor: 'grey.50',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                sx={{
                                  bgcolor: 
                                    activity.type === 'completed' ? 'success.main' :
                                    activity.type === 'created' ? 'primary.main' :
                                    'warning.main'
                                }}
                              >
                                {activity.type === 'completed' ? <CheckCircleIcon /> :
                                 activity.type === 'created' ? <StarIcon /> :
                                 <EditIcon />}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2">
                                  {activity.description}
                    </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                                </Typography>
                              </Box>
                              {activity.priority && (
                                <Chip
                                  label={activity.priority}
                                  size="small"
                                  color={
                                    activity.priority === 'high' ? 'error' :
                                    activity.priority === 'medium' ? 'warning' :
                                    'success'
                                  }
                                />
                              )}
                            </Box>
                          </Card>
                        ))}
                      </Stack>
                  </CardContent>
                </Card>
                </Stack>
              </Grid>
            </Grid>
          )}

          {/* Statistics Tab */}
          {activeTab === 1 && (
            <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
              {/* Task Distribution */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Task Distribution
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 2 }}>
                          <Typography variant="h4" color="error.main">
                            {stats.tasksByPriority.high}
                    </Typography>
                          <Typography variant="body2" color="text.secondary">
                            High Priority
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2 }}>
                          <Typography variant="h4" color="warning.main">
                            {stats.tasksByPriority.medium}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Medium Priority
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2 }}>
                          <Typography variant="h4" color="success.main">
                            {stats.tasksByPriority.low}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Low Priority
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Completion Stats */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Completion Statistics
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Total Progress
                    </Typography>
                          <Typography variant="body2" color="text.primary">
                            {stats.completedTasks}/{stats.totalTasks}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(Math.max((stats.completedTasks / (stats.totalTasks || 1)) * 100, 0), 100)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            On-time Completion Rate
                          </Typography>
                          <Typography variant="body2" color="text.primary">
                            {stats.onTimeCompletionRate || 0}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(Math.max(stats.onTimeCompletionRate || 0, 0), 100)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Efficiency Rate
                          </Typography>
                          <Typography variant="body2" color="text.primary">
                            {stats.efficiency || 0}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(Math.max(stats.efficiency || 0, 0), 100)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Time Analysis */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Time Analysis
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h4" color="primary.main">
                            {stats.averageCompletionTime}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Average Completion Time
                          </Typography>
                        </Box>
            </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h4" color="secondary.main">
                            {stats.streak}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Current Streak (Days)
                          </Typography>
                        </Box>
          </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h4" color="success.main">
                            {stats.tasksInStreak}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tasks in Current Streak
                          </Typography>
                        </Box>
        </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Achievements Tab */}
          {activeTab === 2 && (
            <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
              {['Completion', 'Streak', 'Efficiency', 'Priority', 'Level', 'Daily', 'Complexity', 'Seasonal', 'Special'].map(category => {
                const categoryAchievements = getAchievements().filter(a => a.category === category);
                if (categoryAchievements.length === 0) return null;

                return (
                  <Grid item xs={12} key={category}>
                    <Card>
                      <CardContent>
                        <Typography 
                          variant="h6" 
                          gutterBottom 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            '&::after': {
                              content: '""',
                              flex: 1,
                              height: '1px',
                              bgcolor: 'divider',
                            },
                          }}
                        >
                          {category} ({categoryAchievements.length})
                        </Typography>
                        <Grid container spacing={2}>
                          {categoryAchievements.map((achievement, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <Card
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: 'grey.50',
                                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: 2,
                                  },
                                }}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: achievement.color,
                                    mr: 2,
                                  }}
                                >
                                  {achievement.icon}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {achievement.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {achievement.description}
                                  </Typography>
                                </Box>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Activity Tab */}
          {activeTab === 3 && (
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="success" />
                  Activity History
                </Typography>
                <Stack spacing={2}>
                  {stats.recentActivity.map((activity, index) => (
                    <Card
                      key={index}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 
                              activity.type === 'completed' ? 'success.main' :
                              activity.type === 'created' ? 'primary.main' :
                              activity.type === 'deleted' ? 'error.main' :
                              activity.type === 'deadline_updated' ? 'info.main' :
                              activity.type === 'priority_changed' ? 'warning.main' :
                              activity.type === 'category_changed' ? 'secondary.main' :
                              activity.type === 'reminder_set' ? 'info.main' :
                              activity.type === 'shared' ? 'primary.main' :
                              'warning.main'
                          }}
                        >
                          {activity.type === 'completed' ? <CheckCircleIcon /> :
                           activity.type === 'created' ? <StarIcon /> :
                           activity.type === 'deleted' ? <DeleteIcon /> :
                           activity.type === 'deadline_updated' ? <AccessTimeIcon /> :
                           activity.type === 'priority_changed' ? <FlagIcon /> :
                           activity.type === 'category_changed' ? <CategoryIcon /> :
                           activity.type === 'reminder_set' ? <NotificationIcon /> :
                           activity.type === 'shared' ? <ShareIcon /> :
                           <EditIcon />}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2">
                            {activity.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                            </Typography>
                            {activity.category && (
                              <Chip
                                label={activity.category}
                                size="small"
                                color="secondary"
                                sx={{ height: 20 }}
                              />
                            )}
                            {activity.priority && (
                              <Chip
                                label={activity.priority}
                                size="small"
                                color={
                                  activity.priority === 'high' ? 'error' :
                                  activity.priority === 'medium' ? 'warning' :
                                  'success'
                                }
                                sx={{ height: 20 }}
                              />
                            )}
                            {activity.deadline && (
                              <Chip
                                icon={<AccessTimeIcon sx={{ fontSize: '0.875rem !important' }} />}
                                label={format(new Date(activity.deadline), 'MMM dd')}
                                size="small"
                                color="info"
                                sx={{ height: 20 }}
                              />
                            )}
                          </Box>
                        </Box>
                        {activity.type === 'completed' && activity.completionTime && (
                          <Tooltip title="Time to complete">
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                              {activity.completionTime}
                            </Typography>
                          </Tooltip>
                        )}
                      </Box>
                    </Card>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Profile; 