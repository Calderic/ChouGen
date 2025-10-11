'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  IconButton,
  MenuItem,
  Typography,
  Stack,
} from '@mui/material';
import { PhotoCamera as CameraIcon, Close as CloseIcon } from '@mui/icons-material';
import { useState, useRef } from 'react';

type UserStatus = 'quitting' | 'controlling' | 'observing';

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  status: UserStatus;
}

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<void>;
  loading?: boolean;
}

const statusOptions = [
  { value: 'quitting', label: '戒烟中', description: '正在努力戒烟' },
  { value: 'controlling', label: '控烟中', description: '在控制抽烟量' },
  { value: 'observing', label: '观望中', description: '只是记录数据' },
];

export default function EditProfileDialog({
  open,
  onClose,
  user,
  onUpdate,
  loading,
}: EditProfileDialogProps) {
  const [formData, setFormData] = useState({
    username: user.username,
    bio: user.bio || '',
    status: user.status,
    avatar_url: user.avatar_url || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(user.avatar_url || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    await onUpdate({
      username: formData.username,
      bio: formData.bio || null,
      status: formData.status,
      avatar_url: avatarPreview || null,
    });
    onClose();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 这里应该上传到 Supabase Storage，暂时用本地预览
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getAvatarText = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          fontWeight: 700,
        }}
      >
        编辑资料
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* 头像上传 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={avatarPreview || undefined}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  fontWeight: 700,
                  border: '4px solid',
                  borderColor: 'background.paper',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                {!avatarPreview && getAvatarText(formData.username)}
              </Avatar>

              <IconButton
                onClick={handleAvatarClick}
                sx={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
                size="small"
              >
                <CameraIcon fontSize="small" />
              </IconButton>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              点击相机图标上传头像
            </Typography>
          </Box>

          {/* 用户名 */}
          <TextField
            label="用户名"
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
            fullWidth
            required
            inputProps={{ maxLength: 30 }}
            helperText={`${formData.username.length}/30`}
          />

          {/* 个性签名 */}
          <TextField
            label="个性签名"
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
            fullWidth
            multiline
            rows={3}
            inputProps={{ maxLength: 200 }}
            helperText={`${formData.bio.length}/200`}
            placeholder="写点什么介绍一下自己..."
          />

          {/* 状态选择 */}
          <TextField
            label="当前状态"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value as UserStatus })}
            select
            fullWidth
          >
            {statusOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {option.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.username.trim()}
          sx={{ borderRadius: 2 }}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
