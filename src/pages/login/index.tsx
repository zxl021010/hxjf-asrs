import { UserModule } from '@/store/modules/user';
import { history } from '@umijs/max';
import { App, Button, Form, Input } from 'antd';
import React, { useState } from 'react';

interface LoginFormValues {
  readonly username: string;
  readonly password: string;
  readonly role: string;
}

const LoginPage: React.FC = () => {
  const [form] = Form.useForm<LoginFormValues>();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const res = await UserModule.Login({
        username: values.username,
        password: values.password,
      });
      if (res?.code === 200) {
        message.success('登录成功');
        history.replace('/');
      } else {
        message.error(res?.msg || '登录失败');
      }
    } catch (err: unknown) {
      message.error((err as Error)?.message || '网络异常，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex h-screen w-screen items-center justify-center overflow-hidden"
      style={{
        background: `
          linear-gradient(115deg, transparent 40%, rgba(120, 180, 255, 0.045) 50%, transparent 60%),
          linear-gradient(-125deg, transparent 35%, rgba(180, 220, 255, 0.035) 50%, transparent 65%),
          linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
          radial-gradient(ellipse at 20% 20%, #1a1f3a 0%, transparent 60%),
          radial-gradient(ellipse at 80% 80%, #0f172a 0%, #020617 100%)
        `,
        backgroundSize: '200% 200%, 220% 220%, 40px 40px, 40px 40px, 100% 100%, 100% 100%',
        animation: 'flow1 22s linear infinite, flow2 26s linear infinite',
      }}
    >
      <div className="relative z-10 w-[440px] rounded-[16px] bg-white/95 p-[40px_36px_36px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] backdrop-blur-[20px]">
        <div
          className="w-[72px] h-[72px] rounded-[20px] text-[36px] flex items-center justify-center m-[0_auto_24px]"
          style={{
            background: 'linear-gradient(135deg, #1677FF, #4096FF)',
            boxShadow: '0 6px 20px rgba(22, 119, 255, 0.35)',
          }}
        >
          📦
        </div>
        <div className="text-center text-[24px] font-semibold text-[#0f172a] mb-[6px]">
          {process.env.SITE_NAME || '海峡金成品立体库'}
        </div>
        <div className="text-center text-[13px] text-[#64748B] mb-[32px]">智能仓储管理系统</div>
        <Form<LoginFormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{ role: 'OPERATOR' }}
          onFinish={handleSubmit}
        >
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input
              placeholder="请输入用户名"
              className="h-[58px] rounded-[12px] p-[16px_18px]"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password
              placeholder="请输入密码"
              className="h-[58px] rounded-[12px] p-[16px_18px]"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item className="mb-0 mt-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="!h-[62px] !rounded-[14px] !text-[18px] !font-semibold"
              style={{
                background: 'linear-gradient(135deg, #1677FF, #4096FF)',
                boxShadow: '0 6px 20px rgba(22, 119, 255, 0.35)',
              }}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
