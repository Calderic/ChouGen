'use client';

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import { signUp } from '@/lib/auth/actions';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    // 验证密码
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('两次输入的密码不一致');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('密码至少需要 6 位');
      setLoading(false);
      return;
    }

    const result = await signUp({
      email: formData.email,
      password: formData.password,
      username: formData.username,
    });

    if (result?.error) {
      setErrorMessage(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      // 2 秒后跳转到登录页
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            注册成功！请查收邮件验证你的账号。正在跳转到登录页...
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          注册抽根账号
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: '100%', mt: 2 }}
        >
          <TextField
            fullWidth
            label="用户名"
            required
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            helperText="用于显示和识别你的身份"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="邮箱"
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="密码"
            type="password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            helperText="至少 6 位字符"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="确认密码"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? '注册中...' : '注册'}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          已有账号？{' '}
          <MuiLink component={Link} href="/auth/login" underline="hover">
            立即登录
          </MuiLink>
        </Typography>

        <Alert severity="warning" sx={{ width: '100%', mt: 3 }}>
          <Typography variant="body2">
            <strong>健康提示：</strong>吸烟有害健康，本应用旨在帮助你了解吸烟习惯，鼓励戒烟。
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
}
