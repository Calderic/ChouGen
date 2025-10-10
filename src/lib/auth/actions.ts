'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

/**
 * 邮箱密码注册
 */
export async function signUp(formData: {
  email: string;
  password: string;
  username: string;
}) {
  const supabase = await createClient();

  // 1. 创建 Supabase Auth 用户
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: '注册失败' };
  }

  // 2. 使用 service role 创建 profiles 表记录
  // 原因：注册时用户 session 还未完全建立，普通客户端会被 RLS 拦截
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: dbError } = await serviceSupabase.from('profiles').insert({
    id: authData.user.id,
    username: formData.username,
  });

  if (dbError) {
    return { error: '创建用户记录失败: ' + dbError.message };
  }

  return { success: true };
}

/**
 * 邮箱密码登录
 */
export async function signIn(formData: { email: string; password: string }) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/');
}

/**
 * 登出
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}

/**
 * 获取当前用户
 */
export async function getUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 获取完整的用户信息
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}
