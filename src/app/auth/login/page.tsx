'use client';

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Divider,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { signIn } from '@/lib/auth/actions';
import { useSearchParams } from 'next/navigation';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const redirect = searchParams.get('redirect') || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const result = await signIn({
      ...formData,
      redirect,
    });

    if (result?.error) {
      setErrorMessage(result.error);
      setLoading(false);
    }
    // 成功会自动重定向，不需要处理
  };

  const handleLinuxdoLogin = () => {
    // 将重定向路径传递给 Linux.do OAuth
    const url = new URL('/api/auth/linuxdo', window.location.origin);
    if (redirect && redirect !== '/') {
      url.searchParams.set('redirect', redirect);
    }
    window.location.href = url.toString();
  };

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
          登录到抽根
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error === 'no_code' && '授权失败：未获取到授权码'}
            {error === 'oauth_failed' && 'Linux.do 登录失败，请重试'}
            {error === 'invalid_credentials' && '邮箱或密码错误'}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {/* 邮箱密码登录表单 */}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 2 }}>
          <TextField
            fullWidth
            label="邮箱"
            type="email"
            required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="密码"
            type="password"
            required
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
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
            {loading ? '登录中...' : '登录'}
          </Button>
        </Box>

        <Divider sx={{ width: '100%', my: 3 }}>或</Divider>

        {/* Linux.do 一键登录 */}
        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={handleLinuxdoLogin}
          sx={{ mb: 2 }}
        >
          使用 Linux.do 登录
        </Button>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          还没有账号？{' '}
          <MuiLink component={Link} href="/auth/register" underline="hover">
            立即注册
          </MuiLink>
        </Typography>
      </Box>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
