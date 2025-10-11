'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

/**
 * 邮箱密码注册
 * 注意：不强制验证邮箱，但会发送验证邮件，用户可以稍后验证
 */
export async function signUp(formData: { email: string; password: string; username: string }) {
  const supabase = await createClient();

  // 1. 使用普通 signUp（会发送验证邮件，但不阻止登录）
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        username: formData.username,
      },
      // 不设置 emailRedirectTo，使用默认行为
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: '注册失败' };
  }

  // 2. 使用 service role 创建 profiles 表记录
  // 因为此时用户 session 已存在，但 RLS 可能还未生效
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: dbError } = await serviceSupabase.from('profiles').insert({
    id: authData.user.id,
    username: formData.username,
  });

  if (dbError) {
    // 如果 profile 创建失败，删除刚创建的用户
    await serviceSupabase.auth.admin.deleteUser(authData.user.id);
    return { error: '创建用户记录失败: ' + dbError.message };
  }

  // 3. 用户已经自动登录（signUp 会创建 session）
  // email_confirmed_at 为 null（未验证状态）
  // 但用户可以正常使用，只是邮箱未验证

  return {
    success: true,
    user: authData.user,
    emailVerified: !!authData.user.email_confirmed_at,
  };
}

/**
 * 邮箱密码登录
 */
export async function signIn(formData: { email: string; password: string; redirect?: string }) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: error.message };
  }

  // 登录成功后跳转到原始路径或首页
  redirect(formData.redirect || '/');
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
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return profile;
}
