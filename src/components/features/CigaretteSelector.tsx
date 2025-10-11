'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  LinearProgress,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import { SmokingRooms as SmokingIcon, LocalAtm as MoneyIcon } from '@mui/icons-material';

interface CigarettePack {
  id: string;
  name: string;
  brand?: string;
  remaining_count: number;
  total_count: number;
  price: number;
}

interface CigaretteSelectorProps {
  packs: CigarettePack[];
  selectedPackId?: string;
  onPackChange: (packId: string) => void;
}

export default function CigaretteSelector({
  packs,
  selectedPackId,
  onPackChange,
}: CigaretteSelectorProps) {
  const selectedPack = packs.find(p => p.id === selectedPackId) || packs[0];
  const pricePerStick = selectedPack
    ? (selectedPack.price / selectedPack.total_count).toFixed(2)
    : '0.00';
  const progress = selectedPack
    ? (selectedPack.remaining_count / selectedPack.total_count) * 100
    : 0;

  const handleChange = (event: SelectChangeEvent) => {
    onPackChange(event.target.value);
  };

  if (packs.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="body2" color="text.primary" fontWeight={500} gutterBottom>
            还没有口粮？
          </Typography>
          <Typography variant="caption" color="text.secondary">
            点击下方&ldquo;管理口粮&rdquo;添加你的第一包烟
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
        borderRadius: 3,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ pb: 2.5, pt: 2.5 }}>
        {/* 当前选择 */}
        <Box sx={{ mb: 2.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            gutterBottom
            display="block"
            sx={{ fontWeight: 500, mb: 1 }}
          >
            当前口粮
          </Typography>
          <Select
            value={selectedPackId || packs[0]?.id || ''}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.06)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
              '& .MuiSelect-select': {
                py: 1.5,
                fontWeight: 500,
              },
            }}
          >
            {packs.map(pack => (
              <MenuItem key={pack.id} value={pack.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SmokingIcon fontSize="small" color="primary" />
                  <span>
                    {pack.brand && `${pack.brand} · `}
                    {pack.name}
                  </span>
                  {pack.remaining_count === 0 && (
                    <Chip label="已抽完" size="small" color="error" sx={{ ml: 'auto' }} />
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* 剩余信息 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, mb: 2.5 }}>
          {/* 剩余支数 */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              gutterBottom
              sx={{ fontWeight: 500, mb: 0.5 }}
            >
              剩余支数
            </Typography>
            <Typography variant="h6" fontWeight="600">
              {selectedPack?.remaining_count || 0}
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                / {selectedPack?.total_count || 20} 支
              </Typography>
            </Typography>
          </Box>

          {/* 单价 */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              gutterBottom
              sx={{ fontWeight: 500, mb: 0.5 }}
            >
              单价
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <MoneyIcon sx={{ fontSize: 16, color: 'success.main' }} />
              <Typography variant="h6" fontWeight="600" color="success.main">
                {pricePerStick}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                / 支
              </Typography>
            </Box>
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
                  progress > 30 ? 'primary.main' : progress > 10 ? 'warning.main' : 'error.main',
              },
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: 'block', fontWeight: 500 }}
          >
            {progress.toFixed(0)}% 剩余
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
