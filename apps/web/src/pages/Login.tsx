import { useState, FC } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Divider, FormInstance } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleOAuth } from '../hooks/useGoogleOAuth';
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

const Login: FC = () => {
  const [form] = Form.useForm<FormInstance>();
  const [loading, setLoading] = useState<boolean>(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);
  const [error, setError] = useState<string>('');
  
  const { login, loginWithFacebook } = useAuth();
  const { login: googleLogin } = useGoogleOAuth(); // Real Google OAuth hook
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    setError('');

    const result = await login(values.email, values.password);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Login failed');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setOauthLoading('google');
    setError('');

    try {
      await googleLogin(); // Triggers real Google OAuth flow
      // Navigation happens via event listener in AuthContext
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (err) {
      setError((err as Error).message || 'Google login failed');
    } finally {
      setOauthLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    setOauthLoading('facebook');
    setError('');

    const result = await loginWithFacebook();
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Facebook login failed');
      setOauthLoading(null);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={2} style={{ margin: 0 }}>🔐 Đăng Nhập</Title>
            <Text type="secondary">Chào mừng bạn trở lại!</Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              style={{ marginBottom: '16px' }}
            />
          )}

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  height: '45px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Đăng Nhập
              </Button>
            </Form.Item>
          </Form>

          <Divider>hoặc</Divider>

          <div style={{ textAlign: 'center' }}>
            <Button
              type="default"
              icon={<GoogleOutlined />}
              onClick={handleGoogleLogin}
              loading={oauthLoading === 'google'}
              style={{
                width: '48%',
                marginRight: '4%',
                height: '45px',
                fontSize: '16px',
                fontWeight: '600',
                border: '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: '#fff'
              }}
            >
              Đăng nhập với Google
            </Button>
            <Button
              type="default"
              icon={<FacebookOutlined />}
              onClick={handleFacebookLogin}
              loading={oauthLoading === 'facebook'}
              style={{
                width: '48%',
                height: '45px',
                fontSize: '16px',
                fontWeight: '600',
                border: '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: '#fff'
              }}
            >
              Đăng nhập với Facebook
            </Button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Text>Chưa có tài khoản? </Text>
            <Link to="/register">Đăng ký ngay</Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/">← Quay lại trang tính toán</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;