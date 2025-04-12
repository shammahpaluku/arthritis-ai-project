import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';

const PatientProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();

  // Mock patient data - replace with API call
  const patient = {
    id: id,
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    lastVisit: '2023-05-15',
    diagnosis: 'Rheumatoid Arthritis',
    status: 'Active Treatment'
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Patient Profile
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          ID: {patient.id}
        </Typography>
        
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">Name</TableCell>
                <TableCell>{patient.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Age</TableCell>
                <TableCell>{patient.age}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Gender</TableCell>
                <TableCell>{patient.gender}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Last Visit</TableCell>
                <TableCell>{patient.lastVisit}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Diagnosis</TableCell>
                <TableCell>{patient.diagnosis}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Status</TableCell>
                <TableCell>{patient.status}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default PatientProfile;