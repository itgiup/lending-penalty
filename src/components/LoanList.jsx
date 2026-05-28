import { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Card, Typography, Empty, Spin } from 'antd';
import { motion } from 'framer-motion';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { loansAPI } from '../api/client';
import dayjs from 'dayjs';

const { Title } = Typography;

const LoanList = ({ onAddLoan, onViewLoan, onEditLoan }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await loansAPI.getAll();
      setLoans(response.data || []);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleDelete = async (id) => {
    try {
      await loansAPI.delete(id);
      setLoans(loans.filter(loan => loan.id !== id));
    } catch (error) {
      console.error('Failed to delete loan:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'blue';
      case 'paid': return 'green';
      case 'overdue': return 'red';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Người vay',
      dataIndex: 'borrower_name',
      key: 'borrower_name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Số tiền gốc',
      dataIndex: 'principal',
      key: 'principal',
      render: (amount) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount),
      sorter: (a, b) => a.principal - b.principal
    },
    {
      title: 'Lãi suất',
      dataIndex: 'interest_rate',
      key: 'interest_rate',
      render: (rate) => `${rate}%`
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Kỳ hạn',
      dataIndex: 'term_months',
      key: 'term_months',
      render: (months) => `${months} tháng`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status === 'active' ? 'Đang nợ' : 
           status === 'paid' ? 'Đã trả' : 'Quá hạn'}
        </Tag>
      ),
      filters: [
        { text: 'Đang nợ', value: 'active' },
        { text: 'Đã trả', value: 'paid' },
        { text: 'Quá hạn', value: 'overdue' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onViewLoan(record)}
          >
            Xem
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEditLoan(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <Spin size="large" tip="Đang tải danh sách khoản nợ..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        bordered={false}
        style={{ borderRadius: '12px' }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <Title level={3} style={{ margin: 0 }}>💰 Danh Sách Khoản Nợ</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={onAddLoan}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            Thêm Khoản Nợ Mới
          </Button>
        </div>

        {loans.length === 0 ? (
          <Empty
            description="Chưa có khoản nợ nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              onClick={onAddLoan}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              Tạo Khoản Nợ Đầu Tiên
            </Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={loans}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} khoản nợ`
            }}
            scroll={{ x: true }}
          />
        )}
      </Card>
    </motion.div>
  );
};

export default LoanList;