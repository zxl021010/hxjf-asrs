import { Button, ButtonProps, Modal, ModalFuncProps } from 'antd';
import { useState } from 'react';

interface OperationConfirmProps {
  modalConfig: ModalFuncProps;
  btnProps?: ButtonProps;
  fetchData?: () => void;
  btnText?: string;
}

export const OperationConfirm = ({ modalConfig, btnProps, fetchData, btnText }: OperationConfirmProps) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    setLoading(true);
    try {
      const res = await modalConfig.onOk?.();
      if (res?.code && res?.code === 200) {
        setVisible(false);
        await fetchData?.();
      }
    } catch (error) {
      console.error('Operation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setVisible(false);
    modalConfig.onCancel?.();
  };

  return (
    <>
      <Button type="link" size="small" onClick={() => setVisible(true)} {...btnProps}>
        {btnText || modalConfig.title || ''}
      </Button>
      <Modal
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        maskClosable={false}
        destroyOnHidden
        okButtonProps={{ loading }}
        title={modalConfig.title}
        width={modalConfig.width || 300}
        className={modalConfig.className}
        okText={modalConfig.okText}
        cancelText={modalConfig.cancelText}
      >
        {modalConfig.content}
      </Modal>
    </>
  );
};

export default OperationConfirm;
