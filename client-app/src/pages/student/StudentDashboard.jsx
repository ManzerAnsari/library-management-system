import { Link } from 'react-router-dom';
import { Card, Row, Col, Typography, Space } from 'antd';
import { ReadOutlined, BookOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';

const { Title, Text } = Typography;

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user);

  const cards = [
    { path: '/student/books', icon: <ReadOutlined style={{ fontSize: 28, color: '#2563eb' }} />, title: 'Books', desc: 'Browse catalog' },
    { path: '/student/borrowings', icon: <BookOutlined style={{ fontSize: 28, color: '#2563eb' }} />, title: 'My Borrowings', desc: 'View & track' },
    { path: '/student/profile', icon: <UserOutlined style={{ fontSize: 28, color: '#2563eb' }} />, title: 'Profile', desc: 'Edit your details' },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ marginBottom: 4 }}>Welcome, {user?.fullname ?? 'Student'}</Title>
        <Text type="secondary">View books and manage your borrowings.</Text>
      </div>
      <Row gutter={[16, 16]}>
        {cards.map(({ path, icon, title, desc }) => (
          <Col xs={24} sm={12} md={8} key={path}>
            <Link to={path} style={{ textDecoration: 'none' }}>
              <Card hoverable style={{ height: '100%' }}>
                <Space size="middle">
                  <div style={{ width: 56, height: 56, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 16 }}>{title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 13 }}>{desc}</Text>
                  </div>
                </Space>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Space>
  );
}
