export class IndexExportOffersDto {
  constructor(
    appointments_available: number,
    date_id: number,
    value: string,
    range_id: number,
    start: string,
    end: string,
    range_date_id: number,
    total: number,
    available: number,
  ) {
    this.appointments_available = appointments_available;
    this.date_id = date_id;
    this.value = value;
    this.range_id = range_id;
    this.start = start;
    this.end = end;
    this.range_date_id = range_date_id;
    this.total = total;
    this.available = available;
  }

  appointments_available: number;
  date_id: number;
  value: string;
  range_id: number;
  start: string;
  end: string;
  range_date_id: number;
  total: number;
  available: number;
}
