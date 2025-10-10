import { Box, Container, Typography, Button } from '@mui/material';

export default function Home() {
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
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
          项目初始化完成！使用 Material UI + Next.js + Supabase 技术栈
        </Typography>
        <Button variant="contained" color="primary" size="large">
          开始使用
        </Button>
      </Box>
    </Container>
  );
}
