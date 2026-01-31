import { Link, useLocation } from "react-router-dom";
import { Layout, Menu, Typography } from "antd";
import {
  BookOutlined,
  DashboardOutlined,
  UserOutlined,
  ReadOutlined,
  SwapOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { navConfig } from "../../config/navConfig";

const { Sider } = Layout;
const { Text } = Typography;

const iconMap = {
  "mdi:view-dashboard-outline": DashboardOutlined,
  "mdi:book-open-variant": ReadOutlined,
  "mdi:book-account-outline": BookOutlined,
  "mdi:book-plus-outline": SwapOutlined,
  "mdi:account-group-outline": TeamOutlined,
  "mdi:account-outline": UserOutlined,
};

function getAntdIcon(iconKey) {
  const AntdIcon = iconMap[iconKey] || ReadOutlined;
  return <AntdIcon />;
}

export default function Sidebar({ roleKey, collapsed }) {
  const { pathname } = useLocation();
  const items = navConfig[roleKey] || [];

  const menuItems = items.map(({ key, path, label, icon }) => ({
    key: path,
    icon: getAntdIcon(icon),
    label: <Link to={path}>{label}</Link>,
  }));

  return (
    <Sider
      width={240}
      collapsed={collapsed}
      collapsedWidth={80}
      theme="light"
      breakpoint="lg"
      style={{
        overflow: "auto",
        height: "100vh",
        boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
      }}
    >
      <Link
        to="/"
        style={{
          display: "block",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(5, 5, 5, 0.06)",
          height: "65px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ReadOutlined style={{ fontSize: 24, color: "#2563eb" }} />
          <Text strong style={{ fontSize: 18, color: "rgba(0,0,0,0.88)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {collapsed ? "" : "Library"}
          </Text>
        </div>
      </Link>
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems}
        style={{ height: "calc(100vh - 65px)", borderRight: 0, paddingTop: 8 }}
      />
    </Sider>
  );
}
