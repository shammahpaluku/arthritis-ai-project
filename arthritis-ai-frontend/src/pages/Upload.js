import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  LinearProgress,
  Alert,
  styled,
  TextField,
  MenuItem
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FilePreview from '../components/FilePreview';
import axios from 'axios';

const DropZone = styled('div')(({ theme, isDragActive }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: isDragActive ? theme.palette.action.hover : theme.palette.background.paper,
  cursor: 'pointer',
  transition: 'background-color 0.3s',
  marginBottom: theme.spacing(2)
}));

function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Redirect if not a doctor
  useEffect(() => {
    if (user?.role !== 'doctor') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch patients for this doctor
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('/api/patients');
        setPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    if (user?.role === 'doctor') {
      fetchPatients();
    }
  }, [user]);

  const validateAndSetFile = (file) => {
    setError(null);
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'application/dicom'];
    const maxSize = 10 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or DICOM file');
      return;
    }

    if (file.size > maxSize) {
      setError('File size exceeds 10MB limit');
      return;
    }

    setFile(file);
    setUploadSuccess(false);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!file || !patientId) {
      setError('Please select both a file and a patient');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('patientId', patientId);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadSuccess(true);
      navigate(`/results/${response.data.analysisId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" color="primary" gutterBottom>
          Upload Medical Images
        </Typography>

        <Typography variant="body1" paragraph>
          Upload knee X-ray images in JPEG, PNG, or DICOM format for osteoarthritis analysis.
          Ensure images are clear and properly centered.
        </Typography>

        <TextField
          select
          fullWidth
          label="Select Patient"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          sx={{ mb: 3 }}
          required
        >
          {patients.map((patient) => (
            <MenuItem key={patient.id} value={patient.id}>
              {patient.name} (ID: {patient.id})
            </MenuItem>
          ))}
        </TextField>

        <DropZone
          isDragActive={dragActive}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CloudUploadIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" paragraph>
            {dragActive ? 'Drop your file here' : 'Drag and drop your file here'}
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            or
          </Typography>
          <Button variant="contained" component="label">
            Select File
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.dcm,.dicom"
            />
          </Button>
        </DropZone>

        {file && <FilePreview file={file} onRemove={() => setFile(null)} />}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {uploading && <LinearProgress sx={{ mb: 2 }} />}

        {uploadSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Upload successful! Analyzing your image...
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || uploading}
            size="large"
          >
            {uploading ? 'Analyzing...' : 'Analyze Image'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Upload;
