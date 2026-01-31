import { useState, useEffect, useRef } from 'react';
import {
  Card,
  Table,
  Tag,
  message,
  Spin,
  Typography,
  Space,
  Button,
  Input,
  Modal,
  Form,
  Select,
  Popconfirm,
} from 'antd';
import { SearchOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { listUsers, createUser, deleteUser } from '../../api/users';
import { useDebouncedValue } from '../../hooks/useDebounce';
import { useAuthStore } from '../../stores/authStore';

const { Title } = Typography;

const roleOptions = [
  { value: 'user', label: 'User (Student)' },
  { value: 'librarian', label: 'Librarian' },
];

export default function AdminUsers() {
  const currentUserId = useAuthStore((s) => s.user?._id);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const prevDebouncedSearchRef = useRef(debouncedSearch);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [addSubmitLoading, setAddSubmitLoading] = useState(false);

  const fetchUsers = async (pageNum = 1, q) => {
    setLoading(true);
    try {
      const res = await listUsers({ page: pageNum, limit, q: q || undefined });
      setUsers(res.users || []);
      setTotal(res.meta?.total ?? 0);
    } catch (err) {
      message.error(err.response?.data?.error ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (prevDebouncedSearchRef.current !== debouncedSearch) {
      prevDebouncedSearchRef.current = debouncedSearch;
      setPage(1);
      fetchUsers(1, debouncedSearch);
    } else {
      fetchUsers(page, debouncedSearch);
    }
  }, [page, debouncedSearch]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers(1, search);
  };

  const openAddUser = () => {
    addForm.resetFields();
    setAddModalOpen(true);
  };

  const handleAddUser = async () => {
    try {
      const values = await addForm.validateFields();
      setAddSubmitLoading(true);
      await createUser({
        fullname: values.fullname?.trim(),
        email: values.email?.trim(),
        password: values.password,
        role: values.role,
        collegeUserId: values.collegeUserId?.trim() || undefined,
      });
      message.success('User created');
      setAddModalOpen(false);
      fetchUsers(page, debouncedSearch);
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.response?.data?.error ?? 'Failed to create user');
    } finally {
      setAddSubmitLoading(false);
    }
  };

  const handleRemoveUser = async (id) => {
    try {
      await deleteUser(id);
      message.success('User removed');
      fetchUsers(page, debouncedSearch);
    } catch (err) {
      message.error(err.response?.data?.error ?? 'Failed to remove user');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'fullname', key: 'fullname', ellipsis: true },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
    { title: 'Student ID', dataIndex: 'collegeUserId', key: 'collegeUserId', render: (v) => v || '—' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const color = role === 'admin' ? 'red' : role === 'librarian' ? 'blue' : 'default';
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => {
        const isSelf = record._id === currentUserId;
        return (
          <Popconfirm
            title="Remove this user?"
            description="This cannot be undone."
            onConfirm={() => handleRemoveUser(record._id)}
            okText="Remove"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} disabled={isSelf}>
              Remove
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Users</Title>
        <Space.Compact>
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            prefix={<SearchOutlined />}
            style={{ width: 260 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddUser} style={{ marginLeft: 8 }}>
            Add user
          </Button>
        </Space.Compact>
      </div>

      <Card>
        <Spin spinning={loading}>
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={users}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              showSizeChanger: false,
              showTotal: (t) => `Total ${t} users`,
              onChange: setPage,
            }}
          />
        </Spin>
      </Card>

      <Modal
        title="Add user"
        open={addModalOpen}
        onOk={handleAddUser}
        onCancel={() => setAddModalOpen(false)}
        confirmLoading={addSubmitLoading}
        destroyOnClose
        width={420}
      >
        <Form form={addForm} layout="vertical" preserve={false}>
          <Form.Item name="fullname" label="Full name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="Full name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6, message: 'At least 6 characters' }]}>
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Select role' }]}>
            <Select placeholder="Select role" options={roleOptions} />
          </Form.Item>
          <Form.Item name="collegeUserId" label="College / Student ID">
            <Input placeholder="e.g. STU001 (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
