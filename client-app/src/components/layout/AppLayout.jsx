import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout, Grid } from 'antd';
import { getRoleKeyFromPath } from '../../config/navConfig';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const { Content } = Layout;
const { useBreakpoint } = Grid;

export default function AppLayout() {
  const { pathname } = useLocation();
  const roleKey = getRoleKeyFromPath(pathname);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  if (!roleKey) {
    return <Outlet />;
  }

  return (
    <Layout style={{ minHeight: '100vh', height: '100vh' }}>
      {isMobile ? (
        <Sidebar roleKey={roleKey} drawerOpen={drawerOpen} onDrawerClose={() => setDrawerOpen(false)} />
      ) : (
        <Sidebar roleKey={roleKey} collapsed={collapsed} />
      )}
      <Layout style={{
            maxHeight: '100%',
            height: '100%',
            overflowY: 'auto',}}>
        <Navbar
          collapsed={collapsed}
          onToggle={() => (isMobile ? setDrawerOpen((o) => !o) : setCollapsed((c) => !c))}
          isMobile={isMobile}
        />
        <Content
          className="app-layout-content"
          style={{
            margin: isMobile ? 12 : 24,
            padding: isMobile ? 12 : 24,
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
