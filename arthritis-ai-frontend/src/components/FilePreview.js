import React from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  LinearProgress,
  Chip
} from '@mui/material';
import { Delete, CheckCircle, Error } from '@mui/icons-material';

const FilePreview = ({ 
  file, 
  onRemove, 
  uploadProgress = null,
  uploadError = null 
}) => {
  const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  const fileType = file.type.split('/')[1]?.toUpperCase() || 'FILE';

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: uploadError ? 'error.main' : 'divider',
        borderRadius: 1,
        p: 2,
        mt: 2,
        backgroundColor: 'background.paper',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {/* File Icon and Info */}
        <Box sx={{ 
          bgcolor: 'primary.light', 
          color: 'primary.contrastText',
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
          mr: 2
        }}>
          <Typography variant="subtitle2">{fileType}</Typography>
        </Box>

        {/* File Details */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" noWrap>
            {file.name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {fileSizeInMB} MB
          </Typography>
        </Box>

        {/* Status Indicators */}
        {uploadProgress === null && !uploadError && (
          <IconButton 
            onClick={onRemove}
            color="error"
            size="small"
            sx={{ ml: 1 }}
          >
            <Delete fontSize="small" />
          </IconButton>
        )}

        {uploadProgress !== null && uploadProgress < 100 && (
          <Chip 
            label={`Uploading ${uploadProgress}%`}
            size="small"
            color="info"
            sx={{ ml: 1 }}
          />
        )}

        {uploadProgress === 100 && (
          <CheckCircle color="success" sx={{ ml: 1 }} />
        )}

        {uploadError && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <Error color="error" fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="caption" color="error">
              Failed
            </Typography>
          </Box>
        )}
      </Box>

      {/* Progress Bar */}
      {uploadProgress !== null && uploadProgress < 100 && (
        <LinearProgress
          variant={uploadProgress === 0 ? 'indeterminate' : 'determinate'}
          value={uploadProgress}
          sx={{ mt: 1 }}
          color={uploadError ? 'error' : 'primary'}
        />
      )}
    </Box>
  );
};

export default FilePreview;