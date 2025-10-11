'use client';

import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Stack,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  SmokingRooms as SmokingIcon,
  LocalAtm as MoneyIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface Pack {
  id: string;
  name: string;
  brand: string | null;
  remaining_count: number;
  total_count: number;
  price: number;
  purchase_date: string;
  photo_url: string | null;
}

interface ActivePacksListProps {
  data: Pack[];
  onDelete?: (packId: string) => void;
}

const PackCard = motion(Card);

export default function ActivePacksList({ data, onDelete }: ActivePacksListProps) {
  const router = useRouter();

  const handlePackClick = (packId: string) => {
    router.push(`/inventory/${packId}`);
  };

  if (data.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
        }}
      >
        <SmokingIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="body1" color="text.secondary" fontWeight={500} gutterBottom>
          还没有口粮
        </Typography>
        <Typography variant="caption" color="text.secondary">
          点击右下角按钮添加你的第一包烟
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <AnimatePresence>
        {data.map((pack, index) => {
          const progress = (pack.remaining_count / pack.total_count) * 100;
          const pricePerStick = (pack.price / pack.total_count).toFixed(2);
          const purchaseDate = format(new Date(pack.purchase_date), 'MM月dd日', { locale: zhCN });

          return (
            <PackCard
              key={pack.id}
              elevation={0}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handlePackClick(pack.id)}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
                borderRadius: 3,
                position: 'relative',
                overflow: 'visible',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              <CardContent sx={{ pb: 2.5, pt: 2.5 }}>
                {/* 头部：名称和删除按钮 */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {pack.brand && `${pack.brand} · `}
                      {pack.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                      购于 {purchaseDate}
                    </Typography>
                  </Box>

                  {onDelete && (
                    <IconButton
                      size="small"
                      onClick={e => {
                        e.stopPropagation(); // 阻止冒泡到卡片点击事件
                        onDelete(pack.id);
                      }}
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
                  )}
                </Box>

                {/* 统计信息 */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 2 }}>
                  {/* 剩余支数 */}
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ fontWeight: 500, mb: 0.5 }}
                    >
                      剩余
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="primary.main">
                      {pack.remaining_count}
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 0.5 }}
                      >
                        / {pack.total_count}
                      </Typography>
                    </Typography>
                  </Box>

                  {/* 单价 */}
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ fontWeight: 500, mb: 0.5 }}
                    >
                      单价
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                      <MoneyIcon sx={{ fontSize: 14, color: 'success.main' }} />
                      <Typography variant="body1" fontWeight={600} color="success.main">
                        {pricePerStick}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 总价 */}
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ fontWeight: 500, mb: 0.5 }}
                    >
                      总价
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      ¥{pack.price.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                {/* 进度条 */}
                <Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        bgcolor:
                          progress > 30
                            ? 'primary.main'
                            : progress > 10
                              ? 'warning.main'
                              : 'error.main',
                      },
                    }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {progress.toFixed(0)}% 剩余
                    </Typography>
                    {progress <= 30 && (
                      <Chip
                        label={progress <= 10 ? '即将用完' : '库存不足'}
                        size="small"
                        sx={{
                          height: 20,
                          bgcolor: progress <= 10 ? 'error.lighter' : 'warning.lighter',
                          color: progress <= 10 ? 'error.main' : 'warning.main',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </CardContent>
            </PackCard>
          );
        })}
      </AnimatePresence>
    </Stack>
  );
}
