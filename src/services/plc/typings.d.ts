declare namespace PlcAPI {
  /** PLC 连接状态 */
  interface PlcStatusVO {
    /** PLC 是否已连接 */
    connected: boolean;
    /** 设备编号 */
    deviceCode: string;
    /** PLC 指令层是否已启用 */
    enabled: boolean;
    /** 状态描述消息 */
    message: string;
    /** 系统状态 */
    systemState: 'READY' | 'BUSY' | 'ERROR';
  }

  /** PLC 关键寄存器键值对 */
  interface PlcRegistersVO {
    [registerName: string]: unknown;
  }
}
