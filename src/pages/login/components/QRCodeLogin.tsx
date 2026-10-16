import { getLoginQrCode, getLoginStatus } from '@/services/user/userAPI';
import { UserModule } from '@/store/modules/user';
import { useMutation, useQuery } from '@umijs/max';
import { Flex, QRCode } from 'antd';
import { useEffect, useState } from 'react';

type QRCodeStatusType = 'active' | 'expired' | 'loading' | 'scanned';

const STATUS_POLL_INTERVAL_MS = 2000;

export default (props: { loginSessionId: string; setLoginSessionId: any }) => {
  const { loginSessionId, setLoginSessionId } = props;
  const [QRCodeStatus, setQRCodeStatus] = useState<QRCodeStatusType>('loading');
  const [QRCodeValue, setQRCodeValue] = useState<string>('');

  const fetchQRCode = useMutation({
    mutationFn: async (): Promise<string> => {
      const res = await getLoginQrCode('trace');
      if (res?.code !== '200' || !res?.data) {
        throw new Error('获取二维码失败');
      }
      return res.data;
    },
    onSuccess: (data: string) => {
      setQRCodeStatus('active');
      setQRCodeValue(data);
      setLoginSessionId(data);
    },
    onError: () => {
      setQRCodeStatus('expired');
    },
  });

  useEffect(() => {
    fetchQRCode.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shouldPoll = QRCodeStatus === 'active' || QRCodeStatus === 'scanned';

  const { data: loginStatusData, error: loginStatusError } = useQuery({
    queryKey: ['login-status', loginSessionId],
    queryFn: async () => {
      const res = await getLoginStatus(loginSessionId);
      if (res?.code === '400' || !res?.data) {
        throw new Error('登录状态已过期');
      }
      return res.data;
    },
    enabled: shouldPoll && !!loginSessionId,
    refetchInterval: STATUS_POLL_INTERVAL_MS,
  });

  useEffect(() => {
    if (loginStatusError) {
      setQRCodeStatus('expired');
    }
  }, [loginStatusError]);

  useEffect(() => {
    if (!loginStatusData) return;
    const { status, code } = loginStatusData;
    if (status === 'SCANNED') {
      setQRCodeStatus('scanned');
    }
    if (status === 'EXPIRED') {
      setQRCodeStatus('expired');
    }
    if (status === 'CONFIRMED' && code) {
      setQRCodeStatus('expired');
      UserModule.QRCodeLogin({
        clientId: 'trace',
        grantType: 'authorization_code',
        code,
      }).then((loginRes) => {
        if (loginRes?.code === '200') {
          window.location.href = '/';
        }
      });
    }
  }, [loginStatusData]);

  return (
    <>
      <Flex align="center" justify="center">
        {QRCodeValue ? (
          <QRCode
            value={QRCodeValue}
            status={QRCodeStatus}
            onRefresh={() => fetchQRCode.mutate()}
            errorLevel="H"
            size={320}
          />
        ) : (
          <div
            style={{
              width: 320,
              height: 320,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f5f5f5',
            }}
          >
            加载中...
          </div>
        )}
      </Flex>
    </>
  );
};
