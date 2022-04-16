export class LimitDto {
  constructor(
    id: number,
    type: string,
    name: string,
    quota: number,
    rangesdate_id: number,
    service_id: number,
  ) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.quota = quota;
    this.rangesdate_id = rangesdate_id;
    this.service_id = service_id;
  }

  id: number;
  type: string;
  name: string;
  quota: number;
  rangesdate_id: number;
  service_id: number;
}
