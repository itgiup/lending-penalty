import { FC } from 'react';
import { Input, Select, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;

interface SearchFilterProps {
  onSearch: (value: string) => void;
  onFilter: (type: string, value: any) => void;
  onReset: () => void;
}

const SearchFilter: FC<SearchFilterProps> = ({ onSearch, onFilter, onReset }) => {
  return (
    <Space style={{ marginBottom: '16px', width: '100%' }} wrap>
      <Input
        placeholder="Tìm kiếm theo tên hoặc SĐT..."
        prefix={<SearchOutlined />}
        onChange={(e) => onSearch(e.target.value)}
        style={{ width: 300 }}
        allowClear
      />

      <Select
        placeholder="Lọc theo trạng thái"
        style={{ width: 200 }}
        onChange={(value) => onFilter('status', value)}
        allowClear
      >
        <Option value="active">Đang nợ</Option>
        <Option value="paid">Đã trả</Option>
        <Option value="overdue">Quá hạn</Option>
      </Select>

      <Button icon={<ReloadOutlined />} onClick={onReset}>
        Đặt lại
      </Button>
    </Space>
  );
};

export default SearchFilter;