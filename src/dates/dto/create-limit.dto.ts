export class CreateLimitDto {
  constructor(type: string, name: string, quota: number, rangedate_id: number) {
    this.type = type;
    this.name = name;
    this.quota = quota;
    this.rangedate_id = rangedate_id;
  }
  id?: number;
  type: string;
  name: string;
  quota: number;
  rangedate_id: number;
}
