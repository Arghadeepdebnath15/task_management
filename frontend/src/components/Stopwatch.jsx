import { useState, useEffect } from 'react';
import { 
  Box, 
  IconButton, 
  Typography, 
  Card,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

const Stopwatch = ({ taskId, onTimeUpdate, initialTime = 0 }) => {
  const theme = useTheme();
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          onTimeUpdate && onTimeUpdate(taskId, newTime);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, taskId, onTimeUpdate]);

  const handleStartStop = () => {
    if (!isRunning) {
      setStartTime(Date.now() - (time * 1000));
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setStartTime(null);
    onTimeUpdate && onTimeUpdate(taskId, 0);
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card 
      sx={{ 
        display: 'inline-flex',
        alignItems: 'center',
        p: 1,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        boxShadow: theme.shadows[2],
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TimerIcon color="action" fontSize="small" />
        <Typography variant="body2" sx={{ fontFamily: 'monospace', minWidth: 80 }}>
          {formatTime(time)}
        </Typography>
        <Tooltip title={isRunning ? "Pause" : "Start"}>
          <IconButton 
            size="small" 
            onClick={handleStartStop}
            color={isRunning ? "error" : "success"}
          >
            {isRunning ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset">
          <IconButton 
            size="small" 
            onClick={handleReset}
            color="primary"
          >
            <StopIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default Stopwatch; 