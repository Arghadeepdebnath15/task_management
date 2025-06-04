import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Avatar,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AddAPhoto as AddAPhotoIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { auth } from '../services/api';
import { useAuth } from '../context/AuthContext';

const validationSchema = Yup.object({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      profilePicture: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append('username', values.username);
        formData.append('email', values.email);
        formData.append('password', values.password);
        if (values.profilePicture) {
          formData.append('profilePicture', values.profilePicture);
        }

        const data = await auth.register(formData);
        login(data.user, data.token);
        toast.success('Registration successful!');
        navigate('/');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      formik.setFieldValue('profilePicture', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}80 0%, ${theme.palette.secondary.main}90 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 0%, ${theme.palette.primary.light}40 0%, transparent 50%)`,
        },
      }}
    >
      <Container 
        component="main" 
        sx={{ 
          width: '100%', 
          maxWidth: '400px',
          position: 'relative',
          zIndex: 1,
          animation: 'fadeIn 0.6s ease-out',
          '@keyframes fadeIn': {
            from: {
              opacity: 0,
              transform: 'translateY(20px)'
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}
      >
        <Paper
          elevation={24}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
            },
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 3,
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textAlign: 'center',
              fontSize: '2.2rem',
            }}
          >
            Create Account
          </Typography>

          <Box sx={{ 
            position: 'relative', 
            mb: 3,
            animation: 'fadeIn 0.8s ease-out',
          }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profile-picture"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="profile-picture">
              <Avatar
                src={previewImage}
                sx={{
                  width: 100,
                  height: 100,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '4px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    opacity: 0.9,
                    transform: 'scale(1.05) rotate(5deg)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                  },
                }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: -5,
                  right: -5,
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    transform: 'scale(1.1)',
                  },
                }}
                component="span"
              >
                <AddAPhotoIcon />
              </IconButton>
            </label>
          </Box>

          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ width: '100%' }}
          >
            <TextField
              margin="normal"
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
                  },
                  '&.Mui-focused': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={
                formik.touched.confirmPassword &&
                Boolean(formik.errors.confirmPassword)
              }
              helperText={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem',
                textTransform: 'none',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                {'Already have an account? Sign In'}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 