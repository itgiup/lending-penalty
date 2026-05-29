import { useState, FC } from 'react';
import { Card, Typography, Button, Space, Tabs, TabsProps } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogoutOutlined, HomeOutlined, DashboardOutlined, BarChartOutlined } from '@ant-design/icons';
import { Loan } from '@lending-penalty/shared';
import LoanList from '../components/LoanList';
import LoanForm from '../components/LoanForm';
import LoanDetail from '../components/LoanDetail';
import PaymentForm from '../components/PaymentForm';
import DashboardStats from '../components/DashboardStats';
import DebtChart from '../components/DebtChart';

const { Title } = Typography;

type ViewType = 'list' | 'form' | 'detail' | 'payment';
type TabKeyType = 'overview' | 'analytics';

interface SelectedLoanState {
  id: string;
  [key: string]: any;
}

const Dashboard: FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState<ViewType>('list');
  const [selectedLoan, setSelectedLoan] = useState<SelectedLoanState | null>(null);
  const [activeTab, setActiveTab] = useState<TabKeyType>('overview');

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  const handleAddLoan = (): void => {
    setSelectedLoan(null);
    setView('form');
  };

  const handleEditLoan = (loan: Loan): void => {
    setSelectedLoan(loan);
    setView('form');
  };

  const handleViewLoan = (loan: Loan): void => {
    setSelectedLoan(loan);
    setView('detail');
  };

  const handleAddPayment = (loanId: string): void => {
    setSelectedLoan({ id: loanId });
    setView('payment');
  };

  const handleFormSuccess = (): void => {
    setView('list');
    setSelectedLoan(null);
  };

  const handlePaymentSuccess = (): void => {
    setView('detail');
  };

  const tabItems: TabsProps['items'] = [
    {
      key: 'overview',
      label: (
        <span>
          <DashboardOutlined />
          Tổng Quan
        </span>
      ),
      children: (
        <>
          <DashboardStats />
          <LoanList
            onAddLoan={handleAddLoan}
            onViewLoan={handleViewLoan}
            onEditLoan={handleEditLoan}
          />
        </>
      )
    },
    {
      key: 'analytics',
      label: (
        <span>
          <BarChartOutlined />
          Biểu Đồ Phân Tích
        </span>
      ),
      children: <DebtChart />
    }
  ];

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
        {/* Header */}
        <Card
          style={{
            maxWidth: '1200px',
            margin: '0 auto 24px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Title level={2} style={{ margin: 0 }}>
                 Chào mừng, {user?.name || 'User'}!
              </Title>
              <Space>
                <Button
                  icon={<HomeOutlined />}
                  onClick={() => navigate('/')}
                >
                  Trang tính toán
                </Button>
                <Button
                  danger
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                >
                  Đăng xuất
                </Button>
              </Space>
            </div>
          </Space>
        </Card>

        {/* Main Content with Tabs */}
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {view === 'list' && (
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as TabKeyType)}
              items={tabItems}
              size="large"
            />
          )}

          {view === 'form' && (
            <LoanForm
              loan={selectedLoan as Loan}
              onSuccess={handleFormSuccess}
              onCancel={() => setView('list')}
            />
          )}

          {view === 'detail' && selectedLoan && (
            <LoanDetail
              loanId={selectedLoan.id!}
              onBack={() => setView('list')}
              onAddPayment={handleAddPayment}
            />
          )}

          {view === 'payment' && selectedLoan && (
            <PaymentForm
              loanId={selectedLoan.id!}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setView('detail')}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;