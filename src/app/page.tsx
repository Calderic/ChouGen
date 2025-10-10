import { Box, Container, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { getUser } from '@/lib/auth/actions';

export default async function Home() {
  const user = await getUser();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 4,
        }}
      >
        <Typography variant="h1" color="primary">
          抽根
        </Typography>
        <Typography variant="h5" color="text.secondary">
          香烟记录应用
        </Typography>

        {user ? (
          <>
            <Typography variant="body1" color="text.secondary">
              欢迎回来，<strong>{user.username}</strong>！
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              href="/dashboard"
            >
              进入应用
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
              记录你的抽烟习惯，了解消费数据，与社区互动。
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                href="/auth/login"
              >
                登录
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                component={Link}
                href="/auth/register"
              >
                注册
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}
