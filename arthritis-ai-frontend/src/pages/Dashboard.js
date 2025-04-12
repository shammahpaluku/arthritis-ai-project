import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogContent,
  TextField,
  MenuItem,
  Chip,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  LinearProgress
} from '@mui/material';
import {
  FilterList,
  Search,
  Visibility
} from '@mui/icons-material';
import PatientReport from '../components/PatientReport';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const severityColors = {
  high: 'error',
  moderate: 'warning',
  low: 'success'
};

function Dashboard() {
  const { user } = useAuth();
  const [xrays, setXrays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedXray, setSelectedXray] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Verify authentication first
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token missing');
        }

        // Determine the correct endpoint based on role
        const endpoint = user?.role === 'doctor'
          ? `${process.env.REACT_APP_API_URL}/results/doctor`
          : `${process.env.REACT_APP_API_URL}/results`;

        // Make the API call with proper headers
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Transform data to match frontend expectations
        const formattedData = response.data.map(item => ({
          id: item.id,
          name: item.patient_name || 'Unknown Patient',
          patientId: item.patient_id,
          date: new Date(item.created_at).toLocaleDateString(),
          result: item.diagnosis,
          severity: item.severity || 'moderate', // default if missing
          confidence: item.confidence || 0,
          age: item.patient_age || '',
          gender: item.patient_gender || ''
        }));

        setXrays(formattedData);
      } catch (error) {
        console.error('Error fetching results:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          setError(error.response?.data?.error || 'Failed to load patient records');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
            <Button variant="contained" color="primary">
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
