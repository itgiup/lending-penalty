import { useState, FC } from 'react';
import { Form, InputNumber, DatePicker, Button, Card, Alert, FormInstance } from 'antd';
import { motion } from 'framer-motion';
import dayjs, { Dayjs } from 'dayjs';
import { paymentsAPI } from '../api/client';

interface PaymentFormProps {
  loanId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface PaymentFormValues {
  amount: number;
  payment_date: Dayjs;
  notes?: string;
}

const PaymentForm: FC<PaymentFormProps> = ({ loanId, onSuccess, onCancel }) => {
  const [form] = Form.useForm<FormInstance>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const onFinish = async (values: PaymentFormValues): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const data = {
        amount: values.amount,
        payment_date: values.payment_date.toISOString(),
        notes: values.notes
      };

      await paymentsAPI.create(loanId, data);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        title="💳 Ghi Nhận Thanh Toán"
      >
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
          layout="vertical"
          onFinish={onFinish}
          size="large"
          initialValues={{
            payment_date: dayjs()
          }}
        >
          <Form.Item
            name="amount"
            label="Số tiền thanh toán (VND)"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="500000"
            />
          </Form.Item>

          <Form.Item
            name="payment_date"
            label="Ngày thanh toán"
            rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày"
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} placeholder="Ghi chú về thanh toán (tùy chọn)" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button.Group>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Ghi Nhận
              </Button>
              <Button onClick={onCancel}>Hủy</Button>
            </Button.Group>
          </Form.Item>
        </Form>
      </Card>
    </motion.div>
  );
};

export default PaymentForm;