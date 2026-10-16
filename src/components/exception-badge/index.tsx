import { useModel } from '@umijs/max';
import { Badge } from 'antd';
import React from 'react';

const ExceptionBadge: React.FC = () => {
  const { count } = useModel('exception');
  return count > 0 ? <Badge status="error" style={{ marginLeft: 2 }} /> : null;
};

export default ExceptionBadge;
