'use client';

import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  SmokingRooms as SmokingIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTransition } from '@/components/layout/PageTransitionContext';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface SmokingRecord {
  id: string;
  smoked_at: string;
  cost: number;
  is_violation: boolean;
  violation_type: string | null;
  pack: {
    name: string;
    brand: string | null;
  };
}

interface RecentRecordsProps {
  records: SmokingRecord[];
  onDelete?: (id: string) => void;
}

export default function RecentRecords({ records, onDelete }: RecentRecordsProps) {
  const { suppressInitialMotion } = usePageTransition();
  if (records.length === 0) {
    return (
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          gutterBottom
          display="block"
          sx={{ mb: 1.5, fontWeight: 500 }}
        >
          最近记录
        </Typography>
        <Paper
          elevation={0}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)',
            borderRadius: 3,
            py: 5,
            textAlign: 'center',
          }}
        >
          <SmokingIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body2" color="text.primary" fontWeight={500} gutterBottom>
            还没有抽烟记录
          </Typography>
          <Typography variant="caption" color="text.secondary">
            长按下方按钮记录第一支烟
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          最近记录
        </Typography>
        <Chip
          label={`共 ${records.length} 条`}
          size="small"
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            fontWeight: 500,
          }}
        />
      </Box>

      <List sx={{ p: 0 }}>
        <AnimatePresence>
          {records.map((record, index) => {
            const timeAgo = formatDistanceToNow(new Date(record.smoked_at), {
              addSuffix: true,
              locale: zhCN,
            });

            return (
              <Paper
                key={record.id}
                component={motion.div}
                elevation={0}
                initial={suppressInitialMotion ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: suppressInitialMotion ? 0 : index * 0.05 }}
                sx={{
                  bgcolor: record.is_violation
                    ? 'rgba(255, 245, 245, 0.8)'
                    : 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: record.is_violation ? '2px solid' : '1px solid rgba(255, 255, 255, 0.3)',
                  borderColor: record.is_violation ? 'error.light' : undefined,
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                  mb: 1.5,
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  '&:last-child': { mb: 0 },
                }}
              >
                <ListItem
                  secondaryAction={
                    onDelete && (
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => onDelete(record.id)}
                        sx={{
                          color: 'error.main',
                          bgcolor: 'rgba(255, 255, 255, 0.5)',
                          '&:hover': {
                            bgcolor: 'error.lighter',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                  sx={{
                    py: 2,
                    px: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                      mr: 2,
                    }}
                  >
                    <SmokingIcon />
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="600">
                          {record.pack.brand && `${record.pack.brand} · `}
                          {record.pack.name}
                        </Typography>
                        {record.is_violation && (
                          <Chip
                            label="违规"
                            size="small"
                            color="error"
                            icon={<WarningIcon />}
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              '& .MuiChip-icon': {
                                fontSize: '0.85rem',
                              },
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        component="span"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}
                      >
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 500 }}
                        >
                          {timeAgo}
                        </Typography>
                        <Typography component="span" variant="caption" color="text.secondary">
                          •
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          fontWeight="600"
                          color="success.main"
                        >
                          ¥{record.cost.toFixed(2)}
                        </Typography>
                      </Typography>
                    }
                  />
                </ListItem>
              </Paper>
            );
          })}
        </AnimatePresence>
      </List>
    </Box>
  );
}
