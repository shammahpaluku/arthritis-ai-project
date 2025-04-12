import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Button,
  Chip,
  Avatar,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  LinearProgress
} from '@mui/material';
import { PictureAsPdf, Share, ArrowBack } from '@mui/icons-material';

const PatientReport = ({ data }) => {
  const severityColor = {
    high: 'error',
    moderate: 'warning',
    low: 'success'
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => window.history.back()}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Typography variant="h4" gutterBottom>
        Patient Report: {data.name}
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Patient Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
                {data.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6">{data.name}</Typography>
                <Typography color="textSecondary">
                  {data.age} years, {data.gender}
                </Typography>
              </Box>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Patient ID</TableCell>
                    <TableCell>{data.patientId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Date of Analysis</TableCell>
                    <TableCell>{data.date}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Diagnosis Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Condition:</Typography>
              <Chip 
                label={data.result} 
                color={severityColor[data.severity] || 'default'}
                sx={{ fontSize: '1rem', p: 1 }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Confidence Level:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LinearProgress 
                  variant="determinate" 
                  value={data.confidence} 
                  sx={{ height: 10, flexGrow: 1, mr: 2 }}
                  color={
                    data.confidence > 85 ? 'success' : 
                    data.confidence > 70 ? 'warning' : 'error'
                  }
                />
                <Typography>{data.confidence}%</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          X-ray Image Analysis
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          p: 2,
          borderRadius: 1
        }}>
          <img 
            src={data.imageUrl} 
            alt="X-ray scan" 
            style={{ 
              maxHeight: '400px', 
              maxWidth: '100%',
              objectFit: 'contain'
            }}
          />
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<PictureAsPdf />}
          sx={{ mr: 2 }}
        >
          Export as PDF
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Share />}
        >
          Share Report
        </Button>
      </Box>
    </Box>
  );
};

export default PatientReport;