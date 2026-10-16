export type FilterKey = LocationAPI.Status | 'all';
export interface StatusCardConfig {
  readonly label: string;
  readonly color: string;
  readonly textColor: string;
}
export interface StatusDrawerConfig {
  readonly label: string;
  readonly bgColor: string;
  readonly color: string;
  readonly actionText: string;
  readonly variant: 'link' | 'dashed' | 'solid' | 'text' | 'outlined' | 'filled';
  readonly btnColor:
    | 'primary'
    | 'default'
    | 'blue'
    | 'cyan'
    | 'gold'
    | 'green'
    | 'lime'
    | 'magenta'
    | 'orange'
    | 'pink'
    | 'purple'
    | 'red'
    | 'yellow'
    | 'danger'
    | 'volcano'
    | 'geekblue';
}

export interface FilterTagItem {
  readonly key: FilterKey;
  readonly label: string;
  readonly color?: string;
  readonly count?: number;
}

export interface LocationLookupResult extends LocationAPI.LocationVO {
  readonly errorMessage?: string;
}

export type QuickActionType = 'inbound' | 'outbound';

export interface FetchOrderDetailResult {
  readonly itemName: string;
  readonly itemWeight: string;
}
