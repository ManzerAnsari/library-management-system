import { useState, useEffect, useRef } from 'react';
import { Card, Form, Input, Button, message, Spin, Typography, Space, Row, Col, Divider } from 'antd';
import { DownloadOutlined, IdcardOutlined, UserOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import { getMe, updateProfile } from '../api/auth';
import { useAuthStore } from '../stores/authStore';

const { Title, Text } = Typography;

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { dateStyle: 'long' });
}

export default function Profile() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);
  const libraryCardRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getMe();
        if (!cancelled && res?.user) {
          const u = res.user;
          setProfileData(u);
          form.setFieldsValue({
            fullname: u.fullname ?? '',
            email: u.email ?? '',
            mobileNumber: u.mobileNumber ?? '',
            collegeUserId: u.collegeUserId ?? '',
          });
        }
      } catch (err) {
        message.error(err.response?.data?.error ?? 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [form]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      await updateProfile({
        fullname: values.fullname?.trim(),
        mobileNumber: values.mobileNumber?.trim() || undefined,
        collegeUserId: values.collegeUserId?.trim() || undefined,
      });
      const res = await getMe();
      if (res?.user) {
        setAuth(res.user, useAuthStore.getState().accessToken);
        setProfileData(res.user);
      }
      message.success('Profile updated');
    } catch (err) {
      message.error(err.response?.data?.error ?? 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadCard = async () => {
    if (!libraryCardRef.current) return;
    try {
      const canvas = await html2canvas(libraryCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#fafafa',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `library-card-${profileData?.collegeUserId || 'user'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      message.success('Library card downloaded');
    } catch (err) {
      message.error('Download failed');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>Profile</Title>

      <Row gutter={[24, 24]}>
        {/* Library Card */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <IdcardOutlined />
                <span>Library Card</span>
              </Space>
            }
            extra={
              <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadCard}>
                Download card
              </Button>
            }
            style={{ height: '100%' }}
          >
            <div
              ref={libraryCardRef}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(160deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
                border: '3px solid #2563eb',
                borderRadius: 16,
                padding: 0,
                minHeight: 280,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 12px rgba(37, 99, 235, 0.15)',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
              }}
            >
              {/* Watermark layer - repeated diagonal text */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  zIndex: 0,
                  overflow: 'hidden',
                }}
              >
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${(i % 4) * 35 - 10}%`,
                      top: `${Math.floor(i / 4) * 40 - 15}%`,
                      transform: 'rotate(-28deg)',
                      fontSize: 28,
                      fontWeight: 700,
                      color: 'rgba(37, 99, 235, 0.08)',
                      whiteSpace: 'nowrap',
                      letterSpacing: 4,
                      fontFamily: 'system-ui, sans-serif',
                    }}
                  >
                    LIBRARY CARD
                  </div>
                ))}
              </div>

              {/* Top stripe */}
              <div
                style={{
                  height: 6,
                  background: 'repeating-linear-gradient(90deg, #2563eb, #2563eb 8px, #3b82f6 8px, #3b82f6 16px)',
                  borderRadius: '13px 13px 0 0',
                }}
              />

              {/* Content - above watermark */}
              <div style={{ position: 'relative', zIndex: 1, padding: '20px 24px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, letterSpacing: 3, color: '#1e40af', fontWeight: 600, marginBottom: 4 }}>
                    LIBRARY MANAGEMENT SYSTEM
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1e3a8a' }}>Member Card</div>
                </div>
                <Divider style={{ margin: '12px 0', borderColor: 'rgba(37, 99, 235, 0.3)' }} />
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                  <Row align="middle" gutter={[12, 0]}>
                    <Col span={8}><span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Name</span></Col>
                    <Col span={16}><span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{profileData?.fullname ?? '—'}</span></Col>
                  </Row>
                  <Row align="middle" gutter={[12, 0]}>
                    <Col span={8}><span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Email</span></Col>
                    <Col span={16}><span style={{ fontSize: 13, color: '#334155' }}>{profileData?.email ?? '—'}</span></Col>
                  </Row>
                  <Row align="middle" gutter={[12, 0]}>
                    <Col span={8}><span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Student ID</span></Col>
                    <Col span={16}><span style={{ fontSize: 14, fontWeight: 700, color: '#1e40af', letterSpacing: 1 }}>{profileData?.collegeUserId ?? '—'}</span></Col>
                  </Row>
                  <Row align="middle" gutter={[12, 0]}>
                    <Col span={8}><span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Mobile</span></Col>
                    <Col span={16}><span style={{ fontSize: 13, color: '#334155' }}>{profileData?.mobileNumber ?? '—'}</span></Col>
                  </Row>
                  <Row align="middle" gutter={[12, 0]}>
                    <Col span={8}><span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Member since</span></Col>
                    <Col span={16}><span style={{ fontSize: 13, color: '#334155' }}>{formatDate(profileData?.createdAt)}</span></Col>
                  </Row>
                </Space>
                <div style={{ textAlign: 'right', marginTop: 16, fontSize: 10, color: 'rgba(100, 116, 139, 0.8)' }}>
                  Valid member • Do not copy
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Edit profile form */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>Edit profile</span>
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Full name"
                name="fullname"
                rules={[{ required: true, message: 'Required' }, { min: 2, message: 'At least 2 characters' }]}
              >
                <Input placeholder="Your name" size="large" />
              </Form.Item>
              <Form.Item label="Email" name="email">
                <Input type="email" size="large" disabled />
              </Form.Item>
              <Form.Item label="College / Student ID" name="collegeUserId">
                <Input placeholder="e.g. STU001" size="large" />
              </Form.Item>
              <Form.Item label="Mobile" name="mobileNumber">
                <Input placeholder="+1 234 567 8900" size="large" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" loading={saving}>
                  Save changes
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
