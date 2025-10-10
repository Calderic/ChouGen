'use client';

import { Box, Typography, Card, CardContent, IconButton, Stack, Chip } from '@mui/material';
import { Delete as DeleteIcon, CheckCircle as CompleteIcon, LocalAtm as MoneyIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Pack {
  id: string;
  name: string;
  brand?: string;
  remaining_count: number;
  total_count: number;
  price: number;
  purchase_date: string;
  photo_url?: string | null;
}

interface EmptyPacksListProps {
  data: Pack[];
  onDelete?: (packId: string) => void;
}

const PackCard = motion(Card);

export default function EmptyPacksList({ data, onDelete }: EmptyPacksListProps) {
  if (data.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
        }}
      >
        <CompleteIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="body1" color="text.secondary" fontWeight={500} gutterBottom>
          还没有抽完的烟
        </Typography>
        <Typography variant="caption" color="text.secondary">
          继续努力抽烟吧！
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <AnimatePresence>
        {data.map((pack, index) => {
          const pricePerStick = (pack.price / pack.total_count).toFixed(2);
          const purchaseDate = format(new Date(pack.purchase_date), 'yyyy年MM月dd日', { locale: zhCN });

          return (
            <PackCard
              key={pack.id}
              elevation={0}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)',
                borderRadius: 3,
                position: 'relative',
                overflow: 'visible',
                opacity: 0.8,
              }}
            >
              <CardContent sx={{ pb: 2, pt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* 左侧：完成图标 */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: 'success.lighter',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <CompleteIcon sx={{ color: 'success.main', fontSize: 28 }} />
                  </Box>

                  {/* 中间：信息 */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" fontWeight={600} gutterBottom>
                      {pack.brand && `${pack.brand} · `}
                      {pack.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {purchaseDate}
                      </Typography>

                      <Chip
                        label={`${pack.total_count} 支`}
                        size="small"
                        sx={{
                          height: 20,
                          bgcolor: 'rgba(0, 0, 0, 0.04)',
                          fontSize: '0.7rem',
                          fontWeight: 500,
                        }}
                      />

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MoneyIcon sx={{ fontSize: 14, color: 'success.main' }} />
                        <Typography variant="caption" fontWeight={600} color="success.main">
                          ¥{pack.price.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          (¥{pricePerStick}/支)
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* 右侧：删除按钮 */}
                  {onDelete && (
                    <IconButton
                      size="small"
                      onClick={() => onDelete(pack.id)}
                      sx={{
                        color: 'error.main',
                        bgcolor: 'rgba(255, 255, 255, 0.5)',
                        ml: 1,
                        '&:hover': {
                          bgcolor: 'error.lighter',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </CardContent>
            </PackCard>
          );
        })}
      </AnimatePresence>
    </Stack>
  );
}
