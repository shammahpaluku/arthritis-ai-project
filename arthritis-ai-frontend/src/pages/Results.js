import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Box,
  Divider,
  Chip,
  LinearProgress,
  Alert,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import ImageComparison from '../components/ImageComparison';
import NewAnalysisDialog from '../components/NewAnalysisDialog'; // Assuming the dialog is in a separate file

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: theme.shadows[4],
  minHeight: 300
}));

const ResultChip = styled(Chip)(({ severity }) => ({
  backgroundColor: severity === 'high' ? '#ffebee' :
                   severity === 'moderate' ? '#fff8e1' : '#e8f5e9',
  color: severity === 'high' ? '#c62828' :
         severity === 'moderate' ? '#f57f17' : '#2e7d32',
  fontWeight: 'bold',
  padding: '4px 8px'
}));

function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New Analysis Modal state
  const [newAnalysisOpen, setNewAnalysisOpen] = useState(false);

  // Handle New Analysis Form Submission
  const handleNewAnalysis = async (formData) => {
    try {
      const response = await axios.post('/api/analysis', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Redirect to the new analysis results
      navigate(`/results/${response.data.analysisId}`);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Analysis failed');
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!id || isNaN(id)) {
          throw new Error('Invalid result ID');
        }

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/results/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (!response.data) {
          throw new Error('No data returned');
        }

        setAnalysisResults(response.data);
      } catch (err) {
        console.error('Fetch error:', err);
        const message = err.response?.data?.error || err.message || 'Failed to load results';
        setError(message);
        
        if (err.response?.status === 401) {
          navigate('/login');
        } else if (message.includes('Invalid')) {
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, navigate]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 4 }} />
        <Grid container spacing={4}>
          <Grid xs={12} md={8}>
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Grid>
          <Grid xs={12} md={4}>
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ mb: 4 }}>
        <MedicalInformationIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
        Analysis Results
      </Typography>

      <Grid container spacing={4}>
        <Grid xs={12} md={8}>
          <StyledPaper>
            <Typography variant="h5" gutterBottom>Image Comparison</Typography>
            <ImageComparison 
              original={analysisResults.image_url} 
              analyzed={analysisResults.processed_image_url || analysisResults.image_url} 
            />
          </StyledPaper>
        </Grid>

        <Grid xs={12} md={4}>
          <StyledPaper>
            <Typography variant="h5" gutterBottom>Diagnostic Summary</Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>Confidence:</Typography>
              <LinearProgress
                variant="determinate"
                value={analysisResults.confidence}
                sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                color={
                  analysisResults.confidence > 85 ? 'success' :
                  analysisResults.confidence > 70 ? 'warning' : 'error'
                }
              />
              <Typography variant="body1" sx={{ ml: 2, fontWeight: 'bold' }}>
                {analysisResults.confidence}%
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mr: 2, display: 'inline' }}>Severity:</Typography>
              <ResultChip
                label={analysisResults.severity?.toUpperCase() || 'UNKNOWN'}
                severity={analysisResults.severity || 'low'}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>Affected Areas</Typography>
            {analysisResults.affected_areas?.length > 0 ? (
              <ul style={{ paddingLeft: 20 }}>
                {analysisResults.affected_areas.map((area, index) => (
                  <li key={index}>
                    <Typography variant="body1">{area}</Typography>
                  </li>
                ))}
              </ul>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No affected areas detected
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>Recommendations</Typography>
            {analysisResults.recommendations?.length > 0 ? (
              <ol style={{ paddingLeft: 20 }}>
                {analysisResults.recommendations.map((rec, index) => (
                  <li key={index}>
                    <Typography variant="body1">{rec}</Typography>
                  </li>
                ))}
              </ol>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recommendations available
              </Typography>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => {/* Save logic */}}
              >
                Save to Medical Record
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {/* Download logic */}}
              >
                Download Full Report
              </Button>
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>

      {/* New Analysis Dialog Button */}
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={() => setNewAnalysisOpen(true)}
        sx={{ mt: 4 }}
      >
        New Analysis
      </Button>

      {/* New Analysis Dialog */}
      <NewAnalysisDialog
        open={newAnalysisOpen}
        onClose={() => setNewAnalysisOpen(false)}
        onSubmit={handleNewAnalysis}
      />
    </Container>
  );
}

export default Results;
