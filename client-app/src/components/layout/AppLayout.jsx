import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import { getRoleKeyFromPath } from '../../config/navConfig';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const { Content } = Layout;

export default function AppLayout() {
  const { pathname } = useLocation();
  const roleKey = getRoleKeyFromPath(pathname);
  const [collapsed, setCollapsed] = useState(false);

  if (!roleKey) {
    return <Outlet />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar roleKey={roleKey} collapsed={collapsed} />
      <Layout>
        <Navbar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <Content
          style={{
            margin: 24,
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
