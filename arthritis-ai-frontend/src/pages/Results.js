import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import ImageComparison from '../components/ImageComparison';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: theme.shadows[4],
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
  const { user } = useAuth();
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
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

        if (user?.role === 'doctor') {
          const hasAccess = await axios.get(
            `${process.env.REACT_APP_API_URL}/patients/${response.data.patient_id}/access`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );

          if (!hasAccess.data) {
            throw new Error('Unauthorized access to patient records');
          }
        }

        setAnalysisResults(response.data);
      } catch (err) {
        console.error('Fetch error:', err);
        const message = err.response?.data?.error || err.message || 'Failed to load results';
        setError(message);

        if (message.includes('Invalid') || message.includes('Unauthorized')) {
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, user, navigate]);

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!analysisResults) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ mb: 4 }}>
        <MedicalInformationIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
        Analysis Results
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <StyledPaper>
            <Typography variant="h5" gutterBottom>Image Comparison</Typography>
            <ImageComparison original={analysisResults.image_url} />
          </StyledPaper>
        </Grid>

        <Grid item xs={12} md={4}>
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
            <ul style={{ paddingLeft: 20 }}>
              {analysisResults.affected_areas?.map((area, index) => (
                <li key={index}>
                  <Typography variant="body1">{area}</Typography>
                </li>
              )) || <Typography variant="body2">Not specified</Typography>}
            </ul>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>Recommendations</Typography>
            <ol style={{ paddingLeft: 20 }}>
              {analysisResults.recommendations?.map((rec, index) => (
                <li key={index}>
                  <Typography variant="body1">{rec}</Typography>
                </li>
              )) || <Typography variant="body2">None provided</Typography>}
            </ol>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="outlined" color="primary">
                Save to Medical Record
              </Button>
              <Button variant="contained" color="primary">
                Download Full Report
              </Button>
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Results;
