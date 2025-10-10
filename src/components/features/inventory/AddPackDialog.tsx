'use client';

import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Autocomplete,
  Alert,
  Chip,
  InputAdornment,
} from '@mui/material';
import { Close as CloseIcon, Recommend as RecommendIcon, SmokingRooms as SmokingIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';

interface Pack {
  id: string;
  name: string;
  brand?: string;
  total_count: number;
  price: number;
}

interface AddPackDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PackFormData) => void;
  recentPacks: Pack[]; // 最近抽完的烟，用于推荐
}

interface PackFormData {
  name: string;
  brand: string;
  total_count: number;
  price: number;
  purchase_date: string;
}

export default function AddPackDialog({ open, onClose, onSubmit, recentPacks }: AddPackDialogProps) {
  const [formData, setFormData] = useState<PackFormData>({
    name: '',
    brand: '',
    total_count: 20,
    price: 0,
    purchase_date: new Date().toISOString().split('T')[0],
  });

  const [nameInput, setNameInput] = useState('');
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendedPack, setRecommendedPack] = useState<Pack | null>(null);
  const [matchedPacks, setMatchedPacks] = useState<Pack[]>([]);

  // 获取最近抽完的烟作为推荐
  useEffect(() => {
    if (open && recentPacks.length > 0) {
      const latestPack = recentPacks[0]; // 最近抽完的第一包烟
      setRecommendedPack(latestPack);
      setShowRecommendation(true);
    }
  }, [open, recentPacks]);

  // 模糊匹配逻辑
  useEffect(() => {
    if (nameInput.trim().length > 0) {
      const matches = recentPacks.filter((pack) => {
        const fullName = `${pack.brand || ''} ${pack.name}`.toLowerCase();
        const input = nameInput.toLowerCase();
        return fullName.includes(input) || pack.name.toLowerCase().includes(input);
      });
      setMatchedPacks(matches);
    } else {
      setMatchedPacks([]);
    }
  }, [nameInput, recentPacks]);

  const handleClose = () => {
    // 重置表单
    setFormData({
      name: '',
      brand: '',
      total_count: 20,
      price: 0,
      purchase_date: new Date().toISOString().split('T')[0],
    });
    setNameInput('');
    setShowRecommendation(false);
    setMatchedPacks([]);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    handleClose();
  };

  const handleUseRecommendation = () => {
    if (recommendedPack) {
      setFormData({
        ...formData,
        name: recommendedPack.name,
        brand: recommendedPack.brand || '',
        total_count: recommendedPack.total_count,
        price: recommendedPack.price,
      });
      setNameInput(recommendedPack.name);
      setShowRecommendation(false);
    }
  };

  const handleSelectMatch = (pack: Pack) => {
    setFormData({
      ...formData,
      name: pack.name,
      brand: pack.brand || '',
      total_count: pack.total_count,
      price: pack.price,
    });
    setNameInput(pack.name);
    setMatchedPacks([]);
  };

  const handleNameChange = (_: any, value: string) => {
    setNameInput(value);
    setFormData({ ...formData, name: value });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* 标题栏 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmokingIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={700}>
              添加口粮
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {/* 智能推荐 */}
          {showRecommendation && recommendedPack && (
            <Alert
              severity="info"
              icon={<RecommendIcon />}
              action={
                <Button size="small" onClick={handleUseRecommendation}>
                  使用
                </Button>
              }
              sx={{ mb: 3 }}
            >
              <Typography variant="body2" fontWeight={600}>
                根据你的抽烟记录，推荐：
              </Typography>
              <Typography variant="body2">
                {recommendedPack.brand && `${recommendedPack.brand} · `}
                {recommendedPack.name} - ¥{recommendedPack.price.toFixed(2)} / {recommendedPack.total_count}支
              </Typography>
            </Alert>
          )}

          {/* 表单字段 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* 香烟名称（带自动完成） */}
            <Autocomplete
              freeSolo
              options={matchedPacks}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return `${option.brand ? option.brand + ' · ' : ''}${option.name}`;
              }}
              inputValue={nameInput}
              onInputChange={handleNameChange}
              onChange={(_, value) => {
                if (value && typeof value !== 'string') {
                  handleSelectMatch(value);
                }
              }}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box component="li" key={key} {...otherProps}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {option.brand && `${option.brand} · `}
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ¥{option.price.toFixed(2)} / {option.total_count}支
                      </Typography>
                    </Box>
                    <Chip label="历史记录" size="small" sx={{ ml: 1 }} />
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="香烟名称"
                  required
                  placeholder="输入香烟名称，支持智能匹配"
                  helperText="支持从历史记录中匹配"
                />
              )}
            />

            {/* 品牌 */}
            <TextField
              label="品牌"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="例如：中华、玉溪"
            />

            {/* 支数和价格 */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="支数"
                type="number"
                required
                value={formData.total_count}
                onChange={(e) => setFormData({ ...formData, total_count: parseInt(e.target.value) || 20 })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">支</InputAdornment>,
                }}
                inputProps={{ min: 1, max: 100 }}
              />

              <TextField
                label="价格"
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Box>

            {/* 购买日期 */}
            <TextField
              label="购买日期"
              type="date"
              required
              value={formData.purchase_date}
              onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            {/* 单价预览 */}
            {formData.total_count > 0 && formData.price > 0 && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'primary.lighter',
                  border: '1px solid',
                  borderColor: 'primary.main',
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  单价预览
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  ¥{(formData.price / formData.total_count).toFixed(2)} / 支
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2 }}>
            取消
          </Button>
          <Button type="submit" variant="contained" sx={{ borderRadius: 2, minWidth: 100 }}>
            添加
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
