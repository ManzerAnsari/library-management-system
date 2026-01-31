import { useState, useEffect, useRef } from 'react';
import {
  Card,
  Input,
  Table,
  Tag,
  message,
  Spin,
  Typography,
  Space,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  Popconfirm,
} from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import { listBooks, createBook, updateBook, deleteBook, getBook } from '../api/books';
import { listUsers } from '../api/users';
import { borrowBook } from '../api/borrowings';
import { useAuthStore } from '../stores/authStore';
import { ROLES } from '../stores/authStore';
import { useDebouncedValue } from '../hooks/useDebounce';

const { Title, Text } = Typography;

const defaultBookForm = { title: '', author: '', isbn: '', description: '', copies: 1, tags: [] };

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const hasManageRole = useAuthStore((s) => s.hasAnyRole?.([ROLES.LIBRARIAN, ROLES.ADMIN]));

  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookForm] = Form.useForm();
  const [editingBookId, setEditingBookId] = useState(null);
  const [bookSubmitLoading, setBookSubmitLoading] = useState(false);

  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueForm] = Form.useForm();
  const [issueBookRecord, setIssueBookRecord] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [issueSubmitLoading, setIssueSubmitLoading] = useState(false);

  const prevDebouncedSearchRef = useRef(debouncedSearch);

  const fetchBooks = async (pageNum = 1, q) => {
    setLoading(true);
    try {
      const res = await listBooks({ page: pageNum, limit, q: q || undefined });
      setBooks(res.books || []);
      setTotal(res.meta?.total ?? 0);
    } catch (err) {
      message.error(err.response?.data?.error ?? 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (prevDebouncedSearchRef.current !== debouncedSearch) {
      prevDebouncedSearchRef.current = debouncedSearch;
      setPage(1);
      fetchBooks(1, debouncedSearch);
    } else {
      fetchBooks(page, debouncedSearch);
    }
  }, [page, debouncedSearch]);

  const handleSearch = () => {
    setPage(1);
    fetchBooks(1, search);
  };

  const openAddBook = () => {
    setEditingBookId(null);
    bookForm.setFieldsValue(defaultBookForm);
    setBookModalOpen(true);
  };

  const openEditBook = (record) => {
    setEditingBookId(record._id);
    setBookModalOpen(true);
  };

  // When book modal opens: for edit fetch book and fill form; for add set defaults (form mounts with modal)
  useEffect(() => {
    if (!bookModalOpen) return;
    if (editingBookId) {
      let cancelled = false;
      getBook(editingBookId)
        .then((res) => {
          if (cancelled) return;
          const b = res?.book ?? {};
          bookForm.setFieldsValue({
            title: b.title ?? '',
            author: b.author ?? '',
            isbn: b.isbn ?? '',
            description: b.description ?? '',
            copies: b.copies ?? 1,
            tags: Array.isArray(b.tags) ? b.tags : [],
          });
        })
        .catch((err) => {
          if (!cancelled) message.error(err.response?.data?.error ?? 'Failed to load book');
        });
      return () => { cancelled = true; };
    }
    bookForm.setFieldsValue(defaultBookForm);
  }, [bookModalOpen, editingBookId, bookForm]);

  const handleBookSubmit = async () => {
    try {
      const values = await bookForm.validateFields();
      setBookSubmitLoading(true);
      if (editingBookId) {
        await updateBook(editingBookId, {
          title: values.title?.trim(),
          author: values.author?.trim() || undefined,
          isbn: values.isbn?.trim() || undefined,
          description: values.description?.trim() || undefined,
          copies: values.copies ?? 1,
          tags: values.tags ?? [],
        });
        message.success('Book updated');
      } else {
        await createBook({
          title: values.title?.trim(),
          author: values.author?.trim() || undefined,
          isbn: values.isbn?.trim() || undefined,
          description: values.description?.trim() || undefined,
          copies: values.copies ?? 1,
          tags: values.tags ?? [],
        });
        message.success('Book added');
      }
      setBookModalOpen(false);
      fetchBooks(page, debouncedSearch);
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.response?.data?.error ?? 'Failed to save book');
    } finally {
      setBookSubmitLoading(false);
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      await deleteBook(id);
      message.success('Book removed');
      fetchBooks(page, debouncedSearch);
    } catch (err) {
      message.error(err.response?.data?.error ?? 'Failed to delete book');
    }
  };

  const openIssueModal = (record) => {
    setIssueBookRecord(record);
    issueForm.resetFields();
    setIssueModalOpen(true);
    setStudentsLoading(true);
    listUsers({ role: 'user', limit: 200 })
      .then((res) => {
        setStudents(res.users ?? []);
      })
      .catch(() => message.error('Failed to load students'))
      .finally(() => setStudentsLoading(false));
  };

  const handleIssueSubmit = async () => {
    if (!issueBookRecord) return;
    try {
      const values = await issueForm.validateFields();
      setIssueSubmitLoading(true);
      await borrowBook({ bookId: issueBookRecord._id, userId: values.userId });
      message.success('Book issued to student');
      setIssueModalOpen(false);
      fetchBooks(page, debouncedSearch);
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.response?.data?.error ?? 'Failed to issue book');
    } finally {
      setIssueSubmitLoading(false);
    }
  };

  const tableColumns = [
    { title: 'Title', dataIndex: 'title', key: 'title', ellipsis: true, render: (t) => t || '—' },
    { title: 'Author', dataIndex: 'author', key: 'author', ellipsis: true, render: (a) => a || '—' },
    { title: 'ISBN', dataIndex: 'isbn', key: 'isbn', width: 140, render: (i) => i || '—' },
    {
      title: 'Availability',
      key: 'availability',
      width: 120,
      render: (_, record) => (
        <Text type="secondary">{record.availableCopies ?? 0} / {record.copies ?? 0}</Text>
      ),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) =>
        Array.isArray(tags) && tags.length ? tags.map((t) => <Tag key={t}>{t}</Tag>) : '—',
    },
    ...(hasManageRole
      ? [
          {
            title: 'Actions',
            key: 'actions',
            width: 220,
            render: (_, record) => (
              <Space size="small">
                <Button
                  type="link"
                  size="small"
                  icon={<SendOutlined />}
                  onClick={() => openIssueModal(record)}
                  disabled={!(record.availableCopies > 0)}
                  title="Issue to student"
                >
                  Issue
                </Button>
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditBook(record)}>
                  Edit
                </Button>
                <Popconfirm
                  title="Remove this book?"
                  description="This cannot be undone."
                  onConfirm={() => handleDeleteBook(record._id)}
                  okText="Remove"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                >
                  <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ].filter(Boolean);

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Books</Title>
        <Space.Compact>
          <Input
            placeholder="Search by title, author, ISBN"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            style={{ width: 260, padding: 6 }}
          />
          {hasManageRole && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddBook} style={{ marginLeft: 8 }}>
              Add book
            </Button>
          )}
        </Space.Compact>
      </div>

      <Card>
        <Spin spinning={loading}>
          <Table
            rowKey="_id"
            columns={tableColumns}
            dataSource={books}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              showSizeChanger: false,
              showTotal: (t) => `Total ${t} books`,
              onChange: setPage,
            }}
          />
        </Spin>
      </Card>

      {/* Add / Edit book modal */}
      <Modal
        title={editingBookId ? 'Edit book' : 'Add book'}
        open={bookModalOpen}
        onOk={handleBookSubmit}
        onCancel={() => setBookModalOpen(false)}
        confirmLoading={bookSubmitLoading}
        destroyOnClose
        width={480}
      >
        <Form form={bookForm} layout="vertical" preserve={false}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="Book title" />
          </Form.Item>
          <Form.Item name="author" label="Author">
            <Input placeholder="Author name" />
          </Form.Item>
          <Form.Item name="isbn" label="ISBN">
            <Input placeholder="ISBN (optional)" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Short description (optional)" />
          </Form.Item>
          <Form.Item name="copies" label="Copies" rules={[{ required: true }]} initialValue={1}>
            <InputNumber min={1} max={999} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Select mode="tags" placeholder="Add tags" tokenSeparators={[',']} allowClear />
          </Form.Item>
        </Form>
      </Modal>

      {/* Issue book to student modal */}
      <Modal
        title="Issue book to student"
        open={issueModalOpen}
        onOk={handleIssueSubmit}
        onCancel={() => setIssueModalOpen(false)}
        confirmLoading={issueSubmitLoading}
        destroyOnClose
        okText="Issue"
      >
        {issueBookRecord && (
          <p style={{ marginBottom: 16 }}>
            <Text strong>{issueBookRecord.title}</Text>
            {issueBookRecord.author && <Text type="secondary"> by {issueBookRecord.author}</Text>}
          </p>
        )}
        <Form form={issueForm} layout="vertical">
          <Form.Item
            name="userId"
            label="Student"
            rules={[{ required: true, message: 'Select a student' }]}
          >
            <Select
              placeholder="Select student"
              showSearch
              optionFilterProp="label"
              loading={studentsLoading}
              options={students.map((u) => ({
                value: u._id,
                label: `${u.fullname} (${u.email})${u.collegeUserId ? ` – ${u.collegeUserId}` : ''}`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
