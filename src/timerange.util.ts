export class TimeRangeUtils {
  //constant para obtener el time correcto
  static async getLocalISOTime(): Promise<string> {
    const tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = new Date(Date.now() - tzoffset)
      .toISOString()
      .slice(0, -1);
    return localISOTime;
  }

  /**
   * return iso string HH:mm
   * @param hour
   * @param minute
   * @returns
   */
  static getStringISOTime(hour: number, minute: number): string {
    const valueISOTime: string = hour + ':' + minute;
    return valueISOTime;
  }

  /**
   * return iso string HH:mm
   * @param hour
   * @param minute
   * @returns
   */
  static getHourFromISOTime(isoString: string): number {
    const hour = 0;
    return hour;
  }
}
