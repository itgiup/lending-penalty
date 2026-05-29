import React from 'react';
import { Input, Select, Space, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;

const SearchFilter = ({ onSearch, onFilter, onReset }) => {
  const handleSearch = (value) => {
    onSearch(value);
  };

  const handleStatusFilter = (value) => {
    onFilter('status', value);
  };

  return (
    <Space size="middle" style={{ marginBottom: '16px', width: '100%' }}>
      <Input
        placeholder="🔍 Tìm kiếm theo tên người vay..."
        prefix={<SearchOutlined />}
        allowClear
        onChange={(e) => handleSearch(e.target.value)}
        style={{ width: 300 }}
      />
      
      <Select
        placeholder="Lọc theo trạng thái"
        allowClear
        onChange={handleStatusFilter}
        style={{ width: 200 }}
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