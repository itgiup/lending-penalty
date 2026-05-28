import React from 'react';
import { Card, Typography, Button, Space } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogoutOutlined, HomeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          bordered={false}
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={2}>🎉 Chào mừng, {user?.name || 'User'}!</Title>
            <Text type="secondary">
              Đây là trang quản lý khoản nợ của bạn
            </Text>
          </div>

          <div style={{ 
            textAlign: 'center', 
            padding: '48px 0',
            background: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <Title level={4} style={{ color: '#999' }}>
              🚧 Đang phát triển...
            </Title>
            <Text type="secondary">
              Tính năng quản lý khoản nợ sẽ sớm ra mắt!
            </Text>
          </div>

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Button
              type="primary"
              icon={<HomeOutlined />}
              block
              size="large"
              onClick={() => navigate('/')}
            >
              Quay lại trang tính toán
            </Button>

            <Button
              danger
              icon={<LogoutOutlined />}
              block
              size="large"
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </Space>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;