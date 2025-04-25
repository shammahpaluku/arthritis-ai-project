import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Button, 
  Dialog, 
  DialogContent, 
  TextField, 
  MenuItem, 
  Box, 
  LinearProgress, 
  Alert, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TablePagination, 
  TableRow, 
  Avatar, 
  Chip 
} from '@mui/material';
import { 
  CloudUpload, 
  CheckCircle, 
  FilterList, 
  Search, 
  Visibility 
} from '@mui/icons-material';
import PatientReport from '../components/PatientReport';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

const severityColors = {
  high: 'error',
  moderate: 'warning',
  low: 'success'
};

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [xrays, setXrays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newAnalysisOpen, setNewAnalysisOpen] = useState(false);
  const [selectedXray, setSelectedXray] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: '',
    xrayImage: null
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/results');

        if (!Array.isArray(response.data)) {
          throw new Error('Invalid response format');
        }

        const formattedData = response.data.map(item => ({
          id: item.id,
          name: item.patient_name || 'Unknown Patient',
          patientId: item.patient_id,
          date: new Date(item.created_at).toLocaleDateString(),
          result: item.diagnosis || 'No diagnosis',
          severity: item.severity || 'moderate',
          confidence: item.confidence ? Math.round(item.confidence * 100) : 0,
          age: item.patient_age || 'N/A',
          gender: item.patient_gender || 'Unknown'
        }));

        setXrays(formattedData);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error.response?.data?.error || error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpen = (xray) => {
    setSelectedXray(xray);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedXray(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredXrays = xrays.filter((xray) => {
    const matchesSearch =
      xray.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      xray.patientId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || xray.severity === filter;
    return matchesSearch && matchesFilter;
  });

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, xrayImage: e.target.files[0] });
  };

  const handleNewAnalysisSubmit = async () => {
    try {
      if (!formData.xrayImage) {
        setError('Please upload an X-ray image');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('patientName', formData.patientName);
      formDataToSend.append('patientAge', formData.patientAge);
      formDataToSend.append('patientGender', formData.patientGender);
      formDataToSend.append('image', formData.xrayImage);

      setLoading(true); // Show loading state
      setError('');

      const response = await api.post('/api/analysis', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Reset form and close dialog
      setFormData({
        patientName: '',
        patientAge: '',
        patientGender: '',
        xrayImage: null
      });
      setNewAnalysisOpen(false);

      // Redirect to new analysis results
      navigate(`/results/${response.data.analysisId}`);
    } catch (error) {
      console.error('Error submitting new analysis:', error);
      setError(error.response?.data?.error || 'Analysis submission failed');

      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error" sx={{ m: 2 }}>{error}</Typography>;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" color="primary" gutterBottom>
        Patient Records
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search patients..."
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
              }}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              variant="outlined"
              label="Filter by severity"
              InputProps={{
                startAdornment: <FilterList sx={{ mr: 1, color: 'action.active' }} />
              }}
              value={filter}
              onChange={handleFilterChange}
            >
              <MenuItem value="all">All Results</MenuItem>
              <MenuItem value="high">Severe</MenuItem>
              <MenuItem value="moderate">Moderate</MenuItem>
              <MenuItem value="low">Mild/None</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setNewAnalysisOpen(true)}
              sx={{ mb: 2 }}
            >
              New Analysis
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Result</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredXrays
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((xray) => (
                <TableRow key={xray.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        {xray.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography>{xray.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {xray.age}y, {xray.gender}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{xray.patientId}</TableCell>
                  <TableCell>{xray.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={xray.result}
                      color={severityColors[xray.severity] || 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={xray.confidence}
                          color={
                            xray.confidence > 85 ? 'success' :
                            xray.confidence > 70 ? 'warning' : 'error'
                          }
                        />
                      </Box>
                      <Typography>{xray.confidence}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleOpen(xray)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredXrays.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog
        open={newAnalysisOpen}
        onClose={() => setNewAnalysisOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>New Analysis</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          <TextField
            label="Patient Name"
            fullWidth
            name="patientName"
            value={formData.patientName}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="Patient Age"
            fullWidth
            name="patientAge"
            value={formData.patientAge}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="Patient Gender"
            select
            fullWidth
            name="patientGender"
            value={formData.patientGender}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
            required
          >
            <MenuItem value="">Select Gender</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>

          <Button 
            variant="contained" 
            component="label"
            sx={{ mb: 2 }}
            startIcon={<CloudUpload />}
          >
            Upload X-ray Image
            <input 
              type="file" 
              hidden 
              accept="image/*,.dcm" 
              onChange={handleFileChange}
            />
          </Button>
          
          {/* File upload indicator */}
          {formData.xrayImage && (
            <Box sx={{
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              p: 1,
              border: '1px dashed',
              borderColor: 'primary.main',
              borderRadius: 1
            }}>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {formData.xrayImage.name} ({Math.round(formData.xrayImage.size/1024)} KB)
              </Typography>
            </Box>
          )}
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleNewAnalysisSubmit}
            disabled={loading || !formData.xrayImage}
            fullWidth
          >
            {loading ? 'Submitting...' : 'Submit Analysis'}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
                  <DialogContent dividers>
            {selectedXray && <PatientReport data={selectedXray} />}
          </DialogContent>
        </Dialog>
      </Container>
    );
  }

export default Dashboard;
