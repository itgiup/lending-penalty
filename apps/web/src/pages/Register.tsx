import { useState, FC } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Divider, FormInstance } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleOAuth } from '../hooks/useGoogleOAuth';
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface RegisterFormValues {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

const Register: FC = () => {
  const [form] = Form.useForm<FormInstance>();
  const [loading, setLoading] = useState<boolean>(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);
  const [error, setError] = useState<string>('');

  const { register, loginWithFacebook } = useAuth();
  const { login: googleLogin } = useGoogleOAuth(); // Real Google OAuth hook
  const navigate = useNavigate();

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    setError('');

    const result = await register(
      values.email,
      values.password,
      values.name,
      values.phone
    );

    if (result.success) {
      // Auto login after registration
      const loginResult = await register(values.email, values.password, values.name, values.phone);
      if (loginResult.success) {
        navigate('/dashboard', { replace: true });
      }
    } else {
      setError(result.error || 'Registration failed');
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
        navigate('/dashboard', { replace: true });
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
      navigate('/dashboard', { replace: true });
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
        style={{ width: '100%', maxWidth: '450px' }}
      >
        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={2} style={{ margin: 0 }}>📝 Đăng Ký</Title>
            <Text type="secondary">Tạo tài khoản mới để quản lý khoản nợ</Text>
          </div>

          {error && (
            <Alert
              title={error}
              type="error"
              showIcon
              closable={{
                onClose: () => setError('')
              }}
              style={{ marginBottom: '16px' }}
            />
          )}

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            initialValues={{
              name: '',
              email: '',
              phone: '',
              password: '',
              confirmPassword: ''
            }}
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Họ và tên"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Số điện thoại (tùy chọn)"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu (tối thiểu 6 ký tự)"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Xác nhận mật khẩu"
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
                Đăng Ký
              </Button>
            </Form.Item>
          </Form>

          <Divider>hoặc đăng nhập nhanh với</Divider>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <Button
              icon={<GoogleOutlined />}
              onClick={handleGoogleLogin}
              loading={oauthLoading === 'google'}
              block
              size="large"
              style={{
                borderColor: '#DB4437',
                color: '#DB4437',
                fontWeight: '500'
              }}
            >
              Google
            </Button>

            <Button
              icon={<FacebookOutlined />}
              onClick={handleFacebookLogin}
              loading={oauthLoading === 'facebook'}
              block
              size="large"
              style={{
                borderColor: '#4267B2',
                color: '#4267B2',
                fontWeight: '500'
              }}
            >
              Facebook
            </Button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Text>Đã có tài khoản? </Text>
            <Link to="/login">Đăng nhập</Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/">← Quay lại trang tính toán</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;