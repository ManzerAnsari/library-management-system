import { useState, useEffect, useRef } from 'react';
import { Card, Table, Button, Tag, message, Spin, Typography, Space, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { listBorrowings, returnBorrowing } from '../api/borrowings';
import { useAuthStore } from '../stores/authStore';
import { ROLES } from '../stores/authStore';
import { useDebouncedValue } from '../hooks/useDebounce';

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'returned', label: 'Returned' },
];

export default function Borrowings() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [returningId, setReturningId] = useState(null);
  const user = useAuthStore((s) => s.user);
  const isLibrarianOrAdmin = user && [ROLES.LIBRARIAN, ROLES.ADMIN].includes(user.role);

  const prevDebouncedSearchRef = useRef(debouncedSearch);

  const fetchBorrowings = async (pageNum = 1, q, statusFilter) => {
    setLoading(true);
    try {
      const res = await listBorrowings({
        page: pageNum,
        limit,
        q: q || undefined,
        status: statusFilter || undefined,
      });
      setList(res.borrowings || []);
      setTotal(res.meta?.total ?? 0);
    } catch (err) {
      message.error(err.response?.data?.error ?? 'Failed to load borrowings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (prevDebouncedSearchRef.current !== debouncedSearch) {
      prevDebouncedSearchRef.current = debouncedSearch;
      setPage(1);
      fetchBorrowings(1, debouncedSearch, status);
    } else {
      fetchBorrowings(page, debouncedSearch, status);
    }
  }, [page, debouncedSearch, status]);

  const handleReturn = async (id) => {
    setReturningId(id);
    try {
      await returnBorrowing(id);
      message.success('Book returned');
      fetchBorrowings(page);
    } catch (err) {
      message.error(err.response?.data?.error ?? 'Return failed');
    } finally {
      setReturningId(null);
    }
  };

  const columns = [
    {
      title: 'Book',
      key: 'book',
      render: (_, record) => record.book?.title ?? record.bookId ?? '—',
    },
    ...(isLibrarianOrAdmin
      ? [
          {
            title: 'Borrower',
            key: 'borrower',
            render: (_, record) => record.user?.fullname ?? record.userId ?? '—',
          },
        ]
      : []),
    { title: 'Borrowed', dataIndex: 'borrowedAt', key: 'borrowedAt', render: formatDate },
    { title: 'Due', dataIndex: 'dueDate', key: 'dueDate', render: formatDate },
    {
      title: 'Returned',
      dataIndex: 'returnedAt',
      key: 'returnedAt',
      render: (r) => (r ? formatDate(r) : '—'),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        if (record.returnedAt) return <Tag color="green">Returned</Tag>;
        const due = new Date(record.dueDate);
        const overdue = due < new Date();
        return overdue ? <Tag color="red">Overdue</Tag> : <Tag color="blue">Borrowed</Tag>;
      },
    },
    ...(isLibrarianOrAdmin
      ? [
          {
            title: 'Action',
            key: 'action',
            render: (_, record) =>
              !record.returnedAt ? (
                <Button
                  type="link"
                  size="small"
                  loading={returningId === record._id}
                  onClick={() => handleReturn(record._id)}
                >
                  Mark returned
                </Button>
              ) : null,
          },
        ]
      : []),
  ].filter(Boolean);

  const { Title } = Typography;

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div className="flex flex-wrap gap-3 w-full items-center justify-between">
        <Title level={4} style={{ margin: 0 }} className="!mb-0">
          {isLibrarianOrAdmin ? 'Borrowings (Issue / Return)' : 'My Borrowings'}
        </Title>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {isLibrarianOrAdmin && (
            <Input
              placeholder="Search by book or borrower"
              prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              className="flex-1 min-w-0 sm:w-[240px]"
            />
          )}
          <Select
            value={status || undefined}
            onChange={(v) => { setStatus(v ?? ''); setPage(1); }}
            options={STATUS_OPTIONS}
            className="w-full sm:w-[140px]"
            placeholder="Status"
            allowClear
          />
        </div>
      </div>
      <Card className="overflow-x-auto">
        <Spin spinning={loading}>
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={list}
            scroll={{ x: 'max-content' }}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              showSizeChanger: false,
              showTotal: (t) => `Total ${t}`,
              onChange: setPage,
              responsive: true,
              size: 'small',
            }}
          />
        </Spin>
      </Card>
    </Space>
  );
}
