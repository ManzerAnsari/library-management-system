import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Dropdown, Space, Typography, Avatar, Button, message } from 'antd';
import { UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { logout } from '../../api/auth';
import { getRoleKeyFromPath } from '../../config/navConfig';

const { Header } = Layout;
const { Text } = Typography;

export default function Navbar({ collapsed, onToggle, isMobile = false }) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const roleKey = getRoleKeyFromPath(pathname);
  const profilePath = roleKey ? `/${roleKey}/profile` : '/';

  const handleLogout = async () => {
    try {
      await logout();
      message.success('Logged out');
      navigate('/');
    } catch {
      message.error('Logout failed');
    }
  };

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to={profilePath}>Profile</Link>,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        padding: '0 16px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 99,
        height: '65px',
        minHeight: '65px',
      }}
      className="navbar-header"
    >
      <Space size="small" wrap={false}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{ fontSize: 18 }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        />
        <Text strong className="navbar-title" style={{ fontSize: 14, color: 'rgba(0,0,0,0.88)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isMobile ? 'Library' : 'Library Management System'}
        </Text>
      </Space>

      <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
        <Space size="small" style={{ cursor: 'pointer' }} wrap={false}>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#2563eb' }} size={isMobile ? 'default' : 'default'} />
          {!isMobile && (
            <Space className="align-middle" orientation="vertical" size={0} style={{ lineHeight: 1.2 }}>
              <Text strong style={{ fontSize: 14 }}>
                {user?.fullname ?? 'User'}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {user?.role ?? ''}
              </Text>
            </Space>
          )}
        </Space>
      </Dropdown>
    </Header>
  );
}
