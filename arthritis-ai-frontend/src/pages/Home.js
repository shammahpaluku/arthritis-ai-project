import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Button, 
  Paper,
  Avatar,
  styled
} from '@mui/material';
import { 
  MedicalServices,
  Assessment,
  Security,
  Accessibility
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import medicalTeam from '../assets/medical-team.jpg';

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(rgba(25, 118, 210, 0.9), rgba(25, 118, 210, 0.9)), url(${medicalTeam})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: theme.palette.common.white,
  padding: theme.spacing(10, 0),
  textAlign: 'center',
  marginBottom: theme.spacing(6)
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'translateY(-8px)'
  }
}));

const Home = () => {
  const features = [
    {
      icon: <MedicalServices color="primary" sx={{ fontSize: 60 }} />,
      title: 'Advanced AI Analysis',
      description: 'Our deep learning models detect early signs of osteoarthritis with 94% accuracy.'
    },
    {
      icon: <Assessment color="primary" sx={{ fontSize: 60 }} />,
      title: 'Detailed Reports',
      description: 'Comprehensive analysis reports with visual markers and severity scoring.'
    },
    {
      icon: <Security color="primary" sx={{ fontSize: 60 }} />,
      title: 'HIPAA Compliant',
      description: 'All patient data is encrypted and securely stored following medical standards.'
    },
    {
      icon: <Accessibility color="primary" sx={{ fontSize: 60 }} />,
      title: 'Clinician Approved',
      description: 'Developed in collaboration with leading rheumatologists and radiologists.'
    }
  ];

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <HeroSection>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Avatar 
              alt="Medical Team" 
              src={medicalTeam} 
              sx={{ 
                width: 100, 
                height: 100, 
                margin: '0 auto',
                mb: 2,
                border: '2px solid white'
              }} 
            />
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Osteoarthritis Detection AI
            </Typography>
            <Typography variant="h5" component="p" gutterBottom sx={{ mb: 4 }}>
              Early detection and analysis of osteoarthritis through advanced medical imaging AI
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              href="/upload"
              sx={{ 
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              Analyze an X-ray Now
            </Button>
          </motion.div>
        </Container>
      </HeroSection>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" align="center" gutterBottom sx={{ mb: 6, fontWeight: 500 }}>
          Why Choose Our Solution
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FeatureCard elevation={3}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" align="center" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" align="center">
                    {feature.description}
                  </Typography>
                </FeatureCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ backgroundColor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="h3" gutterBottom>
                  About Osteoarthritis
                </Typography>
                <Typography variant="body1" paragraph>
                  Osteoarthritis is the most common form of arthritis, affecting over 32.5 million adults in the US alone. It occurs when the protective cartilage that cushions the ends of bones wears down over time.
                </Typography>
                <Typography variant="body1" paragraph>
                  Early detection is crucial for effective management and treatment. Our AI system helps identify early signs of osteoarthritis that might be missed in conventional analysis.
                </Typography>
                <Button 
                  variant="outlined" 
                  size="large" 
                  href="https://www.cdc.gov/arthritis/basics/osteoarthritis.htm"
                  target="_blank"
                  rel="noopener"
                  sx={{ mt: 2 }}
                >
                  Learn More About OA
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <img 
                    src="/xray-comparison.jpg" 
                    alt="Osteoarthritis progression" 
                    style={{ width: '100%', display: 'block' }}
                  />
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
