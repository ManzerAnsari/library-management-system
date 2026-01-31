import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Form, Input, Button, Row, Col, message } from 'antd';
import { useAuthStore } from '../stores/authStore';
import { registerRequest, registerResendOtp, registerVerify } from '../api/auth';
import { getDefaultRedirect } from '../lib/redirectByRole';

// Registration is for users (students) only; admin and librarian are created separately
export default function Register() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [form1] = Form.useForm();
  const [form2] = Form.useForm();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const onRequestOtp = async (values) => {
    setLoading(true);
    try {
      await registerRequest({
        fullname: values.fullname.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        mobileNumber: values.mobileNumber?.trim() || undefined,
        collegeUserId: values.collegeUserId?.trim() || undefined,
      });
      setPendingEmail(values.email.trim().toLowerCase());
      form2.setFieldValue('email', values.email.trim().toLowerCase());
      setStep(2);
      message.success('Verification code sent to your email');
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Registration request failed';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (values) => {
    setLoading(true);
    try {
      const { accessToken, user: userData } = await registerVerify({
        email: values.email,
        code: values.code.trim(),
      });
      setAuth(userData, accessToken);
      message.success('Account created successfully');
      navigate(getDefaultRedirect(userData.role), { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Verification failed';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const backToStep1 = () => {
    setStep(1);
    form2.resetFields();
  };

  const onResendOtp = async () => {
    if (!pendingEmail || resendLoading || resendCooldown > 0) return;
    setResendLoading(true);
    try {
      await registerResendOtp({ email: pendingEmail });
      message.success('Verification code sent again');
      setResendCooldown(60);
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Failed to resend code';
      message.error(msg);
    } finally {
      setResendLoading(false);
    }
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <style>{`
        div.register-page-wrapper { padding: 2rem !important; }
        @media (min-width: 768px) { div.register-page-wrapper { padding: 3rem !important; } }
        div.register-page-card { padding: 2rem !important; }
        @media (min-width: 768px) { div.register-page-card { padding: 2.5rem !important; } }
        .register-page-form .ant-form-item { margin-bottom: 20px !important; }
        .register-page-form .ant-form-item:last-of-type { margin-bottom: 0 !important; }
      `}</style>
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-muted/40">
      {/* Left: branding */}
      <div className="hidden md:flex flex-col justify-center items-center p-12! lg:p-20! bg-primary text-primary-foreground rounded-r-3xl shadow-xl">
        <div className="w-full max-w-xs space-y-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-foreground/15 mb-6">
            <Icon icon="mdi:book-open-outline" className="w-8 h-8" aria-hidden />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-3">
            Library Management System
          </h1>
          <p className="text-primary-foreground/90 text-sm leading-relaxed">
            Create your student account to borrow books, track your borrowings, and access the catalog.
          </p>
          {step === 1 && (
            <p className="mt-6 text-primary-foreground/80 text-xs font-medium uppercase tracking-wider">
              Step 1 of 2 — Your details
            </p>
          )}
          {step === 2 && (
            <p className="mt-6 text-primary-foreground/80 text-xs font-medium uppercase tracking-wider">
              Step 2 of 2 — Verify email
            </p>
          )}
        </div>
      </div>

      {/* Right: form */}
      <div className="register-page-wrapper flex flex-col justify-center items-center p-8! md:p-12!">
        <div className="w-full max-w-lg">
          {/* Step 1: Registration form */}
          {step === 1 && (
            <div className="register-page-card rounded-2xl border border-border bg-card shadow-sm p-8! md:p-10!">
              <div className="mb-8!">
                <h2 className="text-xl font-semibold text-foreground">Create account</h2>
                <p className="text-muted-foreground text-sm mt-2!">Student registration — fill in your details</p>
              </div>

              <Form
                form={form1}
                name="register"
                layout="vertical"
                onFinish={onRequestOtp}
                autoComplete="off"
                requiredMark={false}
                className="register-page-form register-form"
              >
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2!">Account details</p>
                <Row gutter={24}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="text-foreground text-sm">Full name</span>}
                      name="fullname"
                      rules={[
                        { required: true, message: 'Required' },
                        { min: 2, message: 'At least 2 characters' },
                      ]}
                    >
                      <Input placeholder="John Doe" size="large" className="rounded-lg" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="text-foreground text-sm">Email</span>}
                      name="email"
                      rules={[
                        { required: true, message: 'Required' },
                        { type: 'email', message: 'Invalid email' },
                      ]}
                    >
                      <Input type="email" placeholder="you@example.com" size="large" className="rounded-lg" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24} className="mt-1!">
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="text-foreground text-sm">Password</span>}
                      name="password"
                      rules={[
                        { required: true, message: 'Required' },
                        { min: 6, message: 'At least 6 characters' },
                      ]}
                    >
                      <Input.Password placeholder="••••••••" size="large" className="rounded-lg" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="text-foreground text-sm">Confirm password</span>}
                      name="confirmPassword"
                      dependencies={['password']}
                      rules={[
                        { required: true, message: 'Required' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) return Promise.resolve();
                            return Promise.reject(new Error('Passwords do not match'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password placeholder="••••••••" size="large" className="rounded-lg" />
                    </Form.Item>
                  </Col>
                </Row>

                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2! mt-6!">Student ID & optional</p>
                <Row gutter={24}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="text-foreground text-sm">College / Student ID</span>}
                      name="collegeUserId"
                      rules={[
                        { required: true, message: 'Student ID is required' },
                        { min: 1, message: 'Enter your college or student ID' },
                      ]}
                    >
                      <Input placeholder="e.g. STU001" size="large" className="rounded-lg" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label={<span className="text-foreground text-sm">Mobile</span>} name="mobileNumber">
                      <Input placeholder="+1 234 567 8900" size="large" className="rounded-lg" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item className="mb-0! mt-8!">
                  <Button type="primary" htmlType="submit" block size="large" loading={loading} className="rounded-lg h-11 font-medium">
                    Send verification code
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <div className="register-page-card rounded-2xl border border-border bg-card shadow-sm p-8! md:p-10! text-center">
              <div className="mb-8!">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-muted text-primary mb-5">
                  <Icon icon="mdi:email-outline" className="w-7 h-7" aria-hidden />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Check your email</h2>
                <p className="text-muted-foreground text-sm mt-2">We sent a 6-digit code to</p>
                <p className="mt-3 font-medium text-foreground break-all">{pendingEmail}</p>
              </div>

              <Form
                form={form2}
                name="verify"
                layout="vertical"
                onFinish={onVerifyOtp}
                autoComplete="off"
                requiredMark={false}
              >
                <Form.Item name="email" hidden>
                  <Input />
                </Form.Item>

                <Form.Item
                  label={<span className="text-foreground text-sm">Verification code</span>}
                  name="code"
                  rules={[
                    { required: true, message: 'Enter the code from your email' },
                    { min: 4, message: 'Code is at least 4 characters' },
                  ]}
                >
                  <Input
                    placeholder="000000"
                    size="large"
                    maxLength={6}
                    className="rounded-lg text-center text-lg tracking-[0.5em] font-mono"
                  />
                </Form.Item>

                <Form.Item className="mb-0! mt-8!">
                  <Button type="primary" htmlType="submit" block size="large" loading={loading} className="rounded-lg h-11 font-medium">
                    Verify and sign in
                  </Button>
                </Form.Item>
              </Form>

              <p className="mt-4! text-sm text-muted-foreground">
                Didn&apos;t get the code?{' '}
                {resendCooldown > 0 ? (
                  <span className="text-muted-foreground">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={onResendOtp}
                    disabled={resendLoading}
                    className="text-primary font-medium hover:underline disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending…' : 'Resend code'}
                  </button>
                )}
              </p>

              <button
                type="button"
                onClick={backToStep1}
                className="mt-6! text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Use a different email
              </button>
            </div>
          )}

          <p className="mt-8! text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
