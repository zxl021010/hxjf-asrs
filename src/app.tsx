import logoPng from '@/assets/logo.png';
import ExceptionBadge from '@/components/exception-badge';
import { ExceptionNotification } from '@/components/exception-notification';
import { PLCStatus } from '@/components/PLC-status';
import { UserModule } from '@/store/modules/user';
import requestConfig from '@/utils/request';
import { history, Link, RunTimeLayoutConfig } from '@umijs/max';
import { App, Avatar, Space, Tooltip } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import defaultSettings from '../config/defaultSettings';

export const request = requestConfig;

const settings = {
  ...defaultSettings,
  logo: <img src={logoPng} alt="logo" style={{ width: 36, height: 36, marginLeft: 8, marginRight: 10 }} />,
};

export async function getInitialState() {
  const { pathname } = window.location;
  const isLoginPage = pathname === '/login';

  if (!isLoginPage) {
    try {
      const currentUser = await UserModule.GetUserInfo();
      return { currentUser, settings };
    } catch {
      UserModule.resetToken();
      history.replace('/login');
      return { settings };
    }
  }
  return { settings };
}

const LogoutButton: React.FC = () => {
  const { modal } = App.useApp();

  const handleLogout = () => {
    modal.confirm({
      icon: null,
      title: <div className="text-[18px] font-semibold text-[#262626]">确认退出</div>,
      content: <div className="text-[16px] leading-normal text-[#000000]">退出后需要重新登录，确定退出吗？</div>,
      okText: '确定',
      cancelText: '取消',
      centered: true,
      maskClosable: true,
      classNames: {
        content: '!p-[32px] !rounded-[18px]',
      },
      okButtonProps: { block: true, size: 'large', className: 'h-[45px]' },
      cancelButtonProps: {
        block: true,
        size: 'large',
        color: 'default',
        variant: 'filled',
        className: 'h-[45px]',
      },
      footer: (_, { CancelBtn, OkBtn }) => (
        <div className="flex gap-[12px] w-full mt-[24px]">
          <div className="flex-1">
            <CancelBtn />
          </div>
          <div className="flex-1">
            <OkBtn />
          </div>
        </div>
      ),
      onOk: async () => {
        await UserModule.LogOut();
        if (window.location.pathname !== '/login') {
          history.replace({
            pathname: '/login',
          });
        }
      },
    });
  };

  return (
    <a
      onClick={handleLogout}
      className="text-white cursor-pointer flex items-center text-[13px] h-[35px] py-[8px] px-[14px] rounded-[10px]"
      style={{
        backgroundColor: 'rgba(255,255,255,0.15)',
        transition: 'background-color 0.2s',
      }}
    >
      退出
    </a>
  );
};

export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    ...initialState?.settings,
    headerTitleRender: (logo, title) => (
      <div className="flex items-center gap-[10px]">
        {/* {logo} */}
        <Tooltip
          placement="right"
          title={
            <>
              <span>{`Version: ${process.env.REACT_APP_VERSION ?? '-'}`}</span>
              <br />
              <span>{`Time: ${dayjs(process.env.REACT_APP_TIME).format('YYYY-MM-DD HH:mm:ss')}`}</span>
            </>
          }
          color="blue"
        >
          <div className="w-[36px] h-[36px] bg-[#ffffff33] text-[20px] rounded-[10px] flex items-center justify-center">
            📦
          </div>
        </Tooltip>
        <span className="text-[20px] font-[600] text-white mr-[40px]">{title}</span>
      </div>
    ),
    menuItemRender: (item, defaultDom) => {
      if (!item.path) return defaultDom;
      const isException = item.path === '/exception';
      return (
        <Link
          to={item.path}
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 36,
            borderRadius: 10,
            padding: '8px 16px',
            marginInline: '-14px',
            transition: 'all 0.2s',
            fontWeight: 500,
            ...(item.path === window.location.pathname
              ? {
                  backgroundColor: '#ffffff',
                  color: '#1677FF',
                }
              : {}),
          }}
        >
          {defaultDom}
          {isException && <ExceptionBadge />}
        </Link>
      );
    },
    actionsRender: () => (
      <Space key="user-actions" size={16} align="center" className=" mr-[24px] ">
        <PLCStatus />
        <div
          className="h-[40px] flex items-center gap-[8px] text-[14px] py-[6px] px-[14px] rounded-[20px]"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
        >
          <Avatar icon={'👤'} size={28} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <span className="text-white text-[14px]">{UserModule?.username || '未登录'}</span>
        </div>
        <LogoutButton />
      </Space>
    ),
    waterMarkProps:
      process.env.REACT_APP_ENV === 'dev'
        ? { content: '开发环境', gapX: 100, gapY: 100 }
        : process.env.REACT_APP_ENV === 'test'
        ? { content: '测试环境', gapX: 100, gapY: 100 }
        : {},
  };
};

export function rootContainer(container: React.ReactNode): React.ReactNode {
  return React.createElement(React.Fragment, null, React.createElement(ExceptionNotification), container);
}
