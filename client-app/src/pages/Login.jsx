import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { useAuthStore } from '../stores/authStore';
import { login as loginApi } from '../api/auth';
import { getDefaultRedirect } from '../lib/redirectByRole';

export default function Login() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname ?? null;
  const redirectTo = from || getDefaultRedirect(user?.role);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { accessToken, user: userData } = await loginApi({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      setAuth(userData, accessToken);
      message.success('Logged in successfully');
      const target = from || getDefaultRedirect(userData.role);
      navigate(target, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Login failed';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30 box-border">
      <Card title="Login" className="w-full max-w-md max-w-[calc(100vw-2rem)] shadow-sm">
        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
          initialValues={{
            email: "admin@library.local",
            password: "Password123!"
          }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Invalid email address' },
            ]}
          >
            <Input type="email" placeholder="you@example.com" size="large" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password placeholder="••••••••" size="large" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Sign in
            </Button>
          </Form.Item>
        </Form>

        <p className="mt-4 text-center text-muted-foreground text-sm">
          Don&apos;t have an account? <Link to="/register" className="text-primary">Register</Link>
        </p>
      </Card>
    </div>
  );
}
