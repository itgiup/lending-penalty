import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import LoanCalculator from './components/LoanCalculator';
import './App.css';

dayjs.locale('vi');

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <LoanCalculator />
    </ConfigProvider>
  );
}

export default App;
