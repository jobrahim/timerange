export class IndexRangesOfDateExRespoDto {
  _id: number;
  date_id: number;
  date_status: string;
  range_id: number;
  range_id_str: string;
  start: string;
  end: string;
  open: boolean;
  ext_user: boolean;
  containers: [
    {
      id: string;
      quantity: number;
    },
  ];
  limits: [
    {
      id: string;
      quota: number;
    },
  ];
}
