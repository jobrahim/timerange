export class ResourceDto {
  constructor(
    type: string,
    status: string,
    quantity: number,
    rangesdate_id: number,
  ) {
    this.type = type;
    this.status = status;
    this.quantity = quantity;
    this.rangesdate_id = rangesdate_id;
  }

  id?: number;
  status: string;
  rangesdate_id: number;
  quantity: number;
  type: string;
}
