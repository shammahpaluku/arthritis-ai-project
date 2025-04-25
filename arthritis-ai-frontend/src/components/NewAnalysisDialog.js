import { Typography } from '@mui/material';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  LinearProgress,
  Alert
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

function NewAnalysisDialog({ open, onClose, onSubmit }) {
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: '',
    notes: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      setError('File size should be less than 10MB');
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('patientInfo', JSON.stringify(patientInfo));
      
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Medical Analysis</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Patient Name"
            value={patientInfo.name}
            onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
            fullWidth
            required
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Age"
              type="number"
              value={patientInfo.age}
              onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
              fullWidth
            />
            <TextField
              label="Gender"
              select
              SelectProps={{ native: true }}
              value={patientInfo.gender}
              onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
              fullWidth
            >
              <option value=""></option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </TextField>
          </Box>
          <TextField
            label="Clinical Notes"
            multiline
            rows={3}
            value={patientInfo.notes}
            onChange={(e) => setPatientInfo({...patientInfo, notes: e.target.value})}
            fullWidth
          />
          
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUpload />}
            sx={{ mt: 2 }}
          >
            Upload Medical Image
            <input
              type="file"
              hidden
              accept="image/*,.dcm"
              onChange={handleFileChange}
            />
          </Button>
          {file && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">Selected: {file.name}</Typography>
            </Box>
          )}
        </Box>
        {uploading && <LinearProgress sx={{ mt: 2 }} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={uploading || !file}
        >
          {uploading ? 'Processing...' : 'Submit Analysis'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NewAnalysisDialog;
