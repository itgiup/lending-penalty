import { ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LoanCalculator from './components/LoanCalculator';
import './App.css';

dayjs.locale('vi');

const localeMap = {
  vi: viVN,
  en: enUS,
  zh: zhCN,
  ru: ruRU
};

function AppContent() {
  const { i18n } = useTranslation();
  const { theme: appTheme } = useTheme();
  
  const currentLocale = localeMap[i18n.language] || viVN;
  const isDarkMode = appTheme === 'dark';

  return (
    <ConfigProvider 
      locale={currentLocale}
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <LoanCalculator />
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;